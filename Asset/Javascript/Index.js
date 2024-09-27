
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

// Mixins
window.Data_Index = {
    Drawer: false,
    Ready_Page: false,
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
window.Mixins_Index = {
    data() {
        return {
            Data_Index: window.Data_Index,
        };
    },
    computed: {
        Drawer: {
            get() { return this.Data_Index.Drawer; },
            set(_value) { this.Data_Index.Drawer = _value; },
        },
        Ready_Page: {
            get() { return this.Data_Index.Ready_Page; },
            set(_value) { this.Data_Index.Ready_Page = _value; },
        },
        List_BGM: {
            get() { return this.Data_Index.List_BGM; },
        }
    },
    methods: {
        ChangeDrawer(_value) { this.Drawer = _value; },
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
            const screen_width = $("#main").width();
            const screen_height = $("#main").height();
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
            $("#SelectMusic").css("left", width_center - $("#SelectMusic").width * 0.5);
            $("#SelectMusic").css("top", text_top);
        },
    },
    mounted() {
        // Event
        $(window).ready(() => { this.Ready_Page = true; });
        $(window).resize(() => { this.Relocate_Index(); });
        // Katakata
        $("[class^='item-']").css("position", "absolute");
        $("[class^='item-']").css("transition", "1s");
        $("[class^='item-']").each(function () {
            $(this).css("animation", "Katakata " + (Math.random() * (1.0 - 0.5) + 0.5).toFixed(2) + "s" + " infinite");
        });
        // Balls
        const canvas = document.getElementById('Balls');
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
        // Glitch
        $(".Glitch_Text").each(function () {
            $(this).attr('data-text', $(this).text());
        });
        setInterval(() => {
            const glitchElements = document.querySelectorAll('.Glitch_Text');
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