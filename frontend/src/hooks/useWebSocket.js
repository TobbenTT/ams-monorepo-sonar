import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * WebSocket hook for real-time updates.
 * Connects to ws(s)://host/ws/{plantId} and calls onMessage when data arrives.
 * Auto-reconnects on disconnect.
 */
export function useWebSocket(plantId, onMessage) {
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const [connected, setConnected] = useState(false);

  const connect = useCallback(() => {
    if (!plantId) return;
    try {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = `${proto}//${window.location.host}/ws/${plantId}`;
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setConnected(true);
        // Ping every 25s to keep alive
        wsRef.current = ws;
        wsRef.current._pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send('ping');
        }, 25000);
      };

      ws.onmessage = (evt) => {
        if (evt.data === 'pong') return;
        try {
          const msg = JSON.parse(evt.data);
          if (onMessage) onMessage(msg);
        } catch {}
      };

      ws.onclose = () => {
        setConnected(false);
        if (wsRef.current?._pingInterval) clearInterval(wsRef.current._pingInterval);
        // Reconnect after 3s
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch {}
  }, [plantId, onMessage]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current?._pingInterval) clearInterval(wsRef.current._pingInterval);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return { connected };
}
