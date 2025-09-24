import { Centrifuge } from 'centrifuge';
import type { MeteoraTokenUpdate, PairUpdate, TradeUpdate, WebSocketEventData } from '../types/api';

export type WSEventHandlers = {
  onPairUpdate?: (data: PairUpdate) => void;
  onTradeUpdate?: (data: TradeUpdate) => void;
  onMeteoraTokenUpdate?: (data: MeteoraTokenUpdate) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
};

export class WebSocketClient {
  private centrifuge: Centrifuge;
  private handlers: WSEventHandlers;
  private subscribedPairs: Set<string> = new Set();
  private pairsSubscription: any = null; // Centrifuge.Subscription
  private tokenUpdatesSubscription: any = null; // Centrifuge.Subscription

  constructor(
    url: string = 'wss://launch.meme/connection/websocket',
    token: string,
    handlers: WSEventHandlers = {}
  ) {
    this.handlers = handlers;

    this.centrifuge = new Centrifuge(url, {
      token,
      debug: process.env.NODE_ENV === 'development',
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.centrifuge.on('connected', () => {
      this.handlers.onConnected?.();
    });

    this.centrifuge.on('disconnected', () => {
      this.handlers.onDisconnected?.();
    });

    this.centrifuge.on('error', (ctx) => {
      console.error('WebSocket error:', ctx);
      this.handlers.onError?.(new Error('WebSocket error'));
    });
  }

  connect() {
    this.centrifuge.connect();
  }

  disconnect() {
    if (this.pairsSubscription) {
      this.pairsSubscription.unsubscribe();
      this.pairsSubscription = null;
    }

    if (this.tokenUpdatesSubscription) {
      this.tokenUpdatesSubscription.unsubscribe();
      this.tokenUpdatesSubscription = null;
    }

    if (this.subscribedPairs.size > 0) {
      this.subscribedPairs.clear();
    }

    this.centrifuge.disconnect();
  }

  // Subscribe to pairs updates (general market data)
  subscribeToPairs() {
    // Check if already subscribed to avoid duplicate subscriptions
    if (this.pairsSubscription) {
      return this.pairsSubscription;
    }

    const subscription = this.centrifuge.newSubscription('pairs');
    subscription.on('publication', (ctx) => {
      try {
        const data = ctx.data as PairUpdate;
        this.handlers.onPairUpdate?.(data);
      } catch (error) {
        console.error('Error processing pairs update:', error);
        this.handlers.onError?.(error as Error);
      }
    });

    subscription.subscribe();
    this.pairsSubscription = subscription;
    return subscription;
  }

  // Subscribe to trades for a specific pair
  subscribeToTrades(pairId: string) {
    if (this.subscribedPairs.has(pairId)) {
      console.warn(`Already subscribed to trades for pair ${pairId}`);
      return;
    }

    const channel = `trades:${pairId}`;
    const subscription = this.centrifuge.newSubscription(channel);

    subscription.on('publication', (ctx) => {
      try {
        const data = ctx.data as TradeUpdate;
        this.handlers.onTradeUpdate?.(data);
      } catch (error) {
        console.error(`Error processing trade update for ${pairId}:`, error);
        this.handlers.onError?.(error as Error);
      }
    });

    subscription.subscribe();
    this.subscribedPairs.add(pairId);
    return subscription;
  }

  // Unsubscribe from trades for a specific pair
  unsubscribeFromTrades(pairId: string) {
    const channel = `trades:${pairId}`;
    const subscription = this.centrifuge.getSubscription(channel);

    if (subscription) {
      subscription.unsubscribe();
      this.subscribedPairs.delete(pairId);
    }
  }

  // Unsubscribe from pairs updates
  unsubscribeFromPairs() {
    if (this.pairsSubscription) {
      this.pairsSubscription.unsubscribe();
      this.pairsSubscription = null;
    }
  }

  // Subscribe to meteora token updates (real channel used by launch.meme)
  subscribeToTokenUpdates() {
    // Check if already subscribed to avoid duplicate subscriptions
    if (this.tokenUpdatesSubscription) {
      return this.tokenUpdatesSubscription;
    }

    const subscription = this.centrifuge.newSubscription('meteora-tokenUpdates');

    subscription.on('publication', (ctx) => {
      try {
        const ctxData = ctx.data as WebSocketEventData;

        // Handle different message formats - get data from WebSocket message
        let meteoraData: WebSocketEventData | undefined;
        if (ctxData?.pub?.data) {
          meteoraData = ctxData.pub.data;
        } else if (ctxData?.data) {
          meteoraData = ctxData.data;
        } else if (ctxData) {
          meteoraData = ctxData;
        }

        if (meteoraData && meteoraData.token) {
          const tokenUpdate: MeteoraTokenUpdate = {
            token: meteoraData.token,
            holders: meteoraData.holders || 0,
            creatorSharePercentage: meteoraData.creatorSharePercentage || 0,
            topHoldersList: meteoraData.topHoldersList || [],
            topHoldersPercentage: meteoraData.topHoldersPercentage || 0,
            price: meteoraData.price || 0,
            priceUsd: meteoraData.priceUsd || 0,
            volumeSol: meteoraData.volumeSol || 0,
            marketCapUsd: meteoraData.marketCapUsd || 0,
            buys: meteoraData.buys || 0,
            sells: meteoraData.sells || 0,
            txCount: meteoraData.txCount || 0,
            last_tx_time: meteoraData.last_tx_time || 0,
            lastUpdated: meteoraData.lastUpdated || Date.now()
          };

          // Log for all tokens to see which ones are coming from WebSocket
          console.log('📊 WebSocket token data:', {
            token: meteoraData.token,
            marketCap: meteoraData.marketCapUsd,
            price: meteoraData.price,
            holders: meteoraData.holders
          });

          // Call meteora-specific handler if available
          this.handlers.onMeteoraTokenUpdate?.(tokenUpdate);

          // Also call generic pair update handler for backward compatibility
          const pairUpdate: PairUpdate = {
            pairId: meteoraData.token,
            price: meteoraData.price || 0,
            change24h: 0,
            volume24h: meteoraData.volumeSol || 0,
            timestamp: new Date().toISOString()
          };
          this.handlers.onPairUpdate?.(pairUpdate);
        }
      } catch (error) {
        console.error('Error processing meteora token update:', error);
        this.handlers.onError?.(error as Error);
      }
    });

    subscription.subscribe();
    this.tokenUpdatesSubscription = subscription;
    return subscription;
  }

  // Unsubscribe from meteora token updates
  unsubscribeFromTokenUpdates() {
    if (this.tokenUpdatesSubscription) {
      this.tokenUpdatesSubscription.unsubscribe();
      this.tokenUpdatesSubscription = null;
    }
  }

  // Get connection state
  getState() {
    return this.centrifuge.state;
  }

  // Check if connected
  isConnected(): boolean {
    return this.centrifuge.state === 'connected';
  }
}
