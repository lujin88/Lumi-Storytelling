"""Key a green-screen Lumi clip, frame by frame, and fit it onto the still's canvas.

Usage: python3 scripts/lumi_key.py <frames-in> <frames-out> <size> <x> <y> <canvas-w> <canvas-h>

Each input frame is keyed against its own background colour, sampled from the
frame border: generated clips drift in brightness (the wave clip's middle frames
are darker), so one fixed key colour leaves green on some frames. Alpha comes from
how much green beats red/blue relative to that colour; edge pixels take the
colour of the solid pixels beside them and green spill is clamped. The keyed frame
is then resized to <size> px square and placed at <x>,<y> on a transparent canvas so it lines up
with the still in assets/lumi/source/.

Needs Pillow and numpy.
"""
import glob
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

src, dst = sys.argv[1], sys.argv[2]
size, x, y, cw, ch = (int(v) for v in sys.argv[3:8])
os.makedirs(dst, exist_ok=True)

for path in sorted(glob.glob(os.path.join(src, '*.png'))):
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    border = np.concatenate([a[:12].reshape(-1, 3), a[-12:].reshape(-1, 3),
                             a[:, :12].reshape(-1, 3), a[:, -12:].reshape(-1, 3)])
    bg = np.median(border, 0)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    greenness = (g - np.maximum(r, b)) / (bg[1] - max(bg[0], bg[2]))
    alpha = np.clip((0.7 - greenness) / 0.55, 0, 1)
    # Choke the matte by 1 px so the outermost mixed ring goes.
    choked = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3))
    alpha = np.minimum(alpha, np.asarray(choked).astype(np.float32) / 255)
    # Edge pixels take the colour of the solid pixels next to them: un-mixing them from
    # the background overshoots to white and leaves a light rim on the page.
    # Transparent pixels get it too (from further away): left green, they bleed into
    # the edge through the WebM's 4:2:0 chroma.
    solid = (alpha > 0.98).astype(np.float32)
    fg = a * solid[..., None]
    filled = solid.copy()
    for radius in (3, 12, 48):
        blur = lambda ch: np.asarray(Image.fromarray(ch.astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius))).astype(np.float32)
        weight = blur(solid * 255)
        near = np.dstack([blur(a[..., i] * solid) for i in range(3)]) * 255 / np.maximum(weight, 1e-3)[..., None]
        take = (filled == 0) & (weight > 1)
        fg[take] = near[take]
        filled[take] = 1
    fg[..., 1] = np.minimum(fg[..., 1], np.maximum(fg[..., 0], fg[..., 2]))
    keyed = Image.fromarray(np.dstack([fg.clip(0, 255), alpha * 255]).astype(np.uint8), 'RGBA')

    # crop() pads with transparent pixels; paste() with the image as its own mask
    # would square the alpha.
    keyed = keyed.resize((size, size), Image.LANCZOS)
    keyed.crop((-x, -y, cw - x, ch - y)).save(os.path.join(dst, os.path.basename(path)))
