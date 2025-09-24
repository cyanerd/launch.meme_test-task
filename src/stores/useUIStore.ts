import { create } from 'zustand';

interface SnackbarState {
  message: string;
  type: 'error' | 'success';
  visible: boolean;
}

interface UIState {
  // Snackbar state
  snackbar: SnackbarState;

  // Modal states
  isLoginModalOpen: boolean;

  // Actions
  showSnackbar: (message: string, type?: 'error' | 'success') => void;
  hideSnackbar: () => void;

  // Modal actions
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  snackbar: {
    message: '',
    type: 'error',
    visible: false,
  },
  isLoginModalOpen: false,

  // Snackbar actions
  showSnackbar: (message: string, type: 'error' | 'success' = 'error') => {
    set({
      snackbar: { message, type, visible: true }
    });

    // Auto-hide after 3 seconds
    setTimeout(() => {
      get().hideSnackbar();
    }, 3000);
  },

  hideSnackbar: () => {
    set({
      snackbar: {
        message: '',
        type: 'error',
        visible: false,
      }
    });
  },

  // Modal actions
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
}));
