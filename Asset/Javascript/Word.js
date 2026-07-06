
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
                v-if="japanese" 
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
                        v-if="english" 
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
        japanese: {
            type: String,
            default: ''
        },
        ttsLang: {
            type: String,
            default: 'ja-JP'
        },
        english: {
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
                this.isPlaying = false;
                return;
            }

            this.synthUtterance = this.speak(this.japanese, this.ttsLang, this.ttsVoice, function () {
                this.isPlaying = false;
                this.synthUtterance = null;
            }.bind(this));
            this.isPlaying = true;
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

            this.synthUtterance2 = this.speak(this.english, this.ttsLang2, this.ttsVoice2, function () {
                this.isPlaying2 = false;
                this.synthUtterance2 = null;
            }.bind(this));
            this.isPlaying2 = true;
        }
    },
    beforeDestroy() {
        window.speechSynthesis.cancel();
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
        applyMainColor() {
            try {
                const saved = localStorage.getItem('appSettings');
                if (saved) {
                    const settings = JSON.parse(saved);
                    if (settings.mainColor) {
                        document.documentElement.style.backgroundColor = settings.mainColor;
                        const vApp = document.querySelector('.v-application');
                        if (vApp) {
                            vApp.style.setProperty('background-color', settings.mainColor, 'important');
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to apply main color:', error);
            }
        }
    },
    mounted() {
        this.applyMainColor();
        $(window).ready(() => { this.Ready_Page = true; });
        $(window).on('beforeunload', () => {
            $('#App').css('opacity', '0');
            $(window).scrollTop(0);
        });
    },
};
