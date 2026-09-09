import { create } from 'zustand';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  login: (token: string, user: any) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,

  login: (token, user) => {
    localStorage.setItem('token', token);
    set({ isAuthenticated: true, user, token });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ isAuthenticated: false, user: null, token: null });
  },

  initialize: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await api.get('/auth/me');
        set({ isAuthenticated: true, user: response.data, token });
      } catch (error) {
        localStorage.removeItem('token');
        set({ isAuthenticated: false, user: null, token: null });
      }
    }
  },
}));

export { api };
