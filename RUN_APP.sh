#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         🚀 TWTC Mining App - Startup                      ║"
echo "║          مع نظام الإحالات والـ MongoDB                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"
echo ""

# Check .env
if [ ! -f .env ]; then
    echo "⚠️  .env file not found"
    echo "📋 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env created"
    echo ""
    echo "📝 Please update .env with your credentials:"
    echo "   - MONGODB_URI"
    echo "   - GOOGLE_CLIENT_ID"
    echo "   - GOOGLE_CLIENT_SECRET"
    echo ""
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Show startup info
echo "🌐 Application Info:"
echo "  Frontend: http://localhost:5000"
echo "  API: http://localhost:5000/api"
echo "  Health: http://localhost:5000/api/health"
echo ""

echo "📚 Quick Links:"
echo "  📄 START_HERE_AR.md - شروع هنا"
echo "  📄 VERCEL_SETUP.md - إعداد Vercel"
echo "  📄 REFERRAL_SYSTEM.md - نظام الإحالات"
echo ""

echo "🚀 Starting application..."
echo ""

npm run dev

