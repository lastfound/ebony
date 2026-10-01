import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

function timeAgo(isoString) {
  if (!isoString) return '';
  const then = new Date(isoString).getTime();
  if (Number.isNaN(then)) return '';

  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return 'baru saja';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

function sourceMeta(source) {
  return source === 'ai'
    ? { label: 'AI Chatbot', icon: '🤖', className: 'notif-item__source--ai' }
    : { label: 'Website', icon: '🌐', className: 'notif-item__source--web' };
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const hasUnread = unreadCount > 0;
  const hasNotification = notifications.length > 0;

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleOpenItem = (item) => {
    markAsRead(item.id);
    setIsOpen(false);
    navigate(`/admin/reservations/${item.id}`);
  };

  const handleToggle = () => {
    setIsOpen((open) => !open);
  };

  const handleMarkAll = () => {
    markAllAsRead();
  };

  return (
    <div className="notif" ref={wrapperRef}>
      <button
        type="button"
        onClick={handleToggle}
        className={`notif__bell ${hasUnread ? 'notif__bell--unread' : ''}`}
        aria-label={hasUnread ? `Notifikasi (${unreadCount} belum dibaca)` : 'Notifikasi'}
        aria-expanded={isOpen}
        title={hasUnread ? `${unreadCount} notifikasi baru` : 'Tidak ada notifikasi baru'}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.73 21a2 2 0 0 1-3.46 0"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {hasUnread ? (
          <span className="notif__count notif__count--pulse">{unreadCount > 99 ? '99+' : unreadCount}</span>
        ) : (
          <span className="notif__none" title="Tidak ada notifikasi baru">✕</span>
        )}
      </button>

      {isOpen && (
        <div className="notif__panel" role="dialog" aria-label="Daftar notifikasi">
          <div className="notif__panel-header">
            <div>
              <span className="notif__panel-title">NOTIFIKASI</span>
              <span className="notif__panel-subtitle">
                {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
              </span>
            </div>
            {hasUnread && (
              <button type="button" className="notif__panel-action" onClick={handleMarkAll}>
                Tandai dibaca
              </button>
            )}
          </div>

          <div className="notif__panel-list">
            {!hasNotification && (
              <div className="notif__empty">
                <span className="notif__empty-icon">🔕</span>
                <span className="notif__empty-title">Belum ada notifikasi</span>
                <span className="notif__empty-text">
                  Reservasi baru dari website maupun AI chatbot akan muncul di sini.
                </span>
              </div>
            )}

            {notifications.map((item) => {
              const source = sourceMeta(item.source);
              return (
                <button
                  type="button"
                  key={item.id}
                  className={`notif-item ${item.read ? '' : 'notif-item--unread'}`}
                  onClick={() => handleOpenItem(item)}
                >
                  <span className="notif-item__icon">🔔</span>
                  <span className="notif-item__body">
                    <span className="notif-item__label">
                      RESERVASI BARU
                      <span className={`notif-item__source ${source.className}`}>
                        {source.icon} {source.label}
                      </span>
                    </span>
                    <span className="notif-item__title">{item.guest_name}</span>
                    <span className="notif-item__meta">
                      {item.formatted_date} • {item.time} • {item.party_size} orang • #{item.booking_number}
                    </span>
                  </span>
                  <span className="notif-item__side">
                    <span className="notif-item__time">{timeAgo(item.created_at)}</span>
                    {!item.read && <span className="notif-item__dot" aria-label="Belum dibaca" />}
                  </span>
                </button>
              );
            })}
          </div>

          {hasNotification && (
            <div className="notif__panel-footer">
              <button type="button" className="notif__panel-action notif__panel-action--muted" onClick={clearNotifications}>
                Hapus semua riwayat
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
