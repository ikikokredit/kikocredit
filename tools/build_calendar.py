import json, base64, io, html, sys
from PIL import Image
SP = sys.argv[1]
q = json.load(open(f'{SP}/posts/queue.json', encoding='utf-8'))
def img64(pid):
    im = Image.open(f'{SP}/posts/{pid}.png').convert('RGB').resize((720, 900), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=86, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
weeks = [('Недела 1', q[:3]), ('Недела 2', q[3:])]
cards = []
for wname, items in weeks:
    cards.append(f'<h2 class="week">{wname}</h2><div class="grid">')
    for p in items:
        e = html.escape
        cards.append(f'''
<article class="post" id="p-{p["id"]}">
  <div class="meta">
    <span class="date">{e(p["day"])} · {e(p["time"])}</span>
    <span class="pill wait">Чека одобрение</span>
  </div>
  <h3>{e(p["theme"])}</h3>
  <img src="{img64(p["id"])}" alt="{e(p["alt"])}" loading="lazy" width="720" height="900">
  <div class="chips"><span class="chip">Facebook</span><span class="chip">Instagram</span><span class="chip file">{e(p["id"])}.png</span></div>
  <div class="cap-head"><span class="label">Опис</span><button class="copy" type="button" id="copy-{p["id"]}" data-target="cap-{p["id"]}">Копирај</button></div>
  <pre class="caption" id="cap-{p["id"]}">{e(p["caption"])}</pre>
  <details><summary>Alt текст (за пристапност)</summary><p class="alt" id="alt-{p["id"]}">{e(p["alt"])}</p></details>
</article>''')
    cards.append('</div>')
page = open(f'{SP}/calendar_template.html', encoding='utf-8').read().replace('<!--CARDS-->', '\n'.join(cards))
open(f'{SP}/kiko-kalendar.html', 'w', encoding='utf-8').write(page)
print('ok', len(page)//1024, 'KB')
