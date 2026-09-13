# kikocredit

Платформа за споредба на кредити — [kikocredit.com](https://kikocredit.com)

- Споредба на понуди од финансиски друштва во Македонија (податоци: `src/institutions.js`)
- Барањата се чуваат во Postgres и се гледаат во контролниот панел: `kikocredit.com/#admin` (или копчето ⚙️)
- Деплој на Vercel од гранката `main`

## Локално

```bash
npm install
npm run dev      # http://localhost:5173 (без API)
npm run build
```

## Vercel — задолжителни поставки

| Варијабла | Опис |
|---|---|
| `DATABASE_URL` | Postgres (Vercel → Storage → Create Database → Postgres/Neon ја додава сама) |
| `ADMIN_PASSWORD` | Лозинка за контролниот панел |

Повеќе во `CLAUDE.md`.
