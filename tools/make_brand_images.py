"""Слики за профилите на KikoCredit (Facebook и Instagram) во изгледот на сајтот.

  python3 tools/make_brand_images.py            # ги запишува во brand/

- brand/kikocredit-profilna.png        1080×1080, профилна за Facebook и Instagram (се сече во круг)
- brand/kikocredit-facebook-cover.png  1640×720, насловна за Facebook. Компјутер ја прикажува
  средината 1640×624, телефон средината 1280×720 — сè важно е во средните 1280×624, а долниот
  лев агол е празен затоа што таму стои профилната.
- tools/assets/kiko-sticker.png        Кико во светол круг со бел раб — за темна позадина
  (го користи make_guide_image.py долу десно на сликите за објави).
Маскота: tools/assets/kiko-avatar.png (долг дуксер, за сечење во круг). Фонтови: tools/fonts.
"""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FD, AS = os.path.join(HERE, 'fonts'), os.path.join(HERE, 'assets')
OUT = os.path.join(os.path.dirname(HERE), 'brand')
NAVY, NAVY2 = (0x1A, 0x3A, 0x5C), (0x12, 0x2A, 0x44)
SOFT, BLUE, ORANGE, PALE = (0xE7, 0xEE, 0xF5), (0x1E, 0x4A, 0x73), (0xE0, 0x70, 0x2F), (0xC9, 0xD6, 0xE4)


def font(name, size, weight):
    f = ImageFont.truetype(os.path.join(FD, name), size)
    f.set_variation_by_axes([weight])
    return f


def asset(name, height):
    im = Image.open(os.path.join(AS, name)).convert('RGBA')
    return im.resize((max(1, round(im.width * height / im.height)), height), Image.LANCZOS)


def gradient(w, h):
    im = Image.new('RGB', (w, h))
    d = ImageDraw.Draw(im)
    for y in range(h):
        d.line([(0, y), (w, y)], fill=tuple(int(NAVY[i] + (NAVY2[i] - NAVY[i]) * y / h) for i in range(3)))
    return im.convert('RGBA')


def badge(d, fox_h, k=3):
    """Кико во светол круг со пречник d и бел раб: дуксерот се сече по кругот, главата и ушите
    излегуваат над него (со бел раб, за да стојат чисто на тегет)."""
    D = d * k
    rim = int(D * 0.022)
    fox = asset('kiko-avatar.png', fox_h * k)
    top = int(D * 0.36)                               # простор над кругот за ушите
    W, H = D + 2 * rim, D + top + rim
    box = (rim, top, rim + D - 1, top + D - 1)
    fx, fy = (W - fox.width) // 2 + int(D * 0.004), int(D * 0.02)
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    layer.alpha_composite(fox, (fx, fy))
    # бел раб околу лисицата
    edge = layer.split()[3].point(lambda v: 255 if v > 60 else 0)
    for _ in range(3):
        edge = edge.filter(ImageFilter.MaxFilter(2 * (rim // 3) + 1))
    edge = edge.filter(ImageFilter.GaussianBlur(k * 1.5)).point(lambda v: 255 if v > 127 else 0).filter(ImageFilter.GaussianBlur(k * 0.6))
    white = Image.new('RGBA', (W, H), (255, 255, 255, 0))
    white.putalpha(edge)
    white.alpha_composite(layer)
    # под средината на кругот останува само она што е внатре во кругот
    keep = Image.new('L', (W, H), 0)
    kd = ImageDraw.Draw(keep)
    kd.rectangle((0, 0, W, top + D // 2), fill=255)
    kd.ellipse(box, fill=255)
    white.putalpha(Image.composite(white.split()[3], Image.new('L', (W, H), 0), keep))
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(out)
    od.ellipse((0, top - rim, W - 1, top + D + rim - 1), fill=(255, 255, 255, 255))   # бел раб на кругот
    od.ellipse(box, fill=SOFT + (255,))
    out.alpha_composite(white)
    # долната половина од белиот раб оди и преку дуксерот
    ring = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse((rim // 2, top - rim // 2, W - 1 - rim // 2, top + D + rim // 2 - 1), outline=(255, 255, 255, 255), width=rim)
    low = Image.new('L', (W, H), 0)
    ImageDraw.Draw(low).rectangle((0, top + int(D * 0.62), W, H), fill=255)
    ring.putalpha(Image.composite(ring.split()[3], Image.new('L', (W, H), 0), low))
    out.alpha_composite(ring)
    return out.resize((W // k, H // k), Image.LANCZOS)


def profile(n=1080):
    im = Image.new('RGBA', (n, n), SOFT + (255,))
    fox = asset('kiko-avatar.png', int(n * 1.27))
    im.alpha_composite(fox, ((n - fox.width) // 2 + 4, int(n * 0.115)))
    return im.convert('RGB')


def cover(w=1640, h=720):
    im = gradient(w, h)
    d = ImageDraw.Draw(im)
    # тивки кругови во позадина
    ov = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(ov)
    od.ellipse((1010, -260, 1900, 630), fill=BLUE + (70,))
    od.ellipse((-320, 430, 260, 1010), fill=BLUE + (55,))
    im.alpha_composite(ov)
    # Кико десно, во средната зона
    b = badge(400, 558)
    im.alpha_composite(b, (1440 - b.width, 644 - b.height))
    # текст лево
    x = 196
    wm = asset('wordmark-light.png', 64)
    im.alpha_composite(wm, (x, 120))
    d = ImageDraw.Draw(im)
    d.rectangle((x + 2, 214, x + 92, 221), fill=ORANGE)
    f = font('Unbounded[wght].ttf', 66, 700)
    d.text((x, 250), 'Биди паметен', font=f, fill='white')
    d.text((x, 332), 'како лисица.', font=f, fill='white')
    g = font('Manrope[wght].ttf', 31, 600)
    d.text((x + 2, 440), 'Спореди кредити од банки и финансиски друштва.', font=g, fill=PALE)
    d.text((x + 2, 484), 'Независно и бесплатно.', font=g, fill=PALE)
    return im.convert('RGB')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    profile().save(os.path.join(OUT, 'kikocredit-profilna.png'), optimize=True)
    cover().save(os.path.join(OUT, 'kikocredit-facebook-cover.png'), optimize=True)
    badge(700, 977, k=2).save(os.path.join(AS, 'kiko-sticker.png'), optimize=True)
    print('saved', OUT)
