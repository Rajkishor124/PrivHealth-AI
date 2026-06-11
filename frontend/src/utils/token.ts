const TOKEN_KEY = 'privhealth_token';

// XSS tradeoff: localStorage is accessible to any JS on the page.
// Acceptable for this project; in production, consider httpOnly cookies
// with a BFF (backend-for-frontend) pattern.

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);
