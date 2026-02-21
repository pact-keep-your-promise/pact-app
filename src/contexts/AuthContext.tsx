import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, setToken, getToken, clearToken } from '../api/client';
import { User } from '../data/types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    (async () => {
      try {
        const existingToken = await getToken();
        if (existingToken) {
          setTokenState(existingToken);
          const me = await api.get<User>('/auth/me');
          setUser(me);
        }
      } catch {
        await clearToken();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    await setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
  };

  const register = async (name: string, username: string, email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>('/auth/register', { name, username, email, password });
    await setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
  };

  const logout = async () => {
    await clearToken();
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
