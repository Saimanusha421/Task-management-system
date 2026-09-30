# Task Management System (MERN Stack)

A full-stack Task Management System built for  Admins can manage employees, assign and monitor tasks; employees can view and update their assigned tasks. Email notifications are sent on task assignment and on status updates.

## Tech Stack

- **Frontend:** React 18 (Vite), React Router, Axios, hand-rolled responsive CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT with role-based access control (bcrypt-hashed passwords)
- **Email:** Nodemailer

## Features

- Separate Admin / Employee login (role validated against the account)
- Role-based access control on every protected API route
- **Admin:** view/create/deactivate employees, assign tasks with priority (High/Medium/Low), dashboard stats (Not Started / Pending-In Progress / Completed), searchable + paginated task table, delete/edit tasks
- **Employee:** view assigned tasks, update task status, searchable + paginated task table
- Email notification to the employee when a task is assigned, and to the admin when a task's status is updated
- Server-side and client-side form validation with clear error messages
- Centralized API error handling

## Project Structure

```
task-management-system/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── models/                   # User, Task (Mongoose schemas)
│   ├── middleware/                # auth (JWT + role check), error handler
│   ├── controllers/              # auth, admin, employee route logic
│   ├── routes/                   # /api/auth, /api/admin, /api/employee
│   ├── utils/                    # JWT helper, Nodemailer + email templates
│   ├── seed.js                   # creates the first Admin account
│   ├── server.js                 # app entry point
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js          # pre-configured Axios instance (JWT header)
    │   ├── context/AuthContext.jsx
    │   ├── components/           # Navbar, Badges, Pagination, modals, guards
    │   └── pages/                # Login, AdminDashboard, Employees, EmployeeDashboard
    └── .env.example
```

## Prerequisites

- Node.js 18+
- A MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster)
- An email account for sending notifications (Gmail + an [App Password](https://myaccount.google.com/apppasswords) is the easiest option; any SMTP provider works with `nodemailer.createTransport`)

## Setup & Run

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, EMAIL_USER, EMAIL_PASS, etc.

npm run seed   # creates the first Admin account (email/password from .env)
npm run dev    # starts the API on http://localhost:5000
```

> If `EMAIL_USER` / `EMAIL_PASS` are left blank, the app still works — emails are skipped with a console warning instead of failing the request.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# edit .env if your backend runs on a different URL

npm run dev    # starts the app on http://localhost:5173
```

### 3. Log in

- Go to `http://localhost:5173`, choose the **Admin** tab, and sign in with the credentials printed by `npm run seed` (defaults: `admin@xploreintellects.com` / `Admin@12345`).
- From the Admin dashboard, open **Manage Employees** to create employee accounts. Employees then log in from the **Employee** tab using those credentials.

## API Overview

| Method | Endpoint                          | Access         | Description                          |
|--------|------------------------------------|----------------|---------------------------------------|
| POST   | `/api/auth/login`                 | Public         | Login (admin or employee)             |
| GET    | `/api/auth/me`                    | Private        | Get current logged-in user            |
| GET    | `/api/admin/employees`            | Admin          | List employees                        |
| POST   | `/api/admin/employees`            | Admin          | Create employee account               |
| PUT    | `/api/admin/employees/:id/status` | Admin          | Activate / deactivate an employee     |
| GET    | `/api/admin/tasks`                | Admin          | List tasks (search, filter, paginate) |
| POST   | `/api/admin/tasks`                | Admin          | Assign a task (sends email)           |
| PUT    | `/api/admin/tasks/:id`            | Admin          | Update a task                         |
| DELETE | `/api/admin/tasks/:id`            | Admin          | Delete a task                         |
| GET    | `/api/admin/dashboard/stats`      | Admin          | Task statistics                       |
| GET    | `/api/employee/tasks`             | Employee       | List own tasks (search, filter, paginate) |
| PUT    | `/api/employee/tasks/:id/status`  | Employee       | Update task status (sends email)      |

All admin/employee routes require `Authorization: Bearer <token>`.

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for the full list. Sensitive values (DB connection string, email credentials, JWT secret) are always read from environment variables and never hard-coded.

## Notes on Design Choices

- **Role-aware login:** a single `/api/auth/login` endpoint is used, but the frontend sends the selected portal (`admin`/`employee`) and the backend rejects the login if it doesn't match the account's actual role — this keeps the Admin and Employee experiences cleanly separated while avoiding duplicated auth logic.
- **Email failures never block core actions:** `sendEmail()` catches its own errors so that task assignment / status updates always succeed even if SMTP credentials are missing or misconfigured during development/grading.
- **Search & pagination** are implemented server-side (MongoDB regex query + `skip`/`limit`) for both the Admin's all-tasks view and the Employee's own-tasks view.
