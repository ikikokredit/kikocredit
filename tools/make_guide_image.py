"""Слика 1080×1350 за споделување на нов водич од kikocredit.com/vodici/ (стил „Кико“).

Употреба:
  python3 tools/make_guide_image.py \
      --title "Брз кредит: колку чини и на што да внимаваш" \
      --points "СВТ кај друштвата: 34,5–60 %|Граница по закон: 61,25 %|Провери ја вкупната цена" \
      --icon "⚡" --out posts/2026-10-25-vodic-brz-kredit.jpg

--points: 2–3 кратки реченици одделени со „|“ (секоја до ~45 знаци), само факти од водичот.
Фонтови: tools/fonts (Manrope, Unbounded — SIL OFL) и Noto Color Emoji.
"""
import argparse, os
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1350
C1, C2 = (0x66, 0x7e, 0xea), (0x76, 0x4b, 0xa2)
INK, MUTED, ACC = (40, 36, 62), (110, 104, 140), (0x5a, 0x4f, 0xb0)
FD = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonts')
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
    px = img.load()
    for y in range(H):
        for x in range(W):
            t = x / W * 0.45 + y / H * 0.55
            px[x, y] = tuple(int(C1[i] + (C2[i] - C1[i]) * t) for i in range(3))
    img = img.convert('RGBA')
    img.alpha_composite(emoji('🦊', 64), (72, 64))
    ImageDraw.Draw(img).text((150, 74), 'KikoCredit', font=B(40), fill='white')
    return img


def rounded(img, box, radius, fill):
    ov = Image.new('RGBA', img.size, (0, 0, 0, 0))
    ImageDraw.Draw(ov).rounded_rectangle(box, radius=radius, fill=fill)
    img.alpha_composite(ov)


def make(title, points, icon, out, kicker='Нов водич', url='kikocredit.com/vodici'):
    img = base()
    d = ImageDraw.Draw(img)
    # ознака „📚 Нов водич“
    kw = d.textlength(kicker, font=B(34)) + 120
    rounded(img, (72, 190, 72 + kw, 254), 32, (255, 255, 255, 60))
    img.alpha_composite(emoji('📚', 38), (92, 202))
    d = ImageDraw.Draw(img)
    d.text((146, 198), kicker, font=B(34), fill='white')
    # наслов (автоматски помал фонт ако е долг)
    size = 72
    while size > 50 and len(wrap(d, title, H1(size), 936)) > 4:
        size -= 4
    y = 300
    for ln in wrap(d, title, H1(size), 936):
        d.text((72, y), ln, font=H1(size), fill='white')
        y += size + 14
    # бела картичка со клучните точки
    top = y + 40

    def body(im, dd, yy):
        for p in points:
            im.alpha_composite(emoji('✅', 46), (110, yy + 4))
            dd = ImageDraw.Draw(im)
            ly = yy
            for ln in wrap(dd, p, M(40), 780):
                dd.text((182, ly), ln, font=M(40), fill=INK)
                ly += 50
            yy = ly + 34
        ic = emoji(icon, 56)
        im.alpha_composite(ic, (110, yy + 6))
        dd = ImageDraw.Draw(im)
        dd.text((190, yy + 12), 'Цел водич на сајтот', font=B(36), fill=ACC)
        return yy + 72

    probe = img.copy()
    end = body(probe, ImageDraw.Draw(probe), top + 56)
    if end + 56 > H - 150:
        raise SystemExit(f'Премногу текст: картичката завршува на {end + 56}px (макс. {H - 150}). Скрати ги точките.')
    rounded(img, (56, top, W - 56, end + 56), 48, (255, 255, 255, 255))
    body(img, ImageDraw.Draw(img), top + 56)
    # копче со адресата
    d = ImageDraw.Draw(img)
    pw = d.textlength(url, font=B(38)) + 72
    rounded(img, (72, H - 118, 72 + pw, H - 50), 34, (255, 255, 255, 255))
    ImageDraw.Draw(img).text((108, H - 108), url, font=B(38), fill=ACC)
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
    a = ap.parse_args()
    pts = [p.strip() for p in a.points.split('|') if p.strip()]
    if not 2 <= len(pts) <= 3:
        raise SystemExit('--points: 2 или 3 точки, одделени со |')
    make(a.title, pts, a.icon, a.out, a.kicker, a.url)
