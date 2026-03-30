import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthContext } from './UserContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const SocketProvider = ({ children }) => {
  const { token, isAuthentication } = useAuthContext();
  const [socket, setSocket] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const s = io(SOCKET_URL, {
      auth: { token: token || undefined },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity,
    });

    s.on('connect', () => setIsConnected(true));
    s.on('disconnect', () => setIsConnected(false));
    s.on('forum:onlineUsers', ({ count, userIds }) => {
      setOnlineCount(count);
      if (userIds) setOnlineUserIds(new Set(userIds.map(String)));
    });

    socketRef.current = s;
    setSocket(s);

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  // Update auth token on reconnect
  useEffect(() => {
    if (socketRef.current && token) {
      socketRef.current.auth = { token };
    }
  }, [token]);

  // Push Notification subscription
  useEffect(() => {
    if (!isAuthentication || !token) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const setupPush = async () => {
      try {
        // Register service worker
        const reg = await navigator.serviceWorker.register('/sw.js');

        // Get VAPID key
        const res = await fetch(`${SOCKET_URL}/push/vapid-key`);
        if (!res.ok) return;
        const { publicKey } = await res.json();
        if (!publicKey) return;

        // Check existing subscription
        let subscription = await reg.pushManager.getSubscription();

        if (!subscription) {
          // Ask permission
          const perm = await Notification.requestPermission();
          if (perm !== 'granted') return;

          // Subscribe
          const urlBase64ToUint8Array = (base64String) => {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
            const raw = atob(base64);
            return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
          };

          subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
          });
        }

        // Send subscription to server
        await fetch(`${SOCKET_URL}/push/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            keys: {
              p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
              auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')))),
            },
          }),
        });
      } catch (err) {
        console.error('Push setup error:', err);
      }
    };

    setupPush();
  }, [isAuthentication, token]);

  return (
    <SocketContext.Provider value={{ socket, onlineCount, onlineUserIds, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
