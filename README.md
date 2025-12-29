# Noted - Task Management App

Full-stack task management application with React frontend and Express backend, deployed on Render.

[![CI](https://github.com/james-truong/task-manager-monorepo/workflows/CI/badge.svg)](https://github.com/james-truong/task-manager-monorepo/actions/workflows/ci.yml)
[![CodeQL](https://github.com/james-truong/task-manager-monorepo/workflows/CodeQL%20Security%20Analysis/badge.svg)](https://github.com/james-truong/task-manager-monorepo/actions/workflows/codeql.yml)
[![codecov](https://codecov.io/gh/james-truong/task-manager-monorepo/branch/main/graph/badge.svg)](https://codecov.io/gh/james-truong/task-manager-monorepo)

## Project Structure

```
task-manager-monorepo/
├── backend/          # Express.js REST API with MongoDB
│   ├── api/          # Vercel serverless entry point
│   └── src/          # Express application code
└── frontend/         # React 19 + Vite application
    └── src/          # React components and services
```

## Features

- ✅ User authentication (JWT-based)
- ✅ Task CRUD operations
- ✅ Task filtering and search
- ✅ Sorting by date, priority, name
- ✅ Dark mode with localStorage persistence
- ✅ User profile with statistics
- ✅ Responsive design with animations

## Tech Stack

**Frontend:**
- React 19
- React Router v7
- Vite
- CSS with dark mode

**Backend:**
- Express.js 5
- MongoDB + Mongoose
- JWT Authentication
- bcrypt password hashing
- Rate limiting & CORS

**Deployment:**
- Vercel (frontend + backend)
- MongoDB Atlas (database)

## Development Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend** (`backend/.env`):
```bash
PORT=3000
MONGODB_URL=mongodb://localhost:27017/task-manager
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:5173
```

**Frontend** (already configured in `.env.development`):
```bash
VITE_API_URL=http://localhost:3000
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Visit http://localhost:5173 to see the app!

## Deployment to Vercel

### Prerequisites
1. MongoDB Atlas account with cluster created
2. GitHub account
3. Vercel account

### Steps

1. **Push to GitHub:**
```bash
git add .
git commit -m "Initial monorepo setup"
git push -u origin main
```

2. **Import to Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel auto-detects `vercel.json` configuration

3. **Add Environment Variables in Vercel:**
   - Go to Settings → Environment Variables
   - Add the following:
     - `MONGODB_URL`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: Random 32-character hex string
     - `FRONTEND_URL`: Auto-set by Vercel
     - `NODE_ENV`: `production`

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## API Endpoints

Backend API is available at `/api/*` in production:

**Authentication:**
- `POST /api/users/signup` - Create account
- `POST /api/users/login` - Login
- `POST /api/users/logout` - Logout
- `GET /api/users/me` - Get profile

**Tasks:**
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get single task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Architecture

### Development
```
Frontend (localhost:5173)
    ↓ HTTP requests
Backend (localhost:3000)
    ↓ MongoDB queries
MongoDB (localhost:27017)
```

### Production (Vercel)
```
User Browser
    ↓
Vercel (https://your-app.vercel.app)
    ├─ Frontend (React static files)
    └─ /api/* routes → Backend (Serverless functions)
            ↓
        MongoDB Atlas
```

## Key Files

- `vercel.json` - Vercel configuration (routing, builds)
- `backend/api/index.js` - Serverless entry point
- `backend/src/index.js` - Express app (exports for serverless)
- `frontend/src/services/api.js` - API client

## Scripts

**Backend:**
- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server

**Frontend:**
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Troubleshooting

### "Cannot connect to MongoDB"
- Check `MONGODB_URL` in Vercel environment variables
- Verify MongoDB Atlas IP whitelist allows `0.0.0.0/0`
- Confirm user has correct permissions

### "API returns 404"
- Verify `vercel.json` routes are correct
- Check backend deployed in Vercel Functions tab
- Confirm API URL is `/api` in production

### "CORS error"
- Verify `FRONTEND_URL` environment variable
- Check CORS config in `backend/src/index.js`

## MongoDB Atlas Setup

1. Create cluster at https://cloud.mongodb.com/
2. Create database user
3. Add IP whitelist: `0.0.0.0/0` (allow all)
4. Get connection string
5. Add to Vercel environment variables

## License

MIT

## Author

James Truong
