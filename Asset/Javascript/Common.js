// Check Version
const VersionManager = {
    currentVersion: '1.0.0',

    reloadResources: function() {
        const links = document.getElementsByTagName('link');
        for (let i = 0; i < links.length; i++) {
            if (links[i].rel === 'stylesheet') {
                links[i].href = this.addVersionToURL(links[i].href);
            }
        }
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].src && !scripts[i].src.includes('Common.js')) {
                const newScript = document.createElement('script');
                newScript.src = this.addVersionToURL(scripts[i].src);
                scripts[i].parentNode.replaceChild(newScript, scripts[i]);
            }
        }
    },

    addVersionToURL: function(url) {
        const separator = url.indexOf('?') !== -1 ? '&' : '?';
        return `${url}${separator}v=${this.currentVersion}`;
    },

    init: function() {
        window.addEventListener('load', () => {
            this.reloadResources();
        });
    }
};
VersionManager.init();

// BGM
let Name_Store = localStorage.getItem("BGM_Name");
let Name = Name_Store == null ? "clair_de_lune.wav" : Name_Store;
let Playing = false;
$(function () {
    //// System Bar
    // Audio
    let audio = $("#current_bgm")[0];
    audio.volume = 0.5;
    $("#speaker_1").on("click", function () {
        if (Playing) {
            $(this).removeClass("mdi-volume-source");
            $(this).addClass("mdi-volume-variant-off");
            audio.pause();
        }
        else {
            $(this).removeClass("mdi-volume-variant-off");
            $(this).addClass("mdi-volume-source");
            audio.src = "../../Asset/Audio/" + Name;
            audio.play();
        }
    });
    audio.onplaying = function () { Playing = true; };
    audio.onpause = function () { Playing = false; };
});
function Get_PlayingBGM() {
    return Playing;
}
function Change_BGM_Name(_name) {
    Name = _name;
    localStorage.setItem("BGM_Name", _name);
}
function RandomNumber(_min, _max) {
    return Math.random() * (_max - _min + 1) + _min;
}

// Index
function Resize() {

    // Variables
    const screen_width = $("#main-container").width();
    const screen_height = $("#app").height();
    const screen_narrower = Math.min(screen_width, screen_height);
    const width_center = screen_width * 0.5;
    const height_center = screen_height * 0.35;
    let radian = 0;
    let radius = 0;
    let item_width = 0;
    let item_height = 0;
    let target_x = 0;
    let target_y = 0;
    let item_left = 0;
    let item_top = 0;
    let bottom = 0;


    for (let i = 1; i < 16; i++) {
        // Calculate
        item_width = $(".item-" + i).width();
        item_height = $(".item-" + i).height();
        target_x = width_center + (radius * Math.cos(radian));
        target_y = height_center + (radius * Math.sin(radian));
        item_left = target_x - item_width / 2;
        item_top = target_y - item_height / 2;
        bottom = item_top > bottom ? item_top : bottom;

        // Apply
        $(".item-" + i).css("left", item_left);
        $(".item-" + i).css("top", item_top);

        // Prepare for the next
        radian += Math.PI / 5;
        radius = Math.max(0, (Math.min(screen_narrower * 0.09, 45) - (i - 1)) * radian);
    }

    // Text
    const text_top = bottom + (screen_height - bottom) * 0.5;
    $("#select-music").css("left", width_center - $("#select-music").width * 0.5);
    $("#select-music").css("top", text_top);
}

// Footer
Vue.component('main-footer', {
    template: `
    <v-footer color="#CFD8DC80" class="font-weight-black" app>
        <v-btn @click="scrollToBottom" text x-small>
            <v-icon color="blue">mdi-chevron-down</v-icon>
        </v-btn>
        <v-spacer />
        <span class="copyright">© 2024 FUM / © 2024 FUM_WebSite</span>
        <v-spacer />
        <v-btn @click="scrollToTop" text x-small>
            <v-icon color="red">mdi-chevron-up</v-icon>
        </v-btn>
    </v-footer>
    `,
    methods: {
        scrollToBottom() {
            this.$vuetify.goTo(document.body.scrollHeight);
        },
        scrollToTop() {
            this.$vuetify.goTo(0);
        }
    }
})
Vue.component('main-footer-simple', {
    template: `
    <v-footer color="#CFD8DC80" class="font-weight-black" app>
        <v-spacer />
        <span class="copyright">© 2024 FUM / © 2024 FUM_WebSite</span>
        <v-spacer />
    </v-footer>
    `,
})