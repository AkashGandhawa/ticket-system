/**
 * Centralized API configuration.
 * In development, it defaults to http://localhost:5000.
 * In production, it uses the NEXT_PUBLIC_API_URL environment variable.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Export common API endpoints to avoid hardcoding strings across the app
export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_URL}/api/auth/login`,
    REGISTER: `${API_URL}/api/auth/register`,
    ME: `${API_URL}/api/auth/me`,
  },
  TICKETS: `${API_URL}/api/tickets`,
  USERS: `${API_URL}/api/users`,
  CATEGORIES: `${API_URL}/api/categories`,
  MESSAGES: `${API_URL}/api/messages`,
  UPLOADS: `${API_URL}/api/uploads`,
};
