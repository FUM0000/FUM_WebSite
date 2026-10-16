
// Funcion
//// Scroll
function ScrollToBottom() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
}
//// Random
function RandomNumber_Between(_min, _max) { return Math.random() * (_max - _min + 1) + _min; }

// Component
//// SystemBar
Vue.component('main-system-bar', {
    template: `
    <v-system-bar color="#FFFFFF60" class="font-weight-black" style="height: 50px;" app>
        <v-row aline="center">
            <v-col cols="9" align-self="center">
                <audio id="BGM" src="" paused loop></audio>
                <v-btn small outlined icon class="mr-2" aria-label="BGM playback">
                    <v-icon id="Speaker" small>mdi-volume-variant-off</v-icon>
                </v-btn>
                <slot></slot>
            </v-col>
            
            <v-col cols="3" class="text-right" align-self="center" @click.stop="Drawer_Local = !Drawer_Local">
                <v-btn small outlined tile>MENU</v-btn>
            </v-col>
        </v-row>
    </v-system-bar>
    `,
    props: ['drawer'],
    computed: {
        Drawer_Local: {
            get() { return this.drawer; },
            set(_value) { this.$emit("change-drawer", _value); }
        }
    },
})


Default_BGM = 'Clair_de_Lune.wav';
Default_Volume_BGM = 0.5;
function Get_Name_BGM() {
    const saved = localStorage.getItem('appSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        if (settings.bgm && settings.bgm !== 'none') {
            return settings.bgm + '.wav';
        }
    }
    return Default_BGM;
}
function Get_Volume_BGM() {
    const saved = localStorage.getItem('appSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        if (settings.bgmVolume != null) {
            return settings.bgmVolume / 100.0;
        }
    }
    return Default_Volume_BGM;
}

let Name;
let Playing = false;
$(function () {
    const audio = $("#BGM")[0];
    Name = Get_Name_BGM();
    audio.volume = Get_Volume_BGM();
    $("#Speaker").on("click", function () {
        if (Playing) {
            $(this).removeClass("mdi-volume-source");
            $(this).addClass("mdi-volume-variant-off");
            audio.pause();
        }
        else {
            var $this = $(this);
            $this.removeClass("mdi-volume-variant-off mdi-volume-source");
            $this.addClass("mdi-loading mdi-spin");

            // Settingから最新のBGM設定を取得
            Name = Get_Name_BGM();
            audio.src = "../../Asset/Audio/BGM/" + Name;

            audio.oncanplaythrough = function () {
                $this.removeClass("mdi-loading mdi-spin");
                $this.addClass("mdi-volume-source");
                audio.play();
            };

            audio.onerror = function () {
                $this.removeClass("mdi-loading mdi-spin");
                $this.addClass("mdi-volume-variant-off");
            };
        }
    });
    audio.onplaying = function () { Playing = true; };
    audio.onpause = function () { Playing = false; };
});
function Get_Playing() {
    return Playing;
}
function Change_BGM() {
    if (Playing) {
        const audio = $("#BGM")[0];
        audio.pause();
        audio.src = "../../Asset/Audio/BGM/" + Get_Name_BGM();
        audio.play();
    }
}
function Change_Volume_BGM() {
    const audio = $("#BGM")[0];
    audio.volume = Get_Volume_BGM();
}
function Get_Menu_Color() {
    const saved = localStorage.getItem('appSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        if (settings.menuColor) {
            return settings.menuColor;
        }
    }
    return '#CFD8DC';
}
function Build_Menu_Fade_Stops(_r, _g, _b, _maxAlpha) {
    const steps = 12;
    const stops = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const eased = t * t * (3 - 2 * t);
        const alpha = Math.round(eased * _maxAlpha * 10000) / 10000;
        let position = '0px';
        if (i === steps) position = 'var(--menu-fade, 96px)';
        else if (i > 0) position = 'calc(var(--menu-fade, 96px) * ' + (i / steps).toFixed(6) + ')';
        stops.push('rgba(' + _r + ', ' + _g + ', ' + _b + ', ' + alpha + ') ' + position);
    }
    return stops.join(', ');
}
function Get_Menu_Gradient(_color) {
    const color = (_color || '').trim() || '#CFD8DC';
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) {
        let hex = color.slice(1);
        if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return 'linear-gradient(to right, ' + Build_Menu_Fade_Stops(r, g, b, 1) + ')';
    }
    return 'linear-gradient(to right, transparent 0px, ' + color + ' var(--menu-fade, 96px))';
}
function Get_Menu_Title_Gradient() {
    return 'linear-gradient(to right, ' + Build_Menu_Fade_Stops(0, 0, 0, 0.54) + ')';
}
function Apply_Menu_Background(_element, _color) {
    if (!_element) return;
    const color = _color || Get_Menu_Color();
    _element.style.setProperty('background-color', 'transparent', 'important');
    _element.style.setProperty('background-image', Get_Menu_Gradient(color), 'important');
}


