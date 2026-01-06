
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
                <v-btn small outlined icon class="mr-2">
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


let Name_Store = localStorage.getItem("BGM_Name");
let Name = Name_Store == null ? "clair_de_lune.wav" : Name_Store;
let Playing = false;
$(function () {
    let audio = $("#BGM")[0];
    audio.volume = 0.5;
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

            audio.src = "../../Asset/Audio/" + Name;

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
function Get_PlayingBGM() { return Playing; }
function Change_BGM_Name(_name) {
    Name = _name;
    localStorage.setItem("BGM_Name", _name);
}


//// NavigationBar
Vue.component('main-navigation', {
    template: `
    <v-navigation-drawer class="blue-grey lighten-5" v-model="Drawer_Local" app right temporary>


        <!-- ▼ Title ▼ ------------------------------------------------------------------------------------>
        <v-btn :ripple="false" class="Not_Selectable font-weight-black non-underline" block tile @click.stop="Drawer_Local = false;" style="height: 50px; background-color: #333333; color: white;">
            MENU
        </v-btn>
        <!-- ▲ Title ▲ ------------------------------------------------------------------------------------>

        
        <!-- ▼ Navigation ▼ ------------------------------------------------------------------------------->
        <v-list nav dense>


            <!-- ▼ Home ▼ ------------------------------------------------------------------------------------->
            <v-list-item href="../../English/HTML/index.html">
                <v-list-item-icon><v-icon>mdi-home</v-icon></v-list-item-icon>
                <v-list-item-title>Home</v-list-item-title>
            </v-list-item>
            <!-- ▲ Home ▲ ------------------------------------------------------------------------------------->


            <!-- ▼ About me ▼ --------------------------------------------------------------------------------->
            <v-list-group :value="false" prepend-icon="mdi-stamper">
                <template v-slot:activator>
                    <v-list-item-title>About Me</v-list-item-title>
                </template>
                
                <v-list-item href="./AboutMe_Profile.html">
                    <v-list-item-icon />
                    <v-list-item-title>Profile</v-list-item-title>
                    <v-list-item-icon><v-icon>mdi-stamper</v-icon></v-list-item-icon>
                </v-list-item>
                <v-list-item href="./Introduction.html">
                    <v-list-item-icon />
                    <v-list-item-title>Introduction</v-list-item-title>
                    <v-list-item-icon><v-icon>mdi-human-greeting-variant</v-icon></v-list-item-icon>
                </v-list-item>
                <v-list-item href="./AboutMe_Blog.html">
                    <v-list-item-icon />
                    <v-list-item-title>Blog</v-list-item-title>
                    <v-list-item-icon><v-icon>mdi-post-outline</v-icon></v-list-item-icon>
                </v-list-item>
                <v-list-item href="./AboutMe_Brain.html">
                    <v-list-item-icon />
                    <v-list-item-title>Brain Archive</v-list-item-title>
                    <v-list-item-icon><v-icon>mdi-brain</v-icon></v-list-item-icon>
                </v-list-item>

                <v-list-item href="./AboutMe_Gallery.html">
                    <v-list-item-icon />
                    <v-list-item-title>Gallery</v-list-item-title>
                    <v-list-item-icon><v-icon>mdi-image</v-icon></v-list-item-icon>
                </v-list-item>
            </v-list-group>
            <!-- ▲ About me ▲ --------------------------------------------------------------------------------->


            <!-- ▼ Service ▼ ---------------------------------------------------------------------------------->
            <v-list-group :value="false" prepend-icon="mdi-hammer-wrench">
                <template v-slot:activator>
                    <v-list-item-title>Service</v-list-item-title>
                </template>
                
                <v-list-item href="./Service_Journey.html">
                    <v-list-item-icon />
                    <v-list-item-title>Journey</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Service_QRCode.html">
                    <v-list-item-icon />
                    <v-list-item-title>QR Code</v-list-item-title>
                </v-list-item>

                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Company</v-list-item-title>
                    </template>

                    <v-list-item href="./Service_CalculateSalary.html">
                        <v-list-item-icon />
                        <v-list-item-title>Calculate Salary</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>

                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Creator</v-list-item-title>
                    </template>

                    <v-list-item href="./Service_BezierCurve.html">
                        <v-list-item-icon />
                        <v-list-item-title>Bezier Curve</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Service_ColorDesign.html">
                        <v-list-item-icon />
                        <v-list-item-title>Color Design</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Service_FontPreview.html">
                        <v-list-item-icon />
                        <v-list-item-title>Font Preview</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Service_ImageEditor.html">
                        <v-list-item-icon />
                        <v-list-item-title>Image Editor</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Service_ImageLayout.html">
                        <v-list-item-icon />
                        <v-list-item-title>Image Layout</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>

                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Game</v-list-item-title>
                    </template>

                    <v-list-item href="./Service_RecommendCounterPick.html">
                        <v-list-item-icon />
                        <v-list-item-title>Counter Pick</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>

                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Other</v-list-item-title>
                    </template>

                    <v-list-item href="./Service_Calendar.html">
                        <v-list-item-icon />
                        <v-list-item-title>Calendar</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Service_VariousConverters.html">
                        <v-list-item-icon />
                        <v-list-item-title>Various Converters</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Service_VariousStatistics.html">
                        <v-list-item-icon />
                        <v-list-item-title>Various Statistics</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
            </v-list-group>
            <!-- ▲ Service ▲ ---------------------------------------------------------------------------------->


            <!-- ▼ Japanese Language ▼ ------------------------------------------------------------------------>
            <v-list-group :value="false" prepend-icon="mdi-translate-variant">
                <template v-slot:activator>
                    <v-list-item-title>Japanese Language</v-list-item-title>
                </template>

                <!-- ▼ Basic ▼ ------------------------------------------------------------------------------------>
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Basic</v-list-item-title>
                        <v-list-item-icon><v-icon>mdi-book-account</v-icon></v-list-item-icon>
                    </template>

                    <v-list-item href="./Japanese_Basic_Memory.html">
                        <v-list-item-icon />
                        <v-list-item-title>Memory Mechanism</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Basic_LearningPoints.html">
                        <v-list-item-icon />
                        <v-list-item-title>Learning Points</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Basic_Character.html">
                        <v-list-item-icon />
                        <v-list-item-title>Character</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Basic_Grammar.html">
                        <v-list-item-icon />
                        <v-list-item-title>Grammar</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Basic_Asking.html">
                        <v-list-item-icon />
                        <v-list-item-title>Word - Asking</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Basic_GeneralWord.html">
                        <v-list-item-icon />
                        <v-list-item-title>Word - General Word</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Basic_Conversation.html">
                        <v-list-item-icon />
                        <v-list-item-title>Word - Conversation</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Basic_Verb.html">
                        <v-list-item-icon />
                        <v-list-item-title>Word - Verb</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Basic_Adjective_i.html">
                        <v-list-item-icon />
                        <v-list-item-title>Word - Adjective - i</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Basic_Adjective_na.html">
                        <v-list-item-icon />
                        <v-list-item-title>Word - Adjective - na</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Basic_Adverb.html">
                        <v-list-item-icon />
                        <v-list-item-title>Word - Adverb</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Basic ▲ ------------------------------------------------------------------------------------>
                
                <!-- ▼ Food ▼ ------------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Word - Food</v-list-item-title>
                        <v-list-item-icon><v-icon>mdi-noodles</v-icon></v-list-item-icon>
                    </template>

                    <v-list-item href="./Japanese_Food_General.html">
                        <v-list-item-icon />
                        <v-list-item-title>General</v-list-item-title>
                    </v-list-item>

                    <v-list-item href="./Japanese_Food_Chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>Chinese</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Food_Italian.html">
                        <v-list-item-icon />
                        <v-list-item-title>Italian</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Food_Seasoning.html">
                        <v-list-item-icon />
                        <v-list-item-title>Seasoning</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Food_Sushi.html">
                        <v-list-item-icon />
                        <v-list-item-title>Sushi</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Food ▲ ------------------------------------------------------------------------------------->

                <!-- ▼ Hobby ▼ ------------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Word - Hobby</v-list-item-title>
                        <v-list-item-icon><v-icon>mdi-tennis</v-icon></v-list-item-icon>
                    </template>

                    <v-list-item href="./Japanese_Hobby_Art.html">
                        <v-list-item-icon />
                        <v-list-item-title>Art</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Hobby_Game.html">
                        <v-list-item-icon />
                        <v-list-item-title>Game</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Hobby_Math.html">
                        <v-list-item-icon />
                        <v-list-item-title>Math</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Hobby_Music.html">
                        <v-list-item-icon />
                        <v-list-item-title>Music</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Hobby_Outdoor.html">
                        <v-list-item-icon />
                        <v-list-item-title>Outdoor</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Hobby_Reading.html">
                        <v-list-item-icon />
                        <v-list-item-title>Reading</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Hobby_Sf.html">
                        <v-list-item-icon />
                        <v-list-item-title>SF</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Hobby_Sport.html">
                        <v-list-item-icon />
                        <v-list-item-title>Sport</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Hobby_Travel.html">
                        <v-list-item-icon />
                        <v-list-item-title>Travel</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Hobby ▲ ------------------------------------------------------------------------------------>

                <!-- ▼ JAPALISH ▼ --------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Word - JAPALISH</v-list-item-title>
                        <v-list-item-icon><v-icon>mdi-syllabary-katakana</v-icon></v-list-item-icon>
                    </template>

                    <v-list-item href="./Japanese_Japalish_Explanation.html">
                        <v-list-item-icon />
                        <v-list-item-title>Explanation</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Japalish_Level_1.html">
                        <v-list-item-icon />
                        <v-list-item-title>Level 1</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Japalish_Level_2.html">
                        <v-list-item-icon />
                        <v-list-item-title>Level 2</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Japalish_Level_3.html">
                        <v-list-item-icon />
                        <v-list-item-title>Level 3</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ JAPALISH ▲ --------------------------------------------------------------------------------->

                <!-- ▼ Life ▼ ------------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Word - Life</v-list-item-title>
                        <v-list-item-icon><v-icon>mdi-coffee</v-icon></v-list-item-icon>
                    </template>

                    <v-list-item href="./Japanese_Life_Body.html">
                        <v-list-item-icon />
                        <v-list-item-title>Body</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Life_Computer.html">
                        <v-list-item-icon />
                        <v-list-item-title>Computer</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Life_House.html">
                        <v-list-item-icon />
                        <v-list-item-title>House</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Life_Kitchen.html">
                        <v-list-item-icon />
                        <v-list-item-title>Kitchen</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Life_Time.html">
                        <v-list-item-icon />
                        <v-list-item-title>Time</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Life ▲ ------------------------------------------------------------------------------------->

                <!-- ▼ Nature ▼ ----------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Word - Nature</v-list-item-title>
                        <v-list-item-icon><v-icon>mdi-nature-people</v-icon></v-list-item-icon>
                    </template>

                    <v-list-item href="./Japanese_Nature_General.html">
                        <v-list-item-icon />
                        <v-list-item-title>General</v-list-item-title>
                    </v-list-item>
                    
                    <v-list-item href="./Japanese_Nature_Animal.html">
                        <v-list-item-icon />
                        <v-list-item-title>Animal</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Nature_Forest.html">
                        <v-list-item-icon />
                        <v-list-item-title>Forest</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Nature_Plant.html">
                        <v-list-item-icon />
                        <v-list-item-title>Plant</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Nature_River.html">
                        <v-list-item-icon />
                        <v-list-item-title>River</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Nature_Sea.html">
                        <v-list-item-icon />
                        <v-list-item-title>Sea</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Nature ▲ ----------------------------------------------------------------------------------->

                <!-- ▼ Shop ▼ ------------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Word - Shop</v-list-item-title>
                        <v-list-item-icon><v-icon>mdi-cart</v-icon></v-list-item-icon>
                    </template>

                    <v-list-item href="./Japanese_Shop_ClothesStore.html">
                        <v-list-item-icon />
                        <v-list-item-title>Clothes</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Shop_Supermarket.html">
                        <v-list-item-icon />
                        <v-list-item-title>Supermarket</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Shop ▲ ------------------------------------------------------------------------------------->

                <!-- ▼ Outside ▼ ---------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Word - Outside</v-list-item-title>
                        <v-list-item-icon><v-icon>mdi-beach</v-icon></v-list-item-icon>
                    </template>

                    <v-list-item href="./Japanese_Outside_Cafe.html">
                        <v-list-item-icon />
                        <v-list-item-title>Cafe</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Outside_Company.html">
                        <v-list-item-icon />
                        <v-list-item-title>Company</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Outside_Direction.html">
                        <v-list-item-icon />
                        <v-list-item-title>Direction</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Outside_Gym.html">
                        <v-list-item-icon />
                        <v-list-item-title>Gym</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Outside_Hospital.html">
                        <v-list-item-icon />
                        <v-list-item-title>Hospital</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Outside_Restaurant.html">
                        <v-list-item-icon />
                        <v-list-item-title>Restaurant</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Outside_Park.html">
                        <v-list-item-icon />
                        <v-list-item-title>Park</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Outside_Road.html">
                        <v-list-item-icon />
                        <v-list-item-title>Road</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Outside_School.html">
                        <v-list-item-icon />
                        <v-list-item-title>School</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Outside_Vehicle.html">
                        <v-list-item-icon />
                        <v-list-item-title>Vehicle</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japanese_Outside_Weather.html">
                        <v-list-item-icon />
                        <v-list-item-title>Weather</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Outside ▲ ---------------------------------------------------------------------------------->

                <!-- ▼ Verb ▼ ------------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Verb</v-list-item-title>
                        <v-list-item-icon><v-icon>mdi-book-open-page-variant</v-icon></v-list-item-icon>
                    </template>

                    <v-list-item href="./Japanese_Verb_Type.html">
                        <v-list-item-icon />
                        <v-list-item-title>Type</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Verb ▲ ------------------------------------------------------------------------------------->
                
                <!-- ▼ Recommend ▼ -------------------------------------------------------------------------------->
                <v-list-item href="./Japanese_Recommend_Learning.html">
                    <v-list-item-icon />
                    <v-list-item-title>Recommend Site</v-list-item-title>

                    <v-list-item-icon><v-icon>mdi-hand-heart-outline</v-icon></v-list-item-icon>
                </v-list-item>
                <!-- ▲ Recommend ▲ -------------------------------------------------------------------------------->

            </v-list-group>
            <!-- ▲ Japanese Language ▲ ------------------------------------------------------------------------>


            <!-- ▼ Japanese Culture ▼ ------------------------------------------------------------------------->
            <v-list-group :value="false" prepend-icon="mdi-checkbox-blank-circle">
                <template v-slot:activator>
                    <v-list-item-title>Japanese Culture</v-list-item-title>
                </template>

                <!-- ▼ Season ▼ ------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Season</v-list-item-title>
                        <v-list-item-icon><v-icon>mdi-cloud-outline</v-icon></v-list-item-icon>
                    </template>

                    <v-list-item href="./Japan_Season_Tsuyu.html">
                        <v-list-item-icon />
                        <v-list-item-title>Tsuyu</v-list-item-title>
                    </v-list-item>

                </v-list-group sub-group>
                <!-- ▲ Season ▲ ------------------------------------------------------------------------------->

                <!-- ▼ Shop ▼ --------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Shop</v-list-item-title>
                        <v-list-item-icon><v-icon>mdi-store</v-icon></v-list-item-icon>
                    </template>

                    <v-list-item href="./Japan_Japanese_Shop_List.html">
                        <v-list-item-icon />
                        <v-list-item-title>Overview</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japan_Japanese_Shop_Daiso.html">
                        <v-list-item-icon />
                        <v-list-item-title>DAISO</v-list-item-title>
                    </v-list-item>

                </v-list-group sub-group>
                <!-- ▲ Shop ▲ --------------------------------------------------------------------------------->

                <!-- ▼ Traffic ▼ ------------------------------------------------------------------------------>
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Traffic</v-list-item-title>
                        <v-list-item-icon><v-icon>mdi-plane-train</v-icon></v-list-item-icon>
                    </template>

                    <v-list-item href="./Japan_Travel.html">
                        <v-list-item-icon />
                        <v-list-item-title>Travel</v-list-item-title>
                    </v-list-item>

                </v-list-group sub-group>
                <!-- ▲ Traffic ▲ ------------------------------------------------------------------------------>

                <!-- ▼ Food ▼ --------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Food</v-list-item-title>
                        <v-list-item-icon><v-icon>mdi-noodles</v-icon></v-list-item-icon>
                    </template>

                    <v-list-item href="./Japan_AsianCuisine.html">
                        <v-list-item-icon />
                        <v-list-item-title>Asian Cuisine</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japan_Food.html">
                        <v-list-item-icon />
                        <v-list-item-title>Food</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japan_Drink.html">
                        <v-list-item-icon />
                        <v-list-item-title>Drink</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japan_Snack.html">
                        <v-list-item-icon />
                        <v-list-item-title>Snack</v-list-item-title>
                    </v-list-item>

                </v-list-group sub-group>
                <!-- ▲ Food ▲ --------------------------------------------------------------------------------->

                <v-list-item href="./Japan_Statistics.html">
                    <v-list-item-icon />
                    <v-list-item-title>Statistics</v-list-item-title>

                    <v-list-item-icon><v-icon>mdi-finance</v-icon></v-list-item-icon>
                </v-list-item>

            </v-list-group>
            <!-- ▲ Japanese Culture ▲ ------------------------------------------------------------------------->


            <!-- ▼ Cooking ▼ ---------------------------------------------------------------------------------->
            <v-list-group :value="false" prepend-icon="mdi-chef-hat">
                <template v-slot:activator>
                    <v-list-item-title>Cooking</v-list-item-title>
                </template>

                <!-- ▼ Complexity ▼ --------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Difficulty</v-list-item-title>
                    </template>

                    <v-list-item href="./Cooking_Simple.html">
                        <v-list-item-icon />
                        <v-list-item-title>Simple</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Cooking_Normal.html">
                        <v-list-item-icon />
                        <v-list-item-title>Normal</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Cooking_Complex.html">
                        <v-list-item-icon />
                        <v-list-item-title>Complex</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Complexity ▲ --------------------------------------------------------------------------->
                
                <v-list-item href="./Cooking_Science.html">
                    <v-list-item-icon />
                    <v-list-item-title>Science</v-list-item-title>
                </v-list-item>

            </v-list-group>
            <!-- ▲ Cooking ▲ ---------------------------------------------------------------------------------->


            <!-- ▼ Plant ▼ ------------------------------------------------------------------------------------>
            <v-list-group :value="false" prepend-icon="mdi-sprout">
                <template v-slot:activator>
                    <v-list-item-title>Plant</v-list-item-title>
                </template>

                <v-list-item href="./Plant_General.html">
                    <v-list-item-icon />
                    <v-list-item-title>General</v-list-item-title>
                </v-list-item>

                <!-- ▼ Flower ▼ ----------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Flower</v-list-item-title>
                        <v-list-item-icon><v-icon>mdi-flower</v-icon></v-list-item-icon>
                    </template>

                    <v-list-item href="./Flower_Rose.html">
                        <v-list-item-icon />
                        <v-list-item-title>Rose</v-list-item-title>
                    </v-list-item>

                </v-list-group sub-group>
                <!-- ▲ Flower ▲ ----------------------------------------------------------------------------------->

                <!-- ▼ Herb ▼ ------------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Herb</v-list-item-title>
                        <v-list-item-icon><v-icon>mdi-leaf</v-icon></v-list-item-icon>
                    </template>


                    <v-list-item href="./Herb_Basil.html">
                        <v-list-item-icon />
                        <v-list-item-title>Basil</v-list-item-title>
                    </v-list-item>

                </v-list-group sub-group>
                <!-- ▲ Herb ▲ ------------------------------------------------------------------------------------->

                <!-- ▼ Vegetable ▼ -------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Vegetable</v-list-item-title>
                        <v-list-item-icon><v-icon>mdi-carrot</v-icon></v-list-item-icon>
                    </template>

                    <v-list-item href="./Plant_Vegetable_Database.html">
                        <v-list-item-icon />
                        <v-list-item-title>Database</v-list-item-title>
                    </v-list-item>

                    <v-list-item href="./Plant_Vegetable_Burdock.html">
                        <v-list-item-icon />
                        <v-list-item-title>Burdock</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Plant_Vegetable_Chrysanthemum.html">
                        <v-list-item-icon />
                        <v-list-item-title>Chrysanthemum</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Plant_Vegetable_Eggplant.html">
                        <v-list-item-icon />
                        <v-list-item-title>Eggplant</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Plant_Vegetable_Konegi.html">
                        <v-list-item-icon />
                        <v-list-item-title>Konegi</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Plant_Vegetable_MiniTomato.html">
                        <v-list-item-icon />
                        <v-list-item-title>Mini Tomato</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Plant_Vegetable_Onion.html">
                        <v-list-item-icon />
                        <v-list-item-title>Onion</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Plant_Vegetable_Potato.html">
                        <v-list-item-icon />
                        <v-list-item-title>Potato</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Plant_Vegetable_Spinach.html">
                        <v-list-item-icon />
                        <v-list-item-title>Spinach</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Vegetable ▲ -------------------------------------------------------------------------------->

            </v-list-group>
            <!-- ▲ Plant ▲ ------------------------------------------------------------------------------------>


            <!-- ▼ Music ▼ ------------------------------------------------------------------------------------>
            <v-list-group :value="false" prepend-icon="mdi-music">
                <template v-slot:activator>
                    <v-list-item-title>Music</v-list-item-title>
                </template>

                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Artist</v-list-item-title>
                        <v-list-item-icon><v-icon>mdi-account-music</v-icon></v-list-item-icon>
                    </template>

                    <v-list-item href="./Music_Showgo.html">
                        <v-list-item-icon />
                        <v-list-item-title>Show-Go</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Music_UtadaHikaru.html">
                        <v-list-item-icon />
                        <v-list-item-title>Utada Hikaru</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>

                <v-list-item href="./Music_Other.html">
                    <v-list-item-icon />
                    <v-list-item-title>Other</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Music_BackgroundBGM.html">
                    <v-list-item-icon />
                    <v-list-item-title>Background BGM</v-list-item-title>
                </v-list-item>
            </v-list-group>
            <!-- ▲ Music ▲ ------------------------------------------------------------------------------------>
            

            <!-- ▼ Game ▼ ------------------------------------------------------------------------------------->
            <v-list-group :value="false" prepend-icon="mdi-nintendo-game-boy">
                <template v-slot:activator>
                    <v-list-item-title>Game</v-list-item-title>
                </template>
                
                <v-list-item href="./Game_RandomQuestion.html">
                    <v-list-item-icon />
                    <v-list-item-title>Random Question</v-list-item-title>

                    <v-list-item-icon><v-icon>mdi-comment-question-outline</v-icon></v-list-item-icon>
                </v-list-item>
                <v-list-item href="./Game_ReflexSpeed.html">
                    <v-list-item-icon />
                    <v-list-item-title>Reflex Speed</v-list-item-title>
                    <v-list-item-icon><v-icon>mdi-speedometer-slow</v-icon></v-list-item-icon>
                </v-list-item>
                <v-list-item href="./Game_Roulette.html">
                    <v-list-item-icon />
                    <v-list-item-title>Roulette</v-list-item-title>
                    
                    <v-list-item-icon><v-icon>mdi-pizza</v-icon></v-list-item-icon>
                </v-list-item>
                <v-list-item href="./Game_KittyHopper.html">
                    <v-list-item-icon />
                    <v-list-item-title>Kitty Hopper</v-list-item-title>
                    <v-list-item-icon><v-icon>mdi-cat</v-icon></v-list-item-icon>
                </v-list-item>
            </v-list-group>
            <!-- ▲ Game ▲ ------------------------------------------------------------------------------------->


            <!-- ▼ My Notes ▼ --------------------------------------------------------------------------------->
            <v-list-group :value="false" prepend-icon="mdi-book-open-page-variant">
                <template v-slot:activator>
                    <v-list-item-title>My Notes</v-list-item-title>
                </template>

                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>コンピュータ</v-list-item-title>
                        <v-list-item-icon><v-icon>mdi-laptop</v-icon></v-list-item-icon>
                    </template>

                    <v-list-item href="./Note_Programming_DesignPattern.html">
                        <v-list-item-icon />
                        <v-list-item-title>デザインパターン</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Note_AI.html">
                        <v-list-item-icon />
                        <v-list-item-title>AI</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Note_Quantum.html">
                        <v-list-item-icon />
                        <v-list-item-title>量子コンピュータ</v-list-item-title>
                    </v-list-item>
                </v-list-group>

                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>資格</v-list-item-title>
                        <v-list-item-icon><v-icon>mdi-account-tie</v-icon></v-list-item-icon>
                    </template>

                    <v-list-item href="./Note_AppliedInformation.html">
                        <v-list-item-icon />
                        <v-list-item-title>応用情報技術者試験</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Learning_Makeup.html">
                        <v-list-item-icon />
                        <v-list-item-title>日本化粧品検定１級</v-list-item-title>
                    </v-list-item>
                </v-list-group>
                
            </v-list-group>
            <!-- ▲ My Notes ▲ --------------------------------------------------------------------------------->


        </v-list>
        <!-- ▲ Navigation ▲ ------------------------------------------------------------------------------->


    </v-navigation-drawer>
    `,
    props: ['drawer'],
    computed: {
        Drawer_Local: {
            get() { return this.drawer; },
            set(_value) { this.$emit("change-drawer", _value); }
        }
    },
})

//// Footer
Vue.component('main-footer', {
    template: `
    <v-footer color="#FFFFFF60" class="font-weight-black" app>
        <v-btn @click="scrollToBottom" text x-small>
            <v-icon color="blue">mdi-chevron-down</v-icon>
        </v-btn>
        <v-spacer />
        <span style="font-size: 0.8rem;">© 2025 FUM. All rights reserved.</span>
        <v-spacer />
        <v-btn @click="scrollToTop" text x-small>
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
        <span style="font-size: 0.8rem;">© 2025 FUM. All rights reserved.</span>
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

        <v-card-title class="text-h5 font-weight-medium" style="flex: 0 1 auto;">
            {{ title }}
        </v-card-title>

        <v-card-text class="Card_Description" style="flex: 0 1 auto;">
            {{ description }}
        </v-card-text>

        <v-card-actions v-if="explanation" style="margin-top: auto; flex: 0 1 auto;">
            <v-btn color="primary" block outlined @click="Show_Explanation = true">Explanation</v-btn>
        </v-card-actions>

        <v-card-actions v-if="recommend" style="flex: 0 1 auto;">
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
    },
    mounted() {
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