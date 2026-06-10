import json
import math

eccentricity = 0.0167
semi_major = 10.0
semi_minor = semi_major * math.sqrt(1 - eccentricity ** 2)
c = semi_major * eccentricity

data = {
    "semi_major_axis": semi_major,
    "semi_minor_axis": semi_minor,
    "eccentricity": eccentricity,
    "c": c,
    "sun": { "x": 0, "y": 0, "z": 0 },
    "orbit": []
}

for deg in range(360):
    nu = math.radians(deg)
    r = semi_major * (1 - eccentricity ** 2) / (1 + eccentricity * math.cos(nu))
    data["orbit"].append({
        "x": r * math.cos(nu),
        "y": 0,
        "z": r * math.sin(nu)
    })

with open("./Asset/Python/Data/Planet_Orbit.json", "w") as f:
    json.dump(data, f, indent=2)