//// NavigationBar
// Page.json (Asset/Data/Page.json) is the single source of truth for the navigation menu.
// Sections / groups / pages / icons are all read from it, so adding a page only requires a Page.json edit.
function Get_Page_Json_Path() {
    const scripts = document.querySelectorAll('script[src]');
    for (const s of scripts) {
        const src = s.getAttribute('src') || '';
        if (src.indexOf('Common.js') !== -1) {
            return src.replace(/Common\.js.*/, '') + '../Data/Page.json';
        }
    }
    return '../../Asset/Data/Page.json';
}
function Build_Flat_Pages(_data) {
    const flat = [];
    Object.keys(_data || {}).forEach(_sectionName => {
        const section = _data[_sectionName] || {};
        (section.groups || []).forEach(_group => {
            (_group.items || []).forEach(_item => {
                flat.push({
                    title: _item.title,
                    url: _item.url,
                    description: _item.description || '',
                    category: _sectionName,
                    subcategory: _group.title === 'Top' ? '' : _group.title
                });
            });
        });
    });
    return flat;
}
function Build_Nav_Model(_data) {
    const model = [];
    Object.keys(_data || {}).forEach(_sectionName => {
        const section = _data[_sectionName] || {};
        const groups = section.groups || [];
        if (section.flat) {
            // 見出しなしセクション (Home / Guide / Setting) はリンクをそのまま並べる
            groups.forEach(_group => {
                (_group.items || []).forEach(_item => {
                    model.push({ kind: 'item', title: _item.title, url: _item.url, icon: _item.icon || section.icon });
                });
            });
            return;
        }
        const blocks = [];
        groups.forEach(_group => {
            if (_group.title === 'Top') {
                // グループ見出しなし: セクション直下のリンクとして並べる (Page.json 上の位置を保持)
                (_group.items || []).forEach(_item => {
                    blocks.push({ kind: 'item', title: _item.title, url: _item.url, icon: _item.icon });
                });
            }
            else {
                blocks.push({ kind: 'group', title: _group.title, icon: _group.icon, items: _group.items || [] });
            }
        });
        model.push({ kind: 'section', title: _sectionName, icon: section.icon, blocks: blocks });
    });
    return model;
}
function Fallback_Nav_Model() {
    // Page.json が読めない環境 (file:// で開いた場合など) 向けの最小メニュー
    return [
        { kind: 'item', title: 'Home', url: './index.html', icon: 'mdi-home' },
        { kind: 'item', title: 'Guide', url: './Guide.html', icon: 'mdi-compass' },
        { kind: 'item', title: 'Setting', url: './Setting.html', icon: 'mdi-cog' },
        { kind: 'item', title: 'Menu unavailable (open via server)', url: '', icon: 'mdi-alert-outline' }
    ];
}
Vue.component('main-navigation', {
    template: `
    <v-navigation-drawer class="blue-grey lighten-5" v-model="Drawer_Local" app right temporary overlay-opacity="0.15">

        <!-- ▼ Title ▼ ------------------------------------------------------------------------------------>
        <v-btn :ripple="false" class="Not_Selectable font-weight-black non-underline" block tile @click.stop="Drawer_Local = false;" :style="{ background: Title_Gradient }" style="height: 50px; color: white;">
            <div style="display: flex; width: 100%; align-items: center;">
                <span style="flex: 1;"></span>
                <span style="display: inline-block; transform: translateX(2em);">MENU</span>
                <span style="flex: 1; text-align: right; white-space: nowrap;"><v-icon small style="color: white;">mdi-chevron-right</v-icon><v-icon small style="color: white; margin-left: -10px;">mdi-chevron-right</v-icon></span>
            </div>
        </v-btn>
        <!-- ▲ Title ▲ ------------------------------------------------------------------------------------>


        <!-- ▼ Search Box ▼ ------------------------------------------------------------------------------->
        <div style="padding: 10px 12px 4px; flex-shrink: 0;">
            <div style="position: relative; border-radius: 999px; background: rgba(255, 255, 255, 0.65); border: 1px solid rgba(120, 140, 160, 0.35); box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.10);">
                <v-icon small style="position:absolute; top:50%; left:13px; transform:translateY(-55%); color: rgba(60, 70, 90, 0.75);">mdi-magnify</v-icon>
                <input v-model="Search_Query" type="text" placeholder="Search pages..."
                    style="width:100%; border:none; outline:none; background:transparent; padding:9px 38px; font-size:14px; color:#333; border-radius:999px; box-sizing:border-box;">
                <div v-if="Search_Query" @click="Clear_Search" style="position:absolute; top:50%; right:11px; transform:translateY(-55%); color: rgba(60, 70, 90, 0.6); cursor:pointer; display:flex;">
                    <v-icon small>mdi-close-circle</v-icon>
                </div>
            </div>
        </div>
        <!-- ▲ Search Box ▲ ------------------------------------------------------------------------------->


        <!-- ▼ Search Results ▼ ---------------------------------------------------------------------------->
        <template v-if="Search_Query">
            <div v-if="Search_Results.length" style="overflow-y:auto;">
                <a v-for="r in Search_Results" :key="r.url" :href="r.url" @click="Drawer_Local = false"
                    style="display:block; padding:8px 16px; text-decoration:none; color:inherit; border-bottom:1px solid rgba(120, 140, 160, 0.25);">
                    <div style="font-size:14px; font-weight:600; color:#37474f;">{{ r.title }}</div>
                    <div style="font-size:11px; color:rgba(70, 90, 110, 0.85);">{{ r.url.split('/').pop() }}</div>
                </a>
            </div>
            <div v-else style="padding:16px; text-align:center; font-size:13px; color:rgba(70, 90, 110, 0.8);">
                No pages found
            </div>
        </template>
        <!-- ▲ Search Results ▲ ---------------------------------------------------------------------------->


        <!-- ▼ Navigation ▼ (built from Page.json) -------------------------------------------------------->
        <v-list nav dense v-show="!Search_Query">

            <template v-for="(node, ni) in Nav_Model">

                <!-- セクション見出しなし (Home / Guide / Setting) ------------------------------------------>
                <v-list-item v-if="node.kind === 'item'" :key="'Node' + ni" :href="node.url || null" :disabled="!node.url">
                    <v-list-item-icon><v-icon v-if="node.icon">{{ node.icon }}</v-icon></v-list-item-icon>
                    <v-list-item-title>{{ node.title }}</v-list-item-title>
                </v-list-item>

                <!-- セクション ------------------------------------------------------------------------------>
                <v-list-group v-else :key="'Node' + ni" :value="false" :prepend-icon="node.icon">
                    <template v-slot:activator>
                        <v-list-item-title>{{ node.title }}</v-list-item-title>
                    </template>

                    <template v-for="(block, bi) in node.blocks">

                        <v-list-item v-if="block.kind === 'item'" :key="'Node' + ni + '_Item' + bi" :href="block.url">
                            <v-list-item-icon />
                            <v-list-item-title>{{ block.title }}</v-list-item-title>
                            <v-list-item-icon v-if="block.icon"><v-icon>{{ block.icon }}</v-icon></v-list-item-icon>
                        </v-list-item>

                        <v-list-group v-else :key="'Node' + ni + '_Group' + bi" sub-group :value="false">
                            <template v-slot:activator>
                                <v-list-item-title>{{ block.title }}</v-list-item-title>
                                <v-list-item-icon v-if="block.icon"><v-icon>{{ block.icon }}</v-icon></v-list-item-icon>
                            </template>

                            <v-list-item v-for="(item, ii) in block.items" :key="'Node' + ni + '_Group' + bi + '_Item' + ii" :href="item.url">
                                <v-list-item-icon />
                                <v-list-item-title>{{ item.title }}</v-list-item-title>
                                <v-list-item-icon v-if="item.icon"><v-icon>{{ item.icon }}</v-icon></v-list-item-icon>
                            </v-list-item>
                        </v-list-group>

                    </template>
                </v-list-group>

            </template>

        </v-list>
        <!-- ▲ Navigation ▲ ------------------------------------------------------------------------------->

    </v-navigation-drawer>
    `,
    props: ['drawer'],
    data() {
        return {
            Search_Query: '',
            All_Pages: [],
            Nav_Model: [],
        };
    },
    computed: {
        Title_Gradient() {
            return Get_Menu_Title_Gradient();
        },
        Drawer_Local: {
            get() { return this.drawer; },
            set(_value) { this.$emit("change-drawer", _value); }
        },
        Search_Results() {
            const q = (this.Search_Query || '').trim().toLowerCase();
            if (!q) return [];
            const terms = q.split(/\s+/).map(t => this.Normalize_Search(t)).filter(t => t);
            if (!terms.length) return [];
            const scored = [];
            this.All_Pages.forEach(p => {
                const fileName = this.Normalize_Search((p.url.split('/').pop() || '').replace(/\.html?$/, ''));
                let ok = true;
                for (const t of terms) {
                    if (!fileName.includes(t)) { ok = false; break; }
                }
                if (ok) scored.push(p);
            });
            return scored.slice(0, 20);
        }
    },
    mounted() {
        this.applyMenuColor();
        this.Load_Pages();
    },
    methods: {
        applyMenuColor() {
            Apply_Menu_Background(this.$el, Get_Menu_Color());
        },
        Clear_Search() {
            this.Search_Query = '';
        },
        Normalize_Search(text) {
            return (text || '').toLowerCase().replace(/[\s_-]+/g, '');
        },
        Load_Pages() {
            fetch(Get_Page_Json_Path())
                .then(res => res.json())
                .then(data => {
                    this.All_Pages = Build_Flat_Pages(data);
                    this.Nav_Model = Build_Nav_Model(data);
                })
                .catch(() => {
                    this.Nav_Model = Fallback_Nav_Model();
                });
        }
    },
})

