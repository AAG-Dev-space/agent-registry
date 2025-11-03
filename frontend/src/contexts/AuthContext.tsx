import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Use /api for Docker deployment (proxied by nginx)
// Set VITE_API_URL environment variable for different backends
const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

interface User {
  username: string;
  email: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      setToken(savedToken);
      fetchCurrentUser(savedToken);
    }
  }, []);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      // Token might be invalid, clear it
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password,
      });

      const { access_token } = response.data;
      setToken(access_token);
      localStorage.setItem('auth_token', access_token);

      // Fetch user info
      await fetchCurrentUser(access_token);
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid username or password');
      }
      throw new Error('Login failed. Please try again.');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
