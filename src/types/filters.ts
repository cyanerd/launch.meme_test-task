import type { TokenData } from './index';

export interface FilterCondition {
  min?: number;
  max?: number;
  hours?: number;
}

export interface FilterOption {
  label: string;
  conditions: FilterCondition | null;
}

export type FilterType = 'priceRange' | 'marketCap' | 'volume' | 'timeFrame';

export const FILTER_OPTIONS = {
  priceRange: {
    'all-prices': { label: 'All Prices', conditions: null },
    'price-0-0.01': { label: '$0 - $0.01', conditions: { min: 0, max: 0.01 } },
    'price-0.01-0.1': { label: '$0.01 - $0.1', conditions: { min: 0.01, max: 0.1 } },
    'price-0.1-1': { label: '$0.1 - $1', conditions: { min: 0.1, max: 1 } },
    'price-1-plus': { label: '$1+', conditions: { min: 1, max: Infinity } },
  },
  marketCap: {
    'any-size': { label: 'Any Size', conditions: null },
    'mc-0-10k': { label: '$0 - $10K', conditions: { min: 0, max: 10000 } },
    'mc-10k-100k': { label: '$10K - $100K', conditions: { min: 10000, max: 100000 } },
    'mc-100k-1m': { label: '$100K - $1M', conditions: { min: 100000, max: 1000000 } },
    'mc-1m-plus': { label: '$1M+', conditions: { min: 1000000, max: Infinity } },
  },
  volume: {
    'any-volume': { label: 'Any Volume', conditions: null },
    'vol-0-1k': { label: '$0 - $1K', conditions: { min: 0, max: 1000 } },
    'vol-1k-10k': { label: '$1K - $10K', conditions: { min: 1000, max: 10000 } },
    'vol-10k-100k': { label: '$10K - $100K', conditions: { min: 10000, max: 100000 } },
    'vol-100k-plus': { label: '$100K+', conditions: { min: 100000, max: Infinity } },
  },
  timeFrame: {
    'all-time': { label: 'All Time', conditions: null },
    'last-24h': { label: 'Last 24h', conditions: { hours: 24 } },
    'last-7d': { label: 'Last 7 days', conditions: { hours: 24 * 7 } },
    'last-30d': { label: 'Last 30 days', conditions: { hours: 24 * 30 } },
  },
} as const satisfies Record<FilterType, Record<string, FilterOption>>;

export type FilterValue = keyof typeof FILTER_OPTIONS.priceRange |
  keyof typeof FILTER_OPTIONS.marketCap |
  keyof typeof FILTER_OPTIONS.volume |
  keyof typeof FILTER_OPTIONS.timeFrame;

export interface Filters {
  priceRange: keyof typeof FILTER_OPTIONS.priceRange;
  marketCap: keyof typeof FILTER_OPTIONS.marketCap;
  volume: keyof typeof FILTER_OPTIONS.volume;
  timeFrame: keyof typeof FILTER_OPTIONS.timeFrame;
}

// Default filter values
export const DEFAULT_FILTERS: Filters = {
  priceRange: 'all-prices',
  marketCap: 'any-size',
  volume: 'any-volume',
  timeFrame: 'all-time',
} as const;

// Sort configuration
export const SORT_OPTIONS = {
  'market-cap': {
    label: 'Market Cap',
    sortFn: (a: TokenData, b: TokenData) => b.marketCap - a.marketCap
  },
  'volume': {
    label: 'Volume',
    sortFn: (a: TokenData, b: TokenData) => b.volume - a.volume
  },
  'created': {
    label: 'Created',
    sortFn: (a: TokenData, b: TokenData) => b.createdAt.getTime() - a.createdAt.getTime()
  },
} as const;

export type SortValue = keyof typeof SORT_OPTIONS;

// Default sort value
export const DEFAULT_SORT: SortValue = 'market-cap';
