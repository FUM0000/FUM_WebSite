
// Funcion
//// Random
function RandomNumber_Between(_min, _max) { return Math.random() * (_max - _min + 1) + _min; }

// Component
//// SystemBar
Vue.component('main-system-bar', {
    template: `
    <v-system-bar color="#CFD8DC80" class="font-weight-black" style="height: 50px;" app>
        <v-row aline="center">
            <v-col cols="6" align-self="center">
                <audio id="BGM" src="" paused loop></audio>
                <v-icon id="Speaker">mdi-volume-variant-off</v-icon>
                <slot></slot>
            </v-col>
            
            <v-col cols="6" class="text-right" @click.stop="Drawer_Local = !Drawer_Local">
                <v-btn rounded small plain>MENU</v-btn>
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
            $(this).removeClass("mdi-volume-variant-off");
            $(this).addClass("mdi-volume-source");
            audio.src = "../../Asset/Audio/" + Name;
            audio.play();
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
        <v-btn :ripple="false" class="Not_Selectable font-weight-black non-underline primary" block tile @click.stop="Drawer_Local = false;">MENU</v-btn>
        <!-- ▲ Title ▲ ------------------------------------------------------------------------------------>

        
        <!-- ▼ Navigation ▼ ------------------------------------------------------------------------------->
        <v-list nav dense>


            <!-- ▼ Home ▼ ------------------------------------------------------------------------------------->
            <v-list-item href="../../English/HTML/index.html">
                <v-list-item-icon><v-icon>mdi-home</v-icon></v-list-item-icon>
                <v-list-item-title>Home</v-list-item-title>
            </v-list-item>
            <!-- ▲ Home ▲ ------------------------------------------------------------------------------------->


            <!-- ▼ Japanese ▼ --------------------------------------------------------------------------------->
            <v-list-group :value="false" prepend-icon="mdi-translate-variant">
                <template v-slot:activator>
                    <v-list-item-title>Japanese</v-list-item-title>
                </template>


                <!-- ▼ Introduction ▼ ----------------------------------------------------------------------------->
                <v-list-item href="./Introduction.html">
                    <v-list-item-icon />
                    <v-list-item-title>Introduction</v-list-item-title>
                        
                    <v-list-item-icon>
                        <v-icon>mdi-human-greeting-variant</v-icon>
                    </v-list-item-icon>
                </v-list-item>
                <!-- ▲ Introduction ▲ ----------------------------------------------------------------------------->


                <!-- ▼ Basic ▼ ------------------------------------------------------------------------------------>
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Basic</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-book-account</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Basic_Memory.html">
                        <v-list-item-icon />
                        <v-list-item-title>Memory Mechanism</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_LearningPoints.html">
                        <v-list-item-icon />
                        <v-list-item-title>Learning Points</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Character.html">
                        <v-list-item-icon />
                        <v-list-item-title>Character</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Grammar.html">
                        <v-list-item-icon />
                        <v-list-item-title>Grammar</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Asking.html">
                        <v-list-item-icon />
                        <v-list-item-title>Asking</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_GeneralWord.html">
                        <v-list-item-icon />
                        <v-list-item-title>Word - General Word</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Conversation.html">
                        <v-list-item-icon />
                        <v-list-item-title>Word - Conversation</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Verb.html">
                        <v-list-item-icon />
                        <v-list-item-title>Word - Verb</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Adjective_i.html">
                        <v-list-item-icon />
                        <v-list-item-title>Word - Adjective - i</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Adjective_na.html">
                        <v-list-item-icon />
                        <v-list-item-title>Word - Adjective - na</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Adverb.html">
                        <v-list-item-icon />
                        <v-list-item-title>Word - Adverb</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Basic ▲ ------------------------------------------------------------------------------------>
                

                <!-- ▼ Food ▼ ------------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Word - Food</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-noodles</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Food_General.html">
                        <v-list-item-icon />
                        <v-list-item-title>General</v-list-item-title>
                    </v-list-item>

                    <v-list-item href="./Food_Chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>Chinese</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Food_Italian.html">
                        <v-list-item-icon />
                        <v-list-item-title>Italian</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Food_Seasoning.html">
                        <v-list-item-icon />
                        <v-list-item-title>Seasoning</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Food_Sushi.html">
                        <v-list-item-icon />
                        <v-list-item-title>Sushi</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Food ▲ ------------------------------------------------------------------------------------->


                <!-- ▼ Hobby ▼ ------------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Word - Hobby</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-tennis</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Hobby_Art.html">
                        <v-list-item-icon />
                        <v-list-item-title>Art</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Game.html">
                        <v-list-item-icon />
                        <v-list-item-title>Game</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Math.html">
                        <v-list-item-icon />
                        <v-list-item-title>Math</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Music.html">
                        <v-list-item-icon />
                        <v-list-item-title>Music</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Outdoor.html">
                        <v-list-item-icon />
                        <v-list-item-title>Outdoor</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Reading.html">
                        <v-list-item-icon />
                        <v-list-item-title>Reading</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Sf.html">
                        <v-list-item-icon />
                        <v-list-item-title>SF</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Sport.html">
                        <v-list-item-icon />
                        <v-list-item-title>Sport</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Travel.html">
                        <v-list-item-icon />
                        <v-list-item-title>Travel</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Hobby ▲ ------------------------------------------------------------------------------------>


                <!-- ▼ Japalish ▼ --------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Word - Japalish</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-syllabary-katakana</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Japalish_Level_1.html">
                        <v-list-item-icon />
                        <v-list-item-title>Level 1</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japalish_Level_2.html">
                        <v-list-item-icon />
                        <v-list-item-title>Level 2</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japalish_Level_3.html">
                        <v-list-item-icon />
                        <v-list-item-title>Level 3</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Japalish ▲ --------------------------------------------------------------------------------->


                <!-- ▼ Life ▼ ------------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Word - Life</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-coffee</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Life_Body.html">
                        <v-list-item-icon />
                        <v-list-item-title>Body</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Life_Computer.html">
                        <v-list-item-icon />
                        <v-list-item-title>Computer</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Life_House.html">
                        <v-list-item-icon />
                        <v-list-item-title>House</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Life_Kitchen.html">
                        <v-list-item-icon />
                        <v-list-item-title>Kitchen</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Life_Time.html">
                        <v-list-item-icon />
                        <v-list-item-title>Time</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Life ▲ ------------------------------------------------------------------------------------->


                <!-- ▼ Nature ▼ ----------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Word - Nature</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-nature-people</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Nature_General.html">
                        <v-list-item-icon />
                        <v-list-item-title>General</v-list-item-title>
                    </v-list-item>
                    
                    <v-list-item href="./Nature_Animal.html">
                        <v-list-item-icon />
                        <v-list-item-title>Animal</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Nature_Forest.html">
                        <v-list-item-icon />
                        <v-list-item-title>Forest</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Nature_Plant.html">
                        <v-list-item-icon />
                        <v-list-item-title>Plant</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Nature_River.html">
                        <v-list-item-icon />
                        <v-list-item-title>River</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Nature_Sea.html">
                        <v-list-item-icon />
                        <v-list-item-title>Sea</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Nature ▲ ----------------------------------------------------------------------------------->


                <!-- ▼ Shop ▼ ------------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Word - Shop</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-cart</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Shop_ClothesStore.html">
                        <v-list-item-icon />
                        <v-list-item-title>Clothes</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Shop_Supermarket.html">
                        <v-list-item-icon />
                        <v-list-item-title>Supermarket</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Shop ▲ ------------------------------------------------------------------------------------->


                <!-- ▼ Outside ▼ ---------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Word - Outside</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-beach</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Outside_Cafe.html">
                        <v-list-item-icon />
                        <v-list-item-title>Cafe</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Company.html">
                        <v-list-item-icon />
                        <v-list-item-title>Company</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Direction.html">
                        <v-list-item-icon />
                        <v-list-item-title>Direction</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Gym.html">
                        <v-list-item-icon />
                        <v-list-item-title>Gym</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Hospital.html">
                        <v-list-item-icon />
                        <v-list-item-title>Hospital</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Restaurant.html">
                        <v-list-item-icon />
                        <v-list-item-title>Restaurant</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Park.html">
                        <v-list-item-icon />
                        <v-list-item-title>Park</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Road.html">
                        <v-list-item-icon />
                        <v-list-item-title>Road</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_School.html">
                        <v-list-item-icon />
                        <v-list-item-title>School</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Vehicle.html">
                        <v-list-item-icon />
                        <v-list-item-title>Vehicle</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Weather.html">
                        <v-list-item-icon />
                        <v-list-item-title>Weather</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Outside ▲ ---------------------------------------------------------------------------------->


                <!-- ▼ Verb ▼ ------------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Verb</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-book-open-page-variant</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Verb_Type.html">
                        <v-list-item-icon />
                        <v-list-item-title>Type</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Verb ▲ ------------------------------------------------------------------------------------->
                

                <!-- ▼ Kanji ▼ ------------------------------------------------------------------------------------>
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Kanji</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-ideogram-cjk</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Kanji_Basic.html">
                        <v-list-item-icon />
                        <v-list-item-title>Basic</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Kanji ▲ ------------------------------------------------------------------------------------>
                

                <!-- ▼ Recommend ▼ -------------------------------------------------------------------------------->
                <v-list-item href="./Recommend_Learning.html">
                    <v-list-item-icon />
                    <v-list-item-title>Recommend Site</v-list-item-title>

                    <v-list-item-icon>
                        <v-icon>mdi-hand-heart-outline</v-icon>
                    </v-list-item-icon>
                </v-list-item>
                <!-- ▲ Recommend ▲ -------------------------------------------------------------------------------->


            </v-list-group>
            <!-- ▲ Japanese ▲ --------------------------------------------------------------------------------->
            

            <!-- ▼ Plant ▼ ------------------------------------------------------------------------------------>
            <v-list-group :value="false" prepend-icon="mdi-sprout">
                <template v-slot:activator>
                    <v-list-item-title>Plants</v-list-item-title>
                </template>

                
                <v-list-item href="./Plant_General.html">
                    <v-list-item-icon />
                    <v-list-item-title>General</v-list-item-title>
                </v-list-item>


                <!-- ▼ Flower ▼ ----------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Flower</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-flower</v-icon>
                        </v-list-item-icon>
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
                        
                        <v-list-item-icon>
                            <v-icon>mdi-leaf</v-icon>
                        </v-list-item-icon>
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
                        
                        <v-list-item-icon>
                            <v-icon>mdi-carrot</v-icon>
                        </v-list-item-icon>
                    </template>


                    <v-list-item href="./Vegetable_Database.html">
                        <v-list-item-icon />
                        <v-list-item-title>Database</v-list-item-title>
                    </v-list-item>

                    <v-list-item href="./Vegetable_Burdock.html">
                        <v-list-item-icon />
                        <v-list-item-title>Burdock</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Vegetable_Chrysanthemum.html">
                        <v-list-item-icon />
                        <v-list-item-title>Chrysanthemum</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Vegetable_Eggplant.html">
                        <v-list-item-icon />
                        <v-list-item-title>Eggplant</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Vegetable_Konegi.html">
                        <v-list-item-icon />
                        <v-list-item-title>Konegi</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Vegetable_MiniTomato.html">
                        <v-list-item-icon />
                        <v-list-item-title>Mini Tomato</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Vegetable_Onion.html">
                        <v-list-item-icon />
                        <v-list-item-title>Onion</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Vegetable_Potato.html">
                        <v-list-item-icon />
                        <v-list-item-title>Potato</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Vegetable_Spinach.html">
                        <v-list-item-icon />
                        <v-list-item-title>Spinach</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Vegetable ▲ -------------------------------------------------------------------------------->

                
            </v-list-group>
            <!-- ▲ Plant ▲ ------------------------------------------------------------------------------------>


            <!-- ▼ Game ▼ ------------------------------------------------------------------------------------->
            <v-list-group :value="false" prepend-icon="mdi-nintendo-game-boy">
                <template v-slot:activator>
                    <v-list-item-title>Game</v-list-item-title>
                </template>
                <v-list-item href="./Game_KittyHopper.html">
                    <v-list-item-icon />
                    <v-list-item-title>Kitty Hopper</v-list-item-title>
                        
                    <v-list-item-icon>
                        <v-icon>mdi-cat</v-icon>
                    </v-list-item-icon>
                </v-list-item>
                <v-list-item href="./Game_Ball.html">
                    <v-list-item-icon />
                    <v-list-item-title>Ping-Pong Ping-Pong</v-list-item-title>
                        
                    <v-list-item-icon>
                        <v-icon>mdi-circle-multiple-outline</v-icon>
                    </v-list-item-icon>
                </v-list-item>
            </v-list-group>
            <!-- ▲ Game ▲ ------------------------------------------------------------------------------------->


            <!-- ▼ Cooking ▼ ---------------------------------------------------------------------------------->
            <v-list-group :value="false" prepend-icon="mdi-chef-hat">
                <template v-slot:activator>
                    <v-list-item-title>Cooking</v-list-item-title>
                </template>

                <v-list-item href="./Youtube_Cooking_Simple.html">
                    <v-list-item-icon />
                    <v-list-item-title>Simple</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Youtube_Cooking_Normal.html">
                    <v-list-item-icon />
                    <v-list-item-title>Normal</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Youtube_Cooking_Intricate.html">
                    <v-list-item-icon />
                    <v-list-item-title>Intricate</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Youtube_Cooking_Chinese.html">
                    <v-list-item-icon />
                    <v-list-item-title>Chinese</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Youtube_Cooking_Pasta.html">
                    <v-list-item-icon />
                    <v-list-item-title>Pasta</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Youtube_Cooking_Ramen.html">
                    <v-list-item-icon />
                    <v-list-item-title>Ramen</v-list-item-title>
                </v-list-item>
            </v-list-group>
            <!-- ▲ Cooking ▲ ---------------------------------------------------------------------------------->


            <!-- ▼ Music ▼ ------------------------------------------------------------------------------------>
            <v-list-group :value="false" prepend-icon="mdi-music">
                <template v-slot:activator>
                    <v-list-item-title>Music</v-list-item-title>
                </template>

                <v-list-item href="./Youtube_Music_UtadaHikaru.html">
                    <v-list-item-icon />
                    <v-list-item-title>Utada Hikaru</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Youtube_Music_Showgo.html">
                    <v-list-item-icon />
                    <v-list-item-title>Show-Go</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Youtube_Music_Ua.html">
                    <v-list-item-icon />
                    <v-list-item-title>UA</v-list-item-title>
                </v-list-item>
            </v-list-group>
            <!-- ▲ Music ▲ ------------------------------------------------------------------------------------>


            <!-- ▼ Japan ▼ ------------------------------------------------------------------------------------>
            <v-list-group :value="false" prepend-icon="mdi-home-city-outline">
                <template v-slot:activator>
                    <v-list-item-title>Life in Japan</v-list-item-title>
                </template>

                <v-list-item href="./Japan_Travel.html">
                    <v-list-item-icon />
                    <v-list-item-title>Travel</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Japan_Shop.html">
                    <v-list-item-icon />
                    <v-list-item-title>Shop</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Japan_AsianCuisine.html">
                    <v-list-item-icon />
                    <v-list-item-title>Asian Cuisine</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Japan_Food.html">
                    <v-list-item-icon />
                    <v-list-item-title>Food</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Japan_Snack.html">
                    <v-list-item-icon />
                    <v-list-item-title>Snack</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Japan_Daiso.html">
                    <v-list-item-icon />
                    <v-list-item-title>DAISO</v-list-item-title>
                </v-list-item>
            </v-list-group>
            <!-- ▲ Japan ▲ ------------------------------------------------------------------------------------>


            <!-- ▼ About me ▼ --------------------------------------------------------------------------------->
            <v-list-group :value="false" prepend-icon="mdi-stamper">
                <template v-slot:activator>
                    <v-list-item-title>About Me</v-list-item-title>
                </template>
                
                <v-list-item href="./Profile.html">
                    <v-list-item-icon />
                    <v-list-item-title>Profile</v-list-item-title>
                        
                    <v-list-item-icon>
                        <v-icon>mdi-stamper</v-icon>
                    </v-list-item-icon>
                </v-list-item>
                <v-list-item href="./Blog.html">
                    <v-list-item-icon />
                    <v-list-item-title>Blog</v-list-item-title>
                        
                    <v-list-item-icon>
                        <v-icon>mdi-post-outline</v-icon>
                    </v-list-item-icon>
                </v-list-item>
                <v-list-item href="./Brain.html">
                    <v-list-item-icon />
                    <v-list-item-title>Brain</v-list-item-title>
                        
                    <v-list-item-icon>
                        <v-icon>mdi-brain</v-icon>
                    </v-list-item-icon>
                </v-list-item>
            </v-list-group>
            <!-- ▲ About me ▲ --------------------------------------------------------------------------------->


            <!-- ▼ Language ▼ --------------------------------------------------------------------------------->
            <v-list-group :value="false" prepend-icon="mdi-hand-heart-outline">
                <template v-slot:activator>
                    <v-list-item-title>Language</v-list-item-title>
                </template>
                
                <v-list-item href="../../Spanish/HTML/index_spanish.html">
                    <v-list-item-icon />
                    <v-list-item-title>Español</v-list-item-title>
                </v-list-item>
                <v-list-item href="../../Chinese/HTML/index_chinese.html">
                    <v-list-item-icon />
                    <v-list-item-title>中文</v-list-item-title>
                </v-list-item>
            </v-list-group>
            <!-- ▲ Language ▲ --------------------------------------------------------------------------------->


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
    <v-footer color="#CFD8DC80" class="font-weight-black" app>
        <v-btn @click="scrollToBottom" text x-small>
            <v-icon color="blue">mdi-chevron-down</v-icon>
        </v-btn>
        <v-spacer />
        <span style="font-size: 0.8rem;">© 2024 FUM / © 2024 FUM WebSite</span>
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
        <span style="font-size: 0.8rem;">© 2024 FUM / © 2024 FUM WebSite</span>
        <v-spacer />
    </v-footer>
    `,
})

