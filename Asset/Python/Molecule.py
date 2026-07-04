import json
import math

ELEMENTS = {
    "H":  {"radius": 0.30, "color": "#ffffff", "name": "水素"},
    "C":  {"radius": 0.45, "color": "#404040", "name": "炭素"},
    "N":  {"radius": 0.42, "color": "#3050f8", "name": "窒素"},
    "O":  {"radius": 0.38, "color": "#ff0d0d", "name": "酸素"},
    "F":  {"radius": 0.35, "color": "#90e050", "name": "フッ素"},
    "Cl": {"radius": 0.50, "color": "#1ff01f", "name": "塩素"},
    "Br": {"radius": 0.55, "color": "#a62929", "name": "臭素"},
    "I":  {"radius": 0.62, "color": "#940094", "name": "ヨウ素"},
    "S":  {"radius": 0.45, "color": "#ffff30", "name": "硫黄"},
    "P":  {"radius": 0.48, "color": "#ff8000", "name": "リン"},
    "Na": {"radius": 0.55, "color": "#ab5cf2", "name": "ナトリウム"},
    "Si": {"radius": 0.50, "color": "#b0b0b0", "name": "ケイ素"},
    "Fe": {"radius": 0.52, "color": "#e06633", "name": "鉄"},
    "Cu": {"radius": 0.52, "color": "#c88033", "name": "銅"},
}

BOND_RADIUS = 0.12
SCALE = 1.8

def make_atoms(elements_list):
    return [
        {"element": elem, "x": x * SCALE, "y": y * SCALE, "z": z * SCALE}
        for elem, x, y, z in elements_list
    ]

def make_bonds(pairs):
    return [{"i": i, "j": j, "order": order} for i, j, order in pairs]


MOLECULES = [
    {
        "name": "水素",
        "formula": "H\u2082",
        "description": "水素分子。最も単純な共有結合。単結合。",
        "atoms": make_atoms([
            ("H", -0.37, 0, 0),
            ("H",  0.37, 0, 0),
        ]),
        "bonds": make_bonds([(0, 1, 1)])
    },
    {
        "name": "酸素",
        "formula": "O\u2082",
        "description": "酸素分子。二重結合。常磁性を持つ。",
        "atoms": make_atoms([
            ("O", -0.605, 0, 0),
            ("O",  0.605, 0, 0),
        ]),
        "bonds": make_bonds([(0, 1, 2)])
    },
    {
        "name": "窒素",
        "formula": "N\u2082",
        "description": "窒素分子。三重結合。極めて安定。",
        "atoms": make_atoms([
            ("N", -0.55, 0, 0),
            ("N",  0.55, 0, 0),
        ]),
        "bonds": make_bonds([(0, 1, 3)])
    },
    {
        "name": "水",
        "formula": "H\u2082O",
        "description": "水分子。折れ線構造、結合角104.5°。極性分子。",
        "atoms": make_atoms([
            ("O",  0,      0,     0),
            ("H",  0.757,  0.586, 0),
            ("H", -0.757,  0.586, 0),
        ]),
        "bonds": make_bonds([(0, 1, 1), (0, 2, 1)])
    },
    {
        "name": "二酸化炭素",
        "formula": "CO\u2082",
        "description": "二酸化炭素。直線形分子。温室効果ガス。",
        "atoms": make_atoms([
            ("C",  0,     0, 0),
            ("O", -1.16,  0, 0),
            ("O",  1.16,  0, 0),
        ]),
        "bonds": make_bonds([(0, 1, 2), (0, 2, 2)])
    },
    {
        "name": "メタン",
        "formula": "CH\u2084",
        "description": "メタン。正四面体構造。天然ガスの主成分。",
        "atoms": make_atoms([
            ("C",  0,                      0,                      0),
            ("H",  0.629,  0.629,  0.629),
            ("H",  0.629, -0.629, -0.629),
            ("H", -0.629,  0.629, -0.629),
            ("H", -0.629, -0.629,  0.629),
        ]),
        "bonds": make_bonds([(0, 1, 1), (0, 2, 1), (0, 3, 1), (0, 4, 1)])
    },
    {
        "name": "アンモニア",
        "formula": "NH\u2083",
        "description": "アンモニア。三角錐構造。窒素原子に非共有電子対。",
        "atoms": make_atoms([
            ("N",  0,                      0,                      0),
            ("H",  0.583,  0.583,  0.583),
            ("H",  0.583, -0.583, -0.583),
            ("H", -0.583,  0.583, -0.583),
        ]),
        "bonds": make_bonds([(0, 1, 1), (0, 2, 1), (0, 3, 1)])
    },
    {
        "name": "ベンゼン",
        "formula": "C\u2086H\u2086",
        "description": "ベンゼン。六角形の環状構造。芳香族性を持つ。",
        "atoms": [],
        "bonds": []
    },
    {
        "name": "塩化ナトリウム",
        "formula": "NaCl",
        "description": "塩化ナトリウム（食塩）。イオン結合。面心立方格子。",
        "atoms": [],
        "bonds": []
    },
]

