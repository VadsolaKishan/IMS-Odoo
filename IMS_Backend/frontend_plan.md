## CoreInventory Frontend Master Document (Single Source of Truth)

This document is a full implementation blueprint for building the CoreInventory frontend using React + Tailwind CSS v4 + shadcn/ui, aligned with your backend and Excalidraw intent.

---

## 1) Project Goal

Build a modern, production-ready, role-based Inventory Management frontend that supports:
- Authentication and password reset via OTP
- Dashboard analytics
- Inventory operations (Receipts, Deliveries, Transfers, Adjustments)
- Stock visibility and movement history
- Settings (Warehouses, Locations, Users)
- Responsive desktop + mobile UX

Scope is strictly based on existing backend APIs and wireframe intent.

---

## 2) Technology Stack

- Framework: React + Vite + TypeScript
- Styling: Tailwind CSS v4
- UI Library: shadcn/ui
- Routing: React Router
- Data Layer: Axios + TanStack Query
- Forms: React Hook Form + Zod
- Date handling: date-fns
- Icons: lucide-react

---

## 3) Frontend Architecture

### 3.1 Directory Structure

- src/app (app bootstrap, providers, router)
- src/layouts (App shell, nav, responsive wrappers)
- src/routes (route-level lazy pages)
- src/features/auth
- src/features/dashboard
- src/features/operations
- src/features/stock
- src/features/history
- src/features/settings
- src/features/profile
- src/components/ui (shadcn generated)
- src/components/shared
- src/lib/api (axios client, interceptors)
- src/lib/query (query keys, hooks)
- src/lib/guards (auth/role guards)
- src/types (DTOs)

### 3.2 App Shell

Desktop:
- Top navigation tabs: Dashboard, Operations, Stock, Move History, Settings
- User avatar menu on right (Profile, Logout)

Mobile:
- Compact top bar + menu button
- Slide-out navigation sheet
- Optional bottom quick tabs: Dashboard, Operations, Stock

---

## 4) Roles and UI Permission Rules

Roles from backend:
- admin
- inventory_manager
- warehouse_staff

UI capability matrix:
- admin: full access
- inventory_manager: operations validation/cancellation, adjustments, products/suppliers
- warehouse_staff: draft creation/editing for receipts/deliveries/transfers, stock/ledger read

UI behavior requirements:
- Unauthorized actions hidden by default
- If shown for context, disable + tooltip explanation
- Status lock: validated/cancelled documents are read-only

---

## 5) Route Map

Authentication:
- /login
- /forgot-password
- /reset-password

Main:
- /dashboard
- /operations/receipts
- /operations/receipts/:id
- /operations/deliveries
- /operations/deliveries/:id
- /operations/transfers
- /operations/transfers/:id
- /operations/adjustments
- /operations/adjustments/:id
- /stock
- /move-history
- /settings/warehouses
- /settings/locations
- /settings/users (admin only)
- /profile

---

## 6) Full Wireframe Designs (Desktop + Mobile)

> These wireframes are derived directly from the Excalidraw design source and serve as pixel-perfect implementation blueprints. Each screen includes visual wireframes, ASCII layout specifications, and exact component behavior.

---

### 6.1 Login Page

![Login Page — Desktop and Mobile wireframe](C:\Users\LENOVOL\.gemini\antigravity\brain\7ae110e5-488c-4fc4-b573-ec422dde4432\login_wireframe_1773464922750.png)

#### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                     (centered on viewport)                      │
│   ┌─────────────────────────────────────────────────────┐       │
│   │                  ┌──────────┐                       │       │
│   │                  │ App Logo │                       │       │
│   │                  └──────────┘                       │       │
│   │               CoreInventory                         │       │
│   │                                                     │       │
│   │  Login Id                                           │       │
│   │  ┌─────────────────────────────────────────────┐    │       │
│   │  │ Enter your Login ID                         │    │       │
│   │  └─────────────────────────────────────────────┘    │       │
│   │                                                     │       │
│   │  Password                                           │       │
│   │  ┌─────────────────────────────────────────────┐    │       │
│   │  │ Enter your password                     👁  │    │       │
│   │  └─────────────────────────────────────────────┘    │       │
│   │                                                     │       │
│   │  Forget Password?              Sign Up              │       │
│   │                                                     │       │
│   │  ┌─────────────────────────────────────────────┐    │       │
│   │  │              SIGN IN (primary)              │    │       │
│   │  └─────────────────────────────────────────────┘    │       │
│   └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

