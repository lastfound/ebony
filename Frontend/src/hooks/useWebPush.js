import { useState, useEffect } from 'react';
import { checkSubscriptionStatus, subscribeUserToPush, unsubscribeUserFromPush } from '../services/webPush';

export function useWebPush() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkSubscriptionStatus()
      .then(status => setIsSubscribed(status))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const subscribe = async () => {
    setLoading(true);
    setError('');
    try {
      await subscribeUserToPush();
      setIsSubscribed(true);
    } catch (err) {
      if (err.message.includes('permission')) {
        setError('❌ Notifikasi diblokir oleh browser. Silakan izinkan melalui pengaturan browser.');
      } else {
        setError(err.message || 'Gagal mengaktifkan notifikasi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    setError('');
    try {
      await unsubscribeUserFromPush();
      setIsSubscribed(false);
    } catch (err) {
      setError('Gagal menonaktifkan notifikasi.');
    } finally {
      setLoading(false);
    }
  };

  return { isSubscribed, loading, error, subscribe, unsubscribe };
}
