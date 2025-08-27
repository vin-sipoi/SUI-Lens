/**
 * Utility functions for sessionStorage operations with type safety and error handling
 */

// Storage keys
export const STORAGE_KEYS = {
  AUTH_SESSION: 'auth_session',
  EVENTS_CACHE: 'events_cache',
  DASHBOARD_PREFS: 'dashboard_prefs',
} as const;

// Types for stored data
export interface AuthSessionData {
  jwt: string;
  user: {
    email?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    name?: string;
  };
  timestamp: number;
}

export interface EventsCacheData {
  events: any[];
  timestamp: number;
}

export interface DashboardPreferences {
  showUpcoming: boolean;
  regShowUpcoming: boolean;
}

/**
 * Safe sessionStorage getter with error handling
 */
export const getSessionStorage = <T>(key: string): T | null => {
  try {
    if (typeof window === 'undefined') return null;
    
    const item = window.sessionStorage.getItem(key);
    if (!item) return null;
    
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from sessionStorage (key: ${key}):`, error);
    return null;
  }
};

/**
 * Safe sessionStorage setter with error handling
 */
export const setSessionStorage = <T>(key: string, value: T): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    
    window.sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to sessionStorage (key: ${key}):`, error);
    return false;
  }
};

/**
 * Safe sessionStorage remover with error handling
 */
export const removeSessionStorage = (key: string): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    
    window.sessionStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from sessionStorage (key: ${key}):`, error);
    return false;
  }
};

/**
 * Check if cached data is still valid based on TTL (time-to-live in milliseconds)
 */
export const isCacheValid = (timestamp: number, ttl: number = 5 * 60 * 1000): boolean => {
  return Date.now() - timestamp < ttl;
};

/**
 * Clear all sessionStorage data (useful for logout)
 */
export const clearSessionStorage = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    
    window.sessionStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing sessionStorage:', error);
    return false;
  }
};
