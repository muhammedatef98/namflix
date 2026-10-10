#!/usr/bin/env python3
"""Erase the sign-out button from the raw home captures.

The button was removed from the app when accounts were dropped, but the raw
captures predate that change, so every generated store screenshot still shows a
control that no longer exists. Re-shooting the raws would be the other option;
this patches the two home captures instead so the rest of the deck stays
byte-identical.

The fill is sampled from a clean band in the *same row* and mirror-tiled, which
keeps the background's vertical gradient and film grain intact. A flat colour
fill reads as a visible rectangle against that grain.
"""
import sys
from PIL import Image

RAW = 'store/screens-raw'

# (file, button box, donor band) — the Arabic layout mirrors the header, so its
# button sits on the left and its clean donor band is the left margin.
TARGETS = [
    ('en-01-home.png', (1005, 202, 1145, 346), (1150, 1206)),
    ('01-home.png',    (  64, 214,  196, 342), (   0,   60)),
]


def mirror_tile(px, y, x0, x1, dsrc, dend):
    """Fill row y from x0..x1 with mirror-tiled pixels of the donor band."""
    span = dend - dsrc
    for i, x in enumerate(range(x0, x1)):
        idx = i % (2 * span)
        sx = dsrc + idx if idx < span else dsrc + (2 * span - 1 - idx)
        px[x, y] = px[sx, y]


def patch(name, box, donor, outdir):
    x0, y0, x1, y1 = box
    im = Image.open(f'{RAW}/{name}')
    mode = im.mode
    im = im.convert('RGB')
    px = im.load()
    for y in range(y0, y1):
        mirror_tile(px, y, x0, x1, *donor)
    out = f'{outdir}/{name}'
    im.convert(mode).save(out)
    print(f'patched {name} -> {out}  box={box} donor={donor}')


if __name__ == '__main__':
    outdir = sys.argv[1] if len(sys.argv) > 1 else '/tmp'
    for name, box, donor in TARGETS:
        patch(name, box, donor, outdir)
