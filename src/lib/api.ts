import type {
  GetTokensRequest,
  GetTokensResponse,
  GetTokenTradesRequest,
  GetTokenTradesResponse,
  UploadFileRequest,
  UploadFileResponse,
  CreateTokenDraftRequest,
  CreateTokenDraftResponse,
  GetProfileRequest,
  ProfileData,
  UpdateProfileRequest,
  UpdateProfileResponse,
  GetPortfolioRequest,
  GetPortfolioResponse,
  GetRewardsRequest,
  GetRewardsResponse,
} from '../types/api';

export class LaunchMemeApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://launch.meme/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const headers = options?.headers ? { ...defaultHeaders, ...options.headers } : defaultHeaders;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        method: 'POST',
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      } else {
        const text = await response.text();
        return text as any;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('API request timed out');
      }
      throw error;
    }
  }

  // Token Data
  async getTokens(dto: GetTokensRequest = {}): Promise<GetTokensResponse> {
    return this.request('/tokens', {
      body: JSON.stringify(dto),
    });
  }

  // Get token trades
  async getTokenTrades(dto: GetTokenTradesRequest): Promise<GetTokenTradesResponse> {
    return this.request('/txs', {
      body: JSON.stringify(dto),
    });
  }

  // Mock data for development (when API is not available)
  private getMockTokens(): GetTokensResponse {
    return {
      tokens: {
        "11111111111111111111111111111112": {
          name: "Mock Token 1",
          symbol: "MTK1",
          description: "This is a mock token for development",
          photo: "https://via.placeholder.com/32",
          volumeUsd: 125000,
          marketCapUsd: 500000,
          progress: 25,
          holders: 1250,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          twitter: "https://twitter.com/mocktoken1",
          website: "https://mocktoken1.com",
          telegram: "https://t.me/mocktoken1",
          price: 0.0005,
          buys: 45,
          sells: 23
        },
        "22222222222222222222222222222223": {
          name: "Mock Token 2",
          symbol: "MTK2",
          description: "Another mock token for testing",
          photo: "https://via.placeholder.com/32",
          volumeUsd: 89000,
          marketCapUsd: 320000,
          progress: 75,
          holders: 890,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          twitter: "https://twitter.com/mocktoken2",
          website: "https://mocktoken2.com",
          telegram: "https://t.me/mocktoken2",
          price: 0.0012,
          buys: 67,
          sells: 12
        }
      }
    };
  }

  // Get mock tokens if API fails
  async getTokensWithFallback(dto: GetTokensRequest = {}): Promise<GetTokensResponse> {
    try {
      return await this.getTokens(dto);
    } catch (error) {
      console.warn('API request failed, using mock data:', error);
      return this.getMockTokens();
    }
  }

  // Upload file
  async uploadFile(data: UploadFileRequest): Promise<UploadFileResponse> {
    return this.request('/upload', {
      body: JSON.stringify(data),
    });
  }

  // Create token draft
  async createTokenDraft(data: CreateTokenDraftRequest): Promise<CreateTokenDraftResponse> {
    return this.request('/tokens/draft', {
      body: JSON.stringify(data),
    });
  }

  // Get user profile
  async getProfile(request: GetProfileRequest): Promise<ProfileData> {
    const formData = new URLSearchParams();
    formData.append('wallet', request.wallet);

    return this.request('/profile', {
      method: 'POST',
      body: formData.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  // Update user profile
  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    // Convert data to URL-encoded form data
    const formData = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    return this.request('/profile', {
      method: 'POST',
      body: formData.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  // Get user portfolio
  async getPortfolio(request: GetPortfolioRequest): Promise<GetPortfolioResponse> {
    const formData = new URLSearchParams();
    formData.append('wallet', request.wallet);

    return this.request('/portfolio', {
      method: 'POST',
      body: formData.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  // Get user rewards
  async getRewards(request: GetRewardsRequest): Promise<GetRewardsResponse> {
    return this.request(`/rewards?wallet=${encodeURIComponent(request.wallet)}`, {
      method: 'GET',
    });
  }
}
