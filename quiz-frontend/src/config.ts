// Configuration for API endpoints
const isDevelopment = process.env.NODE_ENV === 'development';

// Development: localhost backend
// Production: your deployed backend URL
export const API_BASE = isDevelopment 
  ? 'https://quiz-learning-platform-fcld.onrender.com/api'
  : 'https://quiz-learning-platform-fcld.onrender.com/api'; // Replace xxxx with your actual Render backend name

export const AUTH_BASE = isDevelopment
  ? 'https://quiz-learning-platform-fcld.onrender.com/auth'
  : 'https://quiz-learning-platform-fcld.onrender.com/auth'; // Replace xxxx with your actual Render backend name

// Google OAuth callback URLs
export const GOOGLE_CALLBACK_URL = isDevelopment
  ? 'http://localhost:3000/chapters'
  : 'https://quiz-learning-platform-qca72potw-navaneeth8056s-projects.vercel.app/'; // Replace xxxx with your actual Vercel frontend name 