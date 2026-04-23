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

        // Refresh access token before sending — push subscribe sits outside
        // the normal requester flow, so an expired token would 401 here.
        let freshToken = token;
        try {
          const { refreshToken } = await import('../../utils/refreshToken');
          const rawAuth = localStorage.getItem('auth');
          if (rawAuth) {
            const auth = JSON.parse(rawAuth);
            const nt = await refreshToken(auth);
            if (nt) freshToken = nt;
          }
        } catch {
          /* fall back to existing token */
        }

        // Send subscription to server
        const subRes = await fetch(`${SOCKET_URL}/push/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${freshToken}` },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            keys: {
              p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
              auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')))),
            },
          }),
        });
        if (!subRes.ok && subRes.status !== 401) {
          console.warn('[Push] subscribe returned', subRes.status);
        }
        // 401 is swallowed silently — push notifications are non-critical;
        // the user will re-try on next page load when the session is valid.
      } catch (err) {
        console.error('Push setup error:', err);
      }
    };

    // Defer push setup — it was blocking the critical path for 5+ seconds
    // on home (/push/vapid-key → /push/subscribe chain). Push notifications
    // are non-critical; running during browser idle frees the main thread
    // for hero render and initial content.
    const runIdle = window.requestIdleCallback
      ? (cb) => window.requestIdleCallback(cb, { timeout: 5000 })
      : (cb) => setTimeout(cb, 2500);
    const cancelIdle = window.cancelIdleCallback
      ? (id) => window.cancelIdleCallback(id)
      : (id) => clearTimeout(id);
    const idleId = runIdle(() => setupPush());
    return () => cancelIdle(idleId);
  }, [isAuthentication, token]);

  return (
    <SocketContext.Provider value={{ socket, onlineCount, onlineUserIds, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