**Specs:**
- Card: max-width 420px, centered vertically + horizontally, shadow-lg, rounded-xl
- Logo: 64×64 placeholder icon above app name
- Fields: Input with label above, full card width
- "Forget Password?" links to `/forgot-password`; "Sign Up" links to `/register`
- SIGN IN button: full width, primary blue (#3B82F6), disabled while pending
- Validation: Check credentials → on mismatch show inline error: _"Invalid Login ID or Password"_

#### Mobile Layout

```
┌───────────────────────┐
│    CoreInventory       │  ← small centered logo
│                        │
│  Login Id              │
│  ┌───────────────────┐ │
│  │                   │ │  ← full width
│  └───────────────────┘ │
│                        │
│  Password              │
│  ┌───────────────────┐ │
│  │               👁  │ │
│  └───────────────────┘ │
│                        │
│  Forget Password? | Sign Up │
│                        │
│  ┌───────────────────┐ │
│  │     SIGN IN       │ │  ← full width, sticky bottom
│  └───────────────────┘ │
└───────────────────────┘
```

**Mobile notes:** Single-column, 16px horizontal padding, keyboard-aware layout.

---

### 6.2 Sign Up + Forgot Password + OTP Reset

![Signup and Forgot Password wireframes](C:\Users\LENOVOL\.gemini\antigravity\brain\7ae110e5-488c-4fc4-b573-ec422dde4432\signup_forgot_wireframe_1773465020403.png)

#### Sign Up — Desktop

```
┌─────────────────────────────────────────────────────┐
│                    ┌──────────┐                      │
│                    │ App Logo │                      │
│                    └──────────┘                      │
│                 Create Account                       │
│                                                      │
│  Login Id          (6–12 chars, must be unique)       │
│  ┌──────────────────────────────────────────────┐    │
│  │                                              │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  Email Id          (must not be a duplicate)          │
│  ┌──────────────────────────────────────────────┐    │
│  │                                              │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  Password          (8+ chars, upper+lower+special)    │
│  ┌──────────────────────────────────────────────┐    │
│  │                                          👁  │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  Re-Enter Password                                    │
│  ┌──────────────────────────────────────────────┐    │
│  │                                              │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │                SIGN UP                        │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│        Already have an account? Sign In               │
└─────────────────────────────────────────────────────┘
```

**Validation rules (from Excalidraw):**
1. Login ID: unique, 6–12 characters
2. Email: no duplicate in database
3. Password: min 8 chars, must contain lowercase + uppercase + special character

#### Forgot Password — Step 1

```
┌───────────────────────────────┐
│       Forgot Password          │
│                                │
│  Email                         │
│  ┌───────────────────────────┐ │
│  │                           │ │
│  └───────────────────────────┘ │
│                                │
│  ┌───────────────────────────┐ │
│  │       Send OTP            │ │
│  └───────────────────────────┘ │
└───────────────────────────────┘
```

#### Forgot Password — Step 2

```
┌───────────────────────────────┐
│       Reset Password           │
│                                │
│  Email (read-only, pre-filled) │
│  ┌───────────────────────────┐ │
│  │ user@email.com            │ │
│  └───────────────────────────┘ │
│                                │
│  OTP Code                      │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐│
│  │  │ │  │ │  │ │  │ │  │ │  ││
│  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘│
│                                │
│  New Password                  │
│  ┌───────────────────────────┐ │
│  │                           │ │
│  └───────────────────────────┘ │
│                                │
│  Confirm Password              │
│  ┌───────────────────────────┐ │
│  │                           │ │
│  └───────────────────────────┘ │
│                                │
│  ┌───────────────────────────┐ │
│  │     Reset Password        │ │
│  └───────────────────────────┘ │
└───────────────────────────────┘
```

**Mobile:** Same card layout, full-width single-column, stacked fields.

---

### 6.3 Dashboard

![Dashboard — Desktop and Mobile wireframe](C:\Users\LENOVOL\.gemini\antigravity\brain\7ae110e5-488c-4fc4-b573-ec422dde4432\dashboard_wireframe_1773464938931.png)

#### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Dashboard  │ Operations  │ Products  │ Stock  │ Move History │ Settings │ 👤 │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Dashboard                                                                   │
│  ─────────                                                                   │
│                                                                              │
│  ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐  │
│  │  📦 Receipt          │ │  🚚 Delivery         │ │  🔄 Stock            │  │
│  │  4 to receive        │ │  4 to deliver        │ │  Overview            │  │
│  │  🔴 1 Late           │ │  🔴 1 Late           │ │                      │  │
│  │  🔵 6 operations     │ │  🟡 2 waiting        │ │                      │  │
│  │                      │ │  🔵 6 operations     │ │                      │  │
│  └──────────────────────┘ └──────────────────────┘ └──────────────────────┘  │
│                                                                              │
│  Stock Summary                                                               │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Product       │ Per Unit Cost  │ On Hand │ Free to Use                   ││
│  ├───────────────┼────────────────┼─────────┼──────────────                 ││
│  │ Desk          │ 3000 Rs        │ 50      │ 45                            ││
│  │ Table         │ 3000 Rs        │ 50      │ 50                            ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  User must be able to update the stock from here.                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

**KPI Card specs:**
- Late: `schedule_date < today` → red badge
- Operations: `schedule_date > today` → blue badge
- Waiting: out-of-stock dependency → yellow badge

#### Mobile Layout

```
┌───────────────────────┐
│ ☰  CoreInventory  👤  │
├───────────────────────┤
│  Dashboard             │
│                        │
│ ┌──────┐ ┌──────┐     │  ← 2-column KPI grid
│ │Receipt│ │Deliver│    │
│ │4 recv │ │4 dlvr │    │
│ │1 Late │ │1 Late │    │
│ └──────┘ └──────┘     │
│                        │
│ ▼ Stock Summary        │  ← collapsible
│ ┌────────────────────┐ │
│ │ Desk  50  45       │ │
│ │ Table 50  50       │ │
│ └────────────────────┘ │
│                        │
│ [Dashboard][Operations][Stock][⋯]│  ← bottom tabs
└───────────────────────┘
```

---

### 6.4 Receipts List

![Receipts List + Detail wireframes](C:\Users\LENOVOL\.gemini\antigravity\brain\7ae110e5-488c-4fc4-b573-ec422dde4432\receipts_wireframe_1773464953392.png)

#### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Dashboard  │ Operations ▼ │ Products  │ Stock  │ Move History │ Settings │ 👤│
├──────────────────────────────────────────────────────────────────────────────┤
│  Operations > Receipts                                                       │
│                                                                              │
│  Receipts                                                     ┌───────────┐  │
│                                                               │  + NEW    │  │
│                                                               └───────────┘  │
│  ┌─────────┐ ┌──────────────┐ ┌───────────────┐  ⊞ List │ ▦ Kanban        │
│  │🔍 Search│ │ Status ▾     │ │ Date range ▾  │                              │
│  └─────────┘ └──────────────┘ └───────────────┘                              │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Reference    │ From (Supplier)│ Schedule Date │ Status   │ Actions       ││
│  ├──────────────┼────────────────┼───────────────┼──────────┼───────────────┤│
│  │ WH/IN/0001   │ vendor         │ 12/01/2025    │ ● Ready  │     ⋮         ││
│  │ WH/IN/0002   │ vendor         │ 12/01/2025    │ ● Ready  │     ⋮         ││
│  └──────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

**Reference format:** `<Warehouse>/<Operation>/<ID>` — e.g., `WH/IN/001` (auto-increment)
- WH = Warehouse ID, IN = Inbound, OUT = Outbound
- Search: by reference and contacts
- View toggle: List (default) ↔ Kanban (grouped by status)

#### Mobile Layout

```
┌───────────────────────┐
│ ←  Receipts       +   │
├───────────────────────┤
│ ┌─ Filter ──────────┐ │  ← opens filter sheet
│ └────────────────────┘ │
│                        │
│ ┌────────────────────┐ │
│ │ WH/IN/0001         │ │
│ │ vendor    ● Ready  │ │
│ │ 12/01/2025     ⋮   │ │
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │ WH/IN/0002         │ │
│ │ vendor    ● Ready  │ │
│ │ 12/01/2025     ⋮   │ │
│ └────────────────────┘ │
└───────────────────────┘
```

---

### 6.5 Receipt Detail

#### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Dashboard  │ Operations ▼ │ Products  │ Stock  │ Move History │ Settings │ 👤│
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Receipt                                                                     │
│  ┌───┐  ┌───────────┐  ┌───────┐  ┌────────┐                               │
│  │New│  │ Validate  │  │ Print │  │ Cancel │        Status: ● Draft         │
│  └───┘  └───────────┘  └───────┘  └────────┘                               │
│                                                                              │
│  Status flow:  Draft ──→ Ready ──→ Done                                      │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │  WH/IN/0001                                                             ││
│  │                                                                          ││
│  │  Receive From     ┌────────────────────────────────┐                     ││
│  │                   │ Select supplier...          ▾  │                     ││
│  │                   └────────────────────────────────┘                     ││
│  │                                                                          ││
│  │  Schedule Date    ┌────────────────────────────────┐                     ││
│  │                   │ 📅 Pick a date                 │                     ││
│  │                   └────────────────────────────────┘                     ││
│  │                                                                          ││
│  │  Responsible      ┌────────────────────────────────┐                     ││
│  │                   │ Current User (auto-filled)     │                     ││
│  │                   └────────────────────────────────┘                     ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Products                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Product                              │ Quantity                          ││
│  ├──────────────────────────────────────┼──────────────────────────────────┤││
│  │ [DESK001] Desk                       │ 6                                ││
│  ├──────────────────────────────────────┴──────────────────────────────────┤││
│  │ + New Product                                                           ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Print the receipt once it's DONE                                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Action button rules:**
- TODO button: visible in Draft status
- Validate: visible in Ready status → moves to Done
- Cancel: available in Draft/Ready → marks cancelled
- Print: available only after Done

#### Mobile Layout

```
┌───────────────────────┐
│ ← WH/IN/0001  ● Draft│
├───────────────────────┤
│                        │
│ ┌────────────────────┐ │
│ │ Receive From       │ │
│ │ [Select supplier▾] │ │
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │ Schedule Date      │ │
│ │ [📅 Pick date    ] │ │
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │ Responsible        │ │
│ │ [Current User    ] │ │
│ └────────────────────┘ │
│                        │
│ ▼ Products             │
│ ┌────────────────────┐ │
│ │ [DESK001] Desk     │ │  ← accordion
│ │ Qty: 6             │ │
│ └────────────────────┘ │
│ [+ Add Product]        │
│                        │
│ ┌──────────┬─────────┐ │  ← sticky bottom bar
│ │ Validate │ Cancel  │ │
│ └──────────┴─────────┘ │
└───────────────────────┘
```

---

### 6.6 Deliveries List

![Deliveries List + Detail wireframes](C:\Users\LENOVOL\.gemini\antigravity\brain\7ae110e5-488c-4fc4-b573-ec422dde4432\deliveries_wireframe_1773464968797.png)

#### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Dashboard  │ Operations ▼ │ Products  │ Stock  │ Move History │ Settings │ 👤│
├──────────────────────────────────────────────────────────────────────────────┤
│  Operations > Deliveries                                                     │
│                                                                              │
│  Deliveries                                                   ┌───────────┐  │
│                                                               │  + NEW    │  │
│  ┌─────────┐ ┌──────────────┐ ┌───────────────┐              └───────────┘  │
│  │🔍 Search│ │ Status ▾     │ │ Date range ▾  │  ⊞ List │ ▦ Kanban        │
│  └─────────┘ └──────────────┘ └───────────────┘                              │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────── ┐│
│  │ Reference    │ From       │ Contact        │ To    │ Sched.  │ Status    ││
│  ├──────────────┼────────────┼────────────────┼───────┼─────────┼───────────┤│
│  │ WH/OUT/0001  │ WH/Stock1  │ Azure Interior │ vendor│ 12/01   │ ● Ready   ││
│  │ WH/OUT/0002  │ WH/Stock1  │ Azure Interior │ vendor│ 12/01   │ ● Ready   ││
│  └──────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

**Search:** by reference and contacts. **Kanban:** toggle to status-grouped card view.

#### Mobile Layout

```
┌───────────────────────┐
│ ←  Deliveries      +  │
├───────────────────────┤
│ ┌────────────────────┐ │
│ │ WH/OUT/0001        │ │
│ │ Azure Interior     │ │
│ │ WH/Stock1 → vendor │ │
│ │ ● Ready   12/01/25 │ │
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │ WH/OUT/0002        │ │
│ │ Azure Interior     │ │
│ │ WH/Stock1 → vendor │ │
│ │ ● Ready   12/01/25 │ │
│ └────────────────────┘ │
└───────────────────────┘
```

---

### 6.7 Delivery Detail

#### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Delivery                                                                    │
│  ┌───┐  ┌───────────┐  ┌───────┐  ┌────────┐                               │
│  │New│  │ Validate  │  │ Print │  │ Cancel │        Status: ● Draft         │
│  └───┘  └───────────┘  └───────┘  └────────┘                               │
│                                                                              │
│  Status flow:  Draft ──→ Waiting ──→ Ready ──→ Done                          │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │  WH/OUT/0001                                                            ││
│  │                                                                          ││
│  │  Delivery Address ┌────────────────────────────────┐                     ││
│  │                   │ Enter delivery address      ▾  │                     ││
│  │                   └────────────────────────────────┘                     ││
│  │                                                                          ││
│  │  Schedule Date    ┌────────────────────────────────┐                     ││
│  │                   │ 📅 Pick a date                 │                     ││
│  │                   └────────────────────────────────┘                     ││
│  │                                                                          ││
│  │  Operation Type   ┌────────────────────────────────┐                     ││
│  │                   │ Select type...              ▾  │                     ││
│  │                   └────────────────────────────────┘                     ││
│  │                                                                          ││
│  │  Responsible      ┌────────────────────────────────┐                     ││
│  │                   │ Current User (auto-filled)     │                     ││
│  │                   └────────────────────────────────┘                     ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Products                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Product                              │ Quantity                          ││
│  ├──────────────────────────────────────┼──────────────────────────────────┤││
│  │ [DESK001] Desk                       │ 6                                ││
│  ├──────────────────────────────────────┴──────────────────────────────────┤││
│  │ + New Product                                                           ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│  ⚠️ Alert: mark line red if product is not in stock                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Delivery status flow:** Draft → Waiting (out-of-stock dependency) → Ready → Done
- **Waiting:** product is out of stock; line highlighted in red with alert notification
- **Alert rule:** "Alert the notification & mark the line red if product is not in stock"

#### Mobile Layout

Same structure as Receipt Detail mobile, with delivery-specific fields and sticky bottom action bar.

---

### 6.8 Transfers List

#### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Operations > Transfers                                       ┌───────────┐  │
│  Transfers                                                    │  + NEW    │  │
│                                                               └───────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Reference    │ From        │ To          │ Sched. Date │ Status│ Actions ││
│  ├──────────────┼─────────────┼─────────────┼─────────────┼───────┼─────────┤│
│  │ WH/TR/0001   │ WH/Stock1   │ WH/Stock2   │ 12/01/2025  │ Draft │   ⋮     ││
│  └──────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

#### Mobile Layout

```
┌───────────────────────┐
│ ← Transfers        +  │
├───────────────────────┤
│ ┌────────────────────┐ │
│ │ WH/TR/0001         │ │
│ │ WH/Stock1 → WH/Stk2│ │  ← directional emphasis
│ │ ● Draft   12/01/25 │ │
│ └────────────────────┘ │
└───────────────────────┘
```

---

### 6.9 Transfer Detail

#### Desktop Layout

Same structure as Receipt Detail with these field differences:
- **Source Location** (dropdown) — cannot be same as destination
- **Destination Location** (dropdown) — validation hint shown
- **Schedule Date** (date picker)
- **Products table** with Product + Quantity
- **Validation hint:** "Source and Destination cannot be same"

#### Mobile Layout

```
┌───────────────────────┐
│ ← WH/TR/0001  ● Draft│
├───────────────────────┤
│ ┌────────────────────┐ │
│ │ Source Location     │ │
│ │ [Select...       ▾]│ │
│ └────────────────────┘ │
│         ↓  (arrow)     │
│ ┌────────────────────┐ │
│ │ Destination        │ │
│ │ [Select...       ▾]│ │
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │ Schedule Date      │ │
│ │ [📅             ]  │ │
│ └────────────────────┘ │
│ ▼ Products             │
│ ┌────────────────────┐ │
│ │ [DESK001] Desk     │ │
│ │ Qty: 6             │ │
│ └────────────────────┘ │
│ ┌──────────┬─────────┐ │
│ │ Validate │ Cancel  │ │
│ └──────────┴─────────┘ │
└───────────────────────┘
```

---

### 6.10 Adjustments List

#### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Operations > Adjustments                                     ┌───────────┐  │
│  Adjustments                                                  │  + NEW    │  │
│                                                               └───────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Reference │ Location  │ Reason     │ Status │ Created   │ Responsible   ││
│  ├───────────┼───────────┼────────────┼────────┼───────────┼───────────────┤│
│  │ ADJ/0001  │ WH/Stock1 │ Correction │ Draft  │ 12/01/25  │ Admin         ││
│  └──────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

#### Mobile: Card layout with Location, Reason, Status, Created date per card.

---

### 6.11 Adjustment Detail

#### Desktop Layout

Same form structure with:
- **Location** (dropdown)
- **Reason** (text input)
- **Notes** (textarea)
- **Products table:** Product | Counted Qty (editable) | System Qty (read-only) | Difference (auto-calculated, read-only)

#### Mobile: Product cards with inline counted-quantity input, system qty displayed, difference shown.

---

### 6.12 Stock Page

#### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Dashboard  │ Operations  │ Products  │ Stock ▼  │ Move History │ Settings    │
├──────────────────────────────────────────────────────────────────────────────┤
│  Stock                                                                       │
│                                                                              │
│  ┌─────────┐ ┌───────────────┐ ┌──────────────┐                             │
│  │🔍 Search│ │ Warehouse ▾   │ │ Location ▾   │                             │
│  └─────────┘ └───────────────┘ └──────────────┘                             │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Product   │ SKU     │ Warehouse │ Location  │ On Hand │ Free to Use     ││
│  ├───────────┼─────────┼───────────┼───────────┼─────────┼─────────────────┤│
│  │ Desk      │ DESK001 │ WH        │ WH/Stock1 │ 50      │ 45              ││
│  │ Table     │ TBL001  │ WH        │ WH/Stock1 │ 50      │ 50              ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  User must be able to update the stock from here.                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### Mobile: Card per product with expandable location-level quantities.

---

### 6.13 Move History Page

![Move History and Settings wireframes](C:\Users\LENOVOL\.gemini\antigravity\brain\7ae110e5-488c-4fc4-b573-ec422dde4432\history_settings_wireframe_1773464989589.png)

#### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Dashboard  │ Operations  │ Products  │ Stock  │ Move History ▼ │ Settings    │
├──────────────────────────────────────────────────────────────────────────────┤
│  Move History                                                                │
│                                                                              │
│  ┌─────────┐ ┌───────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │🔍 Search│ │ Contact ▾     │ │ Date range ▾ │ │ Type ▾       │           │
│  └─────────┘ └───────────────┘ └──────────────┘ └──────────────┘           │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Reference    │ Contact        │ From      │ To        │ Date  │ Qty     ││
│  ├──────────────┼────────────────┼───────────┼───────────┼───────┼─────────┤│
│  │ WH/IN/0001   │ Azure Interior │ vendor    │ WH/Stock1 │ 12/01 │ 🟢 +6   ││  ← IN = green
│  │ WH/OUT/0002  │ Azure Interior │ WH/Stock1 │ vendor    │ 12/01 │ 🔴 -6   ││  ← OUT = red
│  │ WH/OUT/0002  │ Azure Interior │ WH/Stock2 │ vendor    │ 12/01 │ 🔴 -6   ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Color rules: IN moves → green row/badge, OUT moves → red row/badge         │
│  If single reference has multiple products, display in multiple rows.        │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### Mobile Layout

![Mobile wireframes — Receipts, Detail, Deliveries, Move History](C:\Users\LENOVOL\.gemini\antigravity\brain\7ae110e5-488c-4fc4-b573-ec422dde4432\mobile_wireframes_1773465005317.png)

```
┌───────────────────────┐
│ ←  Move History    🔍  │
├───────────────────────┤
│ ┌────────────────────┐ │
│ │ WH/IN/0001         │ │
│ │ vendor → WH/Stock1 │ │
│ │ Azure Interior     │ │
│ │ 🟢 +6    12/01/25  │ │  ← green for IN
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │ WH/OUT/0002        │ │
│ │ WH/Stock1 → vendor │ │
│ │ Azure Interior     │ │
│ │ 🔴 -6    12/01/25  │ │  ← red for OUT
│ └────────────────────┘ │
└───────────────────────┘
```

---

### 6.14 Settings — Warehouses

#### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Dashboard │ Operations │ Products │ Stock │ Move History │ Settings ▼    │ 👤│
├──────────────────────────────────────────────────────────────────────────────┤
│  Settings > Warehouses                                                       │
│                                                                              │
│  Warehouses                                                   ┌──────────┐   │
│                                                               │  + Add   │   │
│                                                               └──────────┘   │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Name          │ Short Code  │ Address          │ Active │ Actions       ││
│  ├───────────────┼─────────────┼──────────────────┼────────┼───────────────┤│
│  │ Main Warehouse│ WH          │ 123 Street, City │ ✓      │ ✏️ 🗑         ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ── Add/Edit Warehouse Modal ──────────────────                              │
│  ┌────────────────────────────────────────────┐                              │
│  │ Name:       [________________________]     │                              │
│  │ Short Code: [________________________]     │                              │
│  │ Address:    [________________________]     │                              │
│  │             [________________________]     │                              │
│  │                                            │                              │
│  │         [Cancel]    [Save]                  │                              │
│  └────────────────────────────────────────────┘                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### Mobile: Warehouse cards in a list. Add/Edit opens as a full-screen sheet.

---

### 6.15 Settings — Locations

#### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Settings > Locations                                         ┌──────────┐   │
│  Locations                                                    │  + Add   │   │
│                                                               └──────────┘   │
│  ┌───────────────┐ ┌──────────────┐ ┌──────────────┐                        │
│  │ Warehouse ▾   │ │ Type ▾       │ │ Status ▾     │                        │
│  └───────────────┘ └──────────────┘ └──────────────┘                        │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Warehouse │ Name    │ Code      │ Type     │ Active │ Actions           ││
│  ├───────────┼─────────┼───────────┼──────────┼────────┼───────────────────┤│
│  │ WH        │ Stock 1 │ WH/Stock1 │ Internal │ ✓      │ ✏️ 🗑             ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Locations hold warehouse rooms, zones, shelving etc.                        │
│  ── Add/Edit Modal fields: Name, Short Code, Warehouse (select) ──          │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### Mobile: Location cards with quick filters, full-screen sheet for add/edit.

---

### 6.16 Settings — Users (Admin Only)

#### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Settings > Users                                                            │
│  Users                                                                       │
│  ┌───────────────┐ ┌──────────────┐ ┌──────────────┐                        │
│  │ 🔍 Search     │ │ Role ▾       │ │ Active ▾     │                        │
│  └───────────────┘ └──────────────┘ └──────────────┘                        │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Name    │ Email           │ Role              │ Active │ Created│Actions ││
│  ├─────────┼─────────────────┼───────────────────┼────────┼────────┼────────┤│
│  │ Admin   │ admin@co.com    │ 🔵 admin          │ ✓      │ 12/01  │ ✏️ 🗑  ││
│  │ Sarah   │ sarah@co.com    │ 🟢 inv_manager    │ ✓      │ 12/02  │ ✏️ 🗑  ││
│  │ Bob     │ bob@co.com      │ 🟡 warehouse_staff│ ✓      │ 12/03  │ ✏️ 🗑  ││
│  └──────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

#### Mobile: User cards with role badge and 3-dot menu for actions.

---

### 6.17 Profile

#### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Profile                                                                     │
│                                                                              │
│  ┌─── Personal Info ────────────────────────────────────────────────────────┐│
│  │  First Name    [________________________]                                ││
│  │  Last Name     [________________________]                                ││
│  │  Phone         [________________________]                                ││
│  │  Email         [user@email.com (read-only)]                              ││
│  │                                                                          ││
│  │                              [Save Changes]                              ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─── Change Password ─────────────────────────────────────────────────────┐│
│  │  Old Password  [________________________]                                ││
│  │  New Password  [________________________]                                ││
│  │                                                                          ││
│  │                            [Update Password]                             ││
│  └──────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

#### Mobile: Stacked profile form and password form, full-width inputs.

---

### 6.18 Global Navigation Reference

#### Desktop — Top Navigation Bar

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🏢 CoreInventory │ Dashboard │ Operations ▾ │ Products │ Stock │ Move History│ Settings ▾ │ 👤 │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │                                    │
                              ┌─────┴─────┐                       ┌──────┴──────┐
                              │ Receipts   │                       │ Warehouses  │
                              │ Deliveries │                       │ Locations   │
                              │ Transfers  │                       │ Users       │
                              │ Adjustments│                       └─────────────┘
                              └────────────┘
```

#### Mobile — Slide-Out Navigation + Bottom Tabs

```
┌───────────────────────┐
│ ☰  CoreInventory  👤  │   ← compact top bar
├───────────────────────┤

  Hamburger opens sheet:         Bottom quick tabs:
  ┌──────────────────┐           ┌──────────────────────┐
  │ Dashboard        │           │ Dashboard │ Operations│
  │ Operations  ▶    │           │ Stock     │ ⋯ More   │
  │  ├ Receipts      │           └──────────────────────┘
  │  ├ Deliveries    │
  │  ├ Transfers     │
  │  └ Adjustments   │
  │ Products         │
  │ Stock            │
  │ Move History     │
  │ Settings    ▶    │
  │  ├ Warehouses    │
  │  ├ Locations     │
  │  └ Users         │
  │ Profile          │
  │ Logout           │
  └──────────────────┘
```

---

### 6.19 Status Workflow Reference (from Excalidraw)

| Operation    | Status Flow                          | Notes                                   |
|-------------|--------------------------------------|-----------------------------------------|
| Receipt     | Draft → Ready → Done                 | Print available after Done              |
| Delivery    | Draft → Waiting → Ready → Done       | Waiting = out-of-stock dependency       |
| Transfer    | Draft → Ready → Done                 | Source ≠ Destination validation          |
| Adjustment  | Draft → Ready → Done                 | System qty auto-populated               |

**Status definitions:**
- **Draft:** Initial stage — editable
- **Waiting:** Waiting for out-of-stock product to be available (deliveries only)
- **Ready:** Ready to receive/deliver/transfer
- **Done:** Completed — read-only, printable

**Button mapping:**
- TODO button → visible in Draft, moves to Ready
- Validate button → visible in Ready, moves to Done
- Cancel → available in Draft/Ready

---

## 7) shadcn Component Matrix (What / Where / How)

### 7.1 Navigation and Layout
- Components: NavigationMenu, Menubar, Sheet, Breadcrumb, DropdownMenu, Avatar
- Where: app shell + top navigation + user menu
- How: persistent desktop nav, active tab highlight, mobile sheet closes on route select

### 7.2 Data Rendering
- Components: Card, Table, Badge, Separator, ScrollArea, Skeleton, Alert
- Where: dashboard, all lists, all detail summaries
- How: always support loading, error, empty, and success states

### 7.3 Forms and Input
- Components: Form, Input, Textarea, Select, Popover+Calendar(Date), Checkbox
- Where: auth, operation forms, settings forms, profile forms
- How: Zod schema validation + mapped backend errors + disable submit while pending

### 7.4 Actions and Feedback
- Components: Button variants, AlertDialog, Dialog, Toast
- Where: validate/cancel/delete/edit flows
- How: confirmation for destructive actions, consistent success/error toasts

---

## 8) Backend API Endpoint Map

Base URL: /api/v1

### 8.1 Auth
- POST /auth/register/
- POST /auth/login/
- POST /auth/logout/
- POST /auth/token/refresh/
- POST /auth/password-reset/request/
- POST /auth/password-reset/verify/
- GET/PATCH /auth/profile/
- POST /auth/change-password/
- GET /auth/users/
- GET/PATCH/DELETE /auth/users/:id/

### 8.2 Dashboard
- GET /dashboard/overview/
- GET /dashboard/low-stock/
- GET /dashboard/out-of-stock/

### 8.3 Products
- GET/POST /products/categories/
- GET/PATCH/DELETE /products/categories/:id/
- GET/POST /products/uom/
- GET/PATCH/DELETE /products/uom/:id/
- GET/POST /products/
- GET/PATCH/DELETE /products/:id/

### 8.4 Warehouses and Stock
- GET/POST /warehouses/
- GET/PATCH/DELETE /warehouses/:id/
- GET/POST /warehouses/locations/
- GET/PATCH/DELETE /warehouses/locations/:id/
- GET /warehouses/stock/
- GET /warehouses/stock/product/:product_id/

### 8.5 Inventory Operations
Suppliers:
- GET/POST /inventory/suppliers/
- GET/PATCH/DELETE /inventory/suppliers/:id/

Receipts:
- GET/POST /inventory/receipts/
- GET/PATCH /inventory/receipts/:id/
- POST /inventory/receipts/:id/lines/
- POST /inventory/receipts/:id/validate/
- POST /inventory/receipts/:id/cancel/

Deliveries:
- GET/POST /inventory/deliveries/
- GET/PATCH /inventory/deliveries/:id/
- POST /inventory/deliveries/:id/lines/
- POST /inventory/deliveries/:id/validate/
- POST /inventory/deliveries/:id/cancel/

Transfers:
- GET/POST /inventory/transfers/
- GET/PATCH /inventory/transfers/:id/
- POST /inventory/transfers/:id/lines/
- POST /inventory/transfers/:id/validate/
- POST /inventory/transfers/:id/cancel/

Adjustments:
- GET/POST /inventory/adjustments/
- GET/PATCH /inventory/adjustments/:id/
- POST /inventory/adjustments/:id/lines/
- POST /inventory/adjustments/:id/validate/
- POST /inventory/adjustments/:id/cancel/

Ledger:
- GET /inventory/ledger/
- GET /inventory/ledger/product/:product_id/

---

## 9) API Query Parameters and Frontend Mapping

List behavior defaults:
- Pagination: page size 25
- Search: search
- Ordering: ordering

Product filters:
- name, sku, category, category_name, min_stock, is_active, created_after, created_before

Receipt filters:
- status, supplier, warehouse, created_after, created_before

Delivery filters:
- status, warehouse, created_after, created_before

Transfer filters:
- status, source_warehouse, dest_warehouse, created_after, created_before

Adjustment filters:
- status, warehouse, created_after, created_before

Ledger filters:
- product, product_category, operation_type, warehouse, after, before

---

## 10) Data Contracts (Frontend DTO Guidance)

Use strict TypeScript interfaces for:
- Auth payloads and token responses
- User profile and user admin rows
- Dashboard aggregate response blocks
- Product list rows and product detail
- Warehouse/location rows
- Stock record rows
- Receipt/Delivery/Transfer/Adjustment list + detail + lines
- Ledger rows

Use backend field names exactly to avoid transform bugs.

---

## 11) State Management and Query Invalidation

Query key strategy:
- auth.profile
- dashboard.overview, dashboard.lowStock, dashboard.outOfStock
- receipts.list, receipts.detail(id)
- deliveries.list, deliveries.detail(id)
- transfers.list, transfers.detail(id)
- adjustments.list, adjustments.detail(id)
- stock.list, stock.product(id)
- ledger.list, ledger.product(id)
- settings.warehouses, settings.locations, settings.users

Invalidation rules:
- After create/update/validate/cancel: invalidate detail + list for that document type
- After stock-changing validation: invalidate dashboard + stock + ledger queries

---

## 12) UX Principles (Modern and Practical)

- One clear primary action per page section
- Consistent status labels and badge semantics
- Progressive disclosure for complex forms
- Fast scanning tables on desktop, concise cards on mobile
- No dead-end states; always provide clear back/next actions
- Strong form feedback: inline field errors + global error alerts
- Accessibility baseline: keyboard navigation, focus rings, semantic labels

---

## 13) Responsive Design Rules

Breakpoints:
- Desktop/tablet: dense table and multi-column forms
- Mobile: single-column forms, card lists, filter sheets

Mobile behavior:
- Sticky bottom action bar on detail forms
- Collapsible/accordion sections for secondary data
- Avoid horizontal scroll except optional KPI carousels

---

## 14) Security and Session UX

- Keep auth-required routes protected
- On token expiry: attempt refresh, if fails redirect to login
- On logout: call logout API and clear tokens + query cache
- Mask password fields and avoid logging tokens

---

## 15) Build Plan (LLM Execution Sequence)

1) Foundation + theming + shell + routing
2) Auth flows + guards + token lifecycle
3) Dashboard module
4) Operations list pages
5) Operations detail pages with line editors and validate/cancel actions
6) Stock + move history
7) Settings + users + profile
8) UX polish (mobile, accessibility, loading/error states)

Done criteria per module:
- Route complete
- Desktop + mobile UI complete
- API integration complete
- Role-based action control complete
- Loading/error/empty states complete

---

## 16) Full QA Checklist

Functional:
- Every page loads and integrates with correct endpoint
- Create/edit/validate/cancel actions work and refresh correctly
- OTP reset flow works end-to-end

Role-based:
- Admin, inventory_manager, warehouse_staff each sees correct actions only

Responsive:
- All pages usable on desktop and mobile

Quality:
- Keyboard navigation works
- Focus indicators visible
- No blank states without guidance
- Pagination/search/filter/order behave correctly

---

## 17) Final Implementation Notes for LLM

- Do not invent extra pages or backend fields.
- Do not hardcode status transitions not supported by backend.
- Keep naming and payloads exactly aligned with API contracts.
- Prefer composable shared components to reduce duplication.
- Keep UI modern but minimal; avoid decorative complexity.

---

## 18) Optional Enhancements (Phase 2, Not in MVP)

- Operations Kanban view (if required)
- Printable operation documents
- Saved filter presets
- CSV exports for stock/ledger

(Only implement these if explicitly requested.)
