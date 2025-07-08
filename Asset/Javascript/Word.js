
// Component
//// General
Vue.component('card-word-general', {
    template: `
    <v-card class="mx-auto d-flex flex-column">
        <v-card-title class="pb-1 justify-center">
            <div class="pt-8 text-center text-h4 font-weight-medium">
                <slot name="first"></slot>
            </div>
        </v-card-title>
        
        <v-card-actions class="justify-center" style="position: relative;">
            <v-btn color="primary" @click="show = true" text>Answer</v-btn>
            
            <v-btn 
                v-if="audioSrc" 
                icon 
                @click="toggleAudio" 
                color="primary" 
                style="position: absolute; right: 16px;"
            >
                <v-icon>{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
            </v-btn>
        </v-card-actions>

        <v-expand-transition>
            <v-card v-if="show" class="d-flex flex-column transition-fast-in-fast-out v-card--reveal" style="height: 100%;" color="teal lighten-5" outlined>
                <v-spacer />
                <v-card-title class="justify-center">
                    <div class="py-8 text-center text-h4 font-weight-medium">
                        <slot name="second"></slot>
                    </div>
                </v-card-title>
                <v-card-actions class="justify-center">
                    <v-btn color="teal accent-4" @click="show = false" text>Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-expand-transition>
    </v-card>
    `,
    data: function () {
        return {
            show: false,
            audio: null,      // Audioオブジェクトを保持
            isPlaying: false  // 再生状態を管理
        }
    },
    props: {
        showall: Boolean,
        // 音声ファイルのURLを受け取るプロパティ
        audioSrc: {
            type: String,
            default: null
        }
    },
    watch: {
        showall: function (newVal, _old) {
            this.show = newVal;
        },
        // audioSrcプロパティが変更された場合、既存のオーディオをリセット
        audioSrc: function () {
            if (this.audio) {
                this.audio.pause();
                this.audio = null;
                this.isPlaying = false;
            }
        }
    },
    methods: {
        toggleAudio() {
            // Audioオブジェクトがまだ初期化されていなければ、生成する
            if (!this.audio && this.audioSrc) {
                this.audio = new Audio(this.audioSrc);
                // 再生が終了したときのイベントを設定
                this.audio.addEventListener('ended', () => {
                    this.isPlaying = false;
                });
            }

            // Audioオブジェクトが存在する場合のみ処理
            if (this.audio) {
                if (this.isPlaying) {
                    this.audio.pause();
                    this.isPlaying = false;
                } else {
                    // 再開時は常に最初から再生する
                    this.audio.currentTime = 0;
                    this.audio.play();
                    this.isPlaying = true;
                }
            }
        }
    },
    beforeDestroy() {
        // コンポーネントが破棄される前に、音声を停止してリソースをクリーンアップ
        if (this.audio) {
            this.audio.pause();
            this.audio = null;
        }
    }
})

// Mixins
window.Mixins_Word = {
    data() {
        return {
            Ready_Page: false,
            Drawer: false,
            Switch: false,
            List: [],
        };
    },
    methods: {
        ChangeDrawer(_value) { this.Drawer = _value; },
        CreateList(_japanese, _reading, _english) {
            let list = [];
            for (let i = 0; i < _japanese.length; i++) {
                list.push({
                    id: i,
                    japanese: _japanese[i],
                    reading: _reading[i],
                    english: _english[i]
                });
            }
            this.List = list;
        },
    },
    mounted() {
        $(window).ready(() => { this.Ready_Page = true; });
        $(window).on('beforeunload', () => {
            $('#App').css('opacity', '0');
            $(window).scrollTop(0);
        });
    },
};