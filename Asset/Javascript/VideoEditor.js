(function (global) {
    'use strict';

    // ============================================================================
    // Video Editor / Transcoder
    // 動画のリサイズ・圧縮・書き出しエンジン
    //
    // Engine : <video> + Canvas + WebCodecs (H.264) + mp4-muxer
    //
    //   1. 入力 MP4 を <video> に読み込み、ブラウザ内蔵のデコーダで復号する
    //      MP4 の圧縮方式 (H.264 / HEVC / VP9 / AV1 ...) は
    //      ブラウザが再生できるものなら何でも扱えるため、
    //      コーデックごとの分岐や avcC の組み立ては不要になる
    //   2. タイムスタンプ指定でシークし、1 フレームずつ Canvas に描画する
    //   3. WebCodecs で H.264 (avc1) に再エンコードする
    //   4. 音声は Web Audio で PCM にデコードして AAC に再エンコードする
    //   5. mp4-muxer で 1 本の MP4 にまとめて渡す
    //
    // サーバー処理は不要なので GitHub Pages のような静的配信でそのまま動作する
    // (外部 CDN は mp4box / mp4-muxer の 2 スクリプトのみ)
    //
    // Public API:
    //   VideoEditor.Engine()        -> 'webcodecs' | 'unsupported'
    //   VideoEditor.Probe(file)     -> { width, height, duration, fps, bitrate, hasAudio, ... } | null
    //   VideoEditor.Transcode(opt)  -> { blob, engine, elapsed, cancelled }
    // ============================================================================

    const Script_Source = {
        mp4box: 'https://cdn.jsdelivr.net/npm/mp4box@0.5.2/dist/mp4box.all.min.js',
        muxer: 'https://cdn.jsdelivr.net/npm/mp4-muxer@5.2.1/build/mp4-muxer.min.js'
    };

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

    // 書き出しが止まったときに無限に待たないための上限
    const Wait_Limit = {
        open: 30000,
        seek: 20000,
        dequeue: 15000
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

    function Once(_target, _name, _timeout) {
        return new Promise(_resolve => {
            let timer = 0;
            const done = () => {
                if (timer) clearTimeout(timer);
                _target.removeEventListener(_name, done);
                _resolve();
            };
            _target.addEventListener(_name, done);
            if (_timeout > 0) timer = setTimeout(done, _timeout);
        });
    }

    // イベントの発火を待つ。失敗時は message で拒否する
    function Wait_Event(_target, _name, _timeout, _message) {
        return new Promise((_resolve, _reject) => {
            let timer = 0;

            const cleanup = () => {
                _target.removeEventListener(_name, onEvent);
                _target.removeEventListener('error', onError);
                if (timer) clearTimeout(timer);
            };
            const onEvent = () => { cleanup(); _resolve(); };
            const onError = () => { cleanup(); _reject(new Error(_message)); };

            _target.addEventListener(_name, onEvent);
            _target.addEventListener('error', onError);

            if (_timeout > 0) {
                timer = setTimeout(() => {
                    cleanup();
                    _reject(new Error(_message));
                }, _timeout);
            }
        });
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
    // 元のビットレートが判明している場合は、それを上限にすることで
    // 「ダウングレードしても逆に大きくなる」ケースを防ぐ。
    function Suggest_Bitrate(_width, _height, _fps, _quality, _sourceBitrate) {
        const factor = (Quality_Table[_quality] || Quality_Table.standard).pixels;
        const raw = _width * _height * _fps * factor;
        let clamped = Math.min(60000000, Math.max(150000, raw));

        if (_sourceBitrate > 0) {
            clamped = Math.min(clamped, Math.max(_sourceBitrate, 40000000));
            clamped = Math.min(clamped, Math.floor(_sourceBitrate * 0.95));
        }

        return Math.round(clamped / 1000) * 1000;
    }

    // 書き出せるのは mp4box.js が読める mp4/m4v のみ
    function Is_Supported(_file) {
        return Can_Demux(_file);
    }

    // 入力は MP4 / M4V に限定する。中のコーデックは問わない
    function Can_Demux(_file) {
        return /\.(mp4|m4v)$/i.test(_file && _file.name ? _file.name : '');
    }

    // クリップ矩形をフレーム (回転後の表示領域) の範囲内へ丸めて収める。
    // 引数が不正 / 範囲外の場合はフルフレームを返す
    function Clamp_Crop(_crop, _width, _height) {
        if (!_crop || !(_width > 0) || !(_height > 0)) return null;

        let x = Math.round(Number(_crop.x));
        let y = Math.round(Number(_crop.y));
        let w = Math.round(Number(_crop.w));
        let h = Math.round(Number(_crop.h));
        if (!isFinite(x) || !isFinite(y) || !isFinite(w) || !isFinite(h)) return null;

        x = Math.max(0, Math.min(_width - 2, x));
        y = Math.max(0, Math.min(_height - 2, y));
        w = Math.max(2, Math.min(_width - x, w));
        h = Math.max(2, Math.min(_height - y, h));

        return { x: x, y: y, w: w, h: h };
    }

    function Normalize_Rotate(_degrees) {
        const value = Number(_degrees);
        if (!isFinite(value)) return 0;
        const wrapped = value % 360;
        return wrapped === 0 ? 0 : wrapped;
    }

    // ---------------------------------------------------------------------------
    // Engine detection
    // ---------------------------------------------------------------------------

    function Has_WebCodecs() {
        return 'VideoEncoder' in global && 'VideoDecoder' in global;
    }

    function Engine() {
        return Has_WebCodecs() ? 'webcodecs' : 'unsupported';
    }

    function Is_Aac_Supported(_config) {
        if (!global.AudioEncoder || typeof global.AudioEncoder.isConfigSupported !== 'function') {
            return Promise.resolve(false);
        }
        return global.AudioEncoder.isConfigSupported(_config)
            .then(_support => !!(_support && _support.supported))
            .catch(() => false);
    }

    // このブラウザが AAC (mp4a.40.2) をエンコードできるか
    function Can_Encode_Aac(_sampleRate, _channels, _bitrate) {
        return Is_Aac_Supported({
            codec: 'mp4a.40.2',
            sampleRate: _sampleRate || 48000,
            numberOfChannels: _channels || 2,
            bitrate: _bitrate || 128000
        });
    }

    // ---------------------------------------------------------------------------
    // Media helpers
    // ---------------------------------------------------------------------------

    // ファイルを開いた <video> を返す。使ったら dispose で URL を解放する
    async function Open_Video(_file) {
        const url = URL.createObjectURL(_file);
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.src = url;

        const dispose = () => {
            try {
                video.removeAttribute('src');
                video.load();
            } catch (_error) {
                // 解放に失敗しても書き出し結果には影響しない
            }
            URL.revokeObjectURL(url);
        };

        try {
            if (video.readyState < 2) {
                await Wait_Event(video, 'loadeddata', Wait_Limit.open,
                    'This browser cannot decode this video file. Use the latest Chrome / Edge, or convert the file to H.264 first.');
            }
            if (!video.videoWidth || !video.videoHeight) {
                throw new Error('This file has no video track that this browser can decode.');
            }
            return { video: video, dispose: dispose };
        } catch (_error) {
            dispose();
            throw _error;
        }
    }

    // 指定した時刻へシークし、フレームが用意されるのを待つ
    async function Seek_To(_video, _time) {
        const target = Math.max(0, _time);
        if (Math.abs(_video.currentTime - target) < 0.001 && _video.readyState >= 2) return;

        const waiting = Wait_Event(_video, 'seeked', Wait_Limit.seek,
            'Could not seek the video. The file may be damaged.');
        _video.currentTime = target;
        await waiting;
    }

    // 音声トラックを PCM にデコードする。無く / 読めない場合は null
    async function Decode_Audio(_file) {
        const Context = global.AudioContext || global.webkitAudioContext;
        if (!Context) return null;

        let context = null;
        try {
            const buffer = await _file.arrayBuffer();
            context = new Context();
            const audio = await context.decodeAudioData(buffer);
            if (!audio || !audio.length || !audio.numberOfChannels) return null;
            return audio;
        } catch (_error) {
            return null;
        } finally {
            if (context && context.state !== 'closed') {
                const closing = context.close();
                if (closing && typeof closing.catch === 'function') closing.catch(() => { });
            }
        }
    }

    // チャンネル数 / サンプルレートを書き出し向けに合わせる
    async function Conform_Audio(_buffer, _channels, _rate) {
        if (_buffer.numberOfChannels === _channels && _buffer.sampleRate === _rate) return _buffer;
        if (!global.OfflineAudioContext) return _buffer;

        const length = Math.max(1, Math.ceil(_buffer.duration * _rate));
        const context = new global.OfflineAudioContext(_channels, length, _rate);
        const source = context.createBufferSource();
        source.buffer = _buffer;
        source.connect(context.destination);
        source.start(0);
        return await context.startRendering();
    }

    // 書き出し用の AAC 設定を決める。
    // ブラウザが受け付けるビットレート・チャンネル数・サンプルレートは限定的なので、
    // 初期値 → 変換済みバッファの順に候補を試し、全部だめなら案内を出して止める
    async function Pick_Audio(_buffer, _bitrate) {
        if (!global.AudioEncoder || !global.AudioData) {
            throw new Error('This browser cannot encode audio. Set Audio to "Remove audio" and export again.');
        }

        const wanted = _bitrate || 128000;
        const bitrates = [wanted, 128000, 96000]
            .filter((_value, _index, _list) => _value > 0 && _list.indexOf(_value) === _index);

        const buffers = [_buffer];
        const conformed = await Conform_Audio(_buffer, Math.min(2, _buffer.numberOfChannels), 48000);
        if (conformed && conformed !== _buffer) buffers.push(conformed);

        for (const buffer of buffers) {
            for (const bitrate of bitrates) {
                const config = {
                    codec: 'mp4a.40.2',
                    sampleRate: buffer.sampleRate,
                    numberOfChannels: buffer.numberOfChannels,
                    bitrate: bitrate
                };
                if (await Is_Aac_Supported(config)) return { config: config, buffer: buffer };
            }
        }

        throw new Error('This browser cannot re-encode AAC audio. Set Audio to "Remove audio" and export again.');
    }

    // ---------------------------------------------------------------------------
    // Metadata (mp4box.js)
    // moov だけを読むのでサンプルの展開はせず、FPS や音声の有無だけ取得する
    // ---------------------------------------------------------------------------

    async function Read_Info(_file) {
        await Load_Script(Script_Source.mp4box);
        if (!global.MP4Box || !global.MP4Box.createFile) {
            throw new Error('mp4box.js could not be initialised.');
        }

        const buffer = await _file.arrayBuffer();
        if (buffer.fileStart === undefined) buffer.fileStart = 0;

        return new Promise((_resolve, _reject) => {
            const box = global.MP4Box.createFile();
            let settled = false;

            const finish = (_value, _error) => {
                if (settled) return;
                settled = true;
                if (_error) _reject(_error);
                else _resolve(_value);
            };

            box.onError = (_error) => finish(null, new Error(String(_error || 'This file could not be read.')));

            box.onReady = (_info) => {
                try {
                    const video = _info.videoTracks && _info.videoTracks[0];
                    if (!video) {
                        finish(null, new Error('No video track was found in this file.'));
                        return;
                    }

                    const audio = _info.audioTracks && _info.audioTracks[0];
                    const timescale = video.timescale || 1;
                    const duration = timescale > 0 ? video.duration / timescale : 0;
                    const samples = video.nb_samples || 0;

                    finish({
                        width: video.video ? video.video.width : 0,
                        height: video.video ? video.video.height : 0,
                        duration: duration,
                        fps: duration > 0 && samples > 0 ? samples / duration : 0,
                        codec: video.codec || '',
                        bitrate: video.bitrate || 0,
                        hasAudio: !!audio,
                        audioCodec: audio ? audio.codec : '',
                        sampleRate: audio && audio.audio ? audio.audio.sample_rate : 0,
                        channelCount: audio && audio.audio ? audio.audio.channel_count : 0
                    });
                } catch (_error) {
                    finish(null, _error);
                }
            };

            try {
                box.appendBuffer(buffer);
            } catch (_error) {
                finish(null, new Error('This file could not be read as an MP4 file. (' + String(_error) + ')'));
            }
        });
    }

    async function Probe(_file) {
        if (!Can_Demux(_file)) return null;

        try {
            return await Read_Info(_file);
        } catch (_error) {
            return null;
        }
    }

    // ---------------------------------------------------------------------------
    // Encoder config
    // ---------------------------------------------------------------------------

    // 出力解像度に合う H.264 LEVEL を isConfigSupported で選ぶ
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
                if (support && support.supported) {
                    // 返却された設定をそのまま使うと avc 形式が欠ける場合があるため、
                    // mp4-muxer が要求する長さプレフィックス形式を必ず指定する
                    return Object.assign({}, config, support.config, { codec: codec, avc: { format: 'avc' } });
                }
            } catch (_error) {
                // 次の候補へ進む
            }
        }

        throw new Error('This browser cannot encode H.264 with the WebCodecs API.');
    }

    // ---------------------------------------------------------------------------
    // Frame loop
    // ---------------------------------------------------------------------------

    async function Encode_Frames(_video, _job, _report, _state) {
        const canvas = new OffscreenCanvas(_job.width, _job.height);
        const context = canvas.getContext('2d', { alpha: false });
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

        // ---- Crop / Rotate ---------------------------------------------------
        // 切り抜き枠は回転後の表示フレーム上の座標 (画面上で水平固定)。
        // angle === 0 はフレーム == ソースなので矩形を出力へ直描きする高速パス。
        // 回転時は「フレームが必ずソース内に入る」倍率を掛けたアフィン変換を一度だけ
        // 設定して描画するため、黒帯も歪みも生じない
        // ( = 標準的な編集ソフトの傾き調整と同じ挙動 )
        const crop = _job.crop;
        const frame = _job.frame;
        const frameWidth = frame.width;
        const frameHeight = frame.height;
        const sourceWidth = _video.videoWidth;
        const sourceHeight = _video.videoHeight;
        const sourceX = crop ? crop.x : 0;
        const sourceY = crop ? crop.y : 0;
        const cropW = crop ? crop.w : frameWidth;
        const cropH = crop ? crop.h : frameHeight;
        const angle = _job.rotate || 0;
        const radians = (angle * Math.PI) / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        const absCos = Math.abs(cos);
        const absSin = Math.abs(sin);
        const quarterFrame = frameWidth === sourceHeight && frameWidth !== sourceWidth;
        const stageRatio = frameHeight / frameWidth;
        const innerWidth = quarterFrame ? stageRatio : 1;
        const innerHeight = quarterFrame ? 1 : stageRatio;
        const cover = Math.max(1,
            (absCos + stageRatio * absSin) / innerWidth,
            (absSin + stageRatio * absCos) / innerHeight);

        // 出力 = S・cover・R(θ)・(ソース - 中心) + オフセット
        const scaleX = (_job.width / cropW) * cover;
        const scaleY = (_job.height / cropH) * cover;
        const matrix = {
            a: scaleX * cos,
            b: scaleY * sin,
            c: -scaleX * sin,
            d: scaleY * cos,
            e: (frameWidth / 2 - sourceX) * (_job.width / cropW) -
                (scaleX * cos * sourceWidth / 2 - scaleX * sin * sourceHeight / 2),
            f: (frameHeight / 2 - sourceY) * (_job.height / cropH) -
                (scaleY * sin * sourceWidth / 2 + scaleY * cos * sourceHeight / 2)
        };

        const step = 1e6 / _job.fps;
        const frameCount = Math.max(1, Math.round(_job.clip * _job.fps));
        const keyFrame_Interval = Math.max(1, Math.round(_job.fps * 2));
        const lastTime = _job.mediaDuration > 0 ? Math.max(0, _job.mediaDuration - 0.001) : Infinity;

        let failure = null;
        const encoder = new global.VideoEncoder({
            output: (_chunk, _meta) => _job.muxer.addVideoChunk(_chunk, _meta),
            error: (_error) => { failure = _error; }
        });

        try {
            encoder.configure(_job.encodeConfig);

            for (let index = 0; index < frameCount; index++) {
                if (failure) break;
                if (_state.cancelled) return null;

                await Seek_To(_video, Math.min(_job.start + index / _job.fps, lastTime));

                if (angle) {
                    context.fillStyle = '#000000';
                    context.fillRect(0, 0, _job.width, _job.height);
                    context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
                    context.drawImage(_video, 0, 0);
                    context.setTransform(1, 0, 0, 1, 0, 0);
                } else {
                    context.drawImage(_video, sourceX, sourceY, cropW, cropH, 0, 0, _job.width, _job.height);
                }

                const frame = new VideoFrame(canvas, {
                    timestamp: Math.round(index * step),
                    duration: Math.round(step)
                });

                if (encoder.encodeQueueSize > 6) await Once(encoder, 'dequeue', Wait_Limit.dequeue);
                try {
                    encoder.encode(frame, { keyFrame: index % keyFrame_Interval === 0 });
                } finally {
                    frame.close();
                }

                if (index % 2 === 0 || index === frameCount - 1) {
                    _report({ phase: 'video', ratio: Math.min(1, (index + 1) / frameCount) });
                }
            }

            if (failure) throw failure;
            if (_state.cancelled) return null;

            await encoder.flush();
        } catch (_error) {
            failure = failure || _error;
        } finally {
            if (encoder.state !== 'closed') encoder.close();
        }

        if (failure) throw failure;
        return true;
    }

    // ---------------------------------------------------------------------------
    // Audio loop
    // ---------------------------------------------------------------------------

    async function Encode_Audio(_audio, _start, _clip, _muxer, _report, _state) {
        const buffer = _audio.buffer;
        const rate = buffer.sampleRate;
        const channels = buffer.numberOfChannels;
        const first = Math.max(0, Math.min(buffer.length, Math.round(_start * rate)));
        const last = Math.max(first, Math.min(buffer.length, Math.round((_start + _clip) * rate)));
        if (last <= first) return true;

        const total = last - first;
        const block = 4096;
        let failure = null;
        let reported = -1;

        const encoder = new global.AudioEncoder({
            output: (_chunk, _meta) => _muxer.addAudioChunk(_chunk, _meta),
            error: (_error) => { failure = _error; }
        });
        encoder.configure(_audio.config);

        try {
            for (let position = first; position < last; position += block) {
                if (failure) break;
                if (_state.cancelled) return null;

                const frames = Math.min(block, last - position);
                const data = new Float32Array(frames * channels);
                for (let channel = 0; channel < channels; channel++) {
                    data.set(buffer.getChannelData(channel).subarray(position, position + frames), channel * frames);
                }

                const chunk = new AudioData({
                    format: 'f32-planar',
                    sampleRate: rate,
                    numberOfFrames: frames,
                    numberOfChannels: channels,
                    timestamp: Math.round(((position - first) * 1e6) / rate),
                    data: data
                });

                if (encoder.encodeQueueSize > 8) await Once(encoder, 'dequeue', Wait_Limit.dequeue);
                try {
                    encoder.encode(chunk);
                } finally {
                    chunk.close();
                }

                const percent = Math.floor(((position + frames - first) / total) * 100);
                if (percent !== reported) {
                    reported = percent;
                    _report({ phase: 'audio', ratio: (position + frames - first) / total });
                }
            }

            if (failure) throw failure;
            if (_state.cancelled) return null;

            await encoder.flush();
            _report({ phase: 'audio', ratio: 1 });
        } catch (_error) {
            failure = failure || _error;
        } finally {
            if (encoder.state !== 'closed') encoder.close();
        }

        if (failure) throw failure;
        return true;
    }

    // ---------------------------------------------------------------------------
    // Transcode
    // ---------------------------------------------------------------------------

    async function Transcode_File(_file, _opt, _report, _state) {
        _report({ phase: 'prepare', ratio: 0 });

        await Load_Script(Script_Source.muxer);
        if (!global.Mp4Muxer || !global.Mp4Muxer.Muxer) {
            throw new Error('mp4-muxer could not be initialised.');
        }
        if (!global.OffscreenCanvas || !global.VideoFrame) {
            throw new Error('This browser cannot export video. Use the latest Chrome or Edge.');
        }

        const opened = await Open_Video(_file);
        const video = opened.video;

        try {
            const mediaDuration = isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
            const start = Math.max(0, _opt.start || 0);

            let clip = _opt.duration > 0
                ? _opt.duration
                : (mediaDuration > 0 ? Math.max(0, mediaDuration - start) : 0);
            if (mediaDuration > 0) clip = Math.min(clip, Math.max(0, mediaDuration - start));
            if (!(clip > 0)) {
                throw new Error('The export range is empty. Check the trim settings.');
            }

            const wantedFps = _opt.fps > 0 ? _opt.fps : (_opt.sourceFps > 0 ? _opt.sourceFps : 0);
            const effectiveFps = wantedFps > 0 ? wantedFps : 30;

        // ---- Crop / Rotate ------------------------------------------------
        // 切り抜き矩形は「回転を加えた表示フレーム」上の座標 (画面上で水平固定)。
        // 90度回転ではフレームの縦横が入れ替わるため、フレーム寸法を先に確定する
        const rotate = Normalize_Rotate(_opt.rotate);
        const wrap = ((rotate % 360) + 360) % 360;
        const quarter = (wrap > 45 && wrap < 135) || (wrap > 225 && wrap < 315);
        const frameWidth = quarter ? video.videoHeight : video.videoWidth;
        const frameHeight = quarter ? video.videoWidth : video.videoHeight;
        const crop = Clamp_Crop(_opt.crop, frameWidth, frameHeight);

            _report({ phase: 'prepare', ratio: 0.35 });

            // ---- Audio ---------------------------------------------------------
            // ミューサーに音声トラックの情報が必要なため、映像より先に決める
            let audioBuffer = null;
            if (_opt.audio) {
                audioBuffer = await Decode_Audio(_file);
                _report({ phase: 'prepare', ratio: 0.7 });
            }
            const audio = audioBuffer ? await Pick_Audio(audioBuffer, _opt.audioBitrate) : null;
            if (_state.cancelled) return null;

            // ---- Muxer ---------------------------------------------------------
            const target = new global.Mp4Muxer.ArrayBufferTarget();
            const muxer = new global.Mp4Muxer.Muxer({
                target: target,
                fastStart: 'in-memory',
                video: { codec: 'avc', width: _opt.width, height: _opt.height },
                audio: audio ? {
                    codec: 'aac',
                    sampleRate: audio.buffer.sampleRate,
                    numberOfChannels: audio.buffer.numberOfChannels
                } : undefined
            });

            const encodeConfig = await Pick_Video_Codec({
                width: _opt.width,
                height: _opt.height,
                bitrate: _opt.bitrate,
                framerate: effectiveFps,
                avc: { format: 'avc' },
                latencyMode: 'quality'
            });

            // ---- Video --------------------------------------------------------
            const done = await Encode_Frames(video, {
                muxer: muxer,
                encodeConfig: encodeConfig,
                width: _opt.width,
                height: _opt.height,
                start: start,
                clip: clip,
                mediaDuration: mediaDuration,
                fps: effectiveFps,
                crop: crop,
                rotate: rotate,
                frame: { width: frameWidth, height: frameHeight }
            }, _report, _state);
            if (!done) return null;

            // ---- Audio --------------------------------------------------------
            if (audio) {
                _report({ phase: 'audio', ratio: 0 });
                const audioDone = await Encode_Audio(audio, start, clip, muxer, _report, _state);
                if (!audioDone) return null;
            }

            if (_state.cancelled) return null;

            _report({ phase: 'finish', ratio: 1 });
            muxer.finalize();

            return {
                blob: new Blob([target.buffer], { type: 'video/mp4' }),
                engine: 'webcodecs',
                fps: effectiveFps
            };
        } finally {
            opened.dispose();
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
            duration: _options.duration > 0 ? _options.duration : 0,
            sourceFps: _options.sourceFps > 0 ? _options.sourceFps : 0,
            crop: _options.crop || null,
            rotate: Normalize_Rotate(_options.rotate)
        };

        const wanted = _options.engine || 'webcodecs';
        if (wanted !== 'auto' && wanted !== 'webcodecs') {
            throw new Error('This build only exports through the WebCodecs engine. Choose engine "auto" or "webcodecs".');
        }
        if (!Has_WebCodecs()) {
            throw new Error('This browser does not support the WebCodecs API, which is required to export video. Use the latest Chrome or Edge.');
        }
        if (!Can_Demux(options.file)) {
            throw new Error('Only MP4 / M4V files can be exported.');
        }
        if (!(options.bitrate > 0)) {
            throw new Error('The video bitrate could not be determined. Choose a quality preset again.');
        }

        const result = await Transcode_File(options.file, options, report, state);
        if (!result) return { cancelled: true };

        result.elapsed = Date.now() - started;
        return result;
    }

    global.VideoEditor = {
        Engine: Engine,
        Can_Encode_Aac: Can_Encode_Aac,
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
        Audio_Table: Audio_Table,
        Clamp_Crop: Clamp_Crop,
        Normalize_Rotate: Normalize_Rotate
    };

})(window);
