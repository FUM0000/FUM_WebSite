Vue.component('main-footer', {
    template: `
    <v-footer color="#CFD8DC80" class="font-weight-black" app>
        <v-btn @click="scrollToBottom" text x-small>
            <v-icon color="blue">mdi-chevron-down</v-icon>
        </v-btn>
        <slot></slot>
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