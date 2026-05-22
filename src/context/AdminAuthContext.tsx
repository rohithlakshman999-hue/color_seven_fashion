"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

const AUTH_KEY = "colour_seven_admin_auth";
const AUTH_EXPIRY_HOURS = 24;

// Default admin credentials — change these for production
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "colour7admin";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

function getStoredAuth(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return false;
  try {
    const { expiresAt } = JSON.parse(raw);
    if (new Date(expiresAt) > new Date()) return true;
    localStorage.removeItem(AUTH_KEY);
    return false;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return false;
  }
}

function setStoredAuth() {
  if (typeof window === "undefined") return;
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + AUTH_EXPIRY_HOURS);
  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({ authenticated: true, expiresAt: expiresAt.toISOString() })
  );
}

function clearStoredAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsAuthenticated(getStoredAuth());
    setIsLoading(false);
  }, []);

  const login = useCallback((username: string, password: string): boolean => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setStoredAuth();
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setIsAuthenticated(false);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
