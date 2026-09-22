/**
 * webPush.js
 * Utility untuk mendaftarkan Service Worker dan mengelola Web Push Subscription
 */

import api from '../api/axiosInstance';

// Mengubah Base64-URL-encoded string menjadi Uint8Array (dibutuhkan oleh Push API)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Daftarkan Service Worker
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Browser tidak mendukung Service Worker atau Web Push Notification');
  }

  try {
    const registration = await navigator.serviceWorker.register('/web-push-sw.js');
    return registration;
  } catch (error) {
    console.error('Service Worker Registration Failed:', error);
    throw error;
  }
}

/**
 * Subscribe browser ke Push Manager & kirim subscription ke Laravel API
 */
export async function subscribeUserToPush() {
  const registration = await registerServiceWorker();

  // Minta permission ke user
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission denied');
  }

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    throw new Error('VAPID Public Key belum diset di .env');
  }

  const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedVapidKey
  });

  const subscriptionData = subscription.toJSON();

  // Kirim data ke Laravel backend
  await api.post('/admin/push-subscriptions', {
    endpoint: subscriptionData.endpoint,
    keys: {
      p256dh: subscriptionData.keys.p256dh,
      auth: subscriptionData.keys.auth
    }
  });

  return subscription;
}

/**
 * Unsubscribe dari Push Manager & hapus dari Laravel API
 */
export async function unsubscribeUserFromPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    const endpoint = subscription.endpoint;
    
    // Hapus dari backend
    await api.delete('/admin/push-subscriptions', {
      data: { endpoint }
    });

    // Unsubscribe dari browser
    await subscription.unsubscribe();
    return true;
  }
  return false;
}

/**
 * Cek apakah browser saat ini sudah tersubscribe
 */
export async function checkSubscriptionStatus() {
  if (!('serviceWorker' in navigator)) return false;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) return false;

  // Verifikasi ke backend apakah subscription ini valid/aktif
  try {
    const res = await api.get('/admin/push-subscriptions/check', {
      params: { endpoint: subscription.endpoint }
    });
    return res.data.is_subscribed;
  } catch (err) {
    return false;
  }
}
