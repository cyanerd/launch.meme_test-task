import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '../../../hooks/useApiClient';
import { useWalletStore } from '../../../stores/useWalletStore';
import { Trophy, Gift, Award } from 'lucide-react';
import { ConnectWalletCard } from '../wallet/ConnectWalletCard';
import type { Reward } from '../../../types/api';

interface DisplayReward {
  id: string;
  date: string;
  name: string;
  type: string;
  sol: number;
}

export function RewardsTable() {
  const { connected, publicKey } = useWalletStore();
  const apiClient = useApiClient();

  const rewardsQuery = useQuery({
    queryKey: ['rewards', publicKey?.toString()],
    queryFn: async (): Promise<DisplayReward[]> => {
      if (!connected || !publicKey) {
        throw new Error('Wallet not connected');
      }
      const response = await apiClient.getRewards({ wallet: publicKey.toString() });

      // Transform API response to DisplayReward format
      if (response && response.rewards) {
        return response.rewards.map((reward: Reward, index: number) => ({
          id: reward.id || `reward-${index}`,
          date: reward.createdAt || new Date().toISOString().split('T')[0],
          name: `Reward ${reward.type}`,
          type: reward.type,
          sol: reward.amount,
        }));
      }

      return [];
    },
    enabled: connected && !!publicKey,
    retry: false,
  });

  // Calculate rewards stats
  const rewardsStats = rewardsQuery.data ? {
    totalRewards: rewardsQuery.data.length,
    totalValue: rewardsQuery.data.reduce((sum, reward) => sum + reward.sol, 0),
    avgReward: rewardsQuery.data.length > 0 ? rewardsQuery.data.reduce((sum, reward) => sum + reward.sol, 0) / rewardsQuery.data.length : 0,
  } : null;

  return (
    <>
      {/* Rewards Stats */}
      {rewardsStats && rewardsStats.totalRewards > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{rewardsStats.totalRewards}</div>
            <div className="text-sm text-muted-foreground">Total Rewards</div>
          </div>

          <div className="glass rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{rewardsStats.totalValue.toFixed(4)} SOL</div>
            <div className="text-sm text-muted-foreground">Total Earned</div>
          </div>

          <div className="glass rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{rewardsStats.avgReward.toFixed(4)} SOL</div>
            <div className="text-sm text-muted-foreground">Average Reward</div>
          </div>
        </div>
      )}

      {/* Rewards Table */}
      <div className="animate-slide-up">
        <div className="glass rounded-xl overflow-hidden">
          {/* Loading State */}
          {rewardsQuery.isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-3 text-muted-foreground">Loading rewards...</span>
            </div>
          ) : rewardsQuery.isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load rewards</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Unable to load rewards data. Please check your connection and try again.
              </p>
              <button
                onClick={() => rewardsQuery.refetch()}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
        ) : !connected ? (
          <ConnectWalletCard
            title="Connect your wallet"
            description="Connect your Solana wallet to view your rewards and track your achievements."
            buttonText="Connect Wallet"
            glass={false}
          />
        ) : (!rewardsQuery.data || rewardsQuery.data.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No rewards yet
              </h3>
              <p className="text-muted-foreground max-w-md">
                Start participating in the ecosystem to earn rewards and achievements!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Reward</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Type</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rewardsQuery.data?.map((reward) => (
                    <tr key={reward.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">{reward.date}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-primary/20 rounded-lg flex items-center justify-center">
                            <Gift className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{reward.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground capitalize">{reward.type}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-foreground">{reward.sol.toFixed(6)} SOL</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
