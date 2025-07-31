// useAuthStore.ts
import { create } from 'zustand';
import { useClientStore } from './useClientStore';

export type User = {
  id: string;
  name: string;
  email: string;
};

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  authChecked: boolean;
  setIsAuthenticated: (val: boolean) => void;
  setUser: (user: User | null) => void;
  setAuthChecked: (val: boolean) => void;
  checkUser: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  authChecked: false,

  setIsAuthenticated: (val) => set({ isAuthenticated: val }),
  setUser: (user) => set({ user }),
  setAuthChecked: (val) => set({ authChecked: val }),

  checkUser: async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/user`, {
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        const user: User = {
          id: data.userID,
          name: data.name,
          email: data.email,
        };
        set({
          isAuthenticated: true,
          user,
        });
      } else {
        set({ isAuthenticated: false, user: null });
      }
    } catch (err) {
      console.error("Error checking user authentication:", err);
      set({ isAuthenticated: false, user: null });
    } finally {
      set({ authChecked: true });
      const syncClient = useClientStore.getState().syncClient;
      syncClient();
    }
  },
}));
