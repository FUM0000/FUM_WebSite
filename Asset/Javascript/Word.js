
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
                v-if="audioSrc || useTts" 
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
                <v-card-actions class="justify-center" style="position: relative;">
                    <v-btn color="teal accent-4" @click="show = false" text>Close</v-btn>
                    <v-btn 
                        v-if="audioSrc2 || ttsText2" 
                        icon 
                        @click="toggleAudio2" 
                        color="primary"
                        style="position: absolute; right: 16px;"
                    >
                        <v-icon>{{ isPlaying2 ? 'mdi-pause' : 'mdi-play' }}</v-icon>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-expand-transition>
    </v-card>
    `,
    data: function () {
        return {
            show: false,
            audio: null,
            isPlaying: false,
            synthUtterance: null,
            ttsVoice: null,
            isPlaying2: false,
            synthUtterance2: null,
            ttsVoice2: null,
        }
    },
    created: function () {
        var self = this;
        if (window.speechSynthesis) {
            var voices = window.speechSynthesis.getVoices();
            if (voices.length) {
                self.ttsVoice = self.pickVoiceForLang(self.ttsLang, voices);
                self.ttsVoice2 = self.pickVoiceForLang(self.ttsLang2, voices);
            }
            window.speechSynthesis.onvoiceschanged = function () {
                var v = window.speechSynthesis.getVoices();
                self.ttsVoice = self.pickVoiceForLang(self.ttsLang, v);
                self.ttsVoice2 = self.pickVoiceForLang(self.ttsLang2, v);
            };
        }
    },
    props: {
        showall: Boolean,
        audioSrc: {
            type: String,
            default: null
        },
        audioSrc2: {
            type: String,
            default: null
        },
        useTts: {
            type: Boolean,
            default: false
        },
        ttsText: {
            type: String,
            default: ''
        },
        ttsLang: {
            type: String,
            default: 'ja-JP'
        },
        ttsText2: {
            type: String,
            default: ''
        },
        ttsLang2: {
            type: String,
            default: 'en-US'
        }
    },
    watch: {
        showall: function (newVal, _old) {
            this.show = newVal;
        },
        audioSrc: function () {
            if (this.audio) {
                this.audio.pause();
                this.audio = null;
                this.isPlaying = false;
            }
        }
    },
    methods: {
        pickVoiceForLang: function (langPref, voices) {
            var preferred = null, fallback = null;
            var langPrefix = langPref.split('-')[0];
            for (var i = 0; i < voices.length; i++) {
                var v = voices[i];
                if (v.lang && v.lang.indexOf(langPrefix) === 0) {
                    if (!fallback) fallback = v;
                    if (v.name.indexOf('Google') !== -1) {
                        if (v.name.indexOf('女性') !== -1 || v.name.indexOf('Female') !== -1) return v;
                        if (!preferred) preferred = v;
                    }
                    if (langPrefix === 'ja') {
                        if (v.name.indexOf('Haruka') !== -1 || v.name.indexOf('Ichiro') !== -1) {
                            if (!preferred) preferred = v;
                        }
                    }
                    if (langPrefix === 'en') {
                        if (v.name.indexOf('Samantha') !== -1 || v.name.indexOf('Zira') !== -1 || v.name.indexOf('David') !== -1) {
                            if (!preferred) preferred = v;
                        }
                    }
                }
            }
            return preferred || fallback || null;
        },
        speak: function (text, lang, voice, onEnd) {
            var utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 0.85;
            if (voice) utterance.voice = voice;
            utterance.onend = onEnd;
            window.speechSynthesis.speak(utterance);
            return utterance;
        },
        toggleAudio() {
            if (this.isPlaying) {
                if (this.synthUtterance) {
                    window.speechSynthesis.cancel();
                    this.synthUtterance = null;
                }
                if (this.audio) {
                    this.audio.pause();
                }
                this.isPlaying = false;
                return;
            }

            if (this.useTts && this.ttsText) {
                this.synthUtterance = this.speak(this.ttsText, this.ttsLang, this.ttsVoice, function () {
                    this.isPlaying = false;
                    this.synthUtterance = null;
                }.bind(this));
                this.isPlaying = true;
                return;
            }

            if (!this.audio && this.audioSrc) {
                this.audio = new Audio(this.audioSrc);
                this.audio.addEventListener('ended', function () {
                    this.isPlaying = false;
                }.bind(this));
                this.audio.addEventListener('error', function () {
                    this.isPlaying = false;
                    if (this.ttsText) {
                        this.synthUtterance = this.speak(this.ttsText, this.ttsLang, this.ttsVoice, function () {
                            this.isPlaying = false;
                            this.synthUtterance = null;
                        }.bind(this));
                    }
                }.bind(this));
            }

            if (this.audio) {
                this.audio.currentTime = 0;
                this.audio.play();
                this.isPlaying = true;
            }
        },
        toggleAudio2() {
            if (this.isPlaying2) {
                if (this.synthUtterance2) {
                    window.speechSynthesis.cancel();
                    this.synthUtterance2 = null;
                }
                this.isPlaying2 = false;
                return;
            }

            if (this.ttsText2) {
                this.synthUtterance2 = this.speak(this.ttsText2, this.ttsLang2, this.ttsVoice2, function () {
                    this.isPlaying2 = false;
                    this.synthUtterance2 = null;
                }.bind(this));
                this.isPlaying2 = true;
                return;
            }

            if (!this.audio2 && this.audioSrc2) {
                this.audio2 = new Audio(this.audioSrc2);
                this.audio2.addEventListener('ended', function () {
                    this.isPlaying2 = false;
                }.bind(this));
            }

            if (this.audio2) {
                this.audio2.currentTime = 0;
                this.audio2.play();
                this.isPlaying2 = true;
            }
        }
    },
    beforeDestroy() {
        window.speechSynthesis.cancel();
        if (this.audio) {
            this.audio.pause();
            this.audio = null;
        }
        if (this.audio2) {
            this.audio2.pause();
            this.audio2 = null;
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
