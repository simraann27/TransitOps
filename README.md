# TransitOps

### Smart Fleet Operations & Logistics Command Center

TransitOps is a full-stack, enterprise-grade fleet management and logistics dispatch platform. It is designed to centralize vehicle tracking, driver safety scorecards, automated trip manifest dispatches, maintenance schedules, operational expenses, and interactive SVG analytics into a single cohesive control center.

---

## 🔗 Live Links & Demonstration

*   **Live Web Application**: [https://transit-ops-self.vercel.app](https://transit-ops-self.vercel.app)
*   **Watch Interactive Product Tour**: [OneDrive Video Walkthrough](https://1drv.ms/v/c/5b2f135f08e32784/IQCmfqeqEBQqQ4A_RRIcUVE-Adr-FXUN_eb9xcVnA-nsPQI?e=PfWh0r)

---

## 🎯 The Problem & The Journey

Modern fleet management is plagued by siloed data, uncoordinated operations, and critical manual errors. Common operational failures include:
1.  **Safety & Legal Risks**: Expired driver licenses go unnoticed, leading to legal liabilities.
2.  **Dispatch Inefficiencies**: Vehicles currently in repair shops or drivers already on duty are assigned to new trips, causing delays.
3.  **Overloaded Cargo**: Dispatchers overloading trucks beyond their certified load limits, resulting in mechanical strain and safety violations.
4.  **Untracked Spending**: Untracked fuel burn, road permits, and maintenance costs draining margins.

### Building from Scratch
To solve these challenges, I built **TransitOps** completely from scratch as a unified, database-backed platform. Every view, state connection, database schema, and server validation rule was architected to enforce strict logistics constraints. The project is styled with a premium, responsive pastel UI designed to feel cohesive, modern, and light.

---

## 🛠️ Step-by-Step Module Walkthrough

Here is the chronological order in which the platform's layers and modules were designed and implemented:

### 1. Brand Identity & Landing Page
*   **TransitOps Logo**: Created a clean, minimal vector branding symbol representing a stylized "T" combined with route vectors and coordinates.
*   **Landing Page**: Built a responsive landing page with a warm off-white and soft pastel layout, featuring micro-animations, product highlights, and a **Watch Product Tour** modal.
*   **Video Tour Player**: Implemented a responsive modal with a video player linked to the OneDrive product tour, equipped with keyboard escape listeners and backdrop blur overlays.

### 2. User Authentication & JWT Upgrade
*   **Database Schema**: Created the MongoDB `User` model using Mongoose, establishing fields for verified names, unique emails, bcrypt password hashes, and user providers.
*   **JWT Bearer Tokens**: Configured session validation using JSON Web Tokens (JWT). All authenticated requests pass a secure token under the `Authorization: Bearer <token>` header, verified on app load via `GET /api/auth/me`.
*   **Signup Restriction**: Enforced server-side checks. All new public account signups default to the `Dispatcher` role, ignoring any role parameters sent by the client.

### 3. Google Sign-In Integration
*   **Google Identity Services**: Integrated `@react-oauth/google` on the frontend and `google-auth-library` on the backend.
*   **Backend Verification**: The backend receives the Google ID credential token, securely verifies the token audience matching the Google Client ID, extracts verified email/name values, and queries MongoDB.
*   **Conflict Prevention**: If a Google account matches an existing local credentials record, it authenticates the session while preserving the user's pre-assigned database role.

### 4. Role-Based Access Control (RBAC)
*   Enforced permissions on both client routes and UI sidebar elements:
    *   **Fleet Manager**: Access to Dashboard, Fleet, Drivers, Trips, Maintenance, and Analytics.
    *   **Dispatcher**: Access to Dashboard, Fleet (View Only), and Trips (Full CRUD/Dispatch controls).
    *   **Safety Officer**: Access to Dashboard, Drivers (CRUD), Maintenance (CRUD), and Trips (View Only).
    *   **Financial Analyst**: Access to Dashboard, Fleet (View Only), Fuel & Expenses (CRUD), and Analytics.

### 5. Fleet Registry (Vehicles Module)
*   A centralized catalog monitoring vehicle specifications, fuel capacities, active statuses (`Available`, `On Trip`, `In Shop`, `Retired`), and acquisition costs. It includes side-drawer CRUD forms, validation checks, and responsive list layouts.

### 6. Drivers Registry & Safety Scorecards
*   Tracks driver licenses, class categories, active duty statuses (`Available`, `On Trip`, `Offline`), and real-time safety rating scores. Employs conditional UI badges to warn operators of low safety scores (under 75) or active status states.

### 7. Smart Trip Dispatcher
*   **Trip Manifest Management**: A workflow engine transitioning trips from `Draft` ➔ `Dispatched` ➔ `On Trip` ➔ `Completed`.
*   **Server-Enforced Logistics Rules**:
    *   *Resource Availability*: Prevents dispatch if the assigned vehicle is `In Shop` / `Retired` or the driver is `Offline` / `On Trip`.
    *   *Load Constraints*: Blocks dispatch if the cargo weight exceeds the vehicle's certified load limit.
    *   *Driver Qualifications*: Rejects dispatch if the driver's license has expired or their safety rating is critical.
    *   *Resource Sync*: Automatically sets vehicle and driver statuses to `On Trip` during dispatch, and returns them to `Available` upon completion.

### 8. Maintenance Management
*   Coordinates vehicle inspections, services (oil change, engine repairs, brake services), and scheduled work. Transitioning a vehicle to active maintenance locks it out of trip dispatches, automatically updating its registry status to `In Shop`. Costs are formatted in Indian Rupees (INR).

### 9. Fuel & Expense Logs
*   A ledger tracking odometer readings, refuel liters, stations, and trip associations. Validates that new fuel odometer inputs cannot be lower than the vehicle's last recorded odometer reading to ensure mileage accuracy. Tracks general expense categories like tolls, permits, fines, and insurance.

### 10. Analytics & Insights Dashboard
*   Replaced mock statistics with a unified `Promise.allSettled` parallel fetch. Calculates fleet utilization, operating cost summaries, and driver Safety Rankings.
*   **Custom SVG Charts**: Created responsive SVG charts (donut charts for fleet status and cost breakdowns, bar charts for trip distributions, and horizontal charts for fuel burn) that scale using dynamic viewbox calculations.

---

## 💻 Tech Stack & Architecture

### Frontend
*   **Framework**: React (Vite environment)
*   **Animations**: Framer Motion
*   **Icons**: Lucide React
*   **Styling**: Vanilla CSS (CSS variables, custom grid systems, and glassmorphism)
*   **Authentication**: Google OAuth SDK (`@react-oauth/google`)

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Token Handler**: JSON Web Tokens (JWT)
*   **Password Hashing**: BcryptJS
*   **Google OAuth validation**: Google Auth Library (`google-auth-library`)

### Database
*   **Engine**: MongoDB Atlas (NoSQL cloud data cluster)
*   **ODM**: Mongoose

### Infrastructure
*   **Frontend Host**: Vercel (configured with SPA rewrites to `/index.html`)
*   **Backend Host**: Render (configured with dynamic CORS origins matching `FRONTEND_URL`)

---

## ⚙️ Local Setup Instructions

### Prerequisites
*   Node.js (v18+)
*   npm
*   MongoDB connection string

### 1. Clone the Repository
```bash
git clone https://github.com/simraann27/TransitOps.git
cd TransitOps
```

### 2. Configure Backend
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Run the backend server:
```bash
cd backend
npm install
npm run dev
```

### 3. Configure Frontend
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Run the frontend dev server:
```bash
cd ../frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173`.

---

## 👤 Author
*   **Simran Tupe**
*   *Built with passion for the Odoo Hackathon 2026 and upgraded for production.*