//// Footer
Vue.component('main-footer', {
    template: `
    <v-footer color="#FFFFFF60" class="font-weight-black" app>
        <v-btn @click="scrollToBottom" text x-small aria-label="Scroll to bottom">
            <v-icon color="blue">mdi-chevron-down</v-icon>
        </v-btn>
        <v-spacer />
        <span style="font-size: 0.8rem;">© 2026 FUM. All rights reserved.</span>
        <v-spacer />
        <v-btn @click="scrollToTop" text x-small aria-label="Scroll to top">
            <v-icon color="red">mdi-chevron-up</v-icon>
        </v-btn>
    </v-footer>
    `,
    methods: {
        scrollToBottom() {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        },
        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }
})
Vue.component('main-footer-simple', {
    template: `
    <v-footer color="#FFFFFF60" class="font-weight-black" app>
        <v-spacer />
        <span style="font-size: 0.8rem;">© 2026 FUM. All rights reserved.</span>
        <v-spacer />
    </v-footer>
    `,
})

//// Carousel
Vue.component('custom-carousel', {
    template: `
        <v-row justify="center">
            <v-col xs="12" md="6">
                <v-card>
                    <v-system-bar class="font-weight-medium" style="background-color: #BFC8CC99;">{{ title }}</v-system-bar>
                    <v-carousel delimiter-icon="mdi-album" :show-arrows="false" :height="height" v-model="internalpagenumber">
                        <v-carousel-item v-for="(item, index) in items" :key="index">
                            <v-sheet height="100%">
                                <v-row class="fill-height" align="center" justify="center">
                                    <v-col cols="10" align="center" v-html="item"></v-col>
                                </v-row>
                            </v-sheet>
                        </v-carousel-item>
                    </v-carousel>
                </v-card>
            </v-col>
        </v-row>
    `,
    props: {
        title: { type: String, required: true },
        items: { type: Array, required: true },
        height: { type: Number, required: true },
        outpagenumber: { type: Number, default: 0 },
    },
    data() {
        return { internalpagenumber: this.outpagenumber !== null ? this.outpagenumber : 0 };
    },
    watch: {
        outpagenumber(_value) {
            if (_value !== null) {
                this.internalpagenumber = _value;
            }
        },
        internalpagenumber(_value) {
            this.$emit('update:outpagenumber', _value);
        }
    }
});
Vue.component('custom-carousel-left', {
    template: `
        <v-row justify="center">
            <v-col xs="12" md="6">
                <v-card>
                    <v-system-bar class="font-weight-medium" style="background-color: #BFC8CC99;">{{ title }}</v-system-bar>
                    
                    <v-carousel 
                        delimiter-icon="mdi-album" 
                        :show-arrows="false" 
                        :height="height !== null ? height : 'auto'" 
                        v-model="internalpagenumber"
                    >

                        <v-carousel-item v-for="(item, index) in items" :key="index">
                            <v-sheet height="100%" class="d-flex flex-column">
                                <div v-if="item.title" class="pt-10 text-center font-weight-bold" style="flex-shrink: 0;">
                                    {{ item.title }}
                                </div>
                                
                                <v-row class="ma-5 pb-10 flex-grow-1" align="start" justify="center">
                                    <v-col cols="10" align="center" v-html="item.content" class="text-left"></v-col>
                                </v-row>
                            </v-sheet>
                        </v-carousel-item>
                    </v-carousel>
                </v-card>
            </v-col>
        </v-row>
    `,
    props: {
        title: { type: String, required: true },
        // itemsプロパティは { title?: string, content: string } 形式のオブジェクト配列を期待します
        items: { type: Array, required: true },

        // ★★★ [高さ調整] ここから変更 ★★★
        // heightプロパティを必須(required)でなくし、指定がない場合のデフォルト値をnullに設定します
        height: {
            type: Number,
            required: false,
            default: null
        },
        // ★★★ [高さ調整] ここまで変更 ★★★

        outpagenumber: { type: Number, default: 0 },
    },
    data() {
        return { internalpagenumber: this.outpagenumber !== null ? this.outpagenumber : 0 };
    },
    watch: {
        outpagenumber(_value) {
            if (_value !== null) {
                this.internalpagenumber = _value;
            }
        },
        internalpagenumber(_value) {
            this.$emit('update:outpagenumber', _value);
        }
    }
});

