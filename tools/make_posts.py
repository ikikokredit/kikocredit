import sys, os
from PIL import Image, ImageDraw, ImageFont
SP = sys.argv[1]; OUT = os.path.join(SP, 'posts')
W, H = 1080, 1350
C1, C2 = (0x66,0x7e,0xea), (0x76,0x4b,0xa2)
INK, MUTED, ACC = (40,36,62), (110,104,140), (0x5a,0x4f,0xb0)
RED, GREEN = (214,62,62), (46,140,88)
FD = os.path.join(SP, 'fonts')
def font(name, size, weight):
    f = ImageFont.truetype(os.path.join(FD, name), size)
    try: f.set_variation_by_axes([weight])
    except Exception: pass
    return f
H1 = lambda s: font('Unbounded[wght].ttf', s, 700)
B  = lambda s: font('Manrope[wght].ttf', s, 800)
M  = lambda s: font('Manrope[wght].ttf', s, 600)
R  = lambda s: font('Manrope[wght].ttf', s, 500)
EMO = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', 109)
def emoji(ch, size):
    im = Image.new('RGBA', (160,160), (0,0,0,0))
    ImageDraw.Draw(im).text((0,0), ch, font=EMO, embedded_color=True)
    im = im.crop(im.getbbox()); r = size / max(im.size)
    return im.resize((max(1,int(im.width*r)), max(1,int(im.height*r))), Image.LANCZOS)
def base():
    img = Image.new('RGB', (W,H)); px = img.load()
    for y in range(H):
        for x in range(W):
            t = x/W*0.45 + y/H*0.55
            px[x,y] = tuple(int(C1[i]+(C2[i]-C1[i])*t) for i in range(3))
    img = img.convert('RGBA'); d = ImageDraw.Draw(img)
    fx = emoji('🦊', 64); img.alpha_composite(fx, (72, 64))
    d.text((150, 74), 'KikoCredit', font=B(40), fill='white')
    return img, d
def wrap(d, text, f, maxw):
    lines, cur = [], ''
    for w in text.split(' '):
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=f) <= maxw: cur = t
        else: lines.append(cur); cur = w
    lines.append(cur); return lines
def headline(d, text, y, size=74, maxw=936, color='white', gap=14):
    f = H1(size)
    for part in text.split('\n'):
        for ln in wrap(d, part, f, maxw):
            d.text((72, y), ln, font=f, fill=color); y += size + gap
    return y
def card(img, y0, y1):
    ov = Image.new('RGBA', img.size, (0,0,0,0))
    ImageDraw.Draw(ov).rounded_rectangle((56, y0, W-56, y1), radius=48, fill=(255,255,255,255))
    img.alpha_composite(ov)
def footer(img, d, note=None, note_y=None):
    if note:
        for i, ln in enumerate(wrap(d, note, R(26), 936)):
            d.text((72, note_y + i*34), ln, font=R(26), fill=(235,232,255))
    pill_w = d.textlength('kikocredit.com', font=B(38)) + 72
    ov = Image.new('RGBA', img.size, (0,0,0,0))
    ImageDraw.Draw(ov).rounded_rectangle((72, H-118, 72+pill_w, H-50), radius=34, fill=(255,255,255,255))
    img.alpha_composite(ov)
    d = ImageDraw.Draw(img); d.text((108, H-108), 'kikocredit.com', font=B(38), fill=ACC)
    return d
def save(img, name):
    img.convert('RGB').save(os.path.join(OUT, name), optimize=True); print('saved', name)

def rows_check(img, d, items, y, x=110, size=40, gap=40, maxw=780):
    for it in items:
        ck = emoji('✅', 46); img.alpha_composite(ck, (x, y+4)); d = ImageDraw.Draw(img)
        ly = y
        for ln in wrap(d, it, M(size), maxw):
            d.text((x+72, ly), ln, font=M(size), fill=INK); ly += size + 10
        y = ly + gap
    return d, y


def panel(img, top, draw_fn, pad=56):
    """Measure the content first, then draw a white card that fits it exactly."""
    probe = img.copy(); end = draw_fn(probe, ImageDraw.Draw(probe), top + pad)
    card(img, top, end + pad)
    draw_fn(img, ImageDraw.Draw(img), top + pad)
    return end + pad

# 1 — Intro
img, d = base()
y = headline(d, 'Спореди пред да потпишеш.', 210, 84)
d.text((72, y+6), 'Здраво, јас сум Кико.', font=M(40), fill=(240,238,255))
def c1(img, d, y):
    d, y = rows_check(img, d, ['26 банки, штедилници и финансиски друштва на едно место',
                               'Број на рати, камата и вкупна цена за 10 секунди',
                               'Бесплатно и без лични податоци'], y)
    return y - 40
end = panel(img, y+90, c1)
d = footer(img, ImageDraw.Draw(img)); save(img, '01-zdravo-kiko.png')

