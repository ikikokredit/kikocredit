"""Слика 1080×1350 за Facebook/Instagram во изгледот на kikocredit.com (од 22.11.2026):
маскотата Кико + името kikocredit.com на бела лента, тегет позадина, бела картичка со точките.

Употреба:
  python3 tools/make_guide_image.py \
      --title "Брз кредит: колку чини и на што да внимаваш" \
      --points "СВТ кај друштвата: 34,5–60 %|Граница по закон: 61,25 %|Провери ја вкупната цена" \
      --icon "⚡" --out posts/2026-10-25-vodic-brz-kredit.jpg

--points: 2–3 кратки реченици одделени со „|“ (секоја до ~45 знаци), само факти од водичот.
За актуелни објави (не водич): --kicker "Актуелно" --kicker-icon "🗞️" --url "kikocredit.com"
--cta "<кратка порака>"; до 4 точки.
Фонтови: tools/fonts (Manrope, Unbounded — SIL OFL) и Noto Color Emoji.
Лого: tools/assets (kiko.png — маскотата, kiko-sticker.png — со бел раб за темна позадина,
wordmark.png — името). Боите се исти како во src/brand.js на сајтот.
"""
import argparse, os
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1350
NAVY, NAVY2 = (0x1A, 0x3A, 0x5C), (0x12, 0x2A, 0x44)      # тегет позадина (благ премин)
INK, MUTED, ACC = (0x14, 0x26, 0x3A), (0x5C, 0x6B, 0x7E), (0x1E, 0x4A, 0x73)
ORANGE, GREEN = (0xD2, 0x62, 0x2A), (0x15, 0x80, 0x3D)
BAND = 168                                                  # бела лента со логото
HERE = os.path.dirname(os.path.abspath(__file__))
FD = os.path.join(HERE, 'fonts')
AS = os.path.join(HERE, 'assets')
EMOJI_FONT = '/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf'


def font(name, size, weight):
    f = ImageFont.truetype(os.path.join(FD, name), size)
    try:
        f.set_variation_by_axes([weight])
    except Exception:
        pass
    return f


H1 = lambda s: font('Unbounded[wght].ttf', s, 700)
B = lambda s: font('Manrope[wght].ttf', s, 800)
M = lambda s: font('Manrope[wght].ttf', s, 600)
R = lambda s: font('Manrope[wght].ttf', s, 500)
EMO = ImageFont.truetype(EMOJI_FONT, 109)


def emoji(ch, size):
    im = Image.new('RGBA', (160, 160), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((0, 0), ch, font=EMO, embedded_color=True)
    im = im.crop(im.getbbox())
    r = size / max(im.size)
    return im.resize((max(1, int(im.width * r)), max(1, int(im.height * r))), Image.LANCZOS)


def asset(name, height):
    im = Image.open(os.path.join(AS, name)).convert('RGBA')
    return im.resize((max(1, round(im.width * height / im.height)), height), Image.LANCZOS)


def check(size):
    """Зелено крукче со бел знак ✓ (наместо емоџи)."""
    k = 4
    im = Image.new('RGBA', (size * k, size * k), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse((0, 0, size * k - 1, size * k - 1), fill=GREEN + (255,))
    s = size * k
    d.line([(s * .27, s * .53), (s * .44, s * .69), (s * .74, s * .34)], fill='white', width=int(s * .11), joint='curve')
    return im.resize((size, size), Image.LANCZOS)


def wrap(d, text, f, maxw):
    lines, cur = [], ''
    for w in text.split(' '):
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=f) <= maxw:
            cur = t
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)
    return lines


def base():
    img = Image.new('RGB', (W, H))
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        d.line([(0, y), (W, y)], fill=tuple(int(NAVY[i] + (NAVY2[i] - NAVY[i]) * t) for i in range(3)))
    img = img.convert('RGBA')
    d = ImageDraw.Draw(img)
    # бела лента: маскотата + името + „споредба на кредити“
    d.rectangle((0, 0, W, BAND), fill='white')
    d.rectangle((0, BAND, W, BAND + 8), fill=ORANGE)
    m = asset('kiko.png', 128)
    img.alpha_composite(m, (52, 20))
    wm = asset('wordmark.png', 60)
    x = 52 + m.width + 22
    img.alpha_composite(wm, (x, 36))
    ImageDraw.Draw(img).text((x + 3, 100), 'споредба на кредити', font=M(30), fill=MUTED)
    return img


