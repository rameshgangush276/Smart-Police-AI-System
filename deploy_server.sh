#!/bin/bash
# Production Server Deployment Script

# Exit on error
set -e

echo "Starting Server Deployment..."

# 1. Update system and install dependencies if needed
# sudo apt-get update && sudo apt-get install -y nodejs npm postgresql

# 2. Navigate to backend
cd backend

# 3. Install dependencies
echo "Installing Node.js dependencies..."
npm install --production

# 4. Build the project
echo "Building the project..."
npm run build

# 5. Database Setup (Prisma)
echo "Running database migrations..."
# Ensure DATABASE_URL is set in environment or .env
npx prisma migrate deploy

# 6. Start/Restart Server with PM2
echo "Starting server with PM2..."
if pm2 list | grep -q "smart-police-backend"; then
    pm2 restart smart-police-backend
else
    pm2 start dist/index.js --name "smart-police-backend" --env production
fi

echo "Deployment Successful!"