//// Card
Vue.component('card-explanation-image', {
    template: `
      <v-card class="pa-2 d-flex flex-column" style="height:100%">
        <v-img :src="image" :lazy-src="image" style="flex: 0 1 auto;">
            <transition name="Card_Fade">
                <v-card-text v-if="Show_Recommend" class="pa-5 Card_Recommend">
                    <b>Recommend</b><br><br>
                    {{ recommend }}
                </v-card-text>
            </transition>
        </v-img>

        <v-card-title class="text-subtitle-1 font-weight-medium" style="flex: 0 1 auto; height: 3.8rem; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; word-break: break-word; padding: 8px 16px;">
            {{ title }}
        </v-card-title>

        <v-card-text class="Card_Description" style="flex: 0 1 auto;">
            {{ description }}
        </v-card-text>

        <v-card-actions v-if="explanation" style="margin-top: auto; flex: 0 1 auto;">
            <v-btn color="primary" block outlined @click="Show_Explanation = true">Explanation</v-btn>
        </v-card-actions>

        <v-card-actions v-if="recommend" style="margin-top: auto; flex: 0 1 auto;">
          <v-btn color="primary" block outlined @click="Toggle_Recommend">
            {{ Show_Recommend ? 'Image' : 'Recommend' }}
          </v-btn>
        </v-card-actions>

        <v-dialog v-model="Show_Explanation" max-width="600">
          <v-card>
            <v-card-title class="text-h5">{{ title }}</v-card-title>
            <v-card-text v-html="explanation"></v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="Show_Explanation = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card>
    `,
    props: {
        image: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        recommend: { type: String, required: false },
        explanation: { type: String, required: false },
    },
    data() {
        return { Show_Recommend: false, Show_Explanation: false }
    },
    methods: {
        Toggle_Recommend() { this.Show_Recommend = !this.Show_Recommend },
    }
});
Vue.component('card-explanation-image-link', {
    template: `
      <v-card class="pa-2">
        <a :href="link" target="_blank" rel="noopener noreferrer">
          <v-img :src="image" :lazy-src="image"></v-img>
        </a>
  
        <v-card-title class="text-h5 font-weight-medium">
          {{ title }}
        </v-card-title>
  
        <v-card-text class="Card_Description">
          {{ description }}
        </v-card-text>
      </v-card>
    `,
    props: {
        image: { type: String, required: true },
        link: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
    },
})

