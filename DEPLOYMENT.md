# Deployment Guide 🚀 (Ultra-Low Cost & Risk-Free)

This guide explains how to deploy the IT Help Desk Ticketing System for free, securely, and with zero cold-starts using **Neon**, **AWS EC2**, and **Cloudflare Pages**.

## 1. Database (PostgreSQL) - [Neon](https://neon.tech/)

Neon offers a generous free tier for serverless PostgreSQL with hard caps, guaranteeing no surprise bills.

1. Create an account on [Neon.tech](https://neon.tech/).
2. Create a new project named `helpdesk`.
3. Copy the **Connection String** (`postgresql://user:password@host/dbname?sslmode=require`).
4. Keep this safe; you'll need it for the backend.

## 2. Backend (Express.js) - [AWS EC2 Free Tier]

We use a free tier AWS EC2 virtual machine so the backend runs 24/7 without sleeping.

### Step 2.1: Launch the Server
1. Go to the AWS Console and search for **EC2**.
2. Click **Launch Instances**.
3. **Name:** `it-helpdesk-backend`
4. **OS:** Select **Ubuntu** (Make sure it says "Free tier eligible", usually Ubuntu 24.04 or 22.04 LTS).
5. **Instance Type:** Select **t2.micro** or **t3.micro** (Free tier eligible).
6. **Key Pair:** Click "Create new key pair", name it `backend-key`, set it to `.pem` format, and download it safely to your computer.
7. **Network Settings:** Check the boxes for **Allow HTTPS traffic from the internet** and **Allow HTTP traffic from the internet**. Click **Edit**, Add a Custom TCP rule for Port **5000** (Anywhere `0.0.0.0/0`).
8. Click **Launch Instance**.

### Step 2.2: Setup the Server
1. SSH into your server using your terminal:
   `ssh -i "backend-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP`
2. Run these commands to install Node.js and PM2:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   sudo npm install -g typescript ts-node
   ```
3. Clone your GitHub repository and setup the backend:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ticket-system.git
   cd ticket-system/backend
   npm install
   npx prisma generate
   npm run build
   ```
4. Create the `.env` file (`nano .env`) and add your database URL:
   `DATABASE_URL="your-neon-postgres-url"`
5. Start the backend continuously:
   ```bash
   pm2 start dist/src/index.js --name "helpdesk-backend"
   pm2 save
   pm2 startup
   ```

## 3. Frontend (Next.js) - [Cloudflare Pages]

Cloudflare Pages provides a lightning-fast, 100% free edge network for your frontend.

1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com/), navigate to **Workers & Pages**.
2. Click **Create** > **Pages** > **Connect to Git**.
3. Select this GitHub repository.
4. **Framework preset:** Select `Next.js`.
5. **Root directory:** `frontend`
6. Expand **Environment variables (advanced)** and add:
   - Variable name: `NEXT_PUBLIC_API_URL`
   - Value: `http://YOUR_EC2_PUBLIC_IP:5000` (Use HTTPS here if you add an SSL certificate to your backend later).
7. Click **Save and Deploy**. 

---

## 🔄 CI/CD Pipeline (GitHub Actions)

The project includes continuous integration and deployment located in `.github/workflows/ci.yml`. 

**Automated Deployments:**
- **Frontend**: Cloudflare automatically detects pushes to `main` and re-deploys instantly.
- **Backend**: We use GitHub actions to SSH into your EC2 server to pull new changes automatically.

### Required GitHub Secrets for backend CI/CD:
Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**:
1. `EC2_HOST`: The public IP address of your AWS EC2 instance.
2. `EC2_USERNAME`: `ubuntu`
3. `EC2_SSH_KEY`: The entire contents of your downloaded `.pem` file from AWS.