//// Carousel
Vue.component('custom-carousel', {
    template: `
        <v-row justify="center">
            <v-col xs="12" md="6" lg="6">
                <v-card>
                    <v-system-bar class="font-weight-medium" style="background-color: #BFC8CC99;">{{ title }}</v-system-bar>
                    <v-carousel delimiter-icon="mdi-album" :show-arrows="false" :height="height" v-model="internalpagenumber">
                        <v-carousel-item v-for="(item, index) in items" :key="index">
                            <v-sheet height="100%">
                                <v-row class="fill-height" align="center" justify="center">
                                    <v-col cols="10" align="center" v-html="item"><span></span></v-col>
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

//// Card
Vue.component('card-discription-image', {
    template: `
      <v-card class="pa-2">
        <v-img :src="image" :lazy-src="image">
            <transition name="Card_Fade">
                <v-card-text v-if="Show_Recommend" class="pa-5 Card_Recommend">
                <b>Recommend</b><br><br>
                {{ recommend }}
                </v-card-text>
            </transition>
        </v-img>
  
        <v-card-title class="text-h5 font-weight-medium">
            {{ title }}
        </v-card-title>
  
        <v-card-text class="Card_Description">
            {{ description }}
        </v-card-text>
  
        <v-card-actions v-if="recommend">
          <v-btn color="primary" block outlined @click="Toggle">
            {{ Show_Recommend ? 'Image' : 'Recommend' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    `,
    props: {
        image: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        recommend: { type: String, required: false }
    },
    data() {
        return { Show_Recommend: false }
    },
    methods: {
        Toggle() { this.Show_Recommend = !this.Show_Recommend }
    }
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
        $(window).ready(() => { this.Ready_Page = true; });
        $(window).on('beforeunload', () => {
            $('#App').css('opacity', '0');
            $(window).scrollTop(0);
        });
    },
};