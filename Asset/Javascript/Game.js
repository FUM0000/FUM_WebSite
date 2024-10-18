
import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";

function Mobile_or_Desktop() { return /Mobi|Android/i.test(navigator.userAgent); }
function RandomNumber_Between(_min, _max) { return Math.random() * (_max - _min + 1) + _min; }
function Shousuu_Kirisute(_number, _keta) {
    return Math.floor(_number * Math.pow(10, _keta)) / Math.pow(10, _keta);
}
function Degrees_to_Radians(_degrees) { return _degrees * (Math.PI / 180); }
function Alpha_Change(_color, _alpha) {
    if (_color.length === 7) { return _color + _alpha; }
    if (_color.length === 9) { return _color.slice(0, 7) + _alpha; }
    return null;
}

class FC_JoystickController {
    constructor(domElement) {
        this.domElement = domElement;
        this.isActive = false;
        this.startX = 0;
        this.startY = 0;
        this.moveX = 0;
        this.moveY = 0;
        this.touchId = null;

        this.onStart = this.onStart.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onEnd = this.onEnd.bind(this);

        this.domElement.addEventListener('mousedown', this.onStart);
        this.domElement.addEventListener('touchstart', this.onStart);
        this.domElement.addEventListener('mousemove', this.onMove);
        this.domElement.addEventListener('touchmove', this.onMove);
        this.domElement.addEventListener('mouseup', this.onEnd);
        this.domElement.addEventListener('touchend', this.onEnd);
        this.domElement.addEventListener('touchcancel', this.onEnd);
        this.domElement.addEventListener('mouseleave', this.onEnd);
    }

    onStart(event) {
        event.preventDefault();
        if (this.isActive) return;

        if (event.type === 'touchstart') {
            for (let i = 0; i < event.changedTouches.length; i++) {
                const touch = event.changedTouches[i];
                if (this.isTouchInElement(touch)) {
                    this.touchId = touch.identifier;
                    this.startX = touch.clientX;
                    this.startY = touch.clientY;
                    this.isActive = true;
                    break;
                }
            }
        } else {
            this.startX = event.clientX;
            this.startY = event.clientY;
            this.isActive = true;
        }
    }

    onMove(event) {
        event.preventDefault();
        if (!this.isActive) return;

        if (event.type === 'touchmove') {
            for (let i = 0; i < event.changedTouches.length; i++) {
                const touch = event.changedTouches[i];
                if (touch.identifier === this.touchId) {
                    this.moveX = touch.clientX - this.startX;
                    this.moveY = touch.clientY - this.startY;
                    break;
                }
            }
        } else {
            this.moveX = event.clientX - this.startX;
            this.moveY = event.clientY - this.startY;
        }
    }

    onEnd(event) {
        event.preventDefault();
        if (!this.isActive) return;

        if (event.type === 'touchend' || event.type === 'touchcancel') {
            for (let i = 0; i < event.changedTouches.length; i++) {
                if (event.changedTouches[i].identifier === this.touchId) {
                    this.reset();
                    break;
                }
            }
        } else {
            this.reset();
        }
    }

    reset() {
        this.isActive = false;
        this.moveX = 0;
        this.moveY = 0;
        this.touchId = null;
    }

    isTouchInElement(touch) {
        const rect = this.domElement.getBoundingClientRect();
        return (
            touch.clientX >= rect.left &&
            touch.clientX <= rect.right &&
            touch.clientY >= rect.top &&
            touch.clientY <= rect.bottom
        );
    }

    getInput() {
        const vector_input = new THREE.Vector2(this.moveX, -this.moveY);
        if (vector_input.length() > 0) vector_input.normalize();
        return vector_input;
    }
}
class FC_Input_Keyboard {

    _Keys = {};
    _Input_Move = new THREE.Vector2(0, 0);
    _Input_Look = new THREE.Vector2(0, 0);

    get Input_Move() { return this._Input_Move; }
    get Input_Look() { return this._Input_Look; }

