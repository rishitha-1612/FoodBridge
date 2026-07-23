# FoodBridge - Surplus Food Redistribution Network

FoodBridge is a surplus food redistribution platform that connects restaurants and food businesses with non-profit shelters and community kitchens. The platform coordinates food donations through volunteer pickup drivers, helping reduce food waste while ensuring surplus meals reach those in need.

---

# Key Features

## Role-Based Access Control

### Donor / Restaurant
- Post surplus food listings
- Specify food quantity, category, pickup address, expiry time, and special instructions
- Track donation status

### NGO Shelter
- Browse available food donations
- Accept donation claims
- Assign volunteer drivers for pickup and delivery

### Volunteer Driver
- View assigned delivery tasks
- Access pickup and delivery routes
- Update delivery status through each stage:
  - Pickup Assigned
  - Picked Up
  - Delivered
  - Completed

### Administrator
- Approve NGO registrations
- Manage user accounts
- Monitor all platform transactions
- View real-time platform analytics and impact statistics

---

## Secure Authentication

- JWT-based authentication
- Bcrypt password hashing
- Role-based authorization
- Secure session management
- Data isolation across all user roles

---

## Database

- SQLite relational database
- Persistent data storage
- Donation timeline tracking
- Activity history and audit logs

---

# Quick Start Guide

## Prerequisites

Before running the project, ensure the following are installed:

- **Node.js** v18.x or later
- **npm** v9.x or later

---

# Installation

## 1. Clone the Repository

```bash
git clone <your-repo-url>
cd foodbridge
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment Variables

Create a `.env` file in the project root (optional, defaults are provided):

```env
JWT_SECRET=your_jwt_secret_key_here
PORT=3000
```

---

# Running the Application

## Development Mode

Runs the Express backend with **tsx** and integrated **Vite** middleware for hot reloading.

```bash
npm run dev
```

Open your browser:

```
http://localhost:3000
```

---

## Production Build

Build the frontend using Vite and bundle the backend using ESBuild.

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm run start
```

---

## Type Checking

Run TypeScript diagnostics and linting:

```bash
npm run lint
```

---

# Default Administrator Account

Use the following credentials for the initial platform setup:

| Field | Value |
|--------|-------|
| **Email** | `admin@foodbridge.org` |
| **Password** | `admin123` |
| **Role** | Platform Administrator |

To create additional accounts (Restaurant, NGO, or Volunteer), click **Register** from the application's navigation bar.

---

# Tech Stack

## Frontend

- React 19
- TypeScript
- Tailwind CSS v4
- Lucide Icons
- Recharts
- Motion

## Backend

- Node.js
- Express
- JWT Authentication
- BcryptJS

## Database

- SQLite
- sql.js (disk persistence)

## Build Tools

- Vite
- ESBuild

---

# Project Highlights

- Multi-role authentication system
- Secure JWT authorization
- Food donation lifecycle management
- Volunteer delivery tracking
- NGO approval workflow
- Real-time analytics dashboard
- SQLite persistent storage
- Responsive React interface
