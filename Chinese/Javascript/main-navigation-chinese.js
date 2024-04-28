Vue.component('main-navigation-chinese', {
    template: `
    <v-navigation-drawer class="blue-grey lighten-5" v-model="drawer_local" app right>


        <!-- ▼ Title ▼ ------------------------------------------------------------------------------------>
        <v-btn :ripple="false" style="cursor: default;" class="font-weight-black non-underline" block dark>菜单</v-btn>
        <!-- ▲ Title ▲ ------------------------------------------------------------------------------------>

        
        <!-- ▼ Navigation ▼ ------------------------------------------------------------------------------->
        <v-list nav dense>


            <!-- ▼ Home ▼ ------------------------------------------------------------------------------------->
            <v-list-item href="./index_chinese.html">
                <v-list-item-icon><v-icon>mdi-home</v-icon></v-list-item-icon>
                <v-list-item-title>首页</v-list-item-title>
            </v-list-item>
            <!-- ▲ Home ▲ ------------------------------------------------------------------------------------->


            <!-- ▼ Introduction ▼ ----------------------------------------------------------------------------->
            <v-list-item href="./Introduction_chinese.html">
                <v-list-item-icon><v-icon>mdi-human-greeting-variant</v-icon></v-list-item-icon>
                <v-list-item-title>介绍</v-list-item-title>
            </v-list-item>
            <!-- ▲ Introduction ▲ ----------------------------------------------------------------------------->


            <!-- ▼ Japanese ▼ --------------------------------------------------------------------------------->
            <v-list-group :value="false" prepend-icon="mdi-translate-variant">
                <template v-slot:activator>
                    <v-list-item-title>日语</v-list-item-title>
                </template>


                <!-- ▼ Basic ▼ ------------------------------------------------------------------------------------>
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>基础</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-book-account</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Basic_LearningPoints_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>学习要点</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Character_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>字符</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Grammar_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>语法</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Asking_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>询问</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_GeneralWord_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>一般词汇</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Conversation_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>会话</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Verb_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>动词</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Adjective_i_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>形容词 - i</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Adjective_na_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>形容词 - na</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Basic_Adverb_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>副词</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Basic ▲ ------------------------------------------------------------------------------------>
                

                <!-- ▼ Food ▼ ------------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>单词 - 食品</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-noodles</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Food_General_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>一般</v-list-item-title>
                    </v-list-item>

                    <v-list-item href="./Food_Chinese_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>中国菜</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Food_Italian_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>意大利菜</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Food_Seasoning_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>调味料</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Food_Sushi_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>寿司</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Food ▲ ------------------------------------------------------------------------------------->


                <!-- ▼ Hobby ▼ ------------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>单词 - 爱好</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-tennis</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Hobby_Art_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>艺术</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Game_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>游戏</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Math_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>数学</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Music_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>音乐</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Outdoor_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>户外活动</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Reading_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>阅读</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Sf_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>SF</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Sport_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>运动</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Hobby_Travel_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>旅行</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Hobby ▲ ------------------------------------------------------------------------------------>


                <!-- ▼ Japalish ▼ --------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>单词 - 日式英语</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-syllabary-katakana</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Japalish_Level_1_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>等级 1</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japalish_Level_2_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>等级 2</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Japalish_Level_3_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>等级 3</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Japalish ▲ --------------------------------------------------------------------------------->


                <!-- ▼ Life ▼ ------------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>单词 - 生活</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-coffee</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Life_Body_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>身体</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Life_Computer_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>电脑</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Life_House_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>房子</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Life_Kitchen_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>厨房</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Life_Time_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>时间</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Life ▲ ------------------------------------------------------------------------------------->


                <!-- ▼ Nature ▼ ----------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>单词 - 自然</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-nature-people</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Nature_General_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>一般</v-list-item-title>
                    </v-list-item>
                    
                    <v-list-item href="./Nature_Animal_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>动物</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Nature_Forest_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>森林</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Nature_Plant_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>植物</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Nature_River_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>河流</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Nature_Sea_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>海洋</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Nature ▲ ----------------------------------------------------------------------------------->


                <!-- ▼ Shop ▼ ------------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>单词 - 商店</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-cart</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Shop_ClothesStore_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>服装店</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Shop_Supermarket_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>超市</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Shop ▲ ------------------------------------------------------------------------------------->


                <!-- ▼ Outside ▼ ---------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>单词 - 户外</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-beach</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Outside_Cafe_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>咖啡馆</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Company_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>公司</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Direction_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>方向</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Gym_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>健身房</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Hospital_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>医院</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Restaurant_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>餐厅</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Park_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>公园</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Road_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>道路</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_School_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>学校</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Vehicle_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>车辆</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Outside_Weather_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>天气</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Outside ▲ ---------------------------------------------------------------------------------->


                <!-- ▼ Verb ▼ ------------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>动词</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-book-open-page-variant</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Verb_Type_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>种类</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Verb ▲ ------------------------------------------------------------------------------------->


                <!-- ▼ Kanji ▼ ------------------------------------------------------------------------------------>
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>汉字</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-ideogram-cjk</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Kanji_Basic_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>基础</v-list-item-title>
                    </v-list-item>
                </v-list-group sub-group>
                <!-- ▲ Kanji ▲ ------------------------------------------------------------------------------------>
                

                <!-- ▼ Recommend ▼ -------------------------------------------------------------------------------->
                <v-list-item href="./Recommend_Learning_chinese.html">
                    <v-list-item-icon />
                    <v-list-item-title>推荐网站</v-list-item-title>

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
                    <v-list-item-title>种植</v-list-item-title>
                </template>

                <!-- ▼ Flower ▼ ----------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>花朵</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-flower</v-icon>
                        </v-list-item-icon>
                    </template>
                </v-list-group sub-group>
                <!-- ▲ Flower ▲ ----------------------------------------------------------------------------------->


                <!-- ▼ Vegetable ▼ -------------------------------------------------------------------------------->
                <v-list-group sub-group :value="false">
                    <template v-slot:activator>
                        <v-list-item-title>蔬菜</v-list-item-title>
                        
                        <v-list-item-icon>
                            <v-icon>mdi-carrot</v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item href="./Vegetable_Database_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>数据库</v-list-item-title>
                    </v-list-item>

                    <v-list-item href="./Vegetable_Burdock_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>牛蒡</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Vegetable_Chrysanthemum_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>菊花</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Vegetable_Eggplant_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>茄子</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Vegetable_Konegi_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>葱</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Vegetable_MiniTomato_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>小番茄</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Vegetable_Onion_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>洋葱</v-list-item-title>
                    </v-list-item>
                    <v-list-item href="./Vegetable_Spinach_chinese.html">
                        <v-list-item-icon />
                        <v-list-item-title>菠菜</v-list-item-title>
                    </v-list-item>
                </v-list-group>
                <!-- ▲ Vegetable ▲ -------------------------------------------------------------------------------->

                
            </v-list-group>
            <!-- ▲ Plant ▲ ------------------------------------------------------------------------------------>


            <!-- ▼ Game ▼ ------------------------------------------------------------------------------------->
            <v-list-group :value="false" prepend-icon="mdi-nintendo-game-boy">
                <template v-slot:activator>
                    <v-list-item-title>游戏</v-list-item-title>
                </template>
                <v-list-item href="./Game_KittyHopper_chinese.html">
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
                    <v-list-item-title>烹饪</v-list-item-title>
                </template>

                <v-list-item href="./Youtube_Cooking_Simple_chinese.html">
                    <v-list-item-icon />
                    <v-list-item-title>简单</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Youtube_Cooking_Normal_chinese.html">
                    <v-list-item-icon />
                    <v-list-item-title>普通</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Youtube_Cooking_Intricate_chinese.html">
                    <v-list-item-icon />
                    <v-list-item-title>复杂</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Youtube_Cooking_Chinese_chinese.html">
                    <v-list-item-icon />
                    <v-list-item-title>中国菜</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Youtube_Cooking_Pasta_chinese.html">
                    <v-list-item-icon />
                    <v-list-item-title>意大利菜面</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Youtube_Cooking_Ramen_chinese.html">
                    <v-list-item-icon />
                    <v-list-item-title>拉面</v-list-item-title>
                </v-list-item>
            </v-list-group>
            <!-- ▲ Cooking ▲ ---------------------------------------------------------------------------------->


            <!-- ▼ Music ▼ ------------------------------------------------------------------------------------>
            <v-list-group :value="false" prepend-icon="mdi-music">
                <template v-slot:activator>
                    <v-list-item-title>音乐</v-list-item-title>
                </template>

                <v-list-item href="./Youtube_Music_UtadaHikaru_chinese.html">
                    <v-list-item-icon />
                    <v-list-item-title>Utada Hikaru</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Youtube_Music_Showgo_chinese.html">
                    <v-list-item-icon />
                    <v-list-item-title>Show-Go</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Youtube_Music_Ua_chinese.html">
                    <v-list-item-icon />
                    <v-list-item-title>UA</v-list-item-title>
                </v-list-item>
            </v-list-group>
            <!-- ▲ Music ▲ ------------------------------------------------------------------------------------>


            <!-- ▼ Japan ▼ ------------------------------------------------------------------------------------>
            <v-list-group :value="false" prepend-icon="mdi-circle">
                <template v-slot:activator>
                    <v-list-item-title>日本生活</v-list-item-title>
                </template>

                <v-list-item href="./Japan_Shop_chinese.html">
                    <v-list-item-icon />
                    <v-list-item-title>商店</v-list-item-title>
                </v-list-item>
                <v-list-item href="./Japan_Snack_chinese.html">
                    <v-list-item-icon />
                    <v-list-item-title>点心</v-list-item-title>
                </v-list-item>
            </v-list-group>
            <!-- ▲ Japan ▲ ------------------------------------------------------------------------------------>


            <!-- ▼ Language ▼ --------------------------------------------------------------------------------->
            <v-list-group :value="false" prepend-icon="mdi-hand-heart-outline">
                <template v-slot:activator>
                    <v-list-item-title>语言</v-list-item-title>
                </template>
                
                <v-list-item href="../../English/HTML/index.html">
                    <v-list-item-icon />
                    <v-list-item-title>English</v-list-item-title>
                </v-list-item>
                <v-list-item href="../../Spanish/HTML/index_spanish.html">
                    <v-list-item-icon />
                    <v-list-item-title>Español</v-list-item-title>
                </v-list-item>
            </v-list-group>
            <!-- ▲ Language ▲ --------------------------------------------------------------------------------->


            <!-- ▼ About me ▼ --------------------------------------------------------------------------------->
            <v-list-item>
                <v-list-item-icon><v-icon>mdi-stamper</v-icon></v-list-item-icon>
                <v-list-item-title>关于我</v-list-item-title>
            </v-list-item>
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
    }
})