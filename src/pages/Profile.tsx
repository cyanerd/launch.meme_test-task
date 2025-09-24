import { ProfileForm } from '../components/features/profile/ProfileForm';
import { ConnectWalletCard } from '../components/features/wallet/ConnectWalletCard';
import { useWalletStore } from '../stores/useWalletStore';
import { useAuthStore } from '../stores/useAuthStore';

export function Profile() {
  const { connected } = useWalletStore();
  const { authenticated } = useAuthStore();

  // Check if user is authenticated (wallet or Privy)
  const isAuthenticated = connected || authenticated;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center animate-slide-up pt-8 pb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gradient-primary mb-2 animate-float">
          Profile
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Manage your personal information and social connections
        </p>
      </div>

      {isAuthenticated ? (
        <ProfileForm />
      ) : (
        <ConnectWalletCard
          title="Connect your wallet"
          description="Connect your Solana wallet to access and manage your profile settings."
          buttonText="Connect Wallet"
          className="animate-slide-up"
        />
      )}
    </div>
  );
}