// Mixins
window.Mixins_Common = {
    data() {
        return {
            Ready_Page: false,
            Drawer: false,
        };
    },
    methods: {
        ChangeDrawer(_value) { this.Drawer = _value; },

        // メインカラーを適用
        applyMainColor() {
            try {
                const saved = localStorage.getItem('appSettings');
                if (saved) {
                    const settings = JSON.parse(saved);
                    if (settings.mainColor) {
                        // カスタム背景を持つページでは共通背景色の上書きを行わない
                        // #App に z-index が設定されている場合( position: relative; z-index: 1 等)、
                        // そのページは独自背景レイヤーを持つとみなす
                        const app = document.querySelector('#App');
                        const hasCustomBackground = app &&
                            window.getComputedStyle(app).getPropertyValue('z-index') !== 'auto';

                        if (!hasCustomBackground) {
                            document.documentElement.style.backgroundColor = settings.mainColor;
                        }

                        const vApp = document.querySelector('.v-application');
                        if (vApp && !hasCustomBackground) {
                            vApp.style.setProperty('background-color', settings.mainColor, 'important');
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to apply main color:', error);
            }
        },
    },
    mounted() {
        // メインカラーを適用
        this.applyMainColor();

        $(window).ready(() => {
            this.Ready_Page = true;
        });
        $(window).on('beforeunload', () => {
            $('#App').css('opacity', '0');
            $(window).scrollTop(0);
        });
    },
};
window.Mixins_Youtube = {
    data() {
        return {
            Ready_Page: false,
            Drawer: false,
            Showing_PageNavigation: false,
            ScrollTop_Past: 0,
            States_Iframe: {}
        };
    },
    computed: {
        Get_Years() {
            return [...new Set(this.Contents.map(content => content.year.toString().split('/')[0]))]
                .sort((a, b) => parseInt(a) - parseInt(b));
        }
    },
    methods: {
        ChangeDrawer(_value) { this.Drawer = _value; },
        Get_YearColor(year) {
            const contentWithYear = this.Contents.find(content =>
                content.year.toString().startsWith(year)
            );
            return contentWithYear ? contentWithYear.color : 'primary';
        },
        Scroll_Year(year) {
            const timelineItems = document.querySelectorAll('.v-timeline-item');
            const targetItem = Array.from(timelineItems).find(item => {
                const yearElement = item.querySelector('.headline.font-weight-bold');
                return yearElement && yearElement.textContent.trim().startsWith(year);
            });

            if (targetItem) {
                targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        },
        Toggle_PageNavigation() {
            this.Showing_PageNavigation = !this.Showing_PageNavigation;
        },
        Handle_Scroll() {
            const st = window.pageYOffset || document.documentElement.scrollTop;
            const scrollDirection = st > this.ScrollTop_Past ? 'down' : 'up';
            document.documentElement.setAttribute('data-scroll-direction', scrollDirection);
            this.ScrollTop_Past = st <= 0 ? 0 : st;

            this.Check_Visibility();
        },
        Check_Visibility() {
            const iframes = document.querySelectorAll('.Youtube_Animation');
            const scrollDirection = document.documentElement.getAttribute('data-scroll-direction') || 'down';

            iframes.forEach((iframe, index) => {
                const rect = iframe.getBoundingClientRect();
                const isVisible = this.Check_Area(rect);
                const id = `iframe-${index}`;

                const wasVisible = this.States_Iframe[id] ? this.States_Iframe[id].visible : false;

                if (isVisible !== wasVisible) {
                    if (isVisible) {
                        if (scrollDirection === 'down') {
                            iframe.classList.add('slide-in-from-bottom');
                            iframe.classList.remove('slide-out-to-top', 'slide-in-from-top', 'slide-out-to-bottom');
                        } else {
                            iframe.classList.add('slide-in-from-top');
                            iframe.classList.remove('slide-out-to-top', 'slide-in-from-bottom', 'slide-out-to-bottom');
                        }
                    } else {
                        if (scrollDirection === 'down' && rect.top < window.innerHeight * 0.3) {
                            iframe.classList.add('slide-out-to-top');
                            iframe.classList.remove('slide-in-from-bottom');
                        } else if (scrollDirection === 'up' && rect.bottom > window.innerHeight * 0.7) {
                            iframe.classList.add('slide-out-to-bottom');
                            iframe.classList.remove('slide-in-from-top');
                        }
                    }
                }

                this.States_Iframe[id] = {
                    visible: isVisible,
                    rect: rect
                };
            });
        },
        Check_Area(rect) {
            const scrollDirection = document.documentElement.getAttribute('data-scroll-direction') || 'down';
            if (scrollDirection === 'down') {
                return (
                    rect.top < window.innerHeight &&
                    rect.bottom > window.innerHeight * 0.25 &&
                    rect.left < window.innerWidth &&
                    rect.right > 0
                );
            }
            else if (scrollDirection === 'up') {
                return (
                    rect.top < window.innerHeight * 0.75 &&
                    rect.bottom > 0 &&
                    rect.left < window.innerWidth &&
                    rect.right > 0
                );
            }
        },
        Initialize_SlideAnimation() {
            const iframes = document.querySelectorAll('.Youtube_Animation');
            const scrollDirection = document.documentElement.getAttribute('data-scroll-direction') || 'down';

            iframes.forEach((iframe, index) => {
                if (scrollDirection === 'down') {
                    iframe.classList.add('initial-bottom');
                } else {
                    iframe.classList.add('initial-top');
                }

                const id = `iframe-${index}`;
                this.States_Iframe[id] = {
                    visible: false,
                    rect: iframe.getBoundingClientRect()
                };
            });
        }
    },
    mounted() {
        $(window).ready(() => {
            this.Ready_Page = true;
        });
        $(window).on('beforeunload', () => {
            $('#App').css('opacity', '0');
            $(window).scrollTop(0);
        });
        $(window).resize(() => {
            $(".Youtube").width($(".Youtube_Col").width());
        });
        this.Initialize_SlideAnimation();
        window.addEventListener('scroll', this.Handle_Scroll);
        this.$nextTick(() => {
            this.Check_Visibility();
        });
    },
    updated() {
        $(".Youtube").width($(".Youtube_Col").width());
    },
    beforeDestroy() {
        window.removeEventListener('scroll', this.Handle_Scroll);
    },
};

// Next Page Navigation Button for Japanese Language pages
(function () {
    function createNextPageButton(nextPage) {
        var container = document.createElement('div');
        container.id = 'next-page-nav';
        container.style.cssText = 'position:fixed;right:24px;z-index:5;';

        var btn = document.createElement('a');
        btn.href = nextPage.url;
        btn.title = nextPage.title;
        btn.innerHTML = '<span style="font-size:13px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + nextPage.title + '</span><span style="margin-left:6px;font-size:18px;line-height:1;position:relative;top:-2px;">&#8250;</span>';
        btn.style.cssText = 'display:inline-flex;align-items:center;padding:9px 17px;background:transparent;color:#4A90C4;border:2px solid #4A90C4;border-radius:28px;text-decoration:none;font-weight:500;font-size:14px;transition:all 0.3s ease;';

        btn.onmouseenter = function () {
            btn.style.borderColor = '#3A80B4';
            btn.style.color = '#3A80B4';
            btn.style.transform = 'translateY(-2px)';
        };
        btn.onmouseleave = function () {
            btn.style.borderColor = '#4A90C4';
            btn.style.color = '#4A90C4';
            btn.style.transform = 'translateY(0)';
        };

        container.appendChild(btn);
        document.body.appendChild(container);

        function positionAboveFooter() {
            var footer = document.querySelector('.v-footer');
            var offset = footer ? footer.offsetHeight + 4 : 84;
            container.style.bottom = offset + 'px';
            container.style.right = window.innerWidth <= 600 ? '4px' : '24px';
        }
        positionAboveFooter();
        window.addEventListener('resize', positionAboveFooter);
        setTimeout(positionAboveFooter, 500);
        setTimeout(positionAboveFooter, 1500);
    }

    function normalizeUrl(url) {
        return url.replace('./', '').replace(/^\//, '');
    }

    $(function () {
        fetch(Get_Page_Json_Path())
            .then(function (res) { return res.json(); })
            .then(function (pageData) {
                var jpSection = pageData['Japanese Language'];
                if (!jpSection) return;

                var flatList = [];
                (jpSection.groups || []).forEach(function (group) {
                    (group.items || []).forEach(function (page) {
                        flatList.push(page);
                    });
                });

                var currentFile = window.location.pathname.split('/').pop();
                var currentIndex = -1;
                for (var i = 0; i < flatList.length; i++) {
                    if (normalizeUrl(flatList[i].url) === currentFile) {
                        currentIndex = i;
                        break;
                    }
                }

                if (currentIndex >= 0 && currentIndex < flatList.length - 1) {
                    createNextPageButton(flatList[currentIndex + 1]);
                }
            })
            .catch(function () { });
    });
})();

// Fixed Switch All toggle for Japanese Language word pages
(function () {
    function createFixedSwitch() {
        var style = document.createElement('style');
        style.textContent = '#App .v-input--switch { display: none !important; }';
        document.head.appendChild(style);

        var container = document.createElement('div');
        container.id = 'fixed-switch-all';
        container.style.cssText = 'position:fixed;top:56px;right:24px;z-index:5;display:inline-flex;align-items:center;padding:9px 17px;background:transparent;color:#4A90C4;border:2px solid #4A90C4;border-radius:28px;font-weight:500;font-size:14px;transition:all 0.3s ease;cursor:pointer;user-select:none;';

        var label = document.createElement('span');
        label.textContent = 'Switch All';
        label.style.cssText = 'font-size:13px;white-space:nowrap;';

        var track = document.createElement('div');
        track.style.cssText = 'width:34px;height:18px;border-radius:9px;background:rgba(74,144,196,0.3);position:relative;transition:background 0.3s;flex-shrink:0;margin-left:8px;';

        var knob = document.createElement('div');
        knob.style.cssText = 'width:14px;height:14px;border-radius:50%;background:white;position:absolute;top:2px;left:2px;transition:left 0.3s;box-shadow:0 1px 3px rgba(0,0,0,0.3);';

        track.appendChild(knob);
        container.appendChild(label);
        container.appendChild(track);
        document.body.appendChild(container);

        function position() {
            container.style.right = window.innerWidth <= 600 ? '4px' : '24px';
        }
        position();
        window.addEventListener('resize', position);

        function updateVisual(isOn) {
            if (isOn) {
                track.style.background = '#4A90C4';
                knob.style.left = '18px';
                knob.style.background = 'white';
            } else {
                track.style.background = 'rgba(74,144,196,0.3)';
                knob.style.left = '2px';
                knob.style.background = 'white';
            }
        }

        setInterval(function () {
            if (typeof vue !== 'undefined' && vue.Switch !== undefined) {
                updateVisual(vue.Switch);
            }
        }, 300);

        container.addEventListener('click', function () {
            if (typeof vue !== 'undefined' && vue.Switch !== undefined) {
                vue.Switch = !vue.Switch;
                updateVisual(vue.Switch);
            }
        });

        container.addEventListener('mouseenter', function () {
            container.style.borderColor = '#3A80B4';
            container.style.color = '#3A80B4';
            container.style.transform = 'translateY(-2px)';
        });
        container.addEventListener('mouseleave', function () {
            container.style.borderColor = '#4A90C4';
            container.style.color = '#4A90C4';
            container.style.transform = 'translateY(0)';
        });
    }

    $(function () {
        var check = setInterval(function () {
            if (typeof vue !== 'undefined' && vue.Switch !== undefined) {
                clearInterval(check);
                createFixedSwitch();
            }
        }, 200);
        setTimeout(function () { clearInterval(check); }, 5000);
    });
})();
