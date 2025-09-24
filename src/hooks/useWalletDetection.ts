import { useState, useEffect } from 'react';

interface WalletAvailability {
  metamask: boolean;
  trust: boolean;
}

export function useWalletDetection() {
  const [wallets, setWallets] = useState<WalletAvailability>({
    metamask: false,
    trust: false
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectWallets = () => {

      // Additional debugging for solana object
      if ((window as any).solana) {
        // Additional checks for solana object
      }

      const detected: WalletAvailability = {
        metamask: !!(window as any).ethereum?.isMetaMask,
        trust: !!(window as any).trustwallet || !!(window as any).ethereum?.isTrust
      };

      setWallets(detected);
      setIsLoading(false);
    };

    // Check immediately
    detectWallets();

    // Check again after a short delay to catch wallets that inject later
    const timer = setTimeout(detectWallets, 1000);

    // Listen for wallet injection events
    const handleEthereumConnect = () => detectWallets();
    window.addEventListener('ethereum#initialized', handleEthereumConnect);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('ethereum#initialized', handleEthereumConnect);
    };
  }, []);

  const openWalletDownload = (walletType: keyof WalletAvailability) => {
    const urls = {
      metamask: 'https://metamask.io/',
      trust: 'https://trustwallet.com/'
    };

    window.open(urls[walletType], '_blank', 'noopener,noreferrer');
  };

  return {
    wallets,
    isLoading,
    openWalletDownload
  };
}
