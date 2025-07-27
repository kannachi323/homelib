import { createContext } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContext {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  user: User | null;
  setUser: ( user: User | null) => void;
  authChecked: boolean;
  setAuthChecked: (authChecked: boolean) => void;
}

export const AuthContext = createContext<AuthContext | undefined>(undefined);