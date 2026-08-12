# Wheelio

Wheelio is a full-stack vehicle rental and booking platform. Customers can browse vehicles, book them and pay online; vendors can manage their own vehicles, bookings and reviews; and administrators can oversee users, vehicles, categories, bookings and reviews across the whole platform.

The frontend is a Next.js (App Router) single-page application backed by a separate REST API (see the [server repository](#repository-links)). It features role-based dashboards for Admin, Vendor and Customer, Google Sign-In, Stripe-powered checkout, and image uploads.

## Tech Stack

- **Next.js 16** (App Router, React 19) — framework and server-side rendering
- **TypeScript** — typed application code and API client
- **Tailwind CSS 4** — styling, configured with `@tailwindcss/postcss`
- **shadcn/ui** (built on `@base-ui/react`) — UI primitives (button, card, dialog, form, table, etc.)
- **@react-oauth/google** — Google Sign-In
- **@stripe/stripe-js** — Stripe payment integration
- **react-hook-form** + **zod** (via `@hookform/resolvers`) — form handling and validation
- **axios** — HTTP client for the backend API
- **zustand** — client-side state management (auth store)
- **sonner** — toast notifications
- **lucide-react** — icons
- **class-variance-authority**, **clsx**, **tailwind-merge** — styling utilities

## Architecture

```
wheelio-frontend
├── app/                        # Next.js App Router — routes and pages
│   ├── (auth)/                 # Route group: authentication pages
│   │   ├── login/              #   Login page (email/password + Google)
│   │   └── register/           #   Registration page
│   ├── (public)/               # Route group: public, unauthenticated pages
│   │   ├── page.tsx            #   Landing page (/)
│   │   ├── about/              #   About page
│   │   ├── contact/            #   Contact page
│   │   └── vehicles/           #   Public vehicle listing + detail
│   │       └── [id]/           #     Vehicle detail (browse/book)
│   ├── dashboard/              # Protected route group (auth via proxy.ts)
│   │   ├── layout.tsx          #   Shared dashboard shell
│   │   ├── admin/              #   Admin panel: overview, users, vehicles,
│   │   │                       #     categories, bookings, reviews, profile
│   │   ├── vendor/             #   Vendor panel: overview, vehicles, bookings,
│   │   │                       #     reviews, profile
│   │   └── customer/           #   Customer panel: overview, bookings,
│   │                           #     wishlist, profile
│   ├── payment/                # Stripe checkout result pages
│   │   ├── success/            #   Payment success confirmation
│   │   └── cancel/             #   Payment cancellation
│   ├── layout.tsx              # Global layout (providers, navbar, footer)
│   ├── globals.css             # Tailwind entry + global styles
│   ├── error.tsx               # Global error boundary
│   └── not-found.tsx           # 404 page
├── components/                 # Reusable React components
│   ├── auth/                   #   Auth shell, Google login button
│   ├── bookings/               #   Edit/View booking dialogs
│   ├── dashboard/              #   Dashboard shell, stat cards, profile/security forms
│   ├── footer/ navbar/         #   Site chrome
│   ├── payment/                #   Payment success/cancel clients
│   ├── providers/              #   Google OAuth provider
│   ├── shared/                 #   EmptyState, Loader, PageHeader, StatusBadge, VehicleCard
│   ├── ui/                     #   shadcn/ui primitives
│   └── vehicles/               #   Vehicle detail, reviews, listing clients
├── lib/                        # API client & utilities
│   ├── axios.ts                #   Axios instance pointing at NEXT_PUBLIC_API_BASE_URL
│   ├── auth-store.ts           #   Zustand auth store
│   ├── cookie.ts, format.ts    #   Cookie + formatting helpers
│   ├── uploadImage.ts          #   Image upload via ImgBB
│   └── utils.ts                #   cn() helper
├── types/                      # Shared TypeScript types
├── public/                     # Static assets
├── proxy.ts                    # Route protection (redirects /dashboard/* to /login)
├── next.config.ts              # Next.js config
```

### Folder responsibilities

- **`app/`** — All routes and pages, organized into route groups. `(public)` holds the unauthenticated marketing/browse pages, `(auth)` the login/register pages, `dashboard/` contains the three role panels (`admin/`, `vendor/`, `customer/`), and `payment/` handles Stripe result pages.
- **`components/`** — Reusable UI. `components/ui` are low-level shadcn primitives; `components/dashboard`, `bookings`, `vehicles`, `auth`, `payment` are domain-specific feature components; `navbar/`, `footer/`, `shared/`, `providers/` provide shared chrome and providers.
- **`lib/`** — API client (`axios.ts`), client-side auth state (`auth-store.ts`), utilities for formatting, cookies, and image upload.
- **`types/`** — Shared TypeScript types used across pages and components.

## Features

- Multi-role dashboards with route-level protection — **Admin**, **Vendor**, and **Customer** panels (`app/dashboard/*`, `proxy.ts`)
- Admin panel: user management, vehicle management, category management, booking/review oversight, profile & password settings
- Vendor panel: manage own vehicles, bookings and reviews; profile & password settings
- Customer panel: book vehicles, view bookings, wishlist, profile & password settings
- Public vehicle browsing with vehicle detail pages and reviews/ratings
- Booking flow wired to Stripe Checkout with success/cancel pages (`app/payment/*`)
- Google Sign-In via `@react-oauth/google` plus email/password authentication (with change/set-password forms)
- Image upload to ImgBB (`lib/uploadImage.ts`)
- Responsive UI built on Tailwind CSS + shadcn/ui components, toast notifications via sonner

## Setup & Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/kouser-ahamed/wheelio-frontend
   cd wheelio-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root with the following **variable names** (fill in your own values — never commit real keys):

   ```env
   NEXT_PUBLIC_API_BASE_URL=your_value_here
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_value_here
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_value_here
   NEXT_PUBLIC_IMGBB_API_KEY=your_value_here
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

Build commands (from `package.json`):

```bash
npm run build   # create an optimized production build
npm run start   # start the production server after building
```

## Live Demo

**Live URL:** https://wheelio-frontend-ivory.vercel.app

Live demo — use the test credentials below to explore each role's dashboard.

## Demo / Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | kouserahamed420@gmail.com | K123456 |
| Vendor | kouserahamed.cse.diu@gmail.com | K123456 |
| Customer | ahamed15-5643@diu.edu.bd | K123456 |

## Repository Links

- Frontend Repo: https://github.com/kouser-ahamed/wheelio-frontend
- Backend/Server Repo: https://github.com/kouser-ahamed/server

## Backend API Documentation

For full backend API endpoint documentation, see API_Documentation.md in the [server repository](https://github.com/kouser-ahamed/server).