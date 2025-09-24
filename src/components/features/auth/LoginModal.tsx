import { useState, useEffect, useCallback } from 'react';
import { useWalletStore } from '../../../stores/useWalletStore';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useUIStore } from '../../../stores/useUIStore';
import { useWalletDetection } from '../../../hooks/useWalletDetection';

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal } = useUIStore();
  const { authenticated } = useAuthStore();
  const { connectWallet } = useWalletStore();
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [emailError, setEmailError] = useState('');
  const { isLoading, error } = useWalletStore();
  const { wallets, isLoading: walletsLoading, openWalletDownload } = useWalletDetection();
  const { sendEmailOtp, loginWithOtp, ready } = useAuthStore();

  const resetEmailState = useCallback(() => {
    setIsEmailSent(false);
    setOtp('');
    setEmailError('');
  }, []);

  // Automatically close modal on successful Privy authentication
  useEffect(() => {
    if (authenticated && isLoginModalOpen && isEmailSent) {
      // Close only if email authentication was used (Privy)
      closeLoginModal();
    }
  }, [authenticated, isLoginModalOpen, closeLoginModal, isEmailSent]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isLoginModalOpen) {
      resetEmailState();
      setEmail('');
    }
  }, [isLoginModalOpen, resetEmailState]);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ready || !email.trim()) return;

    if (!sendEmailOtp) {
      setEmailError('Email authentication not available');
      return;
    }

    try {
      setEmailError('');
      // Send OTP code to email
      await sendEmailOtp(email);
      setIsEmailSent(true);
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : 'Failed to send verification code. Please try again.');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim()) return;

    try {
      setEmailError('');
      // Login with OTP code
      await loginWithOtp(email, otp);
      // Modal will close automatically after successful authentication
    } catch (error) {
      setEmailError('Invalid verification code. Please try again.');
      console.log('Invalid verification code:', error);
    }
  };

  const handleWalletConnect = async (walletType: 'metamask' | 'trust') => {
    try {
      await connectWallet(walletType);
      closeLoginModal(); // Close modal on successful connection
    } catch (error) {
      // Failed to connect wallet
      console.log('Failed to connect wallet:', error);
    }
  };

  const handleWalletClick = (walletType: 'metamask' | 'trust') => {
    const walletKey = walletType;

    if (wallets[walletKey as keyof typeof wallets]) {
      handleWalletConnect(walletType);
    } else {
      openWalletDownload(walletKey as keyof typeof wallets);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all duration-300"
      role="dialog"
      aria-modal="true"
      onClick={closeLoginModal}
    >
      <div
        className="relative w-full max-w-md bg-card/95 backdrop-blur-xl rounded-xl p-6 shadow-xl border border-border transition-all duration-300 transform scale-100 opacity-100 grid-pattern"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-4 top-4 p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors z-[60]"
          aria-label="Close modal"
          onClick={closeLoginModal}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col gap-2 w-full">
          <h4 className="text-2xl font-bold text-gradient-primary mb-2 animate-float">
            {isEmailSent ? 'Enter verification code' : 'Log in or sign up'}
          </h4>

          {isEmailSent && (
            <p className="text-sm text-muted-foreground">
              We sent a verification code to {email}
            </p>
          )}

          <div className="flex flex-col gap-2 w-full mt-4">
            {!isEmailSent ? (
              <form className="flex items-center gap-2 w-full" onSubmit={handleSubmit}>
                <input
                  type="email"
                  className="w-full p-3 h-11 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!ready || !email.trim()}
                  className="w-11 h-11 flex items-center justify-center rounded-lg bg-gradient-primary hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-200 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed animate-glow"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-arrow-right text-white"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-3">
                <form className="flex items-center gap-2 w-full" onSubmit={handleOtpSubmit}>
                  <input
                    type="text"
                    className="w-full p-3 h-11 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-center font-mono text-lg tracking-widest transition-colors"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />
                  <button
                    type="submit"
                    disabled={otp.length !== 6}
                    className="w-11 h-11 flex items-center justify-center rounded-lg bg-gradient-primary hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-200 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed animate-glow"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-check text-white"
                      aria-hidden="true"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </button>
                </form>
                <button
                  type="button"
                  onClick={resetEmailState}
                  className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  Use different email
                </button>
              </div>
            )}

            {/* Error message */}
            {(error || emailError) && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                {error || emailError}
              </div>
            )}

            <div className="flex items-center justify-center text-center gap-2 my-6">
              <div className="w-full h-[1px] bg-primary/30 from-transparent via-border to-transparent" />
              <span className="text-sm font-semibold text-foreground bg-card px-4 py-2 rounded-full border-2 border-primary/30 shadow-lg backdrop-blur-sm">or</span>
              <div className="w-full h-[1px] bg-primary/30 from-transparent via-border to-transparent" />
            </div>

            <button
              type="button"
              className="bg-primary flex items-center gap-4 p-5 rounded-xl bg-card hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full shadow-md"
              onClick={() => handleWalletClick('trust')}
              disabled={isLoading || walletsLoading}
            >
              <img
                className="w-6 h-6 rounded-lg"
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTgiIGhlaWdodD0iNjUiIHZpZXdCb3g9IjAgMCA1OCA2NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTAgOS4zODk0OUwyOC44OTA3IDBWNjUuMDA0MkM4LjI1NDUgNTYuMzM2OSAwIDM5LjcyNDggMCAzMC4zMzUzVjkuMzg5NDlaIiBmaWxsPSIjMDUwMEZGIi8+CjxwYXRoIGQ9Ik01Ny43ODIyIDkuMzg5NDlMMjguODkxNSAwVjY1LjAwNDJDNDkuNTI3NyA1Ni4zMzY5IDU3Ljc4MjIgMzkuNzI0OCA1Ny43ODIyIDMwLjMzNTNWOS4zODk0OVoiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8yMjAxXzY5NDIpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMjIwMV82OTQyIiB4MT0iNTEuMzYxNSIgeTE9Ii00LjE1MjkzIiB4Mj0iMjkuNTM4NCIgeTI9IjY0LjUxNDciIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agb2Zmc2V0PSIwLjAyMTEyIiBzdG9wLWNvbG9yPSIjMDAwMEZGIi8+CjxzdG9wIG9mZnNldD0iMC4wNzYyNDIzIiBzdG9wLWNvbG9yPSIjMDA5NEZGIi8+CjxzdG9wIG9mZnNldD0iMC4xNjMwODkiIHN0b3AtY29sb3I9IiM0OEZGOTEiLz4KPHN0b3Agb2Zmc2V0PSIwLjQyMDA0OSIgc3RvcC1jb2xvcj0iIzAwOTRGRiIvPgo8c3RvcCBvZmZzZXQ9IjAuNjgyODg2IiBzdG9wLWNvbG9yPSIjMDAzOEZGIi8+CjxzdG9wIG9mZnNldD0iMC45MDI0NjUiIHN0b3AtY29sb3I9IiMwNTAwRkYiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K"
                alt="Trust"
              />
              <span className="text-sm font-medium text-primary-foreground">
                Connect Trust {!walletsLoading && !wallets.trust && '(Install)'}
              </span>
              {isLoading && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              )}
            </button>

            <button
              type="button"
              className="bg-primary flex items-center gap-4 p-5 rounded-xl bg-card hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full shadow-md"
              onClick={() => handleWalletClick('metamask')}
              disabled={isLoading || walletsLoading}
            >
              <img
                className="w-6 h-6 rounded-lg"
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjIzIiBoZWlnaHQ9IjIzIiB4PSIzLjUiIHk9IjMuNSIgdmlld0JveD0iMCAwIDE0MS41MSAxMzYuNDIiPjxwYXRoIGZpbGw9IiNGRjVDMTYiIGQ9Im0xMzIuMjQgMTMxLjc1LTMwLjQ4LTkuMDctMjIuOTkgMTMuNzQtMTYuMDMtLjAxLTIzLTEzLjc0LTMwLjQ3IDkuMDhMMCAxMDAuNDdsOS4yNy0zNC43M0wwIDM2LjQgOS4yNyAwbDQ3LjYgMjguNDRoMjcuNzZMMTMyLjI0IDBsOS4yNyAzNi4zOC05LjI3IDI5LjM2IDkuMjcgMzQuNzItOS4yNyAzMS4yWiIvPjxwYXRoIGZpbGw9IiNGRjVDMTYiIGQ9Im05LjI3IDAgNDcuNjEgMjguNDZMNTQuOTggNDggOS4yOSAwWm0zMC40NyAxMDAuNDggMjAuOTUgMTUuOTUtMjAuOTUgNi4yNHYtMjIuMlpNNTkuMDEgNzQuMSA1NSA0OCAyOS4yMiA2NS43NWgtLjAybC4wOCAxOC4yNyAxMC40NS05LjkyaDE5LjI5Wk0xMzIuMjUgMGwtNDcuNiAyOC40Nkw4Ni41MSA0OGw0NS43Mi00OFptLTMwLjQ3IDEwMC40OC0yMC45NCAxNS45NSAyMC45NCA2LjI0di0yMi4yWm0xMC41My0zNC43M0w4Ni41MyA0OCA4Mi41IDc0LjFoMTkuMjdsMTAuNDYgOS45LjA3LTE4LjI2WiIvPjxwYXRoIGZpbGw9IiNFMzQ4MDciIGQ9Im0zOS43MyAxMjIuNjctMzAuNDYgOS4wOEwwIDEwMC40OGgzOS43M3YyMi4yWk01OS4wMiA3NC4xbDUuODIgMzcuNzEtOC4wNy0yMC45Ny0yNy40OS02LjgyIDEwLjQ2LTkuOTJINTlabTQyLjc2IDQ4LjU5IDMwLjQ3IDkuMDcgOS4yNy0zMS4yN2gtMzkuNzR6TTgyLjUgNzQuMDlsLTUuODIgMzcuNzEgOC4wNi0yMC45NyAyNy41LTYuODItMTAuNDctOS45MnoiLz48cGF0aCBmaWxsPSIjRkY4RDVEIiBkPSJtMCAxMDAuNDcgOS4yNy0zNC43M0gyOS4ybC4wNyAxOC4yNyAyNy41IDYuODIgOC4wNiAyMC45Ny00LjE1IDQuNjItMjAuOTQtMTUuOTZIMFptMTQxLjUgMC05LjI2LTM0LjczaC0xOS45M2wtLjA3IDE4LjI3LTI3LjUgNi44Mi04LjA2IDIwLjk3IDQuMTUgNC42MiAyMC45NC0xNS45NmgzOS43NFpNODQuNjQgMjguNDRINTYuODhsLTEuODkgMTkuNTQgOS44NCA2My44aDExLjg1bDkuODUtNjMuOC0xLjktMTkuNTRaIi8+PHBhdGggZmlsbD0iIzY2MTgwMCIgZD0iTTkuMjcgMCAwIDM2LjM4bDkuMjcgMjkuMzZIMjkuMkw1NC45OCA0OHptNDMuOTggODEuNjdoLTkuMDNsLTQuOTIgNC44MSAxNy40NyA0LjMzLTMuNTItOS4xNVpNMTMyLjI0IDBsOS4yNyAzNi4zOC05LjI3IDI5LjM2aC0xOS45M0w4Ni41MyA0OHpNODguMjcgODEuNjdoOS4wNGw0LjkyIDQuODItMTcuNDkgNC4zNCAzLjUzLTkuMTdabS05LjUgNDIuMyAyLjA2LTcuNTQtNC4xNS00LjYySDY0LjgybC00LjE0IDQuNjIgMi4wNSA3LjU0Ii8+PHBhdGggZmlsbD0iI0MwQzRDRCIgZD0iTTc4Ljc3IDEyMy45N3YxMi40NUg2Mi43NHYtMTIuNDVoMTYuMDJaIi8+PHBhdGggZmlsbD0iI0U3RUJGNiIgZD0ibTM5Ljc0IDEyMi42NiAyMyAxMy43NnYtMTIuNDZsLTIuMDUtNy41NHptNjIuMDMgMC0yMyAxMy43NnYtMTIuNDZsMi4wNi03LjU0eiIvPjwvc3ZnPjwvc3ZnPg=="
                alt="MetaMask"
              />
              <span className="text-sm font-medium text-primary-foreground">
                Connect MetaMask {!walletsLoading && !wallets.metamask && '(Install)'}
              </span>
              {isLoading && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