def rounded(img, box, radius, fill):
    ov = Image.new('RGBA', img.size, (0, 0, 0, 0))
    ImageDraw.Draw(ov).rounded_rectangle(box, radius=radius, fill=fill)
    img.alpha_composite(ov)


def make(title, points, icon, out, kicker='Нов водич', url='kikocredit.com/vodici',
         kicker_icon='📚', cta='Цел водич на сајтот'):
    img = base()
    d = ImageDraw.Draw(img)
    # ознака „📚 Нов водич“ / „🗞️ Актуелно“
    kw = d.textlength(kicker, font=B(34)) + 120
    rounded(img, (72, 216, 72 + kw, 280), 32, ORANGE + (255,))
    img.alpha_composite(emoji(kicker_icon, 38), (92, 228))
    d = ImageDraw.Draw(img)
    d.text((146, 224), kicker, font=B(34), fill='white')
    # наслов (автоматски помал фонт ако е долг)
    size = 68
    while size > 48 and len(wrap(d, title, H1(size), 936)) > 4:
        size -= 4
    y = 318
    for ln in wrap(d, title, H1(size), 936):
        d.text((72, y), ln, font=H1(size), fill='white')
        y += size + 14
    # бела картичка со клучните точки
    top = y + 34
    ck = check(46)

    def body(im, dd, yy):
        for p in points:
            im.alpha_composite(ck, (108, yy + 5))
            dd = ImageDraw.Draw(im)
            ly = yy
            for ln in wrap(dd, p, M(40), 780):
                dd.text((180, ly), ln, font=M(40), fill=INK)
                ly += 50
            yy = ly + 32
        ic = emoji(icon, 54)
        im.alpha_composite(ic, (106, yy + 6))
        dd = ImageDraw.Draw(im)
        dd.text((180, yy + 10), cta, font=B(36), fill=ACC)
        return yy + 70

    probe = img.copy()
    end = body(probe, ImageDraw.Draw(probe), top + 52)
    if end + 52 > H - 150:
        raise SystemExit(f'Премногу текст: картичката завршува на {end + 52}px (макс. {H - 150}). Скрати ги точките.')
    rounded(img, (56, top, W - 56, end + 52), 44, (255, 255, 255, 255))
    body(img, ImageDraw.Draw(img), top + 52)
    bottom = end + 52
    # копче со адресата
    d = ImageDraw.Draw(img)
    pw = d.textlength(url, font=B(38)) + 72
    rounded(img, (72, H - 118, 72 + pw, H - 50), 34, (255, 255, 255, 255))
    ImageDraw.Draw(img).text((108, H - 108), url, font=B(38), fill=ACC)
    # Кико долу десно: поголем кога има место под картичката
    room = H - bottom
    sh = 300 if room >= 330 else 230 if room >= 250 else 168
    st = asset('kiko-sticker.png', sh)
    sx = max(int(72 + pw + 24), W - 44 - st.width)
    if sx + st.width <= W - 8:
        img.alpha_composite(st, (sx, H - 22 - st.height))
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    img.convert('RGB').save(out, quality=90, optimize=True)
    print('saved', out)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--title', required=True)
    ap.add_argument('--points', required=True, help='2–3 точки одделени со |')
    ap.add_argument('--icon', default='📚')
    ap.add_argument('--out', required=True)
    ap.add_argument('--kicker', default='Нов водич')
    ap.add_argument('--url', default='kikocredit.com/vodici')
    ap.add_argument('--kicker-icon', default='📚')
    ap.add_argument('--cta', default='Цел водич на сајтот', help='реченица на дното од картичката')
    a = ap.parse_args()
    pts = [p.strip() for p in a.points.split('|') if p.strip()]
    if not 2 <= len(pts) <= 4:
        raise SystemExit('--points: 2 до 4 точки, одделени со |')
    make(a.title, pts, a.icon, a.out, a.kicker, a.url, a.kicker_icon, a.cta)