    constructor() {
        document.addEventListener('keydown', (event) => this.#KeyDown(event));
        document.addEventListener('keyup', (event) => this.#KeyUp(event));
    }

    Update() {
        this._Input_Move.set(0, 0);
        this._Input_Look.set(0, 0);

        if (this.#IsPressed('w')) {
            this._Input_Move.y += 1;
        }
        if (this.#IsPressed('s')) {
            this._Input_Move.y -= 1;
        }
        if (this.#IsPressed('a')) {
            this._Input_Move.x -= 1;
        }
        if (this.#IsPressed('d')) {
            this._Input_Move.x += 1;
        }

        if (this.#IsPressed('ArrowUp')) {
            this._Input_Look.y += 1;
        }
        if (this.#IsPressed('ArrowDown')) {
            this._Input_Look.y -= 1;
        }
        if (this.#IsPressed('ArrowLeft')) {
            this._Input_Look.x -= 1;
        }
        if (this.#IsPressed('ArrowRight')) {
            this._Input_Look.x += 1;
        }

        if (this._Input_Move.length() > 1) {
            this._Input_Move.normalize();
        }
        if (this._Input_Look.length() > 1) {
            this._Input_Look.normalize();
        }
    }

    #KeyDown(event) {
        this._Keys[event.key] = true;
    }
    #KeyUp(event) {
        this._Keys[event.key] = false;
    }
    #IsPressed(key) {
        return this._Keys[key] === true;
    }
}

class FC_GameObject {
    Initialize() { }
    Update() { }
}
class FC_Environment extends FC_GameObject {

    static FPS = 60;
    static TIME_DELTA = 1 / this.FPS;

    _Gravity = 9.8;

    get Gravity() { return this._Gravity; }

    set Gravity(_value) { this._Gravity = _value; }

    constructor() { super(); }

    Initialize() {
        this._Gravity = 9.8;
    }
}
class FC_Animation extends FC_GameObject {

    _Flag_Animation = true;
    _Flag_Move = false;

    constructor() { super(); }

    Update() {
        if (this._Flag_Animation) {
            if (this._Flag_Move) {
                this.Add_Position(this._Move_Direction.clone().multiplyScalar(this._Move_Speed * FC_Environment.TIME_DELTA));
            }
        }
    }

    Animation_Start() { this._Flag_Animation = true; }
    Animation_Stop() { this._Flag_Animation = false; }
    Animation_Move(_vector3, _speed) {
        this._Flag_Move = true;
        this._Move_Direction = _vector3;
        this._Move_Speed = _speed;
    }

    Add_Position(_vector3) {
        throw new Error("Add_Position(_vector3) must be.");
    }
}
class FC_Camera extends FC_GameObject {

    _FOV = 100;
    _OFFSET_LOOKAT_DEFAULT = new THREE.Vector3(0, 0, 1);
    _OFFSET_TARGET_DEFAULT = new THREE.Vector3(0, 0, -1);

    _Object = new THREE.PerspectiveCamera(this._FOV, window.innerWidth / window.innerHeight, 0.1, 50);
    _Position_LookAt = new THREE.Vector3(0, 0, 0);
    _Flag_Target = false;
    _Target = null;

    get Object() { return this._Object; }
    get Position() { return this._Object.position; }
    get Position_LookAt() { return this._Position_LookAt; }
    get Flag_Target() { return this._Flag_Target; }
    get Target() { return this._Target; }

    set Position(_vector3) { this._Object.position.copy(_vector3); }
    set LookAt(_vector3) {
        this._Position_LookAt = _vector3;
        this._Object.lookAt(this._Position_LookAt);
    }
    set Target(_target) {
        if (_target == null) {
            this._Flag_Target = false;
        }
        else {
            this._Flag_Target = true;
            this._Target = _target;
        }
    }

    constructor(_renderer, _offset_lookat_default = new THREE.Vector3(0, 0, 1), _offset_target_default = new THREE.Vector3(0, 0, -1)) {
        super();
        this._Renderer = _renderer;
        this._OFFSET_LOOKAT_DEFAULT = _offset_lookat_default;
        this._OFFSET_TARGET_DEFAULT = _offset_target_default;
        this.Resize_Screen = this.Resize_Screen.bind(this);
    }

    Initialize() {
        this.Position = this._OFFSET_TARGET_DEFAULT;
        this.LookAt = this._OFFSET_LOOKAT_DEFAULT;
        this.Target = null;
    }
    Update() {
        if (this._Flag_Target) {
            this.Position = new THREE.Vector3(0, 0, this._Target.Position.z).add(this._OFFSET_TARGET_DEFAULT);
            this.LookAt = new THREE.Vector3(0, 0, this._Target.Position.z).add(this._OFFSET_LOOKAT_DEFAULT);
        }
    }

