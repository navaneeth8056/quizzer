// Configuration for API endpoints
const isDevelopment = process.env.NODE_ENV === 'development';

// Development: localhost backend
// Production: your deployed backend URL
export const API_BASE = isDevelopment 
  ? 'https://quizzer-1yvr.onrender.com/api'
  : 'https://quizzer-1yvr.onrender.com/api'; // Replace xxxx with your actual Render backend name

export const AUTH_BASE = isDevelopment
  ? 'https://quizzer-1yvr.onrender.com/auth'
  : 'https://quizzer-1yvr.onrender.com/auth'; // Replace xxxx with your actual Render backend name

// Google OAuth callback URLs
export const GOOGLE_CALLBACK_URL = isDevelopment
  ? 'https://quizzer-1-t6j1.onrender.com/auth/google/callback'
  : 'https://quizzer-1-t6j1.onrender.com/auth/google/callback'; // Replace xxxx with your actual Vercel frontend name 