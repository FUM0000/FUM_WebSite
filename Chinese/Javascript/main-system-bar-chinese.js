Vue.component('main-system-bar-chinese', {
    template: `
    <v-system-bar color="#CFD8DC80" class="font-weight-black"style="height: 50px;" app>
        <v-row aline="center">
            <v-col cols="6" align-self="center">
                <audio id="current_bgm" src="" paused loop></audio>
                <v-icon id="speaker_1">mdi-volume-variant-off</v-icon>
                <slot></slot>
            </v-col>
            
            <v-col cols="6" class="text-right" @click.stop="Drawer_Local = !Drawer_Local">
                <!-- <v-icon id="arrow_1" color="red" x-small style="font-size: 10px; transform: rotate(90deg);">mdi-navigation</v-icon> -->
                <v-btn rounded small plain>菜单</v-btn>
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
    }
})