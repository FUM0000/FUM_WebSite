

// Class
class Ball_Animation_1_CLASS {
    constructor(_canvas, _ctx, _size, _direction) {
        this._Canvas = _canvas;
        this._Context = _ctx;
        this._Size = _size;
        this._Position = [_canvas.width / 2, _canvas.height * 0.4];
        this._Direction = _direction;
        this._Color = '#D3E1E6';
        this._Speed = 100 / Math.pow(this._Size, 1.75);
    }
    Animation() {
        this._Context.beginPath();
        this._Context.arc(this._Position[0], this._Position[1], this._Size, 0, 2 * Math.PI);
        this._Context.fillStyle = this._Color;
        this._Context.fill();
        if (this._Position[1] + this._Direction[1] < 0) {
            this._Position[1] = 0;
            this._Direction[1] *= -1;
        }
        if (this._Position[1] + this._Direction[1] > this._Canvas.height) {
            this._Position[1] = this._Canvas.height;
            this._Direction[1] *= -1;
        }
        if (this._Position[0] + this._Direction[0] < 0) {
            this._Position[0] = 0;
            this._Direction[0] *= -1;
        }
        if (this._Position[0] + this._Direction[0] > this._Canvas.width) {
            this._Position[0] = this._Canvas.width;
            this._Direction[0] *= -1;
        }
        this._Position[0] += this._Direction[0] * this._Speed;
        this._Position[1] += this._Direction[1] * this._Speed;
        requestAnimationFrame(this.Animation.bind(this));
    }
}

// Funcion
//// General
function RandomNumber_Between(_min, _max) { return Math.random() * (_max - _min + 1) + _min; }