    Resize_Screen() {
        this._Object.aspect = window.innerWidth / window.innerHeight;
        this._Object.updateProjectionMatrix();
        this._Renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
class FC_Camera_Controller extends FC_Camera {

    _Forward = new THREE.Vector3(0, 0, 1);
    _Yaw = 0;
    _Pitch = 0;

    get Forward() { return this._Forward; }

    constructor(_renderer, _offset_lookat_default = new THREE.Vector3(0, 0, 1), _offset_target_default = new THREE.Vector3(0, 0, -1)) {
        super(_renderer, _offset_lookat_default, _offset_target_default);
    }

    Update(_input_look = new THREE.Vector2(0, 0), _sensivility) {
        if (this._Flag_Target) {
            this.Position = this._Target.Position;
            this.Rotate_Forward(_input_look, _sensivility);
            this.LookAt = this.Position.clone().add(this._Forward);
        }
    }

    Rotate_Forward(_input_look, _sensivility) {
        const deltaX = -_input_look.x * _sensivility;
        const deltaY = -_input_look.y * _sensivility;

        this._Yaw += deltaX;
        this._Pitch = Math.max(-Math.PI / 2 + Math.PI / 18, Math.min(Math.PI / 2 - Math.PI / 18, this._Pitch + deltaY));

        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(new THREE.Euler(this._Pitch, this._Yaw, 0, 'YXZ'));

        this._Forward.copy(new THREE.Vector3(0, 0, 1)).applyQuaternion(quaternion).normalize();
    }
}
class FC_Light_Ambient extends FC_GameObject {

    _Object = new THREE.AmbientLight(0xffffff, 0.8);

    set Color(_color) { this._Object.color.set(_color); }

    constructor(_scene) {
        super();
        this._Scene = _scene;
        this._Scene.add(this._Object);
    }
    destructor() { this._Scene.remove(this._Object); }
}
class FC_Light_Directional extends FC_GameObject {

    _Object = new THREE.DirectionalLight(0xffffff, 0.8);

    set Color(_color) { this._Object.color.set(_color); }

    constructor(_scene) {
        super();
        this._Scene = _scene;
        this._Scene.add(this._Object);
    }
    destructor() { this._Scene.remove(this._Object); }
}
class FC_Timer extends FC_GameObject {

    _Flag_Starting = false;
    _Flag_Finished = false;
    _Time = 0;
    _Timer = 0;

    get Flag_Finished() { return this._Flag_Finished; }

    set Time(_second) {
        if (!this._Flag_Starting) {
            this.Initialize();
            this._Time = _second;
        }
    }

    constructor(_second) {
        super();
        this._Time = _second;
    }

    Initialize() {
        this._Flag_Starting = false;
        this._Flag_Finished = false;
        this._Time = 0;
        this._Timer = 0;
    }
    Update() {
        if (this._Flag_Starting) {
            this._Timer += FC_Environment.TIME_DELTA;
            if (this._Timer > this._Time) {
                this._Flag_Starting = false;
                this._Flag_Finished = true;
                this._Timer = 0;
            }
        }
    }

    Start() { this._Flag_Starting = true; }
    Stop() { this._Flag_Starting = false; }
    Restart() {
        this._Flag_Finished = false;
        this._Timer = 0;
        this.Start();
    }
}
class FC_Audio extends FC_GameObject {

    _Audio = new Audio();

    get Flag_Playing() { return !this._Audio.paused; }

    set Source(_url) { this._Audio.src = _url; }
    set Volume(_rate) { this._Audio.volume = _rate; }

    constructor(_src, _loop = true, _volume = 0.5) {
        super();
        this._Audio.src = _src;
        this._Audio.loop = _loop;
        this._Audio.volume = _volume;
    }

    Play() {
        this._Audio.play();
    }
    Stop() {
        this._Audio.pause();
        this._Audio.currentTime = 0;
    }
    Restart() {
        this._Audio.currentTime = 0;
        this.Play();
    }
}
class FC_TextPlane extends FC_Animation {

    get Mesh() { return this._Mesh_Front; }
    get Position() { return this._Mesh_Front.position; }
    get Rotation() { return this._Mesh_Front.rotation; }

    set Text(_text) {
        this._Text = _text;
        this._Material_Front.map = this.#_CreateTextTexture(this._Text, this._Color, this._Size_Geometry);
        this._Material_Front.needsUpdate = true;
        this._Material_Back.map = this.#_CreateTextTexture(this._Text, this._Color, this._Size_Geometry, true);
        this._Material_Back.needsUpdate = true;
    }
    set Color(_color) {
        this._Color = _color;
        this._Material_Front.map = this.#_CreateTextTexture(this._Text, this._Color, this._Size_Geometry);
        this._Material_Front.needsUpdate = true;
        this._Material_Back.map = this.#_CreateTextTexture(this._Text, this._Color, this._Size_Geometry, true);
        this._Material_Back.needsUpdate = true;
    }
    set Fog(_bool) {
        this._Material_Front.fog = _bool;
        this._Material_Back.fog = _bool;
    }
    set Position(_vector3) {
        this._Mesh_Front.position.set(_vector3.x, _vector3.y, _vector3.z);
        this._Mesh_Back.position.set(_vector3.x, _vector3.y, _vector3.z);
    }
    set Rotation(_vector3) {
        this._Mesh_Front.rotation.set(_vector3.x, _vector3.y, _vector3.z);
        this._Mesh_Back.rotation.set(_vector3.x, _vector3.y, _vector3.z);
    }
    set Scale(_vector2) { this._Geometry.scale.set(_vector2.x, _vector2.y, 1); }

    constructor(_scene, _camera, _text, _color, _vector2_geometry, _isbillboard = false) {
        super();
        this._Scene = _scene;
        this._Camera = _camera;
        this._Text_Default = this._Text = _text;
        this._Color_Default = this._Color = _color;
        this._Size_Geometry = _vector2_geometry;
        this._Geometry = new THREE.PlaneGeometry(_vector2_geometry.x, _vector2_geometry.y);
        this._Material_Front = new THREE.MeshBasicMaterial({
            map: this.#_CreateTextTexture(_text, _color, _vector2_geometry),
            side: THREE.FrontSide,
            transparent: true,
            opacity: 1.0,
            depthTest: false,
            depthWrite: false,
        });
        this._Mesh_Front = new THREE.Mesh(this._Geometry, this._Material_Front);
        this._Scene.add(this._Mesh_Front);
        this._Material_Back = new THREE.MeshBasicMaterial({
            map: this.#_CreateTextTexture(_text, _color, _vector2_geometry, true),
            side: THREE.BackSide,
            transparent: true,
            opacity: 1.0,
            depthTest: false,
            depthWrite: false,
        });
        this._Mesh_Back = new THREE.Mesh(this._Geometry, this._Material_Back);
        this._Scene.add(this._Mesh_Back);

        this._Is_Billboard = _isbillboard;
    }
    destructor() {
        Scene.remove(this._Mesh_Front);
        Scene.remove(this._Mesh_Back);
    }

    Initialize(_bool_keep_text = false) {
        this.Position = new THREE.Vector3(0, 0, 0);
        this.Rotation = new THREE.Vector3(0, 0, 0);
        if (!_bool_keep_text) this.Text = this._Text_Default;
        this.Color = this._Color_Default;
    }
    Update() {
        super.Update();
        if (this._Is_Billboard) {
            LookAt(this._Camera.Position);
        }
    }

    Show() {
        this._Material_Front.map = this.#_CreateTextTexture(this._Text, Alpha_Change(this._Color, "FF"), this._Size_Geometry);
        this._Material_Front.needsUpdate = true;
        this._Material_Back.map = this.#_CreateTextTexture(this._Text, Alpha_Change(this._Color, "FF"), this._Size_Geometry, true);
        this._Material_Back.needsUpdate = true;
    }
    Hide() {
        this._Material_Front.map = this.#_CreateTextTexture(this._Text, Alpha_Change(this._Color, "00"), this._Size_Geometry);
        this._Material_Front.needsUpdate = true;
        this._Material_Back.map = this.#_CreateTextTexture(this._Text, Alpha_Change(this._Color, "00"), this._Size_Geometry, true);
        this._Material_Back.needsUpdate = true;
    }
    Add_Position(_vector3) {
        const new_position = this.Position;
        new_position.x += _vector3.x;
        new_position.y += _vector3.y;
        new_position.z += _vector3.z;
        this.Position = new_position;
    }
    Add_Rotation(_vector3) {
        const new_rotation = this.Rotation;
        new_rotation.x += _vector3.x;
        new_rotation.y += _vector3.y;
        new_rotation.z += _vector3.z;
        this.Rotation = new_rotation;
    }
    LookAt(_vector3) {
        this._Mesh_Front.lookAt(_vector3);
        this._Mesh_Back.lookAt(_vector3);
    }
    Place_on_Screen(_vector2_screen, _distance) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(_vector2_screen, this._Camera.Object);
        this.Position = raycaster.ray.direction.clone().multiplyScalar(_distance).add(this._Camera.Position);
    }

    #_CreateTextTexture(_text, _color, _vector2_geometry, _flip = false) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        const resolution = 512;
        canvas.width = _vector2_geometry.x * resolution;
        canvas.height = _vector2_geometry.y * resolution;

        context.fillStyle = '#ffffff00';
        context.fillRect(0, 0, canvas.width, canvas.height);

        const font_size = Math.min(canvas.width, canvas.height);
        context.fillStyle = _color;
        context.font = `${font_size}px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        if (_flip) {
            context.scale(-1, 1);
            context.fillText(_text, -canvas.width / 2, canvas.height / 2);
        } else {
            context.fillText(_text, canvas.width / 2, canvas.height / 2);
        }

        return new THREE.CanvasTexture(canvas);
    }
}
class FC_ImagePlane extends FC_Animation {

    get Mesh() { return this._Mesh_Front; }
    get Position() { return this._Mesh_Front.position; }
    get Rotation() { return this._Mesh_Front.rotation; }

    set Image(_url) {
        this._Image = _url;
        this._Material_Front.map = this.#_CreateImageTexture(this._Image);
        this._Material_Front.needsUpdate = true;
        this._Material_Back.map = this.#_CreateImageTexture(this._Image, true);
        this._Material_Back.needsUpdate = true;
    }
    set Position(_vector3) {
        this._Mesh_Front.position.set(_vector3.x, _vector3.y, _vector3.z);
        this._Mesh_Back.position.set(_vector3.x, _vector3.y, _vector3.z);
    }
    set Rotation(_vector3) {
        this._Mesh_Front.rotation.set(_vector3.x, _vector3.y, _vector3.z);
        this._Mesh_Back.rotation.set(_vector3.x, _vector3.y, _vector3.z);
    }
    set Scale(_vector2) { 
        this._Mesh_Front.scale.set(_vector2.x, _vector2.y, 1);
        this._Mesh_Back.scale.set(_vector2.x, _vector2.y, 1);
    }
    set Fog(_bool) {
        this._Material_Front.fog = _bool;
        this._Material_Back.fog = _bool;
    }

    constructor(_scene, _camera, _url, _vector2_geometry, _isbillboard = false) {
        super();
        this._Scene = _scene;
        this._Camera = _camera;
        this._Image_Default = this._Image = _url;
        this._Size_Geometry = _vector2_geometry;
        this._Geometry = new THREE.PlaneGeometry(_vector2_geometry.x, _vector2_geometry.y);
        this._Material_Front = new THREE.MeshBasicMaterial({
            map: this.#_CreateImageTexture(_url),
            side: THREE.FrontSide,
            transparent: true,
            opacity: 1.0,
        });
        this._Mesh_Front = new THREE.Mesh(this._Geometry, this._Material_Front);
        this._Scene.add(this._Mesh_Front);

        this._Material_Back = new THREE.MeshBasicMaterial({
            map: this.#_CreateImageTexture(_url, true),
            side: THREE.BackSide,
            transparent: true,
            opacity: 1.0,
        });
        this._Mesh_Back = new THREE.Mesh(this._Geometry, this._Material_Back);
        this._Scene.add(this._Mesh_Back);

        this._Is_Billboard = _isbillboard;
    }
    destructor() { 
        this._Scene.remove(this._Mesh_Front);
        this._Scene.remove(this._Mesh_Back);
    }

    Initialize() {
        this.Position = new THREE.Vector3(0, 0, 0);
        this.Rotation = new THREE.Vector3(0, 0, 0);
        this.Image = this._Image_Default;
    }
    Update() {
        super.Update();
        if (this._Is_Billboard) {
            this.LookAt(this._Camera.Position);
        }
    }

    Show() {
        this._Material_Front.opacity = 1.0;
        this._Material_Back.opacity = 1.0;
    }
    Hide() {
        this._Material_Front.opacity = 0.0;
        this._Material_Back.opacity = 0.0;
    }
    Add_Position(_vector3) {
        const new_position = this.Position;
        new_position.add(_vector3);
        this.Position = new_position;
    }
    Add_Rotation(_vector3) {
        const new_rotation = this.Rotation;
        new_rotation.x += _vector3.x;
        new_rotation.y += _vector3.y;
        new_rotation.z += _vector3.z;
        this.Rotation = new_rotation;
    }
    LookAt(_vector3) {
        this._Mesh_Front.lookAt(_vector3);
        this._Mesh_Back.lookAt(_vector3);
    }
    Place_on_Screen(_vector2_screen, _distance) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(_vector2_screen, this._Camera.Object);
        this.Position = raycaster.ray.direction.clone().multiplyScalar(_distance).add(this._Camera.Position);
    }

    #_CreateImageTexture(_url, _flip = false) {
        const loader = new THREE.TextureLoader();
        const texture = loader.load(_url);
        if (_flip) {
            texture.repeat.x = -1;
            texture.offset.x = 1;
        }
        return texture;
    }
}
class FC_Player_Controller extends FC_GameObject {

    _Speed_Past = 0.55;
    _Speed = this._Speed_Past;

    get Position() { return this._Object.position; }
    get Forward() { return this._Forward; }

    set Position(_vector3) { this._Object ? this._Object.position.set(_vector3.x, _vector3.y, _vector3.z) : null; }

    constructor(_scene) {
        super();
        this._Scene = _scene;
        this._Object = new THREE.Object3D();
        this._Scene.add(this._Object);
        this.Initialize();
    }
    destructor() { this._Scene.remove(this._Object); }

    Initialize() {
        this._Speed_Past = 1.2;
        this._Speed = this._Speed_Past;
        this.Position = new THREE.Vector3(0, 1.74 - 0.08, 0);
    }
    Update(_input_move = new THREE.Vector2(0, 0), _forward_camera = new THREE.Vector3(0, 0, 0)) {
        const forward = _forward_camera.clone();
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        const moveDirection = new THREE.Vector3(
            forward.x * _input_move.y + right.x * _input_move.x,
            0,
            forward.z * _input_move.y + right.z * _input_move.x
        );

        this.Position = this.Position.clone().add(moveDirection.multiplyScalar(this._Speed * FC_Environment.TIME_DELTA));
    }
}

class FC_Manager {

    _TIME_FOR_READY = 1;
    _UI_SIZE_MULTIPLY = 0.2;

    _Flag_Loaded = false;
    _State = "Waiting_Start";
    _BGM = null;
    _Timer_Waiting = new FC_Timer(1);
    _Timer_Input = new FC_Timer(0.1);
    _Timer_Ready = 0;

    get State() { return this._State; }
    get Timer_Input() { return this._Timer_Input; }
    get BGM() { return this._BGM; }

    set BGM(_url) {
        if (!this._BGM) this._BGM = new FC_Audio(_url);
        else this._BGM.Source = _url;
    }

    constructor(_scene, _renderer) {
        this._Scene = _scene;
        this._Renderer = _renderer;
    }

    Initialize() {
        this._State = "Waiting";
        this._Timer_Waiting.Restart();
        this._Timer_Input.Start();
        this._Timer_Ready = 0;
    }
    Update() {

        if (!this._Flag_Loaded) {
            this._Flag_Loaded = true;
            this.Fade(true);
        }
        if (this._Flag_Loaded) {

            switch (this._State) {
                case "Waiting":
                    this._Timer_Waiting.Update();
                    if (this._Timer_Waiting.Flag_Finished) {
                        this._State = "Waiting_Start";
                    }
                    break;
                case "Playing": this.Update_Playing(); break;
            }
            this.Update_System();

        }
        Renderer.render(Scene, Camera.Object);
        requestAnimationFrame(this.Update.bind(this));
    }
    Update_System() {

        this._Timer_Input.Update();

        if (this._State == "Gameover") {
            this._Timer_Ready += FC_Environment.TIME_DELTA;
            if (this._Timer_Ready > this._TIME_FOR_READY) {
                this._State = "Waiting_Restart";
            }
        }
    }
    Update_Playing() {

    }

    Start() {
        this._State = "Playing";
    }
    GameOver() {
        this._State = "Gameover";
    }
    Fade(_out_or_in) {
        const overlay = document.getElementById('Fade_Game');
        overlay.style.opacity = _out_or_in ? '0' : '1';
    }
}


export {
    Mobile_or_Desktop,
    RandomNumber_Between,
    Shousuu_Kirisute,
    Degrees_to_Radians,
    Alpha_Change,
    FC_JoystickController,
    FC_Input_Keyboard,
    FC_GameObject,
    FC_Environment,
    FC_Animation,
    FC_Camera,
    FC_Camera_Controller,
    FC_Light_Ambient,
    FC_Light_Directional,
    FC_Timer,
    FC_Audio,
    FC_TextPlane,
    FC_ImagePlane,
    FC_Player_Controller,
    FC_Manager,
}