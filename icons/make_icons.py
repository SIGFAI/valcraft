"""ValCraft replacement item icons (SIGF), 16x16, for the resource pack valcraft-sigf-icons.

Original art: 18 icons are fal generations (fal-ai/flux/dev, prompts and seeds in PROMPTS.md) shrunk here to
Minecraft's 16x16 item size; 2 (hard_antler, kindled_ribs) are drawn by hand below (Claude). Nothing here is made
from Valheim's or ValCraft's art. The fal source images (512x512) are not committed; the outputs are.

  python library/valcraft/icons/make_icons.py <folder with the fal images>     (needs Pillow)
"""
import os
import sys
from collections import deque

from PIL import Image

INNER = 14  # the item inside a 1-pixel outline


def background(im):
    """Flood fill from the border over white, light grey and pale shadow pixels: True = background."""
    w, h = im.size
    px = im.load()
    bg = [[False] * w for _ in range(h)]
    q = deque([(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)])
    while q:
        x, y = q.popleft()
        c = px[x, y]
        if bg[y][x] or not (min(c) >= 200 and max(c) - min(c) <= 40):
            continue
        bg[y][x] = True
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not bg[ny][nx]:
                q.append((nx, ny))
    return bg


def pixelize(path, colours, cut=0.5):
    """fal image -> 16x16 RGBA: crop to the object, box-shrink to 14x14, keep `colours` colours, dark outline."""
    im = Image.open(path).convert("RGB")
    w, h = im.size
    bg = background(im)
    mask = Image.new("L", (w, h))
    mask.putdata([0 if bg[y][x] else 255 for y in range(h) for x in range(w)])
    x0, y0, x1, y1 = mask.getbbox()
    s = max(x1 - x0, y1 - y0)
    left, top = int((x0 + x1 - s) / 2), int((y0 + y1 - s) / 2)
    rgba = im.convert("RGBA")
    rgba.putalpha(mask)
    square = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    square.paste(rgba.crop((left, top, left + s, top + s)), (0, 0))
    small = square.resize((INNER, INNER), Image.Resampling.BOX).load()
    solid = {}
    for y in range(INNER):
        for x in range(INNER):
            r, g, b, a = small[x, y]
            if a >= cut * 255:
                solid[(x + 1, y + 1)] = (r, g, b)
    strip = Image.new("RGB", (len(solid), 1))
    strip.putdata(list(solid.values()))
    reduced = list(strip.quantize(colors=colours, method=Image.Quantize.MEDIANCUT).convert("RGB").getdata())

    def punch(c):  # a little more contrast and saturation, like Minecraft's flat item shading
        grey = sum(c) / 3
        return tuple(max(0, min(255, int((grey + (v - grey) * 1.2 - 128) * 1.1 + 128))) for v in c)

    out = {p: punch(c) for p, c in zip(solid, reduced)}
    edge = tuple(int(v * 0.3) for v in min(set(reduced), key=sum))
    for (x, y) in solid:
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if (nx, ny) not in solid and 0 <= nx < 16 and 0 <= ny < 16:
                out[(nx, ny)] = edge
    icon = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    for p, c in out.items():
        icon.putpixel(p, c + (255,))
    return icon


# Drawn by hand (fal's antler and rib results did not read at 16x16): palette letter -> colour, '.' = clear.
HAND = {
    "hard_antler": ({"o": (43, 28, 20), "d": (88, 58, 38), "m": (128, 90, 58), "l": (171, 135, 95), "t": (226, 212, 184)}, """
................
............o...
...........oto..
......o....olo..
.....oto..olmo..
.....olo..olmo..
......olmolmo...
..o...olmmmo....
.oto..olmmdo....
.olo.olmmdo.....
..olmlmmdo......
..olmmmdo.......
.olmmddo........
olmddoo.........
oddoo...........
.oo.............
"""),
    "kindled_ribs": ({"o": (26, 16, 14), "b": (62, 46, 42), "g": (112, 98, 90), "e": (232, 110, 28), "y": (255, 214, 96)}, """
................
.oo.............
obboooooo.......
obgbbbebbo......
obboooooobo.....
obo.....oyeo....
obbooooo.obo....
obgbbbbeo.obo...
obboooooeo.obo..
obo.....obo.oeo.
obboooo..obo.oo.
obgbbbeo.oyeo...
obboooooo.obo...
obo......oeo....
.o........o.....
................
"""),
}


def draw(name):
    pal, grid = HAND[name]
    rows = grid.strip("\n").split("\n")
    assert len(rows) == 16 and all(len(r) == 16 for r in rows), name
    im = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch != ".":
                im.putpixel((x, y), pal[ch] + (255,))
    return im


# icon -> (fal image <name>_<index>.png, colours kept)
PICKS = {
    "ancient_seed": ("ancient_seed_1.png", 7), "bell": ("bell_1.png", 6), "bell_fragment": ("bell_fragment_0.png", 6),
    "swamp_key": ("swamp_key_0.png", 5), "dragon_egg": ("dragon_egg_1.png", 5), "dragon_tear": ("dragon_tear_1.png", 5),
    "majestic_carapace": ("majestic_carapace_1.png", 7), "sealbreaker": ("sealbreaker_0.png", 7),
    "sealbreaker_fragment": ("sealbreaker_fragment_1.png", 7), "bonemass_trophy": ("bonemass_trophy_1.png", 7),
    "moder_trophy": ("moder_trophy_1.png", 7), "eikthyr_trophy": ("eikthyr_trophy_1.png", 7),
    "fader_trophy": ("fader_trophy_1.png", 7), "yagluth_trophy": ("yagluth_trophy_0.png", 7),
    "queen_trophy": ("queen_trophy_1.png", 7), "elder_trophy": ("elder_trophy_0.png", 7),
    "withered_bone": ("withered_bone_0.png", 5), "torn_spirit": ("torn_spirit_1.png", 5),
}
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pack")
ITEMS = os.path.join(OUT, "assets", "valcraft", "textures", "item")


def main():
    src = sys.argv[1]
    os.makedirs(ITEMS, exist_ok=True)
    for name, (file, colours) in PICKS.items():
        pixelize(os.path.join(src, file), colours).save(os.path.join(ITEMS, name + ".png"))
    for name in HAND:
        draw(name).save(os.path.join(ITEMS, name + ".png"))
    # pack.png: the Eikthyr-style stag trophy, 4x nearest
    Image.open(os.path.join(ITEMS, "eikthyr_trophy.png")).resize((64, 64), Image.Resampling.NEAREST).save(os.path.join(OUT, "pack.png"))
    print(len(PICKS) + len(HAND), "icons in", ITEMS)


if __name__ == "__main__":
    main()
