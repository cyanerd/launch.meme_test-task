import { useUIStore } from '../../../stores/useUIStore';

interface ConnectWalletCardProps {
  title?: string;
  description?: string;
  buttonText?: string;
  className?: string;
  glass?: boolean;
}

export function ConnectWalletCard({
  title = "Connect your wallet",
  description = "Connect your Solana wallet to access this feature.",
  buttonText = "Connect Wallet",
  className = "",
  glass = true
}: ConnectWalletCardProps) {
  const { openLoginModal } = useUIStore();

  return (
    <div className={className || ''}>
      <div className={`rounded-xl p-8 text-center ${glass ? 'glass' : ''}`}>
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6 mx-auto">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground mb-6">
          {description}
        </p>
        <button
          onClick={openLoginModal}
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
