import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketClient } from '../lib/websocket';
import type { WSEventHandlers } from '../lib/websocket';

const WS_CONFIG = {
  URL: import.meta.env.VITE_WS_URL,
  JWT_TOKEN: import.meta.env.VITE_WS_JWT_TOKEN
};

interface UseWebSocketProps {
  url?: string;
  token?: string;
  autoConnect?: boolean;
  handlers?: WSEventHandlers;
}

interface UseWebSocketReturn {
  client: WebSocketClient | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  subscribeToPairs: () => void;
  unsubscribeFromPairs: () => void;
  subscribeToTokenUpdates: () => void;
  unsubscribeFromTokenUpdates: () => void;
  subscribeToTrades: (pairId: string) => void;
  unsubscribeFromTrades: (pairId: string) => void;
}

export function useWebSocket({
  url = WS_CONFIG.URL,
  token = WS_CONFIG.JWT_TOKEN,
  autoConnect = true,
  handlers = {}
}: UseWebSocketProps): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    const wsHandlers: WSEventHandlers = {
      ...handlers,
      onConnected: () => {
        setIsConnected(true);
        handlers.onConnected?.();
      },
      onDisconnected: () => {
        setIsConnected(false);
        handlers.onDisconnected?.();
      },
      onError: (error) => {
        setIsConnected(false);
        handlers.onError?.(error);
      }
    };

    try {
      clientRef.current = new WebSocketClient(url, token, wsHandlers);

      if (autoConnect) {
        clientRef.current.connect();
      }
    } catch (error) {
      console.error('Failed to create WebSocket client:', error);
    }

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
      }
    };
  }, [url, token, autoConnect]);

  const connect = useCallback(() => {
    if (clientRef.current && !isConnected) {
      clientRef.current.connect();
    }
  }, [isConnected]);

  const disconnect = useCallback(() => {
    if (clientRef.current && isConnected) {
      clientRef.current.disconnect();
    }
  }, [isConnected]);

  const subscribeToPairs = useCallback(() => {
    if (clientRef.current && isConnected) {
      try {
        const subscription = clientRef.current.subscribeToPairs();
        return subscription;
      } catch (error) {
        console.error('Failed to subscribe to pairs:', error);
      }
    }
  }, [isConnected]);

  const subscribeToTrades = useCallback((pairId: string) => {
    if (clientRef.current && isConnected) {
      try {
        clientRef.current.subscribeToTrades(pairId);
      } catch (error) {
        console.error('Failed to subscribe to trades:', error);
      }
    }
  }, [isConnected]);

  const unsubscribeFromPairs = useCallback(() => {
    if (clientRef.current) {
      try {
        clientRef.current.unsubscribeFromPairs();
      } catch (error) {
        console.error('Failed to unsubscribe from pairs:', error);
      }
    }
  }, []);

  const subscribeToTokenUpdates = useCallback(() => {
    if (clientRef.current && isConnected) {
      try {
        const subscription = clientRef.current.subscribeToTokenUpdates();
        return subscription;
      } catch (error) {
        console.error('Failed to subscribe to token updates:', error);
      }
    }
  }, [isConnected]);

  const unsubscribeFromTokenUpdates = useCallback(() => {
    if (clientRef.current) {
      try {
        clientRef.current.unsubscribeFromTokenUpdates();
      } catch (error) {
        console.error('Failed to unsubscribe from token updates:', error);
      }
    }
  }, []);

  const unsubscribeFromTrades = useCallback((pairId: string) => {
    if (clientRef.current) {
      try {
        clientRef.current.unsubscribeFromTrades(pairId);
      } catch (error) {
        console.error('Failed to unsubscribe from trades:', error);
      }
    }
  }, []);

  return {
    client: clientRef.current,
    isConnected,
    connect,
    disconnect,
    subscribeToPairs,
    unsubscribeFromPairs,
    subscribeToTokenUpdates,
    unsubscribeFromTokenUpdates,
    subscribeToTrades,
    unsubscribeFromTrades,
  };
}