# 2 — Same installment, different price (numbers from calculateLoan)
img, d = base()
y = headline(d, 'Иста рата.\n19.630 ден. разлика.', 200, 78)
def c2(img, d, y):
    d.text((110, y), 'Кредит 50.000 ден. · рата 5.000 ден.', font=B(40), fill=INK)
    d.text((110, y+62), 'СВТ', font=M(28), fill=MUTED); d.text((370, y+62), 'Рати', font=M(28), fill=MUTED); d.text((620, y+62), 'Вкупно враќаш', font=M(28), fill=MUTED)
    ry = y+120
    for svt, n, tot, col in [('6 %', '11', '51.424 ден.', GREEN), ('35 %', '12', '59.974 ден.', INK), ('60 %', '15', '71.054 ден.', RED)]:
        d.line((110, ry-14, W-110, ry-14), fill=(232,229,245), width=3)
        d.text((110, ry), svt, font=H1(56), fill=col)
        d.text((370, ry+8), n, font=B(48), fill=INK)
        d.text((620, ry+8), tot, font=B(48), fill=col)
        ry += 116
    d.text((110, ry+6), 'Секој процент СВТ се твои пари.', font=M(34), fill=ACC)
    return ry + 50
end = panel(img, y+30, c2)
d = footer(img, ImageDraw.Draw(img), 'Пример пресметка со калкулаторот на kikocredit.com. Конечните услови ги дава институцијата.', end+28)
save(img, '02-ista-rata.png')

# 3 — What is СВТ
img, d = base()
y = headline(d, 'Каматата не е цената.\nСВТ е.', 200, 80)
def c3(img, d, y):
    d.text((110, y), 'СВТ = стапка на вкупни трошоци', font=B(44), fill=INK)
    ly = y+70
    for ln in wrap(d, 'Каматата плус сите провизии и надоместоци, изразени во една годишна стапка.', R(38), 860):
        d.text((110, ly), ln, font=R(38), fill=INK); ly += 52
    ly += 30
    d.rounded_rectangle((110, ly, W-110, ly+200), radius=28, fill=(244,242,253))
    d.text((150, ly+30), 'Пример: камата 9 %', font=M(40), fill=INK)
    d.text((150, ly+100), 'СВТ до 60 %', font=H1(52), fill=RED)
    ly += 250
    d.text((110, ly), 'Споредувај по СВТ, не по каматата.', font=B(38), fill=ACC)
    return ly + 50
panel(img, y+30, c3)
d = footer(img, ImageDraw.Draw(img)); save(img, '03-shto-e-svt.png')

# 4 — Bank vs finance company (ranges from kikocredit.com data, Sept 2026)
img, d = base()
y = headline(d, 'Банка или финансиско друштво?', 200, 72)
def c4(img, d, y):
    for i, (ico, title, svt, amt, col) in enumerate([('🏦','Банки','5,5–10,8 %','до 3.000.000 ден.',GREEN), ('💳','Друштва','34,5–60 %','до 600.000 ден.',RED)]):
        x = [110, 560][i]; e = emoji(ico, 60); img.alpha_composite(e, (x, y)); d = ImageDraw.Draw(img)
        d.text((x, y+84), title, font=B(46), fill=INK)
        d.text((x, y+158), 'СВТ', font=M(28), fill=MUTED)
        d.text((x, y+196), svt, font=H1(50), fill=col)
        d.text((x, y+290), 'Износ', font=M(28), fill=MUTED)
        d.text((x, y+328), amt, font=B(38), fill=INK)
    d.line((540, y+10, 540, y+380), fill=(232,229,245), width=3)
    ly = y+430
    for ln in wrap(d, 'Кај многу банки условите зависат од тоа дали примаш плата во нив.', R(34), 860):
        d.text((110, ly), ln, font=R(34), fill=INK); ly += 46
    return ly
end = panel(img, y+30, c4)
d = footer(img, ImageDraw.Draw(img), 'Податоци: 26 даватели на kikocredit.com, проверени септември 2026.', end+28)
save(img, '04-banka-ili-drushtvo.png')

# 5 — 3 mistakes
img, d = base()
y = headline(d, '3 грешки кај брз кредит', 200, 80)
def c5(img, d, y):
    ly = y
    for n, t, s in [('1', 'Гледаш само колку е ратата', 'Помала рата често значи повеќе рати и поголема вкупна цена.'),
                    ('2', 'Не ја гледаш СВТ', 'Каматата е само дел. СВТ ги вклучува сите трошоци.'),
                    ('3', 'Не споредуваш', 'Иста сума може да чини илјадници денари повеќе на друго место.')]:
        d.ellipse((110, ly, 176, ly+66), fill=ACC); d.text((131, ly+6), n, font=H1(40), fill='white')
        d.text((206, ly+6), t, font=B(40), fill=INK); sy = ly+66
        for ln in wrap(d, s, R(32), 760):
            d.text((206, sy), ln, font=R(32), fill=MUTED); sy += 42
        ly = sy + 46
    return ly - 46
panel(img, y+30, c5)
d = footer(img, ImageDraw.Draw(img)); save(img, '05-3-greshki.png')

# 6 — The asterisk
img, d = base()
y = headline(d, 'Што значи ѕвездичката *?', 200, 76)
def c6(img, d, y):
    d.text((110, y), 'СВТ*', font=H1(96), fill=ACC)
    ly = y+140
    for para in ['Некои друштва не ја објавуваат СВТ на својот сајт.',
                 'Кај нив ставаме * и пресметката е приближна.',
                 'Таквата понуда никогаш не добива ознака „Најповолно“.']:
        for ln in wrap(d, para, M(38), 860):
            d.text((110, ly), ln, font=M(38), fill=INK); ly += 50
        ly += 24
    d.text((110, ly+6), 'Заслужуваш да ја знаеш вистинската цена.', font=B(34), fill=ACC)
    return ly + 50
panel(img, y+30, c6)
d = footer(img, ImageDraw.Draw(img)); save(img, '06-dzvezdichka.png')
