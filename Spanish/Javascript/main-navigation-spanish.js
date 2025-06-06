Vue.component('main-navigation-spanish', {
    template: `
    <v-navigation-drawer class="blue-grey lighten-5" v-model="Drawer_Local" app right>


        <!-- ▼ Title ▼ ------------------------------------------------------------------------------------>
        <v-btn :ripple="false" style="cursor: default;" class="font-weight-black non-underline" block dark>MENÚ</v-btn>
        <!-- ▲ Title ▲ ------------------------------------------------------------------------------------>
        
        
        <!-- ▼ Navigation ▼ ------------------------------------------------------------------------------->
        <v-list nav dense>
        
        
            <!-- ▼ Home ▼ ------------------------------------------------------------------------------------->
            <v-list-item href="../../Spanish/HTML/index_spanish.html">
                <v-list-item-icon><v-icon>mdi-home</v-icon></v-list-item-icon>
                <v-list-item-title>Inicio</v-list-item-title>
            </v-list-item>
            <!-- ▲ Home ▲ ------------------------------------------------------------------------------------->
        
        
            <!-- ▼ Japanese ▼ --------------------------------------------------------------------------------->
            <v-list-group :value="false" prepend-icon="mdi-translate-variant">
                <template v-slot:activator>
                    <v-list-item-title>Japonés</v-list-item-title>
                </template>
        
        
                <!-- ▼ Introduction ▼ ----------------------------------------------------------------------------->
                <v-list-item href="./Introduction_spanish.html">
                    <v-list-item-icon />
                    <v-list-item-title>Introducción</v-list-item-title>
                        
                    <v-list-item-icon>
                        <v-icon>mdi-human-greeting-variant</v-icon>
                    </v-list-item-icon>
                </v-list-item>
                <!-- ▲ Introduction ▲ ----------------------------------------------------------------------------->
        
        
                <!-- ▼ Basic ▼ ------------------------------------------------------------------------------------>
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Básico</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-book-account</v-icon>
                        </v-list-item-icon>
                    </template>
        
                    <v-list-item href="./Basic_Memory_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Mecanismo de Memoria</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_LearningPoints_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Puntos de aprendizaje</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Character_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Carácter</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Grammar_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Gramática</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Asking_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Preguntar</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_GeneralWord_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Palabra - Palabra general</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Conversation_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Palabra - Conversación</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Verb_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Palabra - Verbo</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Adjective_i_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Palabra - Adjetivo - i</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Adjective_na_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Palabra - Adjetivo - na</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Adverb_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Palabra - Adverbio</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Basic ▲ ------------------------------------------------------------------------------------>
                

                <!-- ▼ Food ▼ ------------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Palabra - Comida</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-noodles</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Food_General_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>General</v-list-item-title>
                    </v-list-item>

                    <v-list-item href="./Food_Chinese_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Chino</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Food_Italian_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Italiano</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Food_Seasoning_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Condimento</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Food_Sushi_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Sushi</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Food ▲ ------------------------------------------------------------------------------------->


                <!-- ▼ Hobby ▼ ------------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Palabra - Pasatiempo</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-tennis</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Hobby_Art_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Arte</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Game_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Juego</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Math_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Matemáticas</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Music_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Música</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Outdoor_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Aire libre</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Reading_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Lectura</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Sf_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Ciencia ficción</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Sport_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Deporte</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Travel_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Viajar</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Hobby ▲ ------------------------------------------------------------------------------------>


                <!-- ▼ Japalish ▼ --------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Palabra - Japalish</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-syllabary-katakana</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Japalish_Level_1_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Nivel 1</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japalish_Level_2_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Nivel 2</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japalish_Level_3_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Nivel 3</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Japalish ▲ --------------------------------------------------------------------------------->


                <!-- ▼ Life ▼ ------------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Palabra - Vida</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-coffee</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Life_Body_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Cuerpo</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Life_Computer_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Computadora</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Life_House_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Casa</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Life_Kitchen_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Cocina</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Life_Time_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Tiempo</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Life ▲ ------------------------------------------------------------------------------------->


                <!-- ▼ Nature ▼ ----------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Palabra - Naturaleza</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-nature-people</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Nature_General_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>General</v-list-item-title>
                    </v-list-item>
                    
                    <v-list-item href="./Nature_Animal_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Animal</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Nature_Forest_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Bosque</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Nature_Plant_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Planta</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Nature_River_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Río</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Nature_Sea_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Mar</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Nature ▲ ----------------------------------------------------------------------------------->


                <!-- ▼ Shop ▼ ------------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Palabra - Tienda</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-cart</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Shop_ClothesStore_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Ropa</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Shop_Supermarket_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Supermercado</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Shop ▲ ------------------------------------------------------------------------------------->


                <!-- ▼ Outside ▼ ---------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Palabra - Exterior</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-beach</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Outside_Cafe_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Café</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Company_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Compañía</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Direction_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Dirección</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Gym_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Gimnasio</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Hospital_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Hospital</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Restaurant_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Restaurante</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Park_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Parque</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Road_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Carretera</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_School_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Escuela</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Vehicle_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Vehículo</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Weather_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Clima</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Outside ▲ ---------------------------------------------------------------------------------->


                <!-- ▼ Verb ▼ ------------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Verbo</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-book-open-page-variant</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Verb_Type_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Tipo</v-list-item-title>
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

                    <v-list-item href="./Kanji_Basic_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Básico</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Kanji ▲ ------------------------------------------------------------------------------------>
                

                <!-- ▼ Recommend ▼ -------------------------------------------------------------------------------->
                <v-list-item href="./Recommend_Learning_spanish.html">
                    <v-list-item-icon />
                    <v-list-item-title>Sitio Recomendado</v-list-item-title>

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
                    <v-list-item-title>Criar Plantas</v-list-item-title>
                </template>

                
                <v-list-item href="./Plant_General_spanish.html">
                    <v-list-item-icon />
                    <v-list-item-title>General</v-list-item-title>
                </v-list-item>


                <!-- ▼ Flower ▼ ----------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Flor</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-flower</v-icon>
                        </v-list-item-icon>
                    </template>


                    <v-list-item href="./Flower_Rose_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Rosa</v-list-item-title>
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


                    <v-list-item href="./Herb_Basil_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Albahaca</v-list-item-title>
                    </v-list-item>

                </v-list-group sub-group>
                <!-- ▲ Herb ▲ ------------------------------------------------------------------------------------->


                <!-- ▼ Vegetable ▼ -------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>Verdura</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-carrot</v-icon>
                        </v-list-item-icon>
                    </template>


                    <v-list-item href="./Vegetable_Database_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Base de datos</v-list-item-title>
                    </v-list-item>

                    <v-list-item href="./Vegetable_Burdock_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Bardana</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Vegetable_Eggplant_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Berenjena</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Vegetable_Onion_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Cebolla</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Vegetable_Chrysanthemum_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Crí­san­temo</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Vegetable_Spinach_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Espinaca</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Vegetable_Konegi_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Konegi</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Vegetable_MiniTomato_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Mini Tomate</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Vegetable_Potato_spanish.html">
                        <v-list-item-icon />
                        <v-list-item-title>Patata</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Vegetable ▲ -------------------------------------------------------------------------------->
                

            </v-list-group>
            <!-- ▲ Plant ▲ ------------------------------------------------------------------------------------>


            <!-- ▼ Game ▼ ------------------------------------------------------------------------------------->
            <v-list-group :value="false" prepend-icon="mdi-nintendo-game-boy">
                <template v-slot:activator>
                    <v-list-item-title>Juego</v-list-item-title>
                </template>
                <v-list-item href="./Game_KittyHopper_spanish.html">
                    <v-list-item-icon />
                    <v-list-item-title>Kitty Hopper</v-list-item-title>
                        
                    <v-list-item-icon>
                        <v-icon>mdi-cat</v-icon>
                    </v-list-item-icon>
                </v-list-item>
            </v-list-group>
            <!-- ▲ Game ▲ ------------------------------------------------------------------------------------->


            <!-- ▼ Cooking ▼ ---------------------------------------------------------------------------------->
            <v-list-group :value="false" prepend-icon="mdi-chef-hat">
                <template v-slot:activator>
                    <v-list-item-title>Cocina</v-list-item-title>
                </template>

                <v-list-item href="./Youtube_Cooking_Simple_spanish.html">
                    <v-list-item-icon />
                    <v-list-item-title>Sencillo</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Youtube_Cooking_Normal_spanish.html">
                    <v-list-item-icon />
                    <v-list-item-title>Normal</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Youtube_Cooking_Intricate_spanish.html">
                    <v-list-item-icon />
                    <v-list-item-title>Intrincado</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Youtube_Cooking_Chinese_spanish.html">
                    <v-list-item-icon />
                    <v-list-item-title>Chino</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Youtube_Cooking_Pasta_spanish.html">
                    <v-list-item-icon />
                    <v-list-item-title>Pasta</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Youtube_Cooking_Ramen_spanish.html">
                    <v-list-item-icon />
                    <v-list-item-title>Ramen</v-list-item-title>
                </v-list-item>
            </v-list-group>
            <!-- ▲ Cooking ▲ ---------------------------------------------------------------------------------->


            <!-- ▼ Music ▼ ------------------------------------------------------------------------------------>
            <v-list-group :value="false" prepend-icon="mdi-music">
                <template v-slot:activator>
                    <v-list-item-title>Música</v-list-item-title>
                </template>

                <v-list-item href="./Youtube_Music_UtadaHikaru_spanish.html">
                    <v-list-item-icon />
                    <v-list-item-title>Utada Hikaru</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Youtube_Music_Showgo_spanish.html">
                    <v-list-item-icon />
                    <v-list-item-title>Show-Go</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Youtube_Music_Ua_spanish.html">
                    <v-list-item-icon />
                    <v-list-item-title>Other</v-list-item-title>
                </v-list-item>
            </v-list-group>
            <!-- ▲ Music ▲ ------------------------------------------------------------------------------------>


            <!-- ▼ Japan ▼ ------------------------------------------------------------------------------------>
            <v-list-group :value="false" prepend-icon="mdi-home-city-outline">
                <template v-slot:activator>
                    <v-list-item-title>Japanese Culture</v-list-item-title>
                </template>

                <v-list-item href="./Japan_Travel.html">
                    <v-list-item-icon />
                    <v-list-item-title>Viaje</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Japan_Shop_spanish.html">
                    <v-list-item-icon />
                    <v-list-item-title>Tienda</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Japan_AsianCuisine_spanish.html">
                    <v-list-item-icon />
                    <v-list-item-title>Cocina Asiática</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Japan_Food_spanish.html">
                    <v-list-item-icon />
                    <v-list-item-title>Comida</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Japan_Snack_spanish.html">
                    <v-list-item-icon />
                    <v-list-item-title>Merienda</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Japan_Daiso_spanish.html">
                    <v-list-item-icon />
                    <v-list-item-title>DAISO</v-list-item-title>
                </v-list-item>
            </v-list-group>
            <!-- ▲ Japan ▲ ------------------------------------------------------------------------------------>


            <!-- ▼ Language ▼ --------------------------------------------------------------------------------->
            <v-list-group :value="false" prepend-icon="mdi-hand-heart-outline">
                <template v-slot:activator>
                    <v-list-item-title>Idioma</v-list-item-title>
                </template>
                
                <v-list-item href="../../English/HTML/index.html">
                    <v-list-item-icon />
                    <v-list-item-title>English</v-list-item-title>
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
                    <v-list-item-title>Sobre Mí</v-list-item-title>
                </template>
                
                <v-list-item href="../../English/HTML/Profile.html">
                    <v-list-item-icon />
                    <v-list-item-title>Perfil</v-list-item-title>
                        
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
                    <v-list-item-title>Cerebro</v-list-item-title>
                        
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
        Drawer_Local: {
            get() { return this.drawer; },
            set(_value) { this.$emit("change-drawer", _value); }
        }
    }
})