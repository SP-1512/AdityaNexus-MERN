# AdityaNexus — MERN Stack Admission Portal

Full-stack MERN app with Gemini AI, JWT Auth, and MongoDB Atlas.

## Tech Stack
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas (Mongoose)
- **Auth**: JWT + bcryptjs
- **AI**: Google Gemini 2.0 Flash

## Quick Start

### 1. Install all dependencies
```bash
npm run install-all
```

### 2. Run both servers (in one terminal)
```bash
npm run dev
```

- Frontend → http://localhost:3000
- Backend  → http://localhost:5000

### 3. Seed the admin account (first time only)
Open your browser and go to:
```
http://localhost:3000
```
Click **"Sign In"** → Click **"Create Default Admin Account"**

Then login with:
- **Admin**: admin@aditya.edu / admin123
- **Student**: Register a new account

## Environment Variables

### server/.env
```
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

### client/.env
```
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET  | /api/auth/me | Get current user |
| POST | /api/auth/seed-admin | Create default admin |
| GET  | /api/admissions | Get admissions (role-based) |
| POST | /api/admissions | Submit new application |
| PUT  | /api/admissions/:id | Update application (admin) |
| DELETE | /api/admissions/:id | Delete application (admin) |
| POST | /api/ai/analyze | AI eligibility analysis |
| POST | /api/ai/summarize | AI batch summary |