# Benzene
benzene_c = []
for i in range(6):
    a = i * 60 * math.pi / 180
    benzene_c.append((1.40 * math.cos(a) * SCALE,
                      1.40 * math.sin(a) * SCALE,
                      0))

benzene_h = []
for i in range(6):
    a = i * 60 * math.pi / 180
    cx, cy, cz = benzene_c[i]
    benzene_h.append(((cx + 1.09 * math.cos(a) * SCALE),
                      (cy + 1.09 * math.sin(a) * SCALE),
                      0))

benzene_atoms = []
benzene_bonds = []
for i in range(6):
    cx, cy, cz = benzene_c[i]
    hx, hy, hz = benzene_h[i]
    benzene_atoms.append({"element": "C", "x": cx, "y": cy, "z": cz})
    benzene_atoms.append({"element": "H", "x": hx, "y": hy, "z": hz})
    # C-H bond
    ci = i * 2
    hi = ci + 1
    benzene_bonds.append({"i": ci, "j": hi, "order": 1})
    # C-C bond (to next carbon)
    ni = ((i + 1) % 6) * 2
    order = 2 if i % 2 == 0 else 1
    benzene_bonds.append({"i": ci, "j": ni, "order": order})

MOLECULES[7]["atoms"] = benzene_atoms
MOLECULES[7]["bonds"] = benzene_bonds

# NaCl crystal (3x3x3)
na_cl_atoms = []
na_cl_bonds = []
spacing = 2.82 * SCALE
grid_size = 3
offset = (grid_size - 1) / 2
idx = 0
for ix in range(grid_size):
    for iy in range(grid_size):
        for iz in range(grid_size):
            x = (ix - offset) * spacing
            y = (iy - offset) * spacing
            z = (iz - offset) * spacing
            if (ix + iy + iz) % 2 == 0:
                na_cl_atoms.append({"element": "Na", "x": x, "y": y, "z": z})
            else:
                na_cl_atoms.append({"element": "Cl", "x": x, "y": y, "z": z})
            idx += 1

# Bonds between adjacent Na-Cl pairs
for ix in range(grid_size):
    for iy in range(grid_size):
        for iz in range(grid_size):
            i1 = ix * grid_size * grid_size + iy * grid_size + iz
            for dx, dy, dz in [(1,0,0), (-1,0,0), (0,1,0), (0,-1,0), (0,0,1), (0,0,-1)]:
                nx, ny, nz = ix + dx, iy + dy, iz + dz
                if 0 <= nx < grid_size and 0 <= ny < grid_size and 0 <= nz < grid_size:
                    i2 = nx * grid_size * grid_size + ny * grid_size + nz
                    if i1 < i2:
                        na_cl_bonds.append({"i": i1, "j": i2, "order": 1})

MOLECULES[8]["atoms"] = na_cl_atoms
MOLECULES[8]["bonds"] = na_cl_bonds

data = {
    "elements": ELEMENTS,
    "bond_radius": BOND_RADIUS,
    "scale": SCALE,
    "molecules": MOLECULES
}

with open("./Asset/Python/Data/Molecule.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print(f"Generated {len(MOLECULES)} molecules")
for m in MOLECULES:
    name = m['name']
    formula = m['formula'].encode('ascii', 'replace').decode('ascii')
    print(f"  {name} ({formula}): {len(m['atoms'])} atoms, {len(m['bonds'])} bonds")
