import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { getNewReservations } from '../../api/adminApi';
import { playAlertSound } from '../../services/alertSound';
import { subscribeUserToPush } from '../../services/webPush';
import { NotificationContext } from '../../context/NotificationContext';

const POLL_INTERVAL = 5000;
const TOAST_DURATION = 10000;
const MAX_TOASTS = 3;
const MAX_NOTIFICATIONS = 30;
const STORAGE_KEY = 'admin_notifications';

function loadStoredNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_NOTIFICATIONS) : [];
  } catch {
    return [];
  }
}

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(loadStoredNotifications);
  const [alerts, setAlerts] = useState([]);
  const [flash, setFlash] = useState(false);

  const seenIdsRef = useRef(new Set());
  const storedIdsRef = useRef(new Set(loadStoredNotifications().map((n) => n.id)));
  const initializedRef = useRef(false);
  const originalTitleRef = useRef(document.title);
  const titleTimerRef = useRef(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      /* storage penuh / diblokir — abaikan, notifikasi tetap jalan di memory */
    }
  }, [notifications]);

  const doTitleBlink = () => {
    clearInterval(titleTimerRef.current);
    let on = false;
    const base = originalTitleRef.current;
    let ticks = 0;
    titleTimerRef.current = setInterval(() => {
      on = !on;
      ticks += 1;
      document.title = on ? '🔔 Reservasi Baru! — Ebony Admin' : base;
      if (ticks >= 8) {
        clearInterval(titleTimerRef.current);
        document.title = base;
      }
    }, 500);
  };

  const toNotification = (r) => ({
    id: r.id,
    guest_name: r.guest_name,
    booking_number: r.booking_number,
    party_size: r.party_size,
    time: r.time,
    formatted_date: r.formatted_date,
    source: r.source || 'web',
    created_at: r.created_at || new Date().toISOString(),
  });

  const triggerAlerts = (newReservations) => {
    if (newReservations.length === 0) return;

    const now = Date.now();
    const items = newReservations.map((r) => ({
      key: `${r.id}-${now}`,
      id: r.id,
      guest_name: r.guest_name,
      booking_number: r.booking_number,
      party_size: r.party_size,
      time: r.time,
      formatted_date: r.formatted_date,
    }));

    setAlerts((prev) => [...prev, ...items].slice(-MAX_TOASTS));

    // Masukkan ke daftar notifikasi lonceng (yang bisa diklik admin)
    setNotifications((prev) => {
      const incoming = newReservations.map((r) => ({ ...toNotification(r), read: false }));
      return [...incoming, ...prev].slice(0, MAX_NOTIFICATIONS);
    });

    playAlertSound();
    doTitleBlink();

    // Flash layar (headlamp) — kedip singkat
    setFlash(true);
    setTimeout(() => setFlash(false), 700);
  };

  const dismissAlert = (key) => {
    setAlerts((prev) => prev.filter((a) => a.key !== key));
  };

  const openAlert = (key) => {
    const alert = alerts.find((a) => a.key === key);
    if (!alert) return;
    dismissAlert(key);
    navigate(`/admin/reservations/${alert.id}`);
  };

  const clearUnread = useCallback(() => {
    setNotifications((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = clearUnread;

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer = null;

    const check = async () => {
      try {
        const res = await getNewReservations();
        const list = Array.isArray(res?.data) ? res.data : [];

        const fresh = [];
        list.forEach((r) => {
          if (!seenIdsRef.current.has(r.id)) {
            seenIdsRef.current.add(r.id);
            fresh.push(r);
          }
        });

        if (cancelled) return;

        if (!initializedRef.current) {
          initializedRef.current = true; // Polling pertama = baseline, tidak bunyikan alert

          // Reservasi yang masuk saat adminAway tetap dimasukkan ke lonceng sebagai
          // belum dibaca, supaya tidak ada yang hilang — hanya bunyi/flash yang ditahan.
          const missed = fresh.filter((r) => !storedIdsRef.current.has(r.id));
          if (missed.length > 0) {
            setNotifications((prev) => {
              const incoming = missed.map((r) => ({ ...toNotification(r), read: false }));
              return [...incoming, ...prev].slice(0, MAX_NOTIFICATIONS);
            });
          }
          return;
        }

        if (fresh.length > 0) triggerAlerts(fresh);
      } catch {
        /* network error — abaikan, polling berikutnya akan mencoba lagi */
      }
    };

    check();
    timer = setInterval(check, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(timer);
      clearInterval(titleTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const originalTitle = originalTitleRef.current;
    document.title = originalTitle;
    return () => {
      document.title = originalTitle;
    };
  }, []);

  useEffect(() => {
    // Auto-enable Web Push sekali saja per sesi (best-effort, tidak memaksa):
    // kalau sebelumnya admin sudah menolak/subscribe, biarkan; kalau izin masih
    // "default", minta sekali dengan lancar supaya notif bisa muncul walau admin
    // sedang di tab/browser lain atau portal tidak dibuka (notifikasi sistem + getar).
    const key = 'webpush_auto_init_attempted';
    let cancelled = false;

    const attempt = async () => {
      try {
        if (localStorage.getItem(key)) return;

        const reg = await navigator.serviceWorker?.ready;
        if (cancelled || !reg) { localStorage.setItem(key, '1'); return; }

        const existing = await reg.pushManager.getSubscription();
        if (existing) { localStorage.setItem(key, '1'); return; }

        if (Notification.permission === 'denied') { localStorage.setItem(key, '1'); return; }

        localStorage.setItem(key, '1'); // set sebelum minta izin agar tak giring ulang
        await subscribeUserToPush();
      } catch {
        /* gagal/izin ditolak — diam-diam, jangan ganggu halaman */
      }
    };

    attempt();
    return () => { cancelled = true; };
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (alerts.length === 0) return undefined;
    const keys = alerts.map((a) => a.key);
    const t = setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => !keys.includes(a.key)));
    }, TOAST_DURATION);
    return () => clearTimeout(t);
  }, [alerts]);

  const notificationValue = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearNotifications,
    }),
    [notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearNotifications]
  );

  return (
    <NotificationContext.Provider value={notificationValue}>
      <div className="admin-layout">
        <Sidebar unreadCount={unreadCount} onClearUnread={clearUnread} />
        <main className="admin-content">
          <div className="admin-toolbar">
            <NotificationBell />
          </div>
          {children}
        </main>

        {flash && <div className="screen-flash" />}

        <div className="reservation-toast-stack">
          {alerts.map((a) => (
            <div key={a.key} className="reservation-toast" role="alert" onClick={() => openAlert(a.key)}>
              <div className="reservation-toast__icon">🔔</div>
              <div className="reservation-toast__body">
                <span className="reservation-toast__label">RESERVASI BARU</span>
                <span className="reservation-toast__title">{a.guest_name}</span>
                <span className="reservation-toast__meta">
                  {a.formatted_date} • {a.time} • {a.party_size} orang • #{a.booking_number}
                </span>
              </div>
              <button
                type="button"
                className="reservation-toast__close"
                aria-label="Tutup"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissAlert(a.key);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
}
