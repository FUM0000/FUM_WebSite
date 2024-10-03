
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
        <v-card-actions class="justify-center">
            <v-btn color="primary" @click="show = true" text>Answer</v-btn>
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
        }
    },
    props: ['showall'],
    watch: {
        showall: function (_new, _old) {
            this.show = _new;
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