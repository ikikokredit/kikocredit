"""Слики за објавите за АЛТА банка Битола (02.11.2026), стил „Кико“ (1080×1350, JPEG). Употреба: python3 tools/make_alta.py posts"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
W, H = 1080, 1350
C1, C2 = (0x66, 0x7e, 0xea), (0x76, 0x4b, 0xa2)
INK, MUTED, ACC = (40, 36, 62), (110, 104, 140), (0x5a, 0x4f, 0xb0)
FD = os.path.join(HERE, 'fonts')  # tools/fonts


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
EMO = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', 109)


def emoji(ch, size):
    im = Image.new('RGBA', (160, 160), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((0, 0), ch, font=EMO, embedded_color=True)
    im = im.crop(im.getbbox())
    r = size / max(im.size)
    return im.resize((max(1, int(im.width * r)), max(1, int(im.height * r))), Image.LANCZOS)


_GRAD = None


def base():
    global _GRAD
    if _GRAD is None:
        img = Image.new('RGB', (W, H))
        px = img.load()
        for y in range(H):
            for x in range(W):
                t = x / W * 0.45 + y / H * 0.55
                px[x, y] = tuple(int(C1[i] + (C2[i] - C1[i]) * t) for i in range(3))
        _GRAD = img
    img = _GRAD.copy().convert('RGBA')
    img.alpha_composite(emoji('🦊', 64), (72, 64))
    ImageDraw.Draw(img).text((150, 74), 'KikoCredit', font=B(40), fill='white')
    return img


def wrap(d, text, f, maxw):
    lines = []
    for part in text.split('\n'):
        cur = ''
        for w in part.split(' '):
            t = (cur + ' ' + w).strip()
            if d.textlength(t, font=f) <= maxw:
                cur = t
            else:
                lines.append(cur)
                cur = w
        lines.append(cur)
    return lines


def rounded(img, box, radius, fill):
    ov = Image.new('RGBA', img.size, (0, 0, 0, 0))
    ImageDraw.Draw(ov).rounded_rectangle(box, radius=radius, fill=fill)
    img.alpha_composite(ov)


def pill(img, text, y=190):
    d = ImageDraw.Draw(img)
    w = d.textlength(text, font=B(32)) + 64
    rounded(img, (72, y, 72 + w, y + 60), 30, (255, 255, 255, 60))
    ImageDraw.Draw(img).text((104, y + 10), text, font=B(32), fill='white')


def footer(img, note):
    d = ImageDraw.Draw(img)
    d.text((72, H - 172), note, font=R(28), fill=(235, 232, 255))
    pw = d.textlength('kikocredit.com', font=B(38)) + 72
    rounded(img, (72, H - 118, 72 + pw, H - 50), 34, (255, 255, 255, 255))
    ImageDraw.Draw(img).text((108, H - 108), 'kikocredit.com', font=B(38), fill=ACC)


def headline(img, text, y, size):
    d = ImageDraw.Draw(img)
    for ln in wrap(d, text, H1(size), 936):
        d.text((72, y), ln, font=H1(size), fill='white')
        y += size + 16
    return y


def card_text(img, top, text, size=44, color=INK, bold_first=None):
    d = ImageDraw.Draw(img)
    lines = wrap(d, text, M(size), 840)
    h = len(lines) * (size + 18) + 96
    rounded(img, (56, top, W - 56, top + h), 48, (255, 255, 255, 255))
    d = ImageDraw.Draw(img)
    y = top + 48
    for ln in lines:
        d.text((112, y), ln, font=M(size), fill=color)
        y += size + 18
    return top + h


def save(img, name):
    p = os.path.join(OUT, name)
    img.convert('RGB').save(p, quality=90, optimize=True)
    print('saved', p)


NOTE = 'Состојба на 02.11.2026 · извор: Народна банка (НБРМ)'

# ── Објава 1: карусел (Instagram) ─────────────────────────────────────────
img = base()
pill(img, 'Состојба на 02.11.2026')
y = headline(img, 'АЛТА банка Битола: 5 точни факти', 300, 84)
end = card_text(img, y + 50, 'Мирно и јасно: само официјални информации од Народната банка за клиентите на банката.', 46)
d = ImageDraw.Draw(img)
d.text((72, end + 50), 'Повлечи лево →', font=B(40), fill='white')
footer(img, NOTE)
save(img, '2026-11-02-alta-1.jpg')

FACTS = [
    ('Банката не е во стечај.', 'Народната банка привремено ја презеде управата за да ги заштити штедачите. Дозволата за работа останува.'),
    ('До 10.000 денари неделно.', 'Толку можат да користат физичките лица преку картичките на банката, додека трае мерката. Префрлањата меѓу сметки во банката не се ограничени.'),
    ('Кредитите важат.', 'Ратите плаќај ги навреме, како досега. Договорите не се менуваат.'),
    ('Депозитите се заштитени.', 'Не влегуваат во стечајот во Србија и се осигурени до 30.000 € по лице.'),
    ('Следи само официјални извори.', 'Народната банка, самата банка и Фондот за осигурување на депозити.\nСите одговори: kikocredit.com/vodici/alta-banka-bitola'),
]
for k, (h, b) in enumerate(FACTS, start=2):
    img = base()
    pill(img, f'АЛТА банка Битола · {k}/6')
    d = ImageDraw.Draw(img)
    d.text((72, 290), str(k - 1), font=H1(150), fill='white')
    y = headline(img, h, 490, 72)
    card_text(img, y + 40, b, 44)
    footer(img, NOTE)
    save(img, f'2026-11-02-alta-{k}.jpg')

# ── Објава 1: една слика (Facebook) ──────────────────────────────────────
img = base()
pill(img, 'Состојба на 02.11.2026')
y = headline(img, 'АЛТА банка Битола: 5 точни факти', 290, 60)
points = ['Банката не е во стечај. НБРМ привремено ја води.',
          'До 10.000 ден. неделно преку картичките.',
          'Кредитите важат. Ратите се плаќаат навреме.',
          'Депозитите се осигурени до 30.000 € по лице.',
          'Следи само официјални извори.']
top = y + 36
d = ImageDraw.Draw(img)
rows = [wrap(d, p, M(38), 760) for p in points]
h = sum(len(r) * 48 + 24 for r in rows) + 72
assert top + h < H - 190, top + h
rounded(img, (56, top, W - 56, top + h), 48, (255, 255, 255, 255))
yy = top + 52
for r in rows:
    img.alpha_composite(emoji('✅', 42), (104, yy + 2))
    d = ImageDraw.Draw(img)
    for ln in r:
        d.text((172, yy), ln, font=M(38), fill=INK)
        yy += 48
    yy += 24
footer(img, NOTE)
save(img, '2026-11-02-alta-fb.jpg')

# ── Објава 2: осигурување на депозити ───────────────────────────────────
img = base()
pill(img, 'Осигурување на депозити')
y = headline(img, 'До колку се осигурени парите во банка?', 300, 66)
top = y + 40
rounded(img, (56, top, W - 56, top + 470), 48, (255, 255, 255, 255))
d = ImageDraw.Draw(img)
d.text((112, top + 60), '30.000 €', font=H1(124), fill=ACC)
yy = top + 250
for ln in wrap(d, 'по штедач, во секоја банка посебно. Се исплаќа во денари.', M(42), 840):
    d.text((112, yy), ln, font=M(42), fill=INK)
    yy += 58
footer(img, 'Извор: Фонд за осигурување на депозити')
save(img, '2026-11-04-osiguruvanje-depoziti.jpg')

# ── Објава 3: кредит во АЛТА банка ──────────────────────────────────────
img = base()
pill(img, 'АЛТА банка Битола')
y = headline(img, 'Имаш кредит во АЛТА банка? 3 работи што важат', 300, 66)
top = y + 40
items = ['Договорот продолжува да важи.',
         'Ратите се плаќаат навреме, како досега.',
         'Провери дали на сметката има доволно за ратата.']
d = ImageDraw.Draw(img)
rows = [wrap(d, t, M(42), 720) for t in items]
h = sum(max(len(r) * 56, 80) + 36 for r in rows) + 80
rounded(img, (56, top, W - 56, top + h), 48, (255, 255, 255, 255))
yy = top + 52
for n, r in enumerate(rows, 1):
    d = ImageDraw.Draw(img)
    d.ellipse((104, yy, 184, yy + 80), fill=ACC)
    d.text((144, yy + 40), str(n), font=H1(40), fill='white', anchor='mm')
    ly = yy + (12 if len(r) == 1 else -4)
    for ln in r:
        d.text((214, ly), ln, font=M(42), fill=INK)
        ly += 56
    yy += max(len(r) * 56, 80) + 36
footer(img, NOTE)
save(img, '2026-11-06-alta-kredit.jpg')
