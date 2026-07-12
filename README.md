
# TransitOps
Smart Fleet Operations & Logistics Management Platform

## Overview
Explain that TransitOps is a full-stack fleet operations platform designed to centralize vehicle management, driver safety, trip dispatch, maintenance, operational expenses, and analytics.

## Key Features
- Secure login and persistent authentication
- Role-Based Access Control (RBAC)
- Fleet Registry with vehicle CRUD
- Driver and Safety Profile Management
- Driver eligibility and license expiry validation
- Trip Dispatcher and trip lifecycle management
- Cargo overload protection
- Vehicle and driver availability validation
- Cross-module vehicle/driver status synchronization
- Maintenance Management
- Fuel and Expense Tracking
- Odometer validation
- Operational Cost Analytics
- Real-time dashboard metrics
- Custom SVG analytics charts
- Responsive mobile interface
- Product Tour / Video Tour

## User Roles

### Fleet Manager
Dashboard, Fleet, Drivers, Trips, Maintenance and Analytics.

### Dispatcher
Dashboard, Fleet View and Trip Dispatch Management.

### Safety Officer
Dashboard, Driver Safety, Maintenance and Trips View.

### Financial Analyst
Dashboard, Fleet View, Fuel & Expenses and Analytics.

## Tech Stack

Frontend:
- React
- Vite
- React Router
- Vanilla CSS
- Framer Motion
- Lucide React

Backend:
- Node.js
- Express.js
- MongoDB
- Mongoose

## Core Business Validations
Explain:
- unavailable vehicles cannot be dispatched
- unavailable or expired-license drivers cannot be dispatched
- cargo cannot exceed vehicle capacity
- maintenance vehicles are removed from trip availability
- trip lifecycle automatically synchronizes driver and vehicle status
- fuel odometer cannot be below the vehicle odometer
- trip and vehicle associations are validated

## Application Modules
1. Landing Page
2. Authentication & RBAC
3. Dashboard
4. Fleet Registry
5. Drivers & Safety Profiles
6. Trip Dispatcher
7. Maintenance Management
8. Fuel & Expense Management
9. Analytics & Operational Insights

## Local Setup

Frontend:
npm install
npm run dev

Backend:
npm install
npm run dev

Mention environment variables:
VITE_API_URL
MONGO_URI
PORT

Do not expose real environment variable secrets.

## Demo Access
Explain that the current hackathon demo authentication accepts a valid email, password minimum 6 characters, and selected operational role.

Clearly mention:
Demo authentication is intended for project demonstration. Production deployment should use backend authentication, password hashing, JWT/session validation and database-backed user accounts.

## Future Scope
- GPS and live vehicle tracking
- Route optimization
- Predictive maintenance
- Driver mobile application
- Notifications
- AI-powered fleet insights

