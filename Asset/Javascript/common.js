let Name_Store = localStorage.getItem("BGM_Name");
let Name = Name_Store == null ? "clair_de_lune.wav" : Name_Store;
let Playing = false;

$(function() {
    //// System Bar
    // Audio
    let audio = $("#current_bgm")[0];
    audio.volume = 0.5;
    $("#speaker_1").on("click", function () {
        if( Playing ) {
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
    audio.onplaying = function() { Playing = true; };
    audio.onpause = function() { Playing = false; };
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
    const screen_height = $("#main-container").height();
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


    for(let i = 1; i < 16; i++) {
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
    
    // Welcome
    const welcome_top = bottom + (screen_height - bottom) * 0.5;
    $(".welcome_1").css("left", width_center - $(".welcome_1").width * 0.5);
    $(".welcome_1").css("top", welcome_top);
}