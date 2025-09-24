export interface GetTokensRequest {
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

export interface TokenApiResponse {
  name: string;
  symbol: string;
  description: string;
  photo?: string;
  volumeUsd?: number;
  marketCapUsd?: number;
  progress?: number;
  holders?: number;
  createdAt?: string;
  twitter?: string;
  website?: string;
  telegram?: string;
  creator?: string;
  buys?: number;
  sells?: number;
  price?: number;
  priceUsd?: number;
  volumeSol?: number;
  txCount?: number;
  last_tx_time?: number;
  creatorSharePercentage?: number;
  topHoldersPercentage?: number;
  lastUpdated?: number;
  [key: string]: unknown; // For additional API fields
}

export interface GetTokensResponse {
  tokens: Record<string, TokenApiResponse>;
  total?: number;
  hasMore?: boolean;
}

export interface GetTokenTradesRequest {
  tokenId: string;
  limit?: number;
  offset?: number;
}

export interface TokenTrade {
  id: string;
  tokenId: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: string;
  trader: string;
}

export interface GetTokenTradesResponse {
  trades: TokenTrade[];
  total: number;
}

export interface UploadFileRequest {
  file: string; // base64 encoded
  metadata?: string;
}

export interface UploadFileResponse {
  photo?: string;
  url?: string;
}

export interface CreateTokenDraftRequest {
  name: string;
  symbol: string;
  description: string;
  decimals: number;
  supply: number;
  photo: string;
  metadataUri: string;
  hardcap: number;
  website: string;
  x: string; // Twitter handle
  telegram: string;
  version: number;
}

export interface CreateTokenDraftResponse {
  id: string;
  status: 'draft' | 'pending' | 'created';
  tokenAddress?: string;
}

export interface GetProfileRequest {
  wallet: string;
}

export interface ProfileData {
  wallet: string;
  name?: string;
  telegram?: string;
  avatar?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  wallet?: string;
  name?: string;
  telegram?: string;
  avatar?: string;
  bio?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  profile: ProfileData;
}

export interface GetPortfolioRequest {
  wallet: string;
}

export interface PortfolioItem {
  tokenId: string;
  tokenName: string;
  tokenSymbol: string;
  balance: number;
  value: number;
  averagePrice: number;
  profitLoss: number;
  profitLossPercentage: number;
}

export interface GetPortfolioResponse {
  wallet: string;
  totalValue: number;
  totalProfitLoss: number;
  items: PortfolioItem[];
}

export interface GetRewardsRequest {
  wallet: string;
}

export interface Reward {
  id: string;
  wallet: string;
  type: string;
  amount: number;
  token: string;
  status: 'pending' | 'claimed' | 'expired';
  createdAt: string;
  claimedAt?: string;
  expiresAt?: string;
}

export interface GetRewardsResponse {
  rewards: Reward[];
  total: number;
  unclaimed: number;
}

// WebSocket event types
export interface WebSocketPublicationContext {
  data: WebSocketEventData;
  [key: string]: unknown;
}

export interface WebSocketEventData {
  pub?: {
    data: MeteoraTokenUpdate;
  };
  data?: MeteoraTokenUpdate;
  token?: string;
  holders?: number;
  creatorSharePercentage?: number;
  topHoldersList?: Array<{
    address: string;
    percentage: number;
  }>;
  topHoldersPercentage?: number;
  price?: number;
  priceUsd?: number;
  volumeSol?: number;
  marketCapUsd?: number;
  buys?: number;
  sells?: number;
  txCount?: number;
  last_tx_time?: number;
  lastUpdated?: number;
  [key: string]: unknown;
}

export interface MeteoraTokenUpdate {
  token: string;
  holders: number;
  creatorSharePercentage: number;
  topHoldersList: Array<{
    address: string;
    percentage: number;
  }>;
  topHoldersPercentage: number;
  price: number;
  priceUsd: number;
  volumeSol: number;
  marketCapUsd: number;
  buys: number;
  sells: number;
  txCount: number;
  last_tx_time: number;
  lastUpdated: number;
  // Additional fields that may be present
  price_usd?: number;
  usd_price?: number;
  buyCount?: number;
  sellCount?: number;
  volumeUsd?: number;
  [key: string]: unknown; // For any additional fields from API
}

export interface PairUpdate {
  pairId: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: string;
}

export interface TradeUpdate {
  pairId: string;
  tradeId: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: string;
  trader: string;
}
