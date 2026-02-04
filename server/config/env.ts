/**
 * Environment Variables Configuration
 * تحميل المتغيرات من متغيرات البيئة (Vercel/GitHub)
 */

export const env = {
  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI || '',
  
  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  // Google OAuth callback URL
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || `${process.env.VITE_API_URL || 'https://twtc-mining.vercel.app'}/api/auth/google/callback`,
  
  // Session
  SESSION_SECRET: process.env.SESSION_SECRET || 'twtc_secret',
  
  // App
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:5000',
  APP_URL: process.env.APP_URL || process.env.VITE_API_URL || 'http://localhost:5173',
  
  // Email Service (optional for MVP)
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
};

/**
 * التحقق من المتغيرات الحرجة
 */
export function validateEnv() {
  const required = ['MONGODB_URI', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
  const missing = required.filter(key => !env[key as keyof typeof env]);
  
  if (missing.length > 0) {
    console.warn('⚠️  Missing environment variables:', missing);
    console.warn('ℹ️  These variables should be set in Vercel or GitHub Secrets');
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
  
  return true;
}

export default env;
