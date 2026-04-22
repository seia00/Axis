# AXIS — Japan's Student Organization Platform

AXIS is the infrastructure backbone for Japan's student organization ecosystem. Built by high schoolers, free forever.

## 🚀 Key Features
- **AXIS Directory**: Discover 50+ verified student organizations across Japan.
- **Network Portal**: Private workspace for org leaders to collaborate and manage growth.
- **AXIS Ventures**: Incubation program for high-potential student initiatives.
- **Resource Library**: 40+ free templates, playbooks, and toolkits for org management.

## 📚 Documentation
Detailed documentation including project goals, tech stack, and contribution guides can be found in [DOCS.md](./DOCS.md).

## 🛠️ Getting Started

First, install dependencies:
```bash
npm install
```

Set up your environment variables:
```bash
cp .env.example .env
```
*(Make sure to fill in `DATABASE_URL`, `NEXTAUTH_SECRET`, and Supabase keys)*

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## 🏗️ Technical Stack
- **Framework**: Next.js 14 (App Router)
- **DB**: Prisma + PostgreSQL (Supabase)
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS + Radix UI

