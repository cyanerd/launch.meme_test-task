export * from './filters';
export * from './forms';
export * from './api';

export interface User {
  id: string;
  email?: string | { address: string; verifiedAt?: string };
  wallet?: {
    address: string;
    chainType: string;
  };
}

export interface TokenData {
  id: string;
  name: string;
  symbol: string;
  description: string;
  avatar: string;
  ca: string;
  volume: number;
  marketCap: number;
  progress: number;
  holders: number;
  createdAt: Date;
  twitter?: string;
  website?: string;
  telegram?: string;
  creator?: string;
  buys?: number;
  sells?: number;
  price?: number;
  priceUsd?: number;
  volumeSol?: number;
  volumeUsd?: number;
  txCount?: number;
  lastTxTime?: number;
  marketCapUsd?: number;
  devHolders?: number;
  top10Holders?: number;
  lastUpdated?: number;
}
