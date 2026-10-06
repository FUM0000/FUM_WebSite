(function (global) {
    'use strict';

    // ============================================================================
    // Video Editor / Transcoder
    // 動画のリサイズ・圧縮・書き出しエンジン
    //
    // Engine A : WebCodecs + mp4box(demux) + mp4-muxer(mux)
    //            Chrome / Edge 系。ネイティブ実装で高速。
    // Engine B : ffmpeg.wasm
    //            WebCodecs 非対応、または Audio 経路が使えない場合のフォールバック。
    //
    // Public API:
    //   VideoEditor.Engine()        -> 'webcodecs' | 'ffmpeg'
    //   VideoEditor.Transcode(opt)  -> { blob, engine, elapsed, cancelled }
    // ============================================================================

    const Script_Source = {
        mp4box: 'https://cdn.jsdelivr.net/npm/mp4box@0.5.2/dist/mp4box.all.min.js',
        muxer: 'https://cdn.jsdelivr.net/npm/mp4-muxer@5.2.1/build/mp4-muxer.min.js',
        ffmpeg: 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.15/dist/umd/ffmpeg.js',
        ffmpeg_util: 'https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.2/dist/umd/index.js'
    };

    const FFmpeg_Base = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd';

    // 高さ・幅ともに偶数にする必要がある (yuv420p)
    const Quality_Table = {
        high: { label: 'High', pixels: 0.15 },
        standard: { label: 'Standard', pixels: 0.085 },
        compact: { label: 'Compact', pixels: 0.045 },
        tiny: { label: 'Tiny', pixels: 0.022 }
    };

    const Audio_Table = {
        keep: { label: 'Keep audio', bitrate: 128000 },
        low: { label: 'Low (96 kbps)', bitrate: 96000 },
        remove: { label: 'Remove audio', bitrate: 0 }
    };

    // ---------------------------------------------------------------------------
    // Utility
    // ---------------------------------------------------------------------------

    function Load_Script(_url) {
        return new Promise((_resolve, _reject) => {
            const existing = document.querySelector(`script[data-ve="${_url}"]`);
            if (existing) {
                if (existing.dataset.loaded === '1') {
                    _resolve();
                } else {
                    existing.addEventListener('load', () => _resolve());
                    existing.addEventListener('error', () => _reject(new Error('Failed to load ' + _url)));
                }
                return;
            }

            const element = document.createElement('script');
            element.src = _url;
            element.async = true;
            element.dataset.ve = _url;
            element.addEventListener('load', () => {
                element.dataset.loaded = '1';
                _resolve();
            });
            element.addEventListener('error', () => _reject(new Error('Failed to load ' + _url)));
            document.head.appendChild(element);
        });
    }

    function Once(_target, _name) {
        return new Promise(_resolve => _target.addEventListener(_name, _resolve, { once: true }));
    }

    function To_Even(_value) {
        const rounded = Math.round(_value / 2) * 2;
        return Math.max(16, rounded);
    }

    function Format_Time(_seconds) {
        const total = isFinite(_seconds) && _seconds > 0 ? _seconds : 0;
        const minutes = Math.floor(total / 60);
        const seconds = Math.floor(total % 60);
        const milliseconds = Math.floor((total % 1) * 1000);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
    }

    function Format_Size(_bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let value = _bytes || 0;
        let index = 0;
        while (value >= 1024 && index < units.length - 1) {
            value /= 1024;
            index++;
        }
        return `${index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
    }

    function Format_Bitrate(_bitrate) {
        if (!_bitrate) return '0 kbps';
        if (_bitrate >= 1000000) return `${(_bitrate / 1000000).toFixed(2)} Mbps`;
        return `${Math.round(_bitrate / 1000)} kbps`;
    }

    // 解像度と FPS から推奨ビットレートを算出する。
// 元のビットレートが分かっている場合は、それを上限にすることで
// 「ダウングレードしても逆に大きくなる」ケースを防ぐ。
    function Suggest_Bitrate(_width, _height, _fps, _quality, _sourceBitrate) {
        const factor = (Quality_Table[_quality] || Quality_Table.standard).pixels;
        const raw = _width * _height * _fps * factor;
        let clamped = Math.min(60000000, Math.max(150000, raw));

        // 元-filesize が判明している場合、视频として妥当な範囲に収める
        if (_sourceBitrate > 0) {
            // Extreme high bitrate sources (e.g. ProRes) → cap at 40 Mbps, don't inflate
            clamped = Math.min(clamped, Math.max(_sourceBitrate, 40000000));
            // Don't let suggestions exceed source rate, use 95% to guarantee smaller
            clamped = Math.min(clamped, Math.floor(_sourceBitrate * 0.95));
        }

        return Math.round(clamped / 1000) * 1000;
    }

    function Is_Supported(_file) {
        return /\.(mp4|m4v|webm|mov)$/i.test(_file.name) || /^video\//.test(_file.type);
    }

    // mp4box.js が扱えるのは ISO ベースライン (mp4/m4v) のみ。
    // MOV / WebM は ffmpeg.wasm に渡す必要がある。
    function Can_Demux(_file) {
        return /\.(mp4|m4v)$/i.test(_file && _file.name ? _file.name : '');
    }

    // 自動モードで ffmpeg に再試行すべき失敗として印を付ける
    function Mark_Fallback(_error) {
        if (_error && typeof _error === 'object' && !_error.fallback) _error.fallback = true;
        return _error;
    }

    // ---------------------------------------------------------------------------
    // Engine detection
    // ---------------------------------------------------------------------------

    function Has_WebCodecs() {
        return 'VideoEncoder' in global && 'VideoDecoder' in global
            && 'AudioEncoder' in global && 'AudioDecoder' in global;
    }

    function Engine() {
        return Has_WebCodecs() ? 'webcodecs' : 'ffmpeg';
    }

    // ---------------------------------------------------------------------------
    // Demux (mp4box.js)
    // ---------------------------------------------------------------------------

    async function Demux(_file) {
        await Load_Script(Script_Source.mp4box);
        if (!global.MP4Box || !global.MP4Box.createFile) {
            throw new Error('mp4box.js could not be initialised.');
        }

        const buffer = await _file.arrayBuffer();

        return new Promise((_resolve, _reject) => {
            const box = global.MP4Box.createFile();
            const tracks = { video: null, audio: null };
            const samples = { video: [], audio: [] };

            box.onError = (_error) => _reject(Mark_Fallback(new Error('The file could not be demuxed.')));

            box.onReady = (_info) => {
                const videoInfo = _info.videoTracks && _info.videoTracks[0];
                const audioInfo = _info.audioTracks && _info.audioTracks[0];

                if (videoInfo) {
                    tracks.video = {
                        id: videoInfo.id,
                        codec: videoInfo.codec,
                        width: videoInfo.video.width,
                        height: videoInfo.video.height,
                        timescale: videoInfo.timescale || videoInfo.video.timescale,
                        duration: videoInfo.duration,
                        bitrate: videoInfo.bitrate
                    };
                    box.setExtractionOptions(videoInfo.id, null, { nbSamples: 500 });
                }

                if (audioInfo) {
                    tracks.audio = {
                        id: audioInfo.id,
                        codec: audioInfo.codec,
                        sampleRate: audioInfo.audio.sample_rate,
                        channelCount: audioInfo.audio.channel_count,
                        timescale: audioInfo.timescale || audioInfo.audio.sample_rate,
                        duration: audioInfo.duration,
                        bitrate: audioInfo.bitrate
                    };
                    box.setExtractionOptions(audioInfo.id, null, { nbSamples: 500 });
                }

                box.start();
            };

            box.onSamples = (_id, _user, _samples) => {
                const bucket = _id === tracks.video.id ? samples.video
                    : tracks.audio && _id === tracks.audio.id ? samples.audio
                        : null;
                if (!bucket) return;
                for (const sample of _samples) bucket.push(sample);
            };

            try {
                box.appendBuffer(buffer);
                box.flush();
            } catch (_error) {
                _reject(Mark_Fallback(_error));
                return;
            }

            if (!tracks.video || !samples.video.length) {
                _reject(Mark_Fallback(new Error('No video track was found in this file.')));
                return;
            }

            _resolve({
                video: tracks.video,
                audio: tracks.audio,
                videoSamples: samples.video,
                audioSamples: samples.audio
            });
        });
    }

    // ---------------------------------------------------------------------------
    // WebCodecs engine
    // ---------------------------------------------------------------------------

    // 出力解像度に合う H.264  LEVEL  を isConfigSupported で選ぶ
    async function Pick_Video_Codec(_config) {
        const levels = ['34', '33', '32', '2A', '29', '28', '1F'];
        const profiles = ['6400', '4D40', '4200'];
        const candidates = [];

        for (const profile of profiles) {
            for (const level of levels) {
                candidates.push(`avc1.${profile}${level}`);
            }
        }
        candidates.push('avc1.42001f');

        for (const codec of candidates) {
            const config = Object.assign({}, _config, { codec: codec });
            try {
                const support = await global.VideoEncoder.isConfigSupported(config);
                if (support && support.supported) return support.config;
            } catch (_error) {
                // 次の候補へ進む
            }
        }

        throw new Error('This browser cannot encode H.264 with the WebCodecs API.');
    }

    async function Transcode_WebCodecs(_file, _opt, _report, _state) {
        _report({ phase: 'prepare', ratio: 0 });
        await Load_Script(Script_Source.muxer);
        if (!global.Mp4Muxer || !global.Mp4Muxer.Muxer) {
            throw new Error('mp4-muxer could not be initialised.');
        }

        const source = await Demux(_file);
        if (_state.cancelled) return null;

        const sourceFps = source.video.duration > 0 && source.video.timescale
            ? source.videoSamples.length / (source.video.duration / source.video.timescale)
            : 0;
        const fps = _opt.fps > 0 ? Math.min(_opt.fps, sourceFps || _opt.fps) : sourceFps;
        // メタデータが壊れている場合に備えて下限を設ける (0 だと全フレームがキーフレームになる)
        const effectiveFps = fps > 0 ? fps : 30;

        const useAudio = !!(_opt.audio && source.audio && source.audioSamples.length);
        const duration = source.video.duration / (source.video.timescale || 1);

        // 書き出し範囲。duration が 0 なら動画全体
        const trimming = _opt.duration > 0;
        const trimStart = trimming ? Math.max(0, _opt.start || 0) : 0;
        const startUs = Math.round(trimStart * 1e6);
        const endUs = trimming ? startUs + Math.round(_opt.duration * 1e6) : Infinity;

        const target = new global.Mp4Muxer.ArrayBufferTarget();
        const muxer = new global.Mp4Muxer.Muxer({
            target: target,
            fastStart: 'in-memory',
            video: { codec: 'avc', width: _opt.width, height: _opt.height },
            audio: useAudio ? {
                codec: 'aac',
                sampleRate: source.audio.sampleRate,
                numberOfChannels: source.audio.channelCount
            } : undefined
        });

        // ---- Video -------------------------------------------------------------
        const encodeConfig = await Pick_Video_Codec({
            width: _opt.width,
            height: _opt.height,
            bitrate: _opt.bitrate,
            framerate: effectiveFps,
            avc: { format: 'avc' },
            latencyMode: 'quality'
        });

        const decoderConfig = {
            codec: source.video.codec,
            codedWidth: source.video.width,
            codedHeight: source.video.height
        };
        const described = source.videoSamples.find(sample => sample.description);
        if (described) decoderConfig.description = described.description;

        const canvas = new OffscreenCanvas(_opt.width, _opt.height);
        const context = canvas.getContext('2d', { alpha: false, desynchronized: true });
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

        const outStep = _opt.fps > 0 ? 1e6 / effectiveFps : 0;
        const keyFrame_Interval = Math.max(1, Math.round(effectiveFps * 2));
        const needScale = _opt.width !== source.video.width || _opt.height !== source.video.height;

        // 進捗表示の分母。書き出し範囲が指定されていればその長さで数える
        const clipDuration = trimming
            ? Math.min(_opt.duration, Math.max(0, duration - trimStart))
            : duration;
        const expected = clipDuration > 0
            ? Math.max(1, Math.round((clipDuration * 1e6) / (outStep || (1e6 / effectiveFps))))
            : source.videoSamples.length;

        let failure = null;
        let grid = 0;
        let emitted = 0;

        const encoder = new global.VideoEncoder({
            output: (_chunk, _meta) => muxer.addVideoChunk(_chunk, _meta),
            error: (_error) => { failure = _error; }
        });
        encoder.configure(encodeConfig);

        const queue = [];
        let pumping = false;
        let pumpDone = Promise.resolve();

        const pump = async () => {
            while (queue.length) {
                if (failure || _state.cancelled) {
                    while (queue.length) queue.shift().close();
                    return;
                }
                const frame = queue.shift();
                try {
                    await emit(frame);
                } catch (_error) {
                    failure = _error;
                } finally {
                    frame.close();
                }
            }
        };

        const emit = async (_frame) => {
            if (encoder.encodeQueueSize > 6) await Once(encoder, 'dequeue');
            if (failure) return;

            // 書き出し開始より前のフレームは捨てる
            if (trimming && _frame.timestamp < startUs) return;

            // FPS を下げる場合は出力グリッドに一致するフレームだけを採用する
            if (outStep > 0 && _frame.timestamp + outStep * 0.25 < grid) return;

            // 出力タイムスタンプはクリップ先頭を 0 にする
            const shifted = trimming ? Math.max(0, _frame.timestamp - startUs) : _frame.timestamp;
            const timestamp = outStep > 0 ? grid : shifted;
            if (outStep > 0) grid += outStep;

            let output = _frame;
            if (needScale) {
                context.drawImage(_frame, 0, 0, _opt.width, _opt.height);
                output = new VideoFrame(canvas, {
                    timestamp: timestamp,
                    duration: outStep > 0 ? Math.round(outStep) : _frame.duration
                });
            }

// 途中フレームから始まるため、先頭は必ずキーフレームにする
            const keyFrame = emitted === 0 || emitted % keyFrame_Interval === 0;
            encoder.encode(output, { keyFrame: keyFrame });

            if (needScale) output.close();
            emitted++;

            if (emitted % 3 === 0 || emitted >= expected) {
                _report({ phase: 'video', ratio: Math.min(1, emitted / expected) });
            }
        };

        const decoder = new global.VideoDecoder({
            output: (_frame) => {
                queue.push(_frame);
                if (!pumping) {
                    pumping = true;
                    pumpDone = pump();
                }
            },
            error: (_error) => { failure = _error; }
        });
        decoder.configure(decoderConfig);

        try {
            // 書き出し開始位置から最も近い手前のキーフレームを復号の起点にする
            let firstIndex = 0;
            if (trimming) {
                for (let i = 0; i < source.videoSamples.length; i++) {
                    const sample = source.videoSamples[i];
                    if ((sample.cts * 1e6) / sample.timescale > startUs) break;
                    if (sample.is_sync) firstIndex = i;
                }
            }

            for (let index = firstIndex; index < source.videoSamples.length; index++) {
                if (failure || _state.cancelled) break;

                const sample = source.videoSamples[index];
                if (trimming && (sample.cts * 1e6) / sample.timescale > endUs) break;

                decoder.decode(new EncodedVideoChunk({
                    type: sample.is_sync ? 'key' : 'delta',
                    timestamp: Math.round((sample.cts * 1e6) / sample.timescale),
                    duration: Math.round((sample.duration * 1e6) / sample.timescale),
                    data: sample.data
                }));

                if (decoder.decodeQueueSize > 8) await Once(decoder, 'dequeue');
            }

            if (!failure && !_state.cancelled) await decoder.flush();
        } finally {
            if (decoder.state !== 'closed') decoder.close();
        }

        if (failure) throw failure;
        await pumpDone;

        if (_state.cancelled) {
            if (encoder.state !== 'closed') encoder.close();
            return null;
        }

        try {
            await encoder.flush();
        } finally {
            if (encoder.state !== 'closed') encoder.close();
        }

        // ---- Audio -------------------------------------------------------------
        if (useAudio) {
            const audioEncodeConfig = {
                codec: 'mp4a.40.2',
                sampleRate: source.audio.sampleRate,
                numberOfChannels: source.audio.channelCount,
                bitrate: _opt.audioBitrate || 128000
            };

            const support = await global.AudioEncoder.isConfigSupported(audioEncodeConfig);
            if (!support || !support.supported) {
                // Safari / Firefox は AudioEncoder が実装されていないため ffmpeg に任せる
                const error = new Error('This browser cannot encode AAC with the WebCodecs API.');
                error.fallback = true;
                throw error;
            }

            let audioFailure = null;
            const audioEncoder = new global.AudioEncoder({
                output: (_chunk, _meta) => muxer.addAudioChunk(_chunk, _meta),
                error: (_error) => { audioFailure = _error; }
            });
            audioEncoder.configure(support.config);

            const audioQueue = [];
            let audioPumping = false;
            let audioDone = Promise.resolve();

            const audioPump = async () => {
                while (audioQueue.length) {
                    if (audioFailure || _state.cancelled) {
                        while (audioQueue.length) audioQueue.shift().close();
                        return;
                    }
                    const data = audioQueue.shift();
                    try {
                        if (audioEncoder.encodeQueueSize > 24) await Once(audioEncoder, 'dequeue');
                        audioEncoder.encode(data);
                        data.close();
                    } catch (_error) {
                        audioFailure = _error;
                        data.close();
                    }
                }
            };

            const audioDecoder = new global.AudioDecoder({
                output: (_data) => {
                    audioQueue.push(_data);
                    if (!audioPumping) {
                        audioPumping = true;
                        audioDone = audioPump();
                    }
                },
                error: (_error) => { audioFailure = _error; }
            });
            audioDecoder.configure({
                codec: source.audio.codec,
                sampleRate: source.audio.sampleRate,
                numberOfChannels: source.audio.channelCount
            });

            try {
                for (const sample of source.audioSamples) {
                    if (audioFailure || _state.cancelled) break;

                    const time = (sample.cts * 1e6) / sample.timescale;
                    if (trimming) {
                        if (time > endUs) break;
                        // 書き出し開始より前の音声は落とす (AAC のフレーム長は約 21ms)
                        if (time < startUs) continue;
                    }

                    audioDecoder.decode(new EncodedAudioChunk({
                        type: 'key',
                        timestamp: Math.round(time - startUs),
                        duration: Math.round((sample.duration * 1e6) / sample.timescale),
                        data: sample.data
                    }));
                    if (audioDecoder.decodeQueueSize > 24) await Once(audioDecoder, 'dequeue');
                }

                if (!audioFailure && !_state.cancelled) await audioDecoder.flush();
            } finally {
                if (audioDecoder.state !== 'closed') audioDecoder.close();
            }

            if (audioFailure) throw audioFailure;
            await audioDone;

            if (_state.cancelled) {
                if (audioEncoder.state !== 'closed') audioEncoder.close();
                return null;
            }

            try {
                await audioEncoder.flush();
            } finally {
                if (audioEncoder.state !== 'closed') audioEncoder.close();
            }

            _report({ phase: 'audio', ratio: 1 });
        }

        _report({ phase: 'finish', ratio: 1 });
        muxer.finalize();

        return {
            blob: new Blob([target.buffer], { type: 'video/mp4' }),
            engine: 'webcodecs',
            fps: effectiveFps
        };
    }

    // ---------------------------------------------------------------------------
    // ffmpeg.wasm engine (fallback)
    // ---------------------------------------------------------------------------

    async function Transcode_FFmpeg(_file, _opt, _report, _state) {
        _report({ phase: 'prepare', ratio: 0 });
        await Load_Script(Script_Source.ffmpeg);
        await Load_Script(Script_Source.ffmpeg_util);

        const Factory = global.FFmpegWASM && global.FFmpegWASM.FFmpeg;
        const util = global.FFmpegUtil;
        if (!Factory || !util) throw new Error('ffmpeg.wasm could not be initialised.');

        const ffmpeg = new Factory();

        if (ffmpeg.on) {
            ffmpeg.on('progress', (_event) => {
                if (_event && typeof _event.progress === 'number') {
                    _report({ phase: 'encode', ratio: Math.max(0, Math.min(1, _event.progress)) });
                }
            });
        }

        await ffmpeg.load({
            coreURL: await util.toBlobURL(`${FFmpeg_Base}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await util.toBlobURL(`${FFmpeg_Base}/ffmpeg-core.wasm`, 'application/wasm')
        });

        if (_state.cancelled) {
            ffmpeg.terminate();
            return null;
        }

        const extension = (_file.name.split('.').pop() || 'mp4').toLowerCase();
        const input = `input.${extension}`;
        const output = 'output.mp4';

        const filters = [`scale=${_opt.width}:${_opt.height}`];
        if (_opt.fps > 0) filters.push(`fps=${_opt.fps}`);

        const trimming = _opt.duration > 0;
        const start = trimming ? Math.max(0, _opt.start || 0) : 0;

        const args = [];
        // 入力前にシークすると音と映像が同時に切れず、ずれが出にくいため
        if (trimming) args.push('-ss', start.toFixed(3));
        args.push('-i', input);
        if (trimming) args.push('-t', _opt.duration.toFixed(3));
        args.push(
            '-vf', filters.join(','),
            '-c:v', 'libx264',
            '-preset', 'veryfast',
            '-b:v', String(_opt.bitrate),
            '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart'
        );

        if (_opt.audio) {
            args.push('-c:a', 'aac', '-b:a', String(_opt.audioBitrate || 128000));
        } else {
            args.push('-an');
        }
        if (trimming) args.push('-avoid_negative_ts', 'make_zero');
        args.push(output);

        try {
            await ffmpeg.writeFile(input, await util.fetchFile(_file));
            await ffmpeg.exec(args);

            if (_state.cancelled) return null;

            const data = await ffmpeg.readFile(output);
            const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);

            _report({ phase: 'finish', ratio: 1 });

            return {
                blob: new Blob([bytes], { type: 'video/mp4' }),
                engine: 'ffmpeg',
                fps: _opt.fps
            };
        } finally {
            try { ffmpeg.terminate(); } catch (_error) { /* noop */ }
        }
    }

    // ---------------------------------------------------------------------------
    // Probe
    // moov アトムだけを読むので軽く、書き出し前に FPS や音声の有無を取得できる
    // mp4box が読めない形式 (webm など) では null を返す
    // ---------------------------------------------------------------------------

    async function Probe(_file) {
        if (!/\.(mp4|m4v)$/i.test(_file.name)) return null;

        try {
            const source = await Demux(_file);
            const duration = source.video.duration / (source.video.timescale || 1);
            const fps = duration > 0 ? source.videoSamples.length / duration : 0;

            return {
                width: source.video.width,
                height: source.video.height,
                duration: duration,
                fps: fps,
                codec: source.video.codec,
                hasAudio: !!(source.audio && source.audioSamples.length),
                audioCodec: source.audio ? source.audio.codec : '',
                sampleRate: source.audio ? source.audio.sampleRate : 0,
                channelCount: source.audio ? source.audio.channelCount : 0
            };
        } catch (_error) {
            return null;
        }
    }

    // ---------------------------------------------------------------------------
    // Public entry point
    // ---------------------------------------------------------------------------

    async function Transcode(_options, _onProgress, _isCancelled) {
        const report = _onProgress || function () { };
        const check = _isCancelled || function () { return false; };
        const state = { get cancelled() { return check(); } };
        const started = Date.now();

        const options = {
            file: _options.file,
            width: To_Even(_options.width),
            height: To_Even(_options.height),
            fps: _options.fps > 0 ? _options.fps : 0,
            bitrate: _options.bitrate,
            audio: !!_options.audio,
            audioBitrate: _options.audioBitrate,
            start: _options.start > 0 ? _options.start : 0,
            duration: _options.duration > 0 ? _options.duration : 0
        };

        const wanted = _options.engine || 'auto';
        const available = Engine();
        let engine = wanted === 'auto' ? available : wanted;

        if (engine === 'webcodecs' && !Has_WebCodecs()) {
            engine = 'ffmpeg';
        }

        // mp4box.js は mp4/m4v しか開けないので、それ以外は最初から ffmpeg を使う
        const canFallback = wanted === 'auto' || wanted === 'ffmpeg';
        if (engine === 'webcodecs' && canFallback && !Can_Demux(options.file)) {
            engine = 'ffmpeg';
        }

        try {
            const result = engine === 'webcodecs'
                ? await Transcode_WebCodecs(options.file, options, report, state)
                : await Transcode_FFmpeg(options.file, options, report, state);

            if (!result) return { cancelled: true };

            result.elapsed = Date.now() - started;
            return result;
        } catch (error) {
            // WebCodecs は demux / 音声経路などで失敗しうるため ffmpeg で再試行する
            if (engine === 'webcodecs' && error && error.fallback && canFallback) {
                report({ phase: 'prepare', ratio: 0 });
                const result = await Transcode_FFmpeg(options.file, options, report, state);
                if (!result) return { cancelled: true };
                result.elapsed = Date.now() - started;
                return result;
            }
            throw error;
        }
    }

    global.VideoEditor = {
        Engine: Engine,
        Probe: Probe,
        Transcode: Transcode,
        Is_Supported: Is_Supported,
        Can_Demux: Can_Demux,
        Format_Time: Format_Time,
        Format_Size: Format_Size,
        Format_Bitrate: Format_Bitrate,
        Suggest_Bitrate: Suggest_Bitrate,
        To_Even: To_Even,
        Quality_Table: Quality_Table,
        Audio_Table: Audio_Table
    };

})(window);