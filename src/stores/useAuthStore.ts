import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  // Privy auth state
  authenticated: boolean;
  user: User | null;
  ready: boolean;

  // Login modal state
  isLoginModalOpen: boolean;

  // Actions
  login: () => void;
  loginWithTwitter: () => Promise<void>;
  sendEmailOtp: (email: string) => Promise<void>;
  loginWithOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;

  // Modal actions
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  authenticated: false,
  user: null,
  ready: false,
  isLoginModalOpen: false,

  // Auth actions (to be connected with Privy)
  login: () => {
    console.log('Login action not implemented');
  },

  loginWithTwitter: async () => {
    console.log('Twitter login mocked');
  },

  sendEmailOtp: async (email: string) => {
    try {
      console.log('Email OTP not implemented yet', email);
    } catch (error) {
      throw error;
    }
  },

  loginWithOtp: async (email: string, otp: string) => {
    try {
      console.log('OTP verification not implemented yet', email, otp);
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    console.log('Logout action not implemented');
  },

  // Modal actions
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
}));
