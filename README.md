# Basic Robot 26 — Control Console

เว็บไซต์ค่ายโรโบติกส์รุ่นที่ 26 รวมการแข่งขัน คะแนน และภารกิจในที่เดียว

**Stack:** Next.js 14 (App Router) · Supabase · Tailwind · Vercel

---

## 📂 หน้าต่างๆ

| Path | คำอธิบาย | ใครเห็น |
|---|---|---|
| `/` | หน้าแรก + dashboard สรุปสถานะ | ทุกคน |
| `/sprint` | ตารางวิ่งเร็ว (bracket + เวลา) | ทุกคน (read-only) |
| `/mission` | ภารกิจ (ล็อคไว้ก่อน) | ทุกคน |
| `/scoreboard` | คะแนน 16 กลุ่ม | ทุกคน (read-only) |
| `/admin/[secret]` | หน้าควบคุม | แอดมินเท่านั้น |

---

## 🔧 Setup ครั้งแรก

### 1. Clone & install
```bash
git clone <repo-url> basic-robot-26
cd basic-robot-26
npm install
```

### 2. สร้างโปรเจกต์ Supabase
1. ไปที่ <https://supabase.com> → New Project
2. หลังสร้างเสร็จ → **SQL Editor** → New query
3. Copy ทั้งหมดใน `supabase/schema.sql` ไปวาง → Run
4. ตรวจที่ **Table Editor** ว่าได้ตาราง `heats` (10 แถว), `groups` (16 แถว), `mission_state` (1 แถว)

### 3. เก็บ Keys
ใน Supabase Project → **Settings → API** จะเห็น:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` ⚠️ → `SUPABASE_SERVICE_ROLE_KEY` (อย่าให้หลุด)

### 4. สร้าง `.env.local`
```bash
cp .env.local.example .env.local
```
แก้ค่าตามนี้:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
ADMIN_PASSWORD=ตั้งรหัสที่เดายาก
```

### 5. รัน
```bash
npm run dev
```
เปิด <http://localhost:3000>

---

## 🔐 เข้าหน้าแอดมิน

กด **Ctrl + I** บนหน้าเว็บใดก็ได้ → กรอกรหัสผ่าน → ระบบพาไปที่ `/admin` อัตโนมัติ

ระบบจะ set httpOnly cookie อายุ 24 ชั่วโมง

---

## 🚀 Deploy ขึ้น Vercel

### 1. Push ขึ้น GitHub
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/<user>/basic-robot-26.git
git push -u origin main
```

### 2. Connect Vercel
1. <https://vercel.com> → Add New Project → import repo จาก GitHub
2. ในขั้น Configure → **Environment Variables** ใส่ทั้ง 5 ตัว:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
3. Deploy

ทุก `git push` ต่อจากนี้จะ deploy อัตโนมัติ

---

## 🛠 ระบบความปลอดภัย

- **Read** ทั่วถึง: ใช้ Supabase anon key + RLS เปิดให้ select
- **Write** ทุกอย่างผ่าน Next.js API route เท่านั้น (`/api/sprint`, `/api/scoreboard`)
  - API route ตรวจ httpOnly cookie `br26_admin` ก่อน
  - ผ่านแล้วใช้ service_role key เขียน DB
- ถ้าใครเดา URL `/admin/<secret>` ผิด → 404 (เหมือนไม่มีหน้านี้)
- รหัสผ่านเทียบแบบ constant-time เบื้องต้น

> **แนะนำ:** ตั้ง `ADMIN_SECRET_PATH` ให้เดายาก เช่น `br26-9k2x-control`
> และ `ADMIN_PASSWORD` ยาวอย่างน้อย 16 ตัวอักษร

---

## 🎯 ปลดล็อก Mission วันแข่ง

วันที่ภารกิจเริ่ม รันใน Supabase SQL Editor:
```sql
update mission_state set is_locked = false where id = 1;
```

หรือเปิดผ่าน Table Editor → mission_state → แก้ `is_locked` เป็น `false`

---

## 📁 โครงสร้างโปรเจกต์

```
src/
├── app/
│   ├── page.tsx                  หน้าแรก
│   ├── sprint/page.tsx           วิ่งเร็ว (public)
│   ├── mission/page.tsx          ภารกิจ (locked)
│   ├── scoreboard/page.tsx       คะแนน (public)
│   ├── admin/[secret]/
│   │   ├── layout.tsx            ตรวจ secret + login
│   │   ├── page.tsx              admin dashboard
│   │   ├── sprint/page.tsx       กรอกเวลา
│   │   └── scoreboard/page.tsx   ให้คะแนน
│   └── api/
│       ├── auth/route.ts         login/logout
│       ├── sprint/route.ts       PATCH heats
│       └── scoreboard/route.ts   POST (delta) + PUT (absolute)
├── components/                   UI components
└── lib/
    ├── supabase.ts               clients
    ├── auth.ts                   cookie + password
    └── types.ts                  TypeScript types
```

---

## ✏️ จะแก้สีธีม / ฟอนต์

- สี: `tailwind.config.ts` → `colors.navy / teal / gold`
- ฟอนต์: `src/app/globals.css` (import จาก Google Fonts)
