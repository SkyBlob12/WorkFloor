# -*- coding: utf-8 -*-
"""Image de presentation Play Store (1024 x 500), charte WorkFloor."""
import math, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

S = 2                      # supersampling
W, H = 1024 * S, 500 * S
BG          = "#F6F3EE"
SURFACE     = "#FFFFFF"
SURF_MUTED  = "#EDE8E0"
BORDER      = "#E3DDD3"
INK         = "#16140F"
MUTED       = "#6E675D"
PRIMARY     = "#B8431F"
PRIM_MUTED  = "#FBE8DF"
RATING      = "#F2A516"
RATING_MUT  = "#E3DDD3"

F = "C:/Windows/Fonts/"
def font(name, size):
    return ImageFont.truetype(F + name, int(size * S))
BOLD, SEMI, REG = "segoeuib.ttf", "seguisb.ttf", "segoeui.ttf"

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

def text(draw, xy, s, f, fill, anchor="la"):
    draw.text((xy[0] * S, xy[1] * S), s, font=f, fill=fill, anchor=anchor)

def width(s, f):
    return d.textlength(s, font=f) / S

def card(size, radius, fill, border=None):
    """Carte RGBA avec ombre douce, coordonnees en points (non scalees)."""
    w, h = int(size[0] * S), int(size[1] * S)
    pad = 26 * S
    layer = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    sh = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle(
        [pad, pad + 5 * S, pad + w, pad + h + 5 * S], radius=radius * S, fill=(22, 20, 15, 38))
    sh = sh.filter(ImageFilter.GaussianBlur(11 * S))
    layer.alpha_composite(sh)
    ImageDraw.Draw(layer).rounded_rectangle(
        [pad, pad, pad + w, pad + h], radius=radius * S, fill=fill,
        outline=border, width=S if border else 0)
    return layer, pad

def paste_rotated(base, layer, center, angle):
    r = layer.rotate(angle, resample=Image.BICUBIC, expand=True)
    base.alpha_composite(r, (int(center[0] * S - r.width / 2), int(center[1] * S - r.height / 2)))

def star(draw, cx, cy, r, fill):
    pts = []
    for i in range(10):
        a = math.radians(-90 + i * 36)
        rr = r if i % 2 == 0 else r * 0.45
        pts.append((cx * S + math.cos(a) * rr * S, cy * S + math.sin(a) * rr * S))
    draw.polygon(pts, fill=fill)

# ---------------------------------------------------------------- colonne gauche
f_mark  = font(BOLD, 30)
f_head  = font(BOLD, 52)
f_sub   = font(REG, 21)
f_pill  = font(SEMI, 17)

LX = 70
logo = Image.open("C:/Global/Dev Perso/BehindTheDesk/assets/images/logo-mark.png").convert("RGBA")
logo = logo.resize((44 * S, 44 * S), Image.LANCZOS)
img.paste(logo, (LX * S, 60 * S), logo)
x = LX + 58
text(d, (x, 70), "Work", f_mark, INK)
text(d, (x + width("Work", f_mark), 70), "Floor", f_mark, PRIMARY)

text(d, (LX, 158), "Ce que les salariés", f_head, INK)
text(d, (LX, 216), "disent ", f_head, INK)
text(d, (LX + width("disent ", f_head), 216), "vraiment", f_head, PRIMARY)

text(d, (LX, 300), "Avis anonymes sur les entreprises :", f_sub, MUTED)
text(d, (LX, 330), "salaires, ambiance, management.", f_sub, MUTED)

px = LX
for label, bg, fg in (("100 % anonyme", PRIM_MUTED, PRIMARY),
                      ("Gratuit", SURF_MUTED, INK),
                      ("Sans publicité", SURF_MUTED, INK)):
    w = width(label, f_pill) + 34
    d.rounded_rectangle([px * S, 384 * S, (px + w) * S, 424 * S], radius=999, fill=bg)
    text(d, (px + w / 2, 404), label, f_pill, fg, anchor="mm")
    px += w + 12

# ---------------------------------------------------------------- cartes de droite
scene = Image.new("RGBA", (W, H), (0, 0, 0, 0))

back, pad = card((300, 200), 20, SURF_MUTED, BORDER)
# la carte du fond laisse deviner un second avis : seule sa bande haute reste visible
bd = ImageDraw.Draw(back)
for i in range(4):
    star(bd, pad / S + 152 + i * 22, pad / S + 30, 9, RATING if i < 3 else RATING_MUT)
for i, w in enumerate((160, 120)):
    bd.rounded_rectangle([pad + (278 - w) * S, pad + (54 + i * 18) * S,
                          pad + 278 * S, pad + (64 + i * 18) * S],
                         radius=5 * S, fill=BORDER)
paste_rotated(scene, back, (800, 175), -7)

CW, CH = 330, 246
front, pad = card((CW, CH), 20, SURFACE)
fd = ImageDraw.Draw(front)
def ftext(xy, s, f, fill, anchor="la"):
    fd.text((pad + xy[0] * S, pad + xy[1] * S), s, font=f, fill=fill, anchor=anchor)

f_name = font(SEMI, 15)
f_meta = font(REG, 13)
f_title = font(BOLD, 19)
f_body = font(REG, 14)

fd.rounded_rectangle([pad + 22 * S, pad + 22 * S, pad + 60 * S, pad + 60 * S],
                     radius=12 * S, fill=PRIM_MUTED)
fd.text((pad + 41 * S, pad + 41 * S), "A", font=font(BOLD, 18), fill=PRIMARY, anchor="mm")
ftext((72, 26), "Anonyme", f_name, INK)
ftext((72, 46), "Ex-salarié · CDI", f_meta, MUTED)

for i in range(5):
    star(fd, (pad / S + 24 + i * 22), (pad / S + 86), 9,
         RATING if i < 4 else RATING_MUT)
fd.text((pad + 138 * S, pad + 86 * S), "4,2", font=f_name, fill=INK, anchor="lm")

ftext((22, 112), "Bonne ambiance, mais", f_title, INK)
ftext((22, 136), "peu d'évolution", f_title, INK)

for i, (lab, val) in enumerate((("Salaire", 0.6), ("Ambiance", 0.9))):
    y = 178 + i * 30
    ftext((22, y), lab, f_body, MUTED)
    bx0, bx1 = 110, 308
    fd.rounded_rectangle([pad + bx0 * S, pad + (y + 3) * S, pad + bx1 * S, pad + (y + 13) * S],
                         radius=5 * S, fill=SURF_MUTED)
    fd.rounded_rectangle([pad + bx0 * S, pad + (y + 3) * S,
                          pad + (bx0 + (bx1 - bx0) * val) * S, pad + (y + 13) * S],
                         radius=5 * S, fill=PRIMARY)

paste_rotated(scene, front, (768, 268), 3)


img = Image.alpha_composite(img.convert("RGBA"), scene).convert("RGB")
img = img.resize((1024, 500), Image.LANCZOS)
out = "C:/Global/Dev Perso/BehindTheDesk/store/assets/play-feature-graphic-1024x500.png"
os.makedirs(os.path.dirname(out), exist_ok=True)
img.save(out, "PNG", optimize=True)
print(out, img.size, os.path.getsize(out), "octets")
