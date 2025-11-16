import { useState, useEffect, useRef, useCallback } from 'react';

interface UseEventSourceOptions {
  onMessage?: (data: any) => void;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  onCompleted?: () => void;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
}

export function useEventSource(url: string | null, options: UseEventSourceOptions = {}) {
  const {
    onMessage,
    onError,
    onConnected,
    onCompleted,
    autoReconnect = true,
    maxReconnectAttempts = 5,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!url || eventSourceRef.current) return;

    try {
      const es = new EventSource(url);

      es.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptRef.current = 0;
        onConnected?.();
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch {
          onMessage?.(event.data);
        }
      };

      es.addEventListener('connected', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch {
          onMessage?.(event.data);
        }
      });

      es.addEventListener('assistant_message', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch {
          onMessage?.(event.data);
        }
      });

      es.addEventListener('completed', (event: MessageEvent) => {
        onCompleted?.();
        disconnect();
      });

      es.addEventListener('error', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          onError?.(new Error(data.error || 'Stream error'));
        } catch {
          onMessage?.(event.data);
        }
      });

      es.onerror = () => {
        setIsConnected(false);
        const err = new Error('Connection lost');
        setError(err);

        // Only call onError if we're not auto-reconnecting or if we've exhausted retries
        if (!autoReconnect || reconnectAttemptRef.current >= maxReconnectAttempts) {
          onError?.(err);
        }

        if (autoReconnect && reconnectAttemptRef.current < maxReconnectAttempts) {
          reconnectAttemptRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 30000);

          reconnectTimeoutRef.current = setTimeout(() => {
            eventSourceRef.current = null;
            connect();
          }, delay);
        } else {
          disconnect();
        }
      };

      eventSourceRef.current = es;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect');
      setError(error);
      onError?.(error);
    }
  }, [url, onMessage, onError, onConnected, onCompleted, autoReconnect, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (url) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [url, connect, disconnect]);

  return {
    isConnected,
    error,
    disconnect,
    reconnect: connect,
  };
}
