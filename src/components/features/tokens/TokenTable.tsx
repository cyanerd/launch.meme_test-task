import { useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { formatCurrencyWithSuffix, formatAddress, formatTimeAgo, formatPrice } from '../../../lib/utils';
import { useApiClient } from '../../../hooks/useApiClient';
import { MiniChart } from './MiniChart';
import { CopyButton } from '../../ui/CopyButton';
import { TokenAvatar } from '../../ui/TokenAvatar';
import type { ChartDataPoint } from './MiniChart';
import { FILTER_OPTIONS, DEFAULT_FILTERS, SORT_OPTIONS, DEFAULT_SORT, type Filters, type SortValue } from '../../../types/filters';
import { useTokenStore } from '../../../stores/useTokenStore';
import type { TokenData } from '../../../types';
import type { TokenApiResponse, MeteoraTokenUpdate } from '../../../types/api';

interface TokenTableProps {
  searchTerm: string;
  sortBy?: SortValue;
  filters?: Filters;
}

// Function to convert API token to TokenData format
function convertApiTokenToTokenData(tokenId: string, tokenData: TokenApiResponse): TokenData {
  const shortAddress = formatAddress(tokenId);

  // Calculate progress percentage based on some logic (can be adjusted)
  const progress = tokenData.progress ||
    (tokenData.volumeUsd && tokenData.marketCapUsd
      ? Math.min((tokenData.volumeUsd / tokenData.marketCapUsd) * 100, 100)
      : 0);

  return {
    id: tokenId,
    name: tokenData.name || 'Unknown',
    symbol: tokenData.symbol || 'UNK',
    description: tokenData.description || '',
    avatar: tokenData.photo || '/api/placeholder/32/32',
    ca: shortAddress,
    volume: tokenData.volumeUsd || 0,
    marketCap: tokenData.marketCapUsd || 0,
    progress: progress,
    holders: tokenData.holders || 0,
    createdAt: tokenData.createdAt ? new Date(tokenData.createdAt) : new Date(),
    twitter: (typeof tokenData.twitter === 'string' ? tokenData.twitter : undefined) ||
             (typeof tokenData.x === 'string' ? tokenData.x : undefined),
    website: typeof tokenData.website === 'string' ? tokenData.website : undefined,
    telegram: typeof tokenData.telegram === 'string' ? tokenData.telegram : undefined,
    creator: typeof tokenData.creator === 'string' ? tokenData.creator : undefined,
    buys: (typeof tokenData.buys === 'number' ? tokenData.buys : 0) ||
          (typeof tokenData.buyCount === 'number' ? tokenData.buyCount : 0),
    sells: (typeof tokenData.sells === 'number' ? tokenData.sells : 0) ||
           (typeof tokenData.sellCount === 'number' ? tokenData.sellCount : 0),
    price: (typeof tokenData.priceUsd === 'number' ? tokenData.priceUsd : 0) ||
           (typeof tokenData.price_usd === 'number' ? tokenData.price_usd : 0) ||
           (typeof tokenData.usd_price === 'number' ? tokenData.usd_price : 0) ||
           (typeof tokenData.price === 'number' ? tokenData.price : 0),
    devHolders: tokenData.creatorSharePercentage
      ? Math.round(tokenData.creatorSharePercentage * 100 * 100) / 100
      : 0,
    top10Holders: Math.round((tokenData.topHoldersPercentage || 0) * 100 * 100) / 100 // Convert 0.1978 to 19.78
  };
}

// Generate mock chart data for tokens with stable seeding
function generateMockPriceHistory(currentPrice: number, tokenAge: Date, tokenId: string): ChartDataPoint[] {
  const now = Date.now();
  const ageInMs = now - tokenAge.getTime();
  const dataPoints = Math.min(50, Math.max(10, Math.floor(ageInMs / (1000 * 60 * 15)))); // Every 15 minutes, max 50 points

  // Create stable seed from tokenId to ensure consistent results
  const seed = tokenId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const seededRandom = (index: number) => {
    const x = Math.sin(seed + index * 1000) * 10000;
    return x - Math.floor(x);
  };

  const history: ChartDataPoint[] = [];
  const volatility = 0.05 + seededRandom(1) * 0.15; // 5-20% volatility
  const trend = (seededRandom(2) - 0.5) * 2; // -1 to 1 trend

  for (let i = 0; i < dataPoints; i++) {
    const timeOffset = (i / (dataPoints - 1)) * ageInMs;
    const timestamp = tokenAge.getTime() + timeOffset;

    // Generate price with trend and random walk
    const progress = i / (dataPoints - 1);
    const trendComponent = trend * progress * 0.3;
    const randomComponent = (seededRandom(i + 10) - 0.5) * volatility;
    const priceMultiplier = 1 + trendComponent + randomComponent;

    // Add some realistic price action patterns
    const cycleComponent = Math.sin(progress * Math.PI * 2 * (1 + seededRandom(i + 100))) * 0.05;
    const finalMultiplier = Math.max(0.1, priceMultiplier + cycleComponent);

    const price = currentPrice * finalMultiplier;

    history.push({
      timestamp,
      price: Math.max(0.000001, price), // Ensure price is positive
    });
  }

  // Ensure the last point matches current price
  if (history.length > 0) {
    history[history.length - 1].price = currentPrice;
  }

  return history;
}

// Query configuration constants
const QUERY_CONFIG = {
  refetchInterval: 30000, // Refetch every 30 seconds
  retry: 2,
  staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for 10 minutes
} as const;

// Helper function to check if token matches search term
const matchesSearch = (token: TokenData, search: string): boolean =>
  [token.name, token.symbol, token.id, token.description]
    .some(value => value?.toLowerCase().includes(search));

// Helper functions for filter checks
const isInRange = (value: number, range: { min: number; max: number }): boolean =>
  value >= range.min && value <= range.max;

const isWithinTimeFrame = (tokenDate: Date, hours: number): boolean => {
  const now = new Date();
  const diffInHours = (now.getTime() - tokenDate.getTime()) / (1000 * 60 * 60);
  return diffInHours <= hours;
};

export function TokenTable({ searchTerm, sortBy = DEFAULT_SORT, filters }: TokenTableProps) {
  const { tokens, setTokens, updateToken } = useTokenStore();
  const apiClient = useApiClient();

  // Memoize chart data for each token to prevent regeneration
  const tokenChartData = useMemo(() => {
    const data: Record<string, ChartDataPoint[]> = {};
    tokens.forEach(token => {
      data[token.id] = generateMockPriceHistory(token.price || 0.01, token.createdAt, token.id);
    });
    return data;
  }, [tokens]);


  // Check if filters are active
  const areFiltersActive = filters && Object.entries(filters).some(
    ([key, value]) => value !== DEFAULT_FILTERS[key as keyof Filters]
  );

  const handleMeteoraTokenUpdate = useCallback((data: MeteoraTokenUpdate) => {
    // Log for all tokens to see which ones are being updated
    console.log('⚡ TokenTable processing:', {
      token: data.token,
      marketCap: data.marketCapUsd,
      price: data.price,
      holders: data.holders
    });

    // Get current tokens from store
    const currentTokens = useTokenStore.getState().tokens;
    const oldToken = currentTokens.find(token => token.id === data.token);

    if (!oldToken) {
      // Token not found in current list - show debug info
      console.log('⚠️ Token not found in current list:', {
        searchedToken: data.token,
        totalTokens: currentTokens.length,
        firstFewTokens: currentTokens.slice(0, 5).map(t => ({ id: t.id, name: t.name })),
        hasMore: currentTokens.length > 5
      });
      return;
    }

    // Check if any values actually changed to avoid unnecessary updates
    const processedPrice = data.priceUsd || data.price_usd || data.usd_price || data.price || 0;
    const processedBuys = data.buys || data.buyCount || 0;
    const processedSells = data.sells || data.sellCount || 0;
    const processedDevHolders = data.creatorSharePercentage ? Math.round(data.creatorSharePercentage * 100 * 100) / 100 : undefined;
    const processedTop10Holders = data.topHoldersPercentage ? Math.round((data.topHoldersPercentage || 0) * 100 * 100) / 100 : undefined;

    const hasChanges = Object.entries({
      price: [data.price, oldToken.price],
      priceUsd: [processedPrice, oldToken.price],
      volumeSol: [data.volumeSol, oldToken.volumeSol],
      volumeUsd: [data.volumeUsd, oldToken.volumeUsd],
      marketCapUsd: [data.marketCapUsd, oldToken.marketCap],
      holders: [data.holders, oldToken.holders],
      buys: [processedBuys, oldToken.buys],
      sells: [processedSells, oldToken.sells],
      creatorSharePercentage: [processedDevHolders, oldToken.devHolders],
      topHoldersPercentage: [processedTop10Holders, oldToken.top10Holders],
    }).some(([, [newValue, oldValue]]) =>
      newValue !== undefined && newValue !== oldValue
    );

    if (!hasChanges) {
      return;
    }

    // Define field mappings for updates
    const fieldMappings = {
      price: data.price,
      priceUsd: data.priceUsd,
      volumeSol: data.volumeSol,
      volumeUsd: data.volumeUsd,
      marketCapUsd: data.marketCapUsd,
      holders: data.holders,
      buys: data.buys !== undefined ? data.buys || data.buyCount || 0 : undefined,
      sells: data.sells !== undefined ? data.sells || data.sellCount || 0 : undefined,
      txCount: data.txCount,
      lastTxTime: data.last_tx_time,
      lastUpdated: data.lastUpdated,
      // Aliases for UI compatibility
      volume: data.volumeSol,
      marketCap: data.marketCapUsd,
      // Computed fields
      devHolders: data.creatorSharePercentage !== undefined
        ? Math.round(data.creatorSharePercentage * 100 * 100) / 100
        : undefined,
      top10Holders: data.topHoldersPercentage !== undefined
        ? Math.round((data.topHoldersPercentage || 0) * 100 * 100) / 100
        : undefined,
    };

    // Override price with proper fallback logic if any price data is available
    if (data.priceUsd !== undefined || data.price !== undefined) {
      fieldMappings.price = data.priceUsd || data.price_usd || data.usd_price || data.price || 0;
    }

    // Create updated token by applying only defined values
    const updates = Object.fromEntries(
      Object.entries(fieldMappings).filter(([, value]) => value !== undefined)
    );

    // Update the token using the store
    updateToken(data.token, updates);

    // Log for all tokens to track updates
    console.log('✅ Token updated:', {
      name: oldToken.name,
      tokenId: data.token,
      marketCap: `${oldToken.marketCap} → ${updates.marketCap || oldToken.marketCap}`,
      price: `${oldToken.price} → ${updates.price || oldToken.price}`,
      hasMarketCapChange: data.marketCapUsd !== undefined
    });
  }, [updateToken]);

  // WebSocket connection for real-time updates
  const { isConnected, subscribeToTokenUpdates } = useWebSocket({
    autoConnect: true,
    handlers: {
      onConnected: () => {
        subscribeToTokenUpdates();
      },
      onMeteoraTokenUpdate: handleMeteoraTokenUpdate,
    }
  });

  // Fetch data from API
  const { data: apiTokens, isLoading, error } = useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      try {
        const response = await apiClient.getTokensWithFallback({});

        // API returns { tokens: { tokenId: tokenData, ... } }
        const tokens: TokenData[] = [];
        if (response && typeof response === 'object') {
          // Check if response has 'tokens' key
          const tokensData = (response as any).tokens || response;

          if (tokensData && typeof tokensData === 'object') {
            const entries = Object.entries(tokensData);

            entries.forEach(([tokenId, tokenData]) => {
              try {
                const convertedToken = convertApiTokenToTokenData(tokenId, tokenData as TokenApiResponse);
                tokens.push(convertedToken);
              } catch (conversionError) {
                // Error converting token
              }
            });
          }
        }

        // Sort by creation time (newest first)
        return tokens.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } catch (error) {
        throw error;
      }
    },
    ...QUERY_CONFIG
  });

  // Update tokens when API data changes (only if we have data)
  useEffect(() => {
    if (apiTokens && Array.isArray(apiTokens) && apiTokens.length > 0) {
      setTokens(apiTokens);
    }
  }, [apiTokens]);

  // Optimized token filtering and sorting with useMemo to prevent unnecessary recalculations
  const filteredTokens = useMemo(() => {
    let result = tokens;

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(token => matchesSearch(token, search));
    }

    // Apply filters
    if (filters) {
      result = result.filter(token => {
        // Price Range filter
        const priceConfig = FILTER_OPTIONS.priceRange[filters.priceRange];
        if (priceConfig.conditions && !isInRange(token.price || 0, priceConfig.conditions)) {
          return false;
        }

        // Market Cap filter
        const marketCapConfig = FILTER_OPTIONS.marketCap[filters.marketCap];
        if (marketCapConfig.conditions && !isInRange(token.marketCap || 0, marketCapConfig.conditions)) {
          return false;
        }

        // Volume filter
        const volumeConfig = FILTER_OPTIONS.volume[filters.volume];
        if (volumeConfig.conditions && !isInRange(token.volume || 0, volumeConfig.conditions)) {
          return false;
        }

        // Time Frame filter
        const timeFrameConfig = FILTER_OPTIONS.timeFrame[filters.timeFrame];
        if (timeFrameConfig.conditions && !isWithinTimeFrame(token.createdAt, timeFrameConfig.conditions.hours!)) {
          return false;
        }

        return true;
      });
    }

    // Sort by selected option
    const sortOption = SORT_OPTIONS[sortBy];
    if (sortOption) {
      result = [...result].sort(sortOption.sortFn);
    }

    return result;
  }, [tokens, searchTerm, sortBy, filters]);

  // Subscribe to meteora token updates when WebSocket is connected
  useEffect(() => {
    if (isConnected) {
      subscribeToTokenUpdates();
    }
  }, [isConnected, subscribeToTokenUpdates]);

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-8 text-center border border-border">
        <div
          className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading tokens...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-xl p-8 text-center space-y-4 border border-border">
        <p className="text-destructive">
          Error loading data: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <p className="text-muted-foreground text-sm">
          Please refresh the page or check your internet connection
        </p>
      </div>
    );
  }

  return (
    <div
      className="bg-card rounded-xl overflow-x-auto border border-border scrollbar-thin scrollbar-track-background scrollbar-thumb-muted-foreground/20 scrollbar-thumb-rounded-full">
      <div className="min-w-[900px]">
        <table className="w-full text-sm text-left text-foreground table-fixed">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
            <tr>
              <th scope="col" className="px-4 py-3 whitespace-nowrap w-72">Token</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap w-24">CA</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-right">Volume</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-right">Market Cap</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-right">Progress</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-right">Holders</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-center">Chart</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-center">Trade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredTokens.length === 0 && areFiltersActive ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-2xl">🔍</div>
                    <div className="text-sm">
                      No tokens match your filters
                    </div>
                    <div className="text-xs">
                      Try adjusting your filter settings
                    </div>
                  </div>
                </td>
              </tr>
            ) : filteredTokens.length === 0 && searchTerm.trim() ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-2xl">🔍</div>
                    <div className="text-sm">
                      No results found for "{searchTerm}"
                    </div>
                    <div className="text-xs">
                      Try adjusting your search query
                    </div>
                  </div>
                </td>
              </tr>
            ) : filteredTokens.length === 0 && !searchTerm.trim() ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-2xl">⏳</div>
                    <div className="text-sm">
                      Loading tokens...
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTokens.map((token) => (
                <tr key={token.id} className="border-b border-border hover:bg-muted/20 transition-colors duration-200">
                  {/* TOKEN Column */}
                  <td className="px-4 py-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex flex-col items-center space-y-1">
                        <TokenAvatar token={token} />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimeAgo(token.createdAt)}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-foreground truncate text-sm">{token.symbol} / {token.name}</span>
                          <div className="flex items-center space-x-1 flex-shrink-0 pl-1">
                            {token.twitter && (
                              <a href={token.twitter} target="_blank" rel="noopener noreferrer" title="Twitter"
                                className="flex items-center justify-center text-muted-foreground hover:text-primary transition-colors p-0.5 rounded hover:bg-accent/50">
                                <svg className="w-3 h-3" fill="currentColor">
                                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                              </a>
                            )}
                            {token.website && (
                              <a href={token.website} target="_blank" rel="noopener noreferrer" title="Website"
                                className="text-muted-foreground hover:text-primary transition-colors p-0.5 rounded hover:bg-accent/50">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                                  <path d="M2 12h20" />
                                </svg>
                              </a>
                            )}
                            {token.telegram && (
                              <a href={token.telegram} target="_blank" rel="noopener noreferrer" title="Telegram"
                                className="text-muted-foreground hover:text-primary transition-colors p-0.5 rounded hover:bg-accent/50">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                                  <path d="m21.854 2.147-10.94 10.939" />
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                        {token.description && (
                          <p className="text-xs text-muted-foreground max-w-xs line-clamp-2 mt-0.5">
                            {token.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* CA Column */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-mono text-xs text-foreground bg-muted px-2 py-0.5 rounded">{token.ca}</span>
                        <CopyButton
                          address={token.id}
                          size={10}
                          padding="p-0.5"
                          title="Copy full token address"
                        />
                      </div>
                      {token.creator && (
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <span>by</span>
                          <a
                            href={`https://solscan.io/address/${token.creator}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-primary hover:text-primary/80 transition-colors hover:underline"
                          >
                            {formatAddress(token.creator)}
                          </a>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* VOLUME Column */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-medium text-foreground text-sm">{formatCurrencyWithSuffix(token.volume)}</span>
                      <div className="text-xs mt-0.5 flex justify-end items-center space-x-1">
                        <span className="text-green-600 font-medium">{token.buys || 0}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-red-600 font-medium">{token.sells || 0}</span>
                      </div>
                    </div>
                  </td>

                  {/* MARKET CAP Column */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-medium text-foreground text-sm">{formatCurrencyWithSuffix(token.marketCap)}</span>
                      <span className="text-xs text-muted-foreground mt-0.5">{formatPrice(token.price || 0)}</span>
                    </div>
                  </td>

                  {/* PROGRESS Column */}
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="flex flex-col items-end space-y-0.5">
                      <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden" title={`${token.progress.toFixed(2)}%`}>
                        <div
                          className="h-1.5 rounded-full transition-all duration-500 ease-out bg-primary"
                          style={{ width: `${Math.min(token.progress, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground">{token.progress.toFixed(1)}%</span>
                    </div>
                  </td>

                  {/* HOLDERS Column */}
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="text-foreground font-medium text-sm">{token.holders}</div>
                    <div className="flex items-center justify-end space-x-1 mt-1">
                      <div className="flex items-center space-x-0.5" title={`Developer Holders: ${token.devHolders || 0}%`}>
                        <div className="w-4 h-4 bg-primary/10 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">D</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{token.devHolders || 0}%</span>
                      </div>
                      <div className="flex items-center space-x-0.5" title={`Top 10 Holders: ${token.top10Holders || 0}%`}>
                        <div className="w-4 h-4 bg-primary/10 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">10</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{token.top10Holders || 0}%</span>
                      </div>
                    </div>
                  </td>

                  {/* CHART Column */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center">
                      <MiniChart
                        key={`chart-${token.id}`}
                        data={tokenChartData[token.id] || []}
                        width={80}
                        height={32}
                        animate={true}
                      />
                    </div>
                  </td>

                  {/* TRADE Column */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <button
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium py-1.5 px-3 rounded transition-colors duration-200 flex items-center justify-center space-x-1 mx-auto"
                      title={`Trade ${token.name}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 3 4 7l4 4" />
                        <path d="M4 7h16" />
                        <path d="m16 21 4-4-4-4" />
                        <path d="M20 17H4" />
                      </svg>
                      <span>Trade</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
