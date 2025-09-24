import { create } from 'zustand';
import type { TokenData } from '../types';

interface TokenState {
  tokens: TokenData[];
  selectedToken: TokenData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setTokens: (tokens: TokenData[]) => void;
  updateToken: (tokenId: string, updates: Partial<TokenData>) => void;
  setSelectedToken: (token: TokenData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed
  getTokenById: (id: string) => TokenData | undefined;
}

export const useTokenStore = create<TokenState>((set, get) => ({
  // Initial state
  tokens: [],
  selectedToken: null,
  isLoading: false,
  error: null,

  // Actions
  setTokens: (tokens) => set({ tokens }),

  updateToken: (tokenId, updates) => set((state) => ({
    tokens: state.tokens.map(token =>
      token.id === tokenId ? { ...token, ...updates } : token
    )
  })),

  setSelectedToken: (token) => set({ selectedToken: token }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  // Computed
  getTokenById: (id) => get().tokens.find(token => token.id === id),
}));
