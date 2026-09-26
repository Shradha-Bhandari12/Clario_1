# KIRA Admin — Phase 1 QUICK START

## ⚡ 5-Minute Setup

### 1️⃣ Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create new project → Copy credentials

### 2️⃣ Update `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### 3️⃣ Run SQL Scripts
In Supabase SQL Editor:
- Paste `supabase/schema.sql` → Run
- Paste `supabase/rls-policies.sql` → Run
- Paste `supabase/seed.sql` → Run (optional)

### 4️⃣ Start Server
```bash
cd "c:\Users\shradha\OneDrive\Desktop\Admin dash\kira-admin"
npm run dev
```

### 5️⃣ Login
- Open http://localhost:3000/login
- Email: `admin@kira.test`
- Password: `Test@12345`

---

## ✅ Phase 1 Complete

| Feature | Status |
|---------|--------|
| Next.js 14 + TypeScript | ✅ |
| Tailwind CSS Setup | ✅ |
| Supabase Integration | ✅ |
| Auth System | ✅ |
| Database Schema | ✅ |
| RLS Policies | ✅ |
| Sidebar + Layout | ✅ |
| Login Page | ✅ |
| Build Success | ✅ |

---

## 🗺️ Routes

| Route | Purpose |
|-------|---------|
| `/login` | Authentication |
| `/dashboard` | Home |
| `/workflows` | Workflow management |
| `/logs` | Execution logs |
| `/users` | User management |
| `/mcp` | MCP tools |
| `/scheduler` | Job scheduling |
| `/settings` | Configuration |
| `/builder` | Visual builder |
| `/webhook-playground` | Testing |
| `/analytics` | Analytics |

---

## 📦 Key Packages

- **next**: 16.1.6
- **react**: 19.2.3
- **typescript**: 5
- **tailwindcss**: 4
- **supabase**: 2.97.0
- **zustand**: 5.0.11
- **react-query**: 5.90.21
- **zod**: 4.3.6
- **lucide-react**: 574
- **framer-motion**: 12.34.2

---

## 🎯 Database Tables

- users
- workflows
- workflow_versions
- mcp_tools
- logs
- alerts
- scheduled_jobs
- feature_flags

All tables have RLS enabled ✅

---

## 🔐 RBAC Roles

- **super_admin**: Full access
- **admin**: Can create/edit workflows
- **designer**: Can create workflows
- **viewer**: Read-only access

---

## 🧪 Test User

Email: `admin@kira.test`
Password: `Test@12345`
Role: `super_admin`

---

## 🔗 Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Query](https://tanstack.com/query)

---

## 💡 Tips

- Use `npm run build` to test production build
- Check browser console (F12) for errors
- Verify SQL scripts in Supabase SQL Editor
- Use dark mode toggle in topbar
- Collapse sidebar with chevron button

---

## 📝 Next Phase

Phase 2 adds:
- Dashboard metrics
- Workflow CRUD
- Real-time logs
- User management
- Settings

---

**Status**: ✅ READY TO GO

Run: `npm run dev` then open http://localhost:3000/login
