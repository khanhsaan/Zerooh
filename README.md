# Zeroooh! 🌿

A food-waste marketplace mobile app where customers buy surplus food at a discount from local businesses — reducing waste, saving money, and rescuing meals.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Prerequisites](#prerequisites)
- [Setup & Running the Demo](#setup--running-the-demo)
- [Seeding the Database](#seeding-the-database)
- [Demo Credentials](#demo-credentials)
- [App Walkthrough](#app-walkthrough)
- [Key Features](#key-features)

---

## Overview

Zeroooh! connects local food businesses (bakeries, cafes, restaurants) with customers who want discounted surplus food before it goes to waste. Businesses list surplus items with a pickup window and a discounted price. Customers browse, add to cart, and collect in person.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile framework | Expo SDK 54 + React Native 0.81 |
| Routing | Expo Router v4 (file-based) |
| Language | TypeScript (strict) |
| Backend / DB | Supabase (PostgreSQL + Auth + RLS) |
| Auth | Supabase Auth (email/password) |
| Icons | `@expo/vector-icons` (Ionicons) |
| Navigation | Expo Router tabs + stack |
| State | React Context + custom hooks |
| Seed script | Node.js + ts-node |

---

## Project Structure

```
Zeroooh/
├── mobile/                          # Expo app (all source code lives here)
│   ├── app/
│   │   ├── _layout.tsx              # Root layout — wraps AuthContext + NavigationContainer
│   │   ├── index.tsx                # Entry redirect (auth → splash, session → tabs)
│   │   ├── (auth)/
│   │   │   ├── splash.tsx           # Welcome screen — role select (Customer / Business)
│   │   │   ├── login.tsx            # Customer login
│   │   │   ├── business-login.tsx   # Business login
│   │   │   └── sign-up.tsx          # Registration (customer + business path)
│   │   ├── (customer_tabs)/
│   │   │   ├── _layout.tsx          # 5-tab bottom nav (black bar, lime active icon)
│   │   │   ├── index.tsx            # Home — deals feed, category filter, search
│   │   │   ├── product-detail.tsx   # Product detail — image, prices, qty, add to cart
│   │   │   ├── cart.tsx             # Cart — items, savings breakdown, checkout
│   │   │   ├── explore.tsx          # Map explore — store locations, order success
│   │   │   ├── orders.tsx           # Order history — status badges, pickup banner
│   │   │   └── profile.tsx          # User profile — impact stats, sign out
│   │   └── (business_tabs)/
│   │       ├── _layout.tsx          # Business tab nav
│   │       ├── index.tsx            # Dashboard — revenue, stats, listings, add product
│   │       └── business-profile-setup.tsx  # Business profile onboarding
│   ├── components/
│   │   ├── ProductCard.tsx          # Deal card — image, name, prices, % off badge
│   │   ├── CategoryPill.tsx         # Horizontal category filter pill
│   │   ├── DealBadge.tsx            # "67% off", "Popular", "Last chance" badges
│   │   ├── DateTimePickerModal.tsx  # Calendar + time carousel picker (pickup windows)
│   │   └── LoadingScreen.tsx        # Full-screen loading state
│   ├── hooks/
│   │   ├── useSupabase.ts           # Supabase client singleton
│   │   ├── useAuth.ts               # signIn / signUp / signOut
│   │   ├── useAuthContext.ts        # Auth context consumer
│   │   ├── useProducts.ts           # Fetch products + images + business profiles
│   │   ├── useProfile.ts            # User + business profile read/write
│   │   ├── useCarts.ts              # Cart CRUD operations
│   │   ├── useOrders.ts             # Order history
│   │   └── useAsyncWithTimeout.ts   # Async wrapper with timeout + loading state
│   ├── context/
│   │   └── AuthContext.tsx          # Session state — supabase client + auth session
│   ├── constants/
│   │   ├── Colors.ts                # Brand colour tokens + spacing + border radius
│   │   └── errorMessages.ts         # Reusable error message strings
│   ├── utilities/
│   │   └── handleError.ts           # logErrorAndSetState, displayError helpers
│   ├── types/                       # Shared TypeScript types (ResponseType, Product, etc.)
│   └── supabase/
│       └── migrations/              # 9 SQL migration files
│
└── backend/                         # Seed script (standalone Node.js)
    ├── seed.ts                      # Seeds 8 businesses + 1 customer + 40 products
    ├── package.json
    ├── tsconfig.json
    └── .env.example
```

---

## Design System

The app uses a premium dark theme inspired by the Zeroooh! brand:

| Token | Hex | Usage |
|---|---|---|
| `black` | `#1A1A1A` | Main background |
| `darkGray` | `#2A2A2A` | Card / surface background |
| `lime` | `#D9E021` | Active state, prices, CTAs, deal badges |
| `orange` | `#FF6B35` | Primary action buttons, revenue, warnings |
| `deepGreen` | `#00492C` | Impact cards, eco indicators |
| `white` | `#FFFFFF` | Primary text |
| `w10–w60` | rgba white | Secondary text, borders, subtle fills |

Typography uses bold sans-serif with generous padding, rounded cards (18–24 px radius), and high-contrast lime/orange accent pops on a dark base.

---

## Architecture

```
AuthContext (supabase session)
    │
    ├── Not authenticated
    │       └── (auth)/ stack
    │               ├── splash.tsx       ← first screen
    │               ├── login.tsx
    │               ├── business-login.tsx
    │               └── sign-up.tsx
    │
    ├── Authenticated as Customer
    │       └── (customer_tabs)/ bottom tabs
    │               ├── Home            (index.tsx)
    │               ├── Explore         (explore.tsx)
    │               ├── Cart            (cart.tsx)
    │               ├── Orders          (orders.tsx)
    │               └── Profile         (profile.tsx)
    │                       └── product-detail.tsx  (modal)
    │
    └── Authenticated as Business
            └── (business_tabs)/
                    ├── Dashboard       (index.tsx)
                    └── Profile Setup   (business-profile-setup.tsx)
```

All hooks return `{ data, error }` (`ResponseType`) — errors are never thrown. UI components catch errors via `useEffect` and display them with `displayError()`.

---

## Database Schema

Nine migrations run in order via `supabase db reset`:

| Table | Purpose |
|---|---|
| `user_profiles` | Customer first/last name, role flag |
| `business_profiles` | Business name, phone, address, suburb |
| `product_categories` | Bakery, Cafe, Meals, Drinks, Grocery |
| `product_status` | active, sold_out |
| `products` | Listings — dual price model (`original_price_cents` + `discounted_price_cents`), pickup window (`pickup_start` / `pickup_end`) |
| `product_images` | One-to-many image URLs per product |
| `carts` | Per-user cart items (product + quantity) |
| `orders` | Completed orders with status + pickup time |

Row Level Security (RLS) is enabled on all tables. Key policies:
- Anyone can read products and business profiles
- Only the owning business can insert / update / delete their products
- Users can only read and update their own profile and cart

---

## Prerequisites

Make sure the following are installed:

| Tool | Version | Install |
|---|---|---|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| npm | 9+ | Bundled with Node |
| Expo CLI | latest | `npm install -g expo-cli` |
| Supabase CLI | latest | `brew install supabase/tap/supabase` |
| Docker Desktop | latest | Required by Supabase local dev |
| iOS Simulator | Xcode 15+ | macOS only |
| Expo Go app | latest | iPhone / Android (optional, for physical device) |

---

## Setup & Running the Demo

### 1. Clone the repository

```bash
git clone https://github.com/khanhsaan/Zeroooh.git
cd Zeroooh
```

### 2. Start local Supabase

Docker Desktop must be running first.

```bash
cd mobile
supabase start
```

This will:
- Pull and start Supabase containers (PostgreSQL, Auth, Storage, Studio)
- Run all 9 migrations automatically
- Print your local API URL and keys

Take note of the output — you'll need:
- **API URL** (e.g. `http://localhost:54321`)
- **anon key**
- **service_role key**

You can view them again any time with:
```bash
supabase status
```

### 3. Configure the mobile app environment

```bash
# inside mobile/
cp .env.example .env
```

Edit `mobile/.env` and fill in the values from `supabase status`:

```env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Install mobile dependencies

```bash
# inside mobile/
npm install
```

### 5. Run the app

**iOS Simulator (recommended):**
```bash
npx expo start --ios
```

**Android Emulator:**
```bash
npx expo start --android
```

**Physical device via Expo Go:**
```bash
npx expo start
```
Then scan the QR code with the Expo Go app.

---

## Seeding the Database

The seed script creates 8 demo businesses, 1 customer account, and 40 surplus products.

### 1. Configure the backend environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

> **Note:** The seed uses the `service_role` key (not the anon key) to bypass email confirmation when creating users.

### 2. Install backend dependencies

```bash
# inside backend/
npm install
```

### 3. Reset the database and run the seed

Always reset before seeding to ensure a clean state:

```bash
# inside mobile/
supabase db reset

# then seed
cd ../backend
npm run seed
```

A successful seed prints a credential summary like:

```
✅ Seeded 8 businesses, 1 customer, 40 products

📋 Demo Credentials
─────────────────────────────────────────
👤 Customer
   email:    customer@zeroooh.com
   password: Password123!

🏪 Businesses (all use password: Password123!)
   daily.crumb@zeroooh.com   → Daily Crumb Bakery
   cafe.mocha@zeroooh.com    → Cafe Mocha
   sushi.wave@zeroooh.com    → Sushi Wave
   pizza.posto@zeroooh.com   → Pizza Posto
   green.leaf@zeroooh.com    → Green Leaf Cafe
   bread.basket@zeroooh.com  → The Bread Basket
   noodle.house@zeroooh.com  → Noodle House
   fresh.squeeze@zeroooh.com → Fresh Squeeze
```

---

## Demo Credentials

All accounts use the same password: **`Password123!`**

### Customer account

| Field | Value |
|---|---|
| Email | `customer@zeroooh.com` |
| Password | `Password123!` |
| Name | Alex Johnson |

### Business accounts

| Email | Business Name | Location |
|---|---|---|
| `daily.crumb@zeroooh.com` | Daily Crumb Bakery | Wollongong |
| `cafe.mocha@zeroooh.com` | Cafe Mocha | Wollongong |
| `sushi.wave@zeroooh.com` | Sushi Wave | Wollongong |
| `pizza.posto@zeroooh.com` | Pizza Posto | Sydney CBD |
| `green.leaf@zeroooh.com` | Green Leaf Cafe | Newtown |
| `bread.basket@zeroooh.com` | The Bread Basket | Surry Hills |
| `noodle.house@zeroooh.com` | Noodle House | Chinatown |
| `fresh.squeeze@zeroooh.com` | Fresh Squeeze | Bondi |

---

## App Walkthrough

### Customer flow

1. **Splash** — Tap **"I'm a Customer"**
2. **Login** — Use `customer@zeroooh.com` / `Password123!`
3. **Home** — Browse the deals feed. Tap a category pill (Bakery, Cafe, Meals, Drinks, Grocery) to filter. Pull down to refresh.
4. **Product Detail** — Tap any deal card. See the original vs. discounted price, pickup window, eco-impact badge. Adjust quantity, then tap **Add to Cart**.
5. **Cart** — Review items and the savings breakdown (subtotal, savings, service fee, total). Tap **Checkout** to place the order.
6. **Orders** — View your order history with status badges (Ready / Completed).
7. **Explore** — See store locations on a map. Tap a location card to see deal count.
8. **Profile** — View your impact stats (orders placed, money saved, CO₂ rescued) and sign out.

### Business flow

1. **Splash** — Tap **"I'm a Business"**
2. **Business Login** — Use any business email (e.g. `daily.crumb@zeroooh.com`) / `Password123!`
3. **Dashboard → Today tab** — See today's revenue, items sold, and food saved stats.
4. **Dashboard → Listings tab** — Browse your active listings with lime price, stock count, and status badge.
5. **Add a product** — Tap the lime **"+ Add"** button in the header:
   - Fill in Item Name, Description, Original Price, Sale Price, Quantity
   - Tap **Pickup Start** / **Pickup End** to open the date + time picker:
     - **Calendar** — navigate months, tap a day (lime highlight)
     - **Time carousel** — scroll the Hour and Minute drums to snap-select a time
   - Tap **Publish Listing** — the product goes live immediately on the customer home feed
6. **Sign out** — Tap the sign-out button at the bottom of the dashboard.

---

## Key Features

### Dual-price model
Every product stores both `original_price_cents` (retail value) and `discounted_price_cents` (surplus price). The discount percentage is calculated and shown as a lime badge on every card.

### Pickup windows
Businesses set a `pickup_start` and `pickup_end` using the built-in calendar + time carousel picker — no manual datetime string entry needed.

### Date + Time Picker (`DateTimePickerModal`)
A custom bottom-sheet modal with two sections:
- **Calendar** — full month grid with prev/next navigation. Selected day highlighted in lime; today ringed with a lime border.
- **Time carousel** — two snap-scroll drums (Hour 00–23, Minute 00/05/.../55). A lime highlight band marks the centre (selected) slot.

### Impact tracking
Customer profile shows orders placed, total money saved (orange), and CO₂ rescued (lime). Business dashboard shows revenue, items sold, and kilograms of food saved.

### Role-based routing
On first login, `isBusiness` from `user_metadata` routes the user to either the customer tab navigator or the business stack — no manual role selection after sign-up.

### Row Level Security
All Supabase tables enforce RLS. Businesses can only modify their own products; customers can only read/write their own cart and orders.
