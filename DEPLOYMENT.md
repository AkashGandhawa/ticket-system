# Deployment Guide 🚀

This guide explains how to deploy the IT Help Desk Ticketing System for free using **Neon**, **Render**, and **Vercel**.

## 1. Database (PostgreSQL) - [Neon](https://neon.tech/)

Neon offers a generous free tier for serverless PostgreSQL.

1.  Create an account on [Neon.tech](https://neon.tech/).
2.  Create a new project named `helpdesk`.
3.  Copy the **Connection String** (it should look like `postgresql://user:password@host/dbname?sslmode=require`).
4.  **Important**: Add `?sslmode=require` if it's not already there.

## 2. Backend (Express.js) - [Render](https://render.com/)

Render's free tier is perfect for small web services.

1.  Create an account on [Render.com](https://render.com/).
2.  Click **New +** > **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the service:
    - **Name**: `it-helpdesk-backend`
    - **Root Directory**: `backend`
    - **Environment**: `Node`
    - **Build Command**: `npm install && npx prisma generate && npm run build`
    - **Start Command**: `npm start`
5.  Add **Environment Variables**:
    - `DATABASE_URL`: (Paste your Neon connection string)
    - `FRONTEND_URL`: `https://your-frontend-app.vercel.app` (You'll get this after the next step)
    - `PORT`: `5000`
6.  Deploy! Render will provide a URL like `https://it-helpdesk-backend.onrender.com`.

## 3. Frontend (Next.js) - [Vercel](https://vercel.com/)

Vercel is the best place to host Next.js apps.

1.  Create an account on [Vercel.com](https://vercel.com/).
2.  Click **Add New** > **Project**.
3.  Import your GitHub repository.
4.  Configure the project:
    - **Framework Preset**: `Next.js`
    - **Root Directory**: `frontend`
5.  Add **Environment Variables**:
    - `NEXT_PUBLIC_API_URL`: `https://it-helpdesk-backend.onrender.com` (Your Render URL)
6.  Click **Deploy**.

---

## 🔄 CI/CD Pipeline

The project includes a GitHub Actions workflow in `.github/workflows/ci.yml`. 

- **Automated Builds**: Every time you push to `main` or create a Pull Request, GitHub will automatically check if both the frontend and backend build correctly.
- **Continuous Deployment**: 
    - **Render** will automatically re-deploy your backend when you push to `main`.
    - **Vercel** will automatically re-deploy your frontend when you push to `main`.

## 📝 Important Notes

- **Spin-up Time**: Render's free tier "sleeps" after 15 minutes of inactivity. The first request might take ~30 seconds to wake up the server.
- **CORS**: Ensure the `FRONTEND_URL` in Render matches your actual Vercel deployment URL exactly.
