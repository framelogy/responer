# Responer - Next.js Template

Platform pencarian responden survei dengan tampilan biru-putih profesional.

## Cara Menjalankan

```bash
npm install
cp .env.example .env
npm run dev
```

Buka `http://localhost:3000`.

## Backend / SQL

Template backend sudah disiapkan dengan Prisma + NextAuth Google Login.
Atur `DATABASE_URL`, `GOOGLE_CLIENT_ID`, dan `GOOGLE_CLIENT_SECRET` di `.env`.

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Untuk tahap frontend demo, data masih mock di `lib/data.ts` agar UI langsung tampil.

1. di awal setiap user udh dapat 2 credit dulu, nanti 1 creditnya didapetin dari isi gform dari framelogy yg udh ada di beranda

2. dibuat kategorinya yg relevan kayak tech, peneliti, dll.