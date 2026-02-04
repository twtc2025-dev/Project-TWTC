#!/bin/bash

# 🔍 TWTC Referral System - Configuration Checker
# يتحقق من جميع الإعدادات المطلوبة

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔍 TWTC Referral System - Configuration Checker           ║"
echo "║     التحقق من إعدادات نظام الإحالات                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ISSUES=0

# ========================================
# 1. فحص Node.js و npm
# ========================================
echo "📋 فحص البيئة..."
echo ""

if command -v node &> /dev/null; then
    echo -e "${GREEN}✅${NC} Node.js: $(node -v)"
else
    echo -e "${RED}❌${NC} Node.js: غير مثبت"
    ISSUES=$((ISSUES + 1))
fi

if command -v npm &> /dev/null; then
    echo -e "${GREEN}✅${NC} npm: $(npm -v)"
else
    echo -e "${RED}❌${NC} npm: غير مثبت"
    ISSUES=$((ISSUES + 1))
fi

echo ""

# ========================================
# 2. فحص الملفات المهمة
# ========================================
echo "📁 فحص الملفات الأساسية..."
echo ""

FILES=(
    "package.json"
    ".env.example"
    "api/server.ts"
    "api/config/env.ts"
    "api/lib/mongodb.ts"
    "api/routes/referral.ts"
    "api/services/referralBackendService.ts"
    "src/components/referral-section.tsx"
    "src/services/referralService.ts"
    "vite.config.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${RED}❌${NC} $file: مفقود"
        ISSUES=$((ISSUES + 1))
    fi
done

echo ""

# ========================================
# 3. فحص ملف .env
# ========================================
echo "🔐 فحص متغيرات البيئة..."
echo ""

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️${NC} .env: غير موجود"
    echo "📝 إنشاء من .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅${NC} تم إنشاء .env"
    fi
else
    echo -e "${GREEN}✅${NC} .env: موجود"
fi

# فحص المتغيرات
echo ""
echo "📊 فحص محتوى .env:"

if grep -q "MONGODB_URI=" .env; then
    MONGODB_VALUE=$(grep "MONGODB_URI=" .env | cut -d'=' -f2)
    if [[ "$MONGODB_VALUE" != "mongodb+srv://username:password"* ]] && [[ "$MONGODB_VALUE" != "" ]]; then
        echo -e "${GREEN}✅${NC} MONGODB_URI: مُعدّ"
    else
        echo -e "${YELLOW}⚠️${NC} MONGODB_URI: يحتاج تحديث"
    fi
else
    echo -e "${RED}❌${NC} MONGODB_URI: مفقود من .env"
    ISSUES=$((ISSUES + 1))
fi

if grep -q "GOOGLE_CLIENT_ID=" .env; then
    GOOGLE_ID=$(grep "GOOGLE_CLIENT_ID=" .env | cut -d'=' -f2)
    if [[ "$GOOGLE_ID" != "your_google_client_id"* ]] && [[ "$GOOGLE_ID" != "" ]]; then
        echo -e "${GREEN}✅${NC} GOOGLE_CLIENT_ID: مُعدّ"
    else
        echo -e "${YELLOW}⚠️${NC} GOOGLE_CLIENT_ID: يحتاج تحديث"
    fi
else
    echo -e "${RED}❌${NC} GOOGLE_CLIENT_ID: مفقود من .env"
    ISSUES=$((ISSUES + 1))
fi

if grep -q "GOOGLE_CLIENT_SECRET=" .env; then
    echo -e "${GREEN}✅${NC} GOOGLE_CLIENT_SECRET: مُعدّ"
else
    echo -e "${RED}❌${NC} GOOGLE_CLIENT_SECRET: مفقود من .env"
    ISSUES=$((ISSUES + 1))
fi

if grep -q "SESSION_SECRET=" .env; then
    echo -e "${GREEN}✅${NC} SESSION_SECRET: مُعدّ"
else
    echo -e "${RED}❌${NC} SESSION_SECRET: مفقود من .env"
    ISSUES=$((ISSUES + 1))
fi

echo ""

# ========================================
# 4. فحص node_modules
# ========================================
echo "📦 فحص المتطلبات المثبتة..."
echo ""

if [ -d "node_modules" ]; then
    COUNT=$(ls -1 node_modules | wc -l)
    echo -e "${GREEN}✅${NC} node_modules: موجود ($COUNT package)"
else
    echo -e "${YELLOW}⚠️${NC} node_modules: غير موجود"
    echo "💡 تشغيل: npm install"
fi

echo ""

# ========================================
# 5. فحص TypeScript
# ========================================
echo "🔤 فحص TypeScript..."
echo ""

if [ -f "tsconfig.json" ]; then
    echo -e "${GREEN}✅${NC} tsconfig.json: موجود"
else
    echo -e "${RED}❌${NC} tsconfig.json: مفقود"
    ISSUES=$((ISSUES + 1))
fi

echo ""

# ========================================
# 6. فحص قاعدة البيانات
# ========================================
echo "🗄️  فحص قاعدة البيانات..."
echo ""

if grep -q "User Schema" api/lib/mongodb.ts; then
    echo -e "${GREEN}✅${NC} User Schema: معرّف"
else
    echo -e "${RED}❌${NC} User Schema: غير معرّف"
fi

if grep -q "Referral Schema" api/lib/mongodb.ts; then
    echo -e "${GREEN}✅${NC} Referral Schema: معرّف"
else
    echo -e "${RED}❌${NC} Referral Schema: غير معرّف"
fi

echo ""

# ========================================
# 7. ملخص النتائج
# ========================================
echo "════════════════════════════════════════════════════════════"
echo ""

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ كل شيء جاهز!${NC}"
    echo ""
    echo "🚀 للبدء:"
    echo "   npm install"
    echo "   npm run dev"
    echo ""
    echo "🌐 ثم افتح: http://localhost:5000"
else
    echo -e "${RED}⚠️  $ISSUES مشاكل تحتاج إلى إصلاح${NC}"
    echo ""
    echo "💡 الخطوات المقترحة:"
    echo "   1. تحديث .env بقيم حقيقية"
    echo "   2. تشغيل: npm install"
    echo "   3. التحقق من اتصال MongoDB"
    echo "   4. التحقق من Google OAuth credentials"
fi

echo ""
echo "📚 المستندات:"
echo "   - QUICK_SETUP.md: إعداد سريع"
echo "   - VERCEL_ENV_SETUP.md: ربط Vercel"
echo "   - REFERRAL_SYSTEM.md: التوثيق الكامل"
echo ""
