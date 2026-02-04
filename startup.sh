#!/bin/bash

# Project TWTC - Startup Script

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         🚀 TWTC Mining App - Referral System              ║"
echo "║              MongoDB + Express + React + Vite              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📋 Copy .env.example to .env and configure it:"
    echo "   cp .env.example .env"
    echo ""
    echo "Then set your MongoDB URI and Google OAuth credentials:"
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🗄️  MongoDB Connection Status:"
node -e "
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;
if (!uri) {
    console.log('❌ MONGODB_URI not set in .env');
    process.exit(1);
}
console.log('✅ MONGODB_URI configured');
" || exit 1

echo ""
echo "🔧 Build Configuration:"
echo "  📁 Frontend: Vite + React"
echo "  ⚙️  Backend: Express + Node.js"
echo "  🗄️  Database: MongoDB"
echo "  🔐 Auth: Google OAuth 2.0"
echo ""

echo "📚 Available Commands:"
echo "  npm run dev          - Start development server (with Vite)"
echo "  npm run build        - Build for production"
echo "  npm run preview      - Preview production build"
echo "  npm run test         - Run tests"
echo ""

echo "🌐 API Endpoints (after starting):"
echo "  Health Check:     http://localhost:5000/api/health"
echo "  Referral Me:      http://localhost:5000/api/referral/me"
echo "  Referral Stats:   http://localhost:5000/api/referral/stats"
echo ""

echo "📖 Documentation:"
echo "  START_HERE_AR.md              - شروع هنا (بدء سريع)"
echo "  REFERRAL_SYSTEM.md            - الدليل الشامل"
echo "  REFERRAL_QUICK_START.md       - أمثلة عملية"
echo ""

echo "🚀 Starting the application..."
echo ""

# Start the development server
npm run dev
