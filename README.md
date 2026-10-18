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

## Multilingual Support Chat

The chat widget uses the local fine-tuned classifier in `foodbridge_model/` through a separate FastAPI service. Keep that model folder on the machine running the service; it is intentionally excluded from Git because the weights are about 711 MB.

In a second terminal, from the repository root, install and start the Python service:

```powershell
py -3.10 -m venv chatbot_service/.venv
chatbot_service/.venv/Scripts/python -m pip install -r chatbot_service/requirements.txt
chatbot_service/.venv/Scripts/python -m uvicorn main:app --app-dir chatbot_service --host 127.0.0.1 --port 8000
```

In another terminal, install and start FoodBridge as usual:

```powershell
npm install
npm run dev
```

The React widget calls `POST /api/chatbot` on Express. Express calls the internal Python endpoint `POST http://127.0.0.1:8000/predict`; Python health is at `GET http://127.0.0.1:8000/health`. Set `CHATBOT_SERVICE_URL` for a different internal service address. Set `FOODBRIDGE_MODEL_DIR` to override the local model folder and `CHATBOT_CONFIDENCE_THRESHOLD` to tune the fallback threshold (default `0.55`). Chat language is explicitly selected as `en`, `hi`, or `kn`; the model does not detect language. Public FAQ chat is unauthenticated. Donation history and delivery status require a valid FoodBridge JWT and are filtered by the logged-in user's role and ID.

The checked-in model evaluation reports 49.2% overall accuracy, 0.098 macro F1, and 33.3% Hindi accuracy. Low confidence predictions receive a safe fallback, so responses may often be generic. The classifier does not generate prose; reviewed language templates provide the answers. Hosting should allow Python 3.10+, sufficient memory for the 711 MB weights plus the model runtime, and local network access from Express to FastAPI. Keep the FastAPI port private to the application host/network.

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
