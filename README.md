# Portfolio — Chung Yun Huang

Next.js + Supabase + Vercel 重構的個人作品集專案。

## Stack

- Next.js 14+ (App Router)
- Tailwind CSS v4
- Framer Motion
- Supabase (Postgres, `projects` / `project_sections` / `site_content`)
- Vercel（GitHub push 自動部署）

## 本機開發

```bash
npm install
npm run dev
```

需要 `.env.local`（不進版控）：

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 內容管理

案例文案透過 Supabase Table Editor 直接編輯 `projects` / `project_sections` / `site_content` 三張表,不自建 admin UI。
