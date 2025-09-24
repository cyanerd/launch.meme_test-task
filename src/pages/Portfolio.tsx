import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useWalletStore } from '../stores/useWalletStore';
import { useApiClient } from '../hooks/useApiClient';
import type { PortfolioItem } from '../types/api';
import { Wallet, TrendingUp, PieChart, DollarSign } from 'lucide-react';
import { ConnectWalletCard } from '../components/features/wallet/ConnectWalletCard';
import { CopyButton } from '../components/ui/CopyButton';
import { formatAddress } from '../lib/utils';

interface PortfolioToken {
  id: string;
  symbol: string;
  name: string;
  address: string;
  amount: number;
  sol: number;
  price?: number;
  value?: number;
}


export function Portfolio() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const searchParams = useSearchParams();
  const navigate = useNavigate();
  const { connected, publicKey } = useWalletStore();

  // API client
  const apiClient = useApiClient();

  // Portfolio query
  const portfolioQuery = useQuery({
    queryKey: ['portfolio', walletAddress],
    queryFn: async (): Promise<PortfolioToken[]> => {
      if (!walletAddress) {
        return [];
      }
      const response = await apiClient.getPortfolio({ wallet: walletAddress });

      // Transform API response to PortfolioToken format
      if (response && response.items) {
        return response.items.map((item: PortfolioItem, index: number) => ({
          id: item.tokenId || `token-${index}`,
          symbol: item.tokenSymbol || 'UNKNOWN',
          name: item.tokenName || 'Unknown Token',
          address: item.tokenId || '',
          amount: item.balance || 0,
          sol: item.value || 0,
        }));
      }

      return [];
    },
    enabled: !!walletAddress,
    retry: false,
  });

  // Get wallet from URL params or use connected wallet
  useEffect(() => {
    const walletParam = searchParams[0].get('wallet');

    if (walletParam) {
      setWalletAddress(walletParam);
    } else if (publicKey) {
      setWalletAddress(publicKey.toBase58());
      // Update URL with connected wallet address using React Router
      navigate(`/portfolio?wallet=${publicKey.toBase58()}`, { replace: true });
    } else {
      // If wallet is not connected and no URL param, leave empty
      setWalletAddress('');
    }
  }, [searchParams, publicKey, navigate]);

  // Calculate portfolio stats
  const portfolioStats = portfolioQuery.data ? {
    totalTokens: portfolioQuery.data.length,
    totalValue: portfolioQuery.data.reduce((sum, token) => sum + token.sol, 0),
    totalAmount: portfolioQuery.data.reduce((sum, token) => sum + token.amount, 0),
  } : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center animate-slide-up pt-8 pb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gradient-primary mb-4 animate-float">
          Portfolio
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Track your meme coin investments and portfolio performance
        </p>
      </div>

      {/* Portfolio Stats */}
      {portfolioStats && portfolioStats.totalTokens > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up">
          <div className="glass rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <PieChart className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{portfolioStats.totalTokens}</div>
            <div className="text-sm text-muted-foreground">Total Tokens</div>
          </div>

          <div className="glass rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{portfolioStats.totalValue.toFixed(4)} SOL</div>
            <div className="text-sm text-muted-foreground">Total Value</div>
          </div>

          <div className="glass rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{portfolioStats.totalAmount.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Amount</div>
          </div>
        </div>
      )}

      {/* Wallet Address */}
      {walletAddress && (
        <div className="glass rounded-xl p-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Wallet Address</h3>
                <p className="text-sm text-muted-foreground font-mono">
                  {formatAddress(walletAddress, 12, 12)}
                </p>
              </div>
            </div>
            <CopyButton address={walletAddress} title="Copy wallet address" />
          </div>
        </div>
      )}

      {/* Portfolio Table */}
      <div className="animate-slide-up">
        <div className="glass rounded-xl overflow-hidden">
          {/* Loading State */}
          {portfolioQuery.isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-3 text-muted-foreground">Loading portfolio...</span>
            </div>
          ) : portfolioQuery.isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load portfolio</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Unable to load portfolio data. Please check your connection and try again.
              </p>
              <button
                onClick={() => portfolioQuery.refetch()}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : !connected ? (
            <ConnectWalletCard
              title="Connect your wallet"
              description="Connect your Solana wallet to view your portfolio and track your investments."
              buttonText="Connect Wallet"
              glass={false}
            />
          ) : (portfolioQuery.data || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No tokens found
              </h3>
              <p className="text-muted-foreground max-w-md">
                Your portfolio is empty. Start trading to see your tokens here!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Token</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-muted-foreground">Amount</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-muted-foreground">Value (SOL)</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-muted-foreground">Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {portfolioQuery.data?.map((token) => (
                    <tr key={token.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-primary/20 rounded-lg flex items-center justify-center">
                            <span className="text-primary font-bold text-sm">{token.symbol.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{token.symbol}</div>
                            <div className="text-sm text-muted-foreground">{token.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-medium text-foreground">
                          {token.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-foreground">
                          {token.sol.toFixed(6)} SOL
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <span className="text-sm font-mono text-muted-foreground">
                            {formatAddress(token.address, 6, 6)}
                          </span>
                          <CopyButton address={token.address} title="Copy token address" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
