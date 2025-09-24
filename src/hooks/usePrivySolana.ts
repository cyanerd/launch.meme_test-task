import { useEffect } from 'react';
import { Keypair, Transaction } from '@solana/web3.js';
import { useAuthStore } from '../stores/useAuthStore';
import { useWalletStore } from '../stores/useWalletStore';

export const usePrivySolana = () => {
  const { authenticated, user } = useAuthStore();
  const { connectCustomWallet } = useWalletStore();

  useEffect(() => {
    const handlePrivyAuth = async () => {
      if (authenticated && user?.email && typeof user.email === 'object' && user.email.address) {
        try {
          // Create deterministic wallet based on user email
          // In production app, a more secure method should be used
          // For example, use Privy's embedded wallets
          const seed = new TextEncoder().encode(user.email.address);
          const seedArray = new Uint8Array(32);
          for (let i = 0; i < seed.length && i < 32; i++) {
            seedArray[i] = seed[i];
          }

          const keypair = Keypair.fromSeed(seedArray);

          // Connect wallet to SDK only if another wallet is not already connected
          await connectCustomWallet('Privy Email Wallet', {
            publicKey: keypair.publicKey,
            signTransaction: async (tx: Transaction) => {
              tx.sign(keypair);
              return tx;
            },
            signAllTransactions: async (txs: Transaction[]) => {
              txs.forEach((tx: Transaction) => tx.sign(keypair));
              return txs;
            }
          });
        } catch (error) {
          console.error('Failed to connect wallet via Privy:', error);
        }
      } else if (!authenticated) {
        // Disconnect wallet on logout only if it's a Privy wallet
        // Don't disconnect other wallet types (MetaMask, Trust, etc.)
        // try {
        //   await disconnectWallet();
        // } catch (error) {
        //   console.error('Failed to disconnect wallet:', error);
        // }
      }
    };

    handlePrivyAuth();
  }, [authenticated, user, connectCustomWallet]);

  return { authenticated, user };
};
