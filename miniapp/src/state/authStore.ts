import { create } from "zustand";
import { setAuthToken } from "../api/client";

type User = {
  id: string;
  name: string;
  telegramId: string | null;
  emailVerified: boolean;
};

type AuthState = {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => {
    setAuthToken(token);
    set({ token, user });
  },
  reset: () => {
    setAuthToken(null);
    set({ token: null, user: null });
  }
}));

