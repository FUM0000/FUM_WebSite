Vue.component('card-word-kanji', {
    template: `
    <v-card class="mx-auto d-flex flex-column">
        <v-spacer />
        <v-card-title class="justify-center">
            <div class="py-8 text-center text-h4 font-weight-medium">
                <slot name="first"></slot>
            </div>
        </v-card-title>
        <v-card-actions class="justify-center">
            <v-btn color="primary" @click="reveal = true" text>答案</v-btn>
        </v-card-actions>

        <v-expand-transition>
            <v-card v-if="reveal" class="d-flex flex-column transition-fast-in-fast-out v-card--reveal" style="height: 100%;" color="teal lighten-5" outlined>
                <v-card-title class="pb-1 justify-center">
                    <div class="pt-8 text-center text-h4 font-weight-medium">
                        <slot name="second"></slot>
                    </div>
                </v-card-title>
                <v-card-actions class="justify-center">
                    <v-btn color="teal accent-4" @click="reveal = false" text>关闭</v-btn>
                </v-card-actions>
            </v-card>
        </v-expand-transition>
    </v-card>
    `,
    data: function () {
        return {
            reveal: false,
        }
    },
    props: ['showall'],
    watch: {
        showall: function (_new, _old) {
            this.reveal = _new;
        }
    }
})