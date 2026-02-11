# Deployment Guide for AWS EC2 with PM2

This guide outlines the steps to deploy the **Skill Compass Server** on an AWS EC2 instance using PM2.

## 1. Prerequisites

- AWS EC2 Instance (Ubuntu recommended)
- Node.js installed (v18+ recommended)
- PM2 installed globally: `npm install -g pm2`
- PostreSQL database (RDS or local)

## 2. Server Setup

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd skill-compass-server
   ```

2. **Install dependencies:**

   ```bash
   npm install --production
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and fill in the production values.

   ```bash
   cp .env.example .env
   nano .env
   ```

   *Make sure to set `NODE_ENV=production` and update database credentials.*

4. **Build the project:**

   ```bash
   npm run build
   ```

## 3. Running with PM2

We have configured an `ecosystem.config.cjs` file to manage the application.

- **Start the application:**

  ```bash
  npm run pm2:start
  ```

- **Check status:**

  ```bash
  pm2 status
  ```

- **View logs:**

  ```bash
  npm run pm2:logs
  ```

- **Restart application:**

  ```bash
  npm run pm2:restart
  ```

- **Stop application:**

  ```bash
  npm run pm2:stop
  ```

## 4. Enable Startup Persistence

To ensure the application starts automatically after a server reboot:

```bash
pm2 save
pm2 startup
```

*Follow the instructions output by the `pm2 startup` command.*

## 5. Reverse Proxy (Optional but Recommended)

It is highly recommended to use **Nginx** as a reverse proxy to handle SSL and port 80/443 mapping.

Example Nginx config (`/etc/nginx/sites-available/default`):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5003; # Match your PORT in .env
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
