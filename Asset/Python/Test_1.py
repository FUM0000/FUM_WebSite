import json
import math

points = []

for deg in range(360):
    r = math.radians(deg)

    points.append({
        "x": math.cos(r),
        "y": math.sin(r),
        "z": 0
    })

with open("./Asset/Python/Data/Test_1.json", "w") as f:
    json.dump(points, f)