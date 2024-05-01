
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
    localStorage.setItem("BGM_Name", "clair_de_lune.wav");
}