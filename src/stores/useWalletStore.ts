import { create } from 'zustand';
import { PublicKey, Transaction } from '@solana/web3.js';

interface WalletInfo {
  name: string;
  type: 'metamask' | 'trust' | 'custom';
}

interface WalletState {
  connected: boolean;
  connecting: boolean;
  publicKey: PublicKey | null;
  wallet: WalletInfo | null;
}

interface CustomWalletAdapter {
  publicKey: PublicKey;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
  signAllTransactions: (txs: Transaction[]) => Promise<Transaction[]>;
}

interface WalletStore extends WalletState {
  isLoading: boolean;
  error: string | null;
  customAdapter: CustomWalletAdapter | null;

  // Actions
  connectWallet: (walletType: 'metamask' | 'trust') => Promise<void>;
  connectCustomWallet: (name: string, adapter: CustomWalletAdapter) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  switchNetwork: (network: 'mainnet-beta' | 'testnet' | 'devnet') => void;
  getBalance: () => Promise<number>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;

  // Internal actions
  setWalletState: (state: Partial<WalletState>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCustomAdapter: (adapter: CustomWalletAdapter | null) => void;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  // Initial state
  connected: false,
  connecting: false,
  publicKey: null,
  wallet: null,
  isLoading: false,
  error: null,
  customAdapter: null,

  // Internal state setters
  setWalletState: (state) => set((prev) => ({
    ...prev,
    ...state,
  })),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setCustomAdapter: (adapter) => set({ customAdapter: adapter }),

  // Wallet actions (simplified - would need wallet adapter integration)
  connectWallet: async (walletType: 'metamask' | 'trust') => {
    try {
      get().setError(null);
      get().setLoading(true);

      // Mock implementation - would integrate with actual wallet adapters
      console.log(`Connecting ${walletType} wallet...`);

      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 1000));

      get().setWalletState({
        connected: true,
        connecting: false,
        publicKey: new PublicKey('11111111111111111111111111111112'), // Mock key
        wallet: {
          name: walletType,
          type: walletType,
        }
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to connect ${walletType} wallet`;
      get().setError(errorMessage);
      throw err;
    } finally {
      get().setLoading(false);
    }
  },

  connectCustomWallet: async (name: string, adapter: CustomWalletAdapter) => {
    try {
      get().setError(null);
      get().setCustomAdapter(adapter);

      get().setWalletState({
        connected: true,
        connecting: false,
        publicKey: adapter.publicKey,
        wallet: {
          name,
          type: 'custom'
        }
      });
    } catch (err) {
      get().setError(err instanceof Error ? err.message : 'Failed to connect custom wallet');
      throw err;
    }
  },

  disconnectWallet: async () => {
    try {
      get().setError(null);
      get().setCustomAdapter(null);

      get().setWalletState({
        connected: false,
        connecting: false,
        publicKey: null,
        wallet: null
      });
    } catch (err) {
      get().setError(err instanceof Error ? err.message : 'Failed to disconnect wallet');
    }
  },

  switchNetwork: (network: 'mainnet-beta' | 'testnet' | 'devnet') => {
    console.log(`Switching to ${network} network`);
    // Implementation would depend on wallet adapter capabilities
  },

  getBalance: async (): Promise<number> => {
    const { publicKey } = get();
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    // Mock implementation
    return 1000000; // Mock balance in lamports
  },

  signTransaction: async (transaction: Transaction): Promise<Transaction> => {
    const { connected, customAdapter } = get();

    if (!connected) {
      throw new Error('Wallet not connected');
    }

    // Use custom adapter if available
    if (customAdapter) {
      return customAdapter.signTransaction(transaction);
    }

    // Mock signing for demo
    console.log('Mock signing transaction');
    return transaction;
  },
}));
