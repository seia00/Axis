# AXIS — Project Documentation

## 1. Overview
AXIS is an infrastructure platform designed for the student organization ecosystem in Japan. It serves as a central hub for student clubs, initiatives, and ventures to discover each other, share resources, and grow sustainably.

The platform is designed with a premium, dark-mode aesthetic to appeal to modern student leaders.

## 2. Core Features

### AXIS Directory
- A searchable database of over 50 verified student organizations across Japan.
- Users can filter by focus area, location, and school level.
- Features ratings, reviews, and event listings for each organization.

### Network Portal
- A dedicated workspace for organization leaders.
- **Dashboard**: Track profile views, reviews, and event engagement.
- **Verification System**: Apply for "Verified" or "Partner" status to gain trust and visibility.
- **Merge Program**: Facilitates strategic mergers or alliances between organizations.
- **Team Management**: Manage organization members and leadership succession.

### AXIS Ventures
- An incubation program for high-potential student initiatives.
- Provides mentorship, cohort-based learning, and launch infrastructure.

### Resource Library
- Over 40 free templates, playbooks, and toolkits.
- Categories include Legal (MOU templates), Financial (budgeting), Design assets, and Succession guides.

## 3. Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database**: [Prisma](https://www.prisma.io/) with PostgreSQL (hosted on [Supabase](https://supabase.com/))
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Radix UI](https://www.radix-ui.com/) components
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Email**: [Resend](https://resend.com/)

## 4. Development & Deployment Recommendations

### Team Deployment
To facilitate team collaboration:
1. **GitHub Organization**: Move the repository to a dedicated GitHub Org.
2. **Vercel Teams**: Link the GitHub Org to Vercel. While the Pro plan is required for shared dashboard access, members can still develop via GitHub push to a single owner's Vercel account.
3. **Railway/Cloudflare Pages**: Alternatives for teams that prefer shared free-tier collaboration features.

### Database Strategy
- **Supabase**: Continue using Supabase for both the PostgreSQL database and Storage (buckets). It allows inviting team members to the project dashboard for shared management.
- **Environment Variables**: Ensure `DATABASE_URL`, `NEXTAUTH_SECRET`, and Supabase keys are synchronized across the team's development environments and deployment platform.

## 5. Project Structure
- `src/app`: Next.js App Router pages and layouts.
- `src/components`: Reusable UI components (layout, portal-specific, ui).
- `src/lib`: Core utility functions, Prisma client, and API wrappers.
- `prisma/`: Database schema and migrations.
- `public/`: Static assets (logos, icons).
