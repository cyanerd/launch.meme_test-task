import { useMemo } from 'react';
import { LaunchMemeApiClient } from '../lib/api';

export function useApiClient() {
  return useMemo(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://launch.meme/api';
    return new LaunchMemeApiClient(baseUrl);
  }, []);
}
