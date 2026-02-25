# MediReach — Frontend

Production-level frontend for **MediReach**, an online pharmacy and medicine delivery platform for Nepal. Built with React, Tailwind CSS, React Router v6, and Axios. Uses **mock data** only (no backend required).

## Tech stack

- **React 19** (JavaScript)
- **Vite** — build tool
- **React Router v6** — routing and protected routes
- **Tailwind CSS** — styling (custom theme: sage green, cream, charcoal)
- **Axios** — ready for API calls (currently all data from `src/data/mockData.js`)
- **Google Fonts** — Fraunces (headings), DM Sans (body)

## Design

- **Colors:** Primary `#4a7c59` (sage), background `#faf8f3` (cream), dark `#1a1f1c` (charcoal), amber for warnings, soft red for alerts
- **UI:** Card-heavy layouts, hover lift on cards, page enter fade-up, skeleton loaders, status transitions
- **Responsive:** Sidebar collapses to hamburger from 768px down

## Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview   # preview production build
```

## Roles and demo login

| Role        | Demo email             | Password |
|------------|------------------------|----------|
| Customer   | ram@example.com        | demo123  |
| Pharmacist | amit@pharma.com        | demo123  |
| Admin      | admin@medireach.com    | admin123 |

After login you are redirected to the dashboard for that role.

## Routes

### Public
- `/` — Landing (hero, stats, features, CTA)
- `/login` — Login (role tabs + demo buttons)
- `/register` — 3-step registration wizard

### Customer (`/customer/*`)
- `/customer` — Dashboard (stats, recent orders, quick actions)
- `/customer/medicines` — Medicine catalog (search, filter, sort)
- `/customer/medicines/:id` — Medicine detail + alternatives
- `/customer/cart` — Cart & checkout (address, payment: COD / eSewa / Khalti)
- `/customer/prescriptions` — Upload prescriptions + past list
- `/customer/track` — Order tracking (5-step status + map placeholder)
- `/customer/orders` — My orders (table, filter by status)
- `/customer/profile` — Profile, address, password, notifications

### Pharmacist (`/pharmacist/*`)
- `/pharmacist` — Dashboard (verify queue, low stock)
- `/pharmacist/inventory` — Inventory table + add/edit medicine modal
- `/pharmacist/verify` — Verify prescriptions (approve/reject + reason)
- `/pharmacist/orders` — Manage orders (status dropdown per row)

### Admin (`/admin/*`)
- `/admin` — Dashboard (6 stat cards, activity feed)
- `/admin/analytics` — Charts (weekly sales, donut, top medicines, revenue)
- `/admin/users` — User management (Customers / Pharmacists tabs, suspend/delete, add pharmacist)
- `/admin/medicines` — Medicine CRUD table + add/edit modal
- `/admin/orders` — All orders + filters + Export CSV

## Features

- **Role-based routing** — Protected routes per role; wrong role redirects to correct dashboard
- **Cart** — React Context, persisted in `localStorage`
- **Auth** — Mock login/register; user stored in `localStorage`
- **MediBot** — FAB bottom-right, slide-up chat; keyword replies for medicines, orders, prescriptions, delivery, payment
- **Toasts** — Success/error toasts from `useToast()`
- **Shared components** — Modal, Badge, Avatar, StatusBadge, StatCard, EmptyState, SkeletonLoader, Breadcrumb, ProgressBar, QtyControls, UploadZone, MapPlaceholder
- **Sidebar** — Role-aware nav, active state, cart/prescription badge counts, user chip, sign out
- **Top bar** — Page title (from route handle), optional search, notification bell, avatar

## Project structure

```
src/
├── components/
│   ├── layout/       # Sidebar, TopBar, DashboardLayout, MediBot
│   ├── ui/            # Reusable UI components
│   └── ProtectedRoute.jsx
├── context/           # AuthContext, CartContext, ToastContext
├── data/
│   └── mockData.js    # All mock data (medicines, orders, users, etc.)
├── pages/
│   ├── public/        # Landing, Login, Register
│   ├── customer/      # 8 pages
│   ├── pharmacist/    # 4 pages
│   └── admin/         # 5 pages
├── App.jsx
├── main.jsx
└── index.css
```

## Notes

- No real API: all data is in `src/data/mockData.js`. Replace with Axios calls when connecting to a backend.
- Forms use controlled inputs and basic validation (e.g. register steps, login).
- Tables are filterable and sortable where specified (catalog, orders, inventory, admin tables).