// SystemBar
Vue.component('main-system-bar', {
    template: `
    <v-system-bar color="#CFD8DC80" class="font-weight-black"style="height: 50px;" app>
        <v-row aline="center">
            <v-col cols="6" align-self="center">
                <audio id="current_bgm" src="" paused loop></audio>
                <v-icon id="speaker_1">mdi-volume-variant-off</v-icon>
                <slot></slot>
            </v-col>
            
            <v-col cols="6" class="text-right" @click.stop="drawer_local = !drawer_local">
                <!-- <v-icon id="arrow_1" color="red" x-small style="font-size: 10px; transform: rotate(90deg);">mdi-navigation</v-icon> -->
                <v-btn rounded small plain>MENU</v-btn>
            </v-col>
        </v-row>
    </v-system-bar>
    `,
    props: ['drawer'],
    computed: {
        drawer_local: {
            get() { return this.drawer; },
            set(_value) { this.$emit("change-drawer", _value); }
        }
    },
})
let Name_Store = localStorage.getItem("BGM_Name");
let Name = Name_Store == null ? "clair_de_lune.wav" : Name_Store;
let Playing = false;
$(function () {
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
function Get_PlayingBGM() { return Playing; }
function Change_BGM_Name(_name) {
    Name = _name;
    localStorage.setItem("BGM_Name", _name);
}

// NavigationBar
Vue.component('main-navigation', {
    template: `
    <v-navigation-drawer class="blue-grey lighten-5" v-model="drawer_local" app right temporary>


        <!-- ▼ Title ▼ ------------------------------------------------------------------------------------>
        <v-btn :ripple="false" class="not-selectable font-weight-black non-underline primary" block tile @click.stop="drawer_local = false;">MENU</v-btn>
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
                    <v-list-item-title>Japan Life</v-list-item-title>
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


        </v-list>
        <!-- ▲ Navigation ▲ ------------------------------------------------------------------------------->


    </v-navigation-drawer>
    `,
    props: ['drawer'],
    computed: {
        drawer_local: {
            get() { return this.drawer; },
            set(_value) { this.$emit("change-drawer", _value); }
        }
    },
})

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

// Mixins
window.data_common = {
    drawer: false,
    show_page: false,
};
window.data_index = {
    drawer: false,
    show_page: false,
    List_BGM: [
        "clair_de_lune.wav",
        "gymnopedies.wav",
        "an_der_wiege.wav",
        "lofi_1.wav",
        "lofi_2.wav",
        "punk_1.wav",
        "noise_1.wav",
        "noise_2.wav",
        "beat_1.wav",
        "wave_1.wav",
        "club_1.wav",
        "hihat_1.wav",
        "hihat_2.wav",
        "beep_1.wav",
        "piano_1.wav",
    ],
};
window.mixins_common = {
    data() {
        return {
            data_common: window.data_common,
        };
    },
    computed: {
        drawer: {
            get() { return this.data_common.drawer; },
            set(_value) { this.data_common.drawer = _value; },
        },
        show_page: {
            get() { return this.data_common.show_page; },
            set(_value) { this.data_common.show_page = _value; },
        },
    },
    methods: {
        Change_Drawer(_value) { this.drawer = _value; },
    },
    mounted() {
        $(window).ready(() => { this.show_page = true; });
    },
};
window.mixins_index = {
    data() {
        return {
            data_index: window.data_index,
        };
    },
    computed: {
        drawer: {
            get() { return this.data_index.drawer; },
            set(_value) { this.data_index.drawer = _value; },
        },
        show_page: {
            get() { return this.data_index.show_page; },
            set(_value) { this.data_index.show_page = _value; },
        },
        List_BGM: {
            get() { return this.data_index.List_BGM; },
        }
    },
    methods: {
        Change_Drawer(_value) { this.drawer = _value; },
        Change_BGM(_number) {
            let audio = $("#current_bgm")[0];
            audio.pause();
            audio.oncanplaythrough = function () {
                audio.currentTime = 0;
                audio.src = "../../Asset/Audio/" + this.List_BGM[_number];
                Change_BGM_Name(this.List_BGM[_number]);
                if (Get_PlayingBGM()) audio.play();
                audio.oncanplaythrough = null;
            }.bind(this);
            audio.load();
        },
        Relocate_Index() {
            const screen_width = $("#app").width();
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
                item_width = $(".item-" + i).width();
                item_height = $(".item-" + i).height();
                target_x = width_center + (radius * Math.cos(radian));
                target_y = height_center + (radius * Math.sin(radian));
                item_left = target_x - item_width / 2;
                item_top = target_y - item_height / 2;
                bottom = item_top > bottom ? item_top : bottom;
                $(".item-" + i).css("left", item_left);
                $(".item-" + i).css("top", item_top);
                radian += Math.PI / 5;
                radius = Math.max(0, (Math.min(screen_narrower * 0.09, 45) - (i - 1)) * radian);
            }
        
            const text_top = bottom + (screen_height - bottom) * 0.5;
            $("#select-music").css("left", width_center - $("#select-music").width * 0.5);
            $("#select-music").css("top", text_top);
        },
    },
    mounted() {
        // Event
        $(window).ready(() => { this.show_page = true; });
        $(window).resize(() => { this.Relocate_Index(); });
        // Katakata
        $("[class^='item-']").css("position", "absolute");
        $("[class^='item-']").css("transition", "1s");
        $("[class^='item-']").each(function () {
            $(this).css("animation", "animation_katakata " + (Math.random() * (1.0 - 0.5) + 0.5).toFixed(2) + "s" + " infinite");
        });
        // Balls
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        function CleanCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            requestAnimationFrame(CleanCanvas);
        }
        CleanCanvas();
        const balls = {};
        for (let i = 0; i < 60; i++) {
            const size = RandomNumber_Between(5, 20);
            let direction_x = RandomNumber_Between(-1, 1);
            let direction_y = RandomNumber_Between(-1, 1);
            direction_x = direction_x / (Math.abs(direction_x) + Math.abs(direction_y))
            direction_y = direction_y / (Math.abs(direction_x) + Math.abs(direction_y))
            const ball = new Ball_Animation_1_CLASS(canvas, ctx, size, [direction_x, direction_y]);
            ball.Animation();
            balls[i] = ball;
        }
        // SelectMusic
        $(".glitch").each(function () {
            $(this).attr('data-text', $(this).text());
        });
        setInterval(() => {
            const glitchElements = document.querySelectorAll('.glitch');
            glitchElements.forEach(element => {
                if (Math.random() > 0.9) {
                    element.style.textShadow = `${Math.random() * 5 - 2.5}px 0 #ff00c1, ${Math.random() * 5 - 2.5}px 0 #00fff9`;
                    setTimeout(() => {
                        element.style.textShadow = '';
                    }, 50);
                }
            });
        }, 500);

        // Relocate
        this.Relocate_Index();
    },
};