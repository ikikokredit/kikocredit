# kikocredit

Портал за споредба на потрошувачки кредити — [kikocredit.com](https://kikocredit.com)

- Внесуваш **износ и месечна рата** → гледаш број на рати, камата (СВТ) и вкупен трошок кај
  **банки, штедилници и финансиски друштва** во Македонија (податоци: `src/institutions.js`)
- „Аплицирај" те носи директно на страницата на институцијата — не се собираат лични податоци
- Анонимна статистика на кликови: `kikocredit.com/#admin` (копчето ⚙️)
- Деплој на Vercel од гранката `main`

## Локално

```bash
npm install
npm run dev      # http://localhost:5173 (без API)
npm run build
```

## Vercel — поставки

| Варијабла | Опис |
|---|---|
| `DATABASE_URL` | Postgres (Vercel → Storage → Postgres/Neon ја додава сама) |
| `ADMIN_PASSWORD` | Лозинка за статистиката |

Повеќе во `CLAUDE.md`.
