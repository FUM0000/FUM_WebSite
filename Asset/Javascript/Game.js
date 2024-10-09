
function RandomNumber_Between(_min, _max) { return Math.random() * (_max - _min + 1) + _min; }
function Degrees_to_Radians(_degrees) { return _degrees * (Math.PI / 180); }
function Alpha_Change(_color, _alpha) {
    if (_color.length === 7) { return _color + _alpha; }
    if (_color.length === 9) { return _color.slice(0, 7) + _alpha; }
    return null;
}