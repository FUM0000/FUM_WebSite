import json
import math

AU_KM = 149597870.7

PLANETS = [
    {"name": "Mercury", "semi_major_au": 0.387,  "eccentricity": 0.2056, "radius_km": 2439.7, "color": "#b5b5b5", "period_days": 87.97},
    {"name": "Venus",   "semi_major_au": 0.723,  "eccentricity": 0.0068, "radius_km": 6051.8, "color": "#e8cda0", "period_days": 224.7},
    {"name": "Earth",   "semi_major_au": 1.000,  "eccentricity": 0.0167, "radius_km": 6371.0, "color": "#2288ff", "period_days": 365.25},
    {"name": "Mars",    "semi_major_au": 1.524,  "eccentricity": 0.0934, "radius_km": 3389.5, "color": "#c1440e", "period_days": 687.0},
    {"name": "Jupiter", "semi_major_au": 5.203,  "eccentricity": 0.0484, "radius_km": 69911.0, "color": "#d8a27a", "period_days": 4333},
    {"name": "Saturn",  "semi_major_au": 9.537,  "eccentricity": 0.0542, "radius_km": 58232.0, "color": "#ead6b8", "period_days": 10759},
    {"name": "Uranus",  "semi_major_au": 19.19,  "eccentricity": 0.0472, "radius_km": 25362.0, "color": "#73b8e0", "period_days": 30687},
    {"name": "Neptune", "semi_major_au": 30.07,  "eccentricity": 0.0086, "radius_km": 24622.0, "color": "#3f54ba", "period_days": 60190},
]

SUN_RADIUS_KM = 696340
MAX_SCREEN_RADIUS = 45.0
MAX_AU = max(p["semi_major_au"] for p in PLANETS)
SCALE = MAX_SCREEN_RADIUS / (MAX_AU * AU_KM)

data = {
    "sun": {
        "x": 0, "y": 0, "z": 0,
        "radius": SUN_RADIUS_KM * SCALE
    },
    "planets": [],
    "scale": {
        "km_to_screen": SCALE,
        "max_screen_radius": MAX_SCREEN_RADIUS
    }
}

for planet in PLANETS:
    semi_major_au = planet["semi_major_au"]
    e = planet["eccentricity"]
    semi_major = semi_major_au * AU_KM * SCALE
    semi_minor = semi_major * math.sqrt(1 - e ** 2)
    c = semi_major * e
    radius = planet["radius_km"] * SCALE

    orbit = []
    for deg in range(360):
        nu = math.radians(deg)
        r = semi_major * (1 - e ** 2) / (1 + e * math.cos(nu))
        orbit.append({
            "x": r * math.cos(nu),
            "y": 0,
            "z": r * math.sin(nu)
        })

    data["planets"].append({
        "name": planet["name"],
        "semi_major_axis": semi_major,
        "semi_minor_axis": semi_minor,
        "eccentricity": e,
        "c": c,
        "radius": radius,
        "color": planet["color"],
        "period_days": planet["period_days"],
        "orbit": orbit
    })

with open("./Asset/Python/Data/Planet_Orbit.json", "w") as f:
    json.dump(data, f, indent=2)

print(f"Scale: {SCALE:.6e} km/screen-unit")
print(f"Sun radius: {SUN_RADIUS_KM * SCALE:.8f} screen units")
for p in data["planets"]:
    print(f"  {p['name']}: orbit a={p['semi_major_axis']:.4f}, radius={p['radius']:.8f}")
