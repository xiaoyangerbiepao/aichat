import { useRef, useState, useEffect, useCallback } from 'react';

type WebSocketStatus = 'connecting' | 'open' | 'closing' | 'closed';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (event: MessageEvent) => void;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}

export function useWebSocket(
  url: string,
  options: UseWebSocketOptions = {}
) {
  const {
    autoConnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  // ✅用ref保存回调，避免connect频繁更新
  const callbacksRef = useRef(options);
  callbacksRef.current = options;

  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>('closed');
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  // ✅标记：是否手动关闭（组件卸载、主动disconnect），手动关闭不重连
  const isManualCloseRef = useRef(false);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  // ✅手动关闭，打上标记
  const disconnect = useCallback(() => {
    isManualCloseRef.current = true;
    clearReconnectTimer();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, [clearReconnectTimer]);

  const connect = useCallback(() => {
    // 新建连接，重置手动关闭标记
    isManualCloseRef.current = false;
    disconnect();
    setStatus('connecting');

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = (e) => {
      reconnectCountRef.current = 0;
      setStatus('open');
      callbacksRef.current.onOpen?.(e);
    };

    ws.onmessage = (e) => {
      setLastMessage(e);
      callbacksRef.current.onMessage?.(e);
    };

    ws.onclose = (e) => {
      setStatus('closed');
      callbacksRef.current.onClose?.(e);

      // ✅关键：手动关闭 直接return，不重连！
      if (isManualCloseRef.current) return;

      // 只有非手动、异常断开才重连
      if (!e.wasClean && reconnectCountRef.current < maxReconnectAttempts) {
        reconnectCountRef.current += 1;
        clearReconnectTimer();
        reconnectTimerRef.current = window.setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    };

    ws.onerror = (e) => {
      setStatus('closed');
      callbacksRef.current.onError?.(e);
    };
  }, [url, disconnect, maxReconnectAttempts, reconnectInterval, clearReconnectTimer]);


  const sendMessage = useCallback(
    (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(data);
        return true;
      }
      console.warn('WebSocket 未连接，消息发送失败');
      return false;
    },
    []
  );

  // ✅useEffect只依赖autoConnect，不依赖connect/disconnect，防止StrictMode疯狂执行
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect]);

  return {
    status,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
    isConnected: status === 'open',
  };
}
