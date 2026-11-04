import api from '../api/axiosInstance';

export const DEFAULT_SITE_SETTINGS = {
  about_title: 'The Essence of Ebony',
  about_subtitle: 'Simple Elegance',
  about_description: `Ebony is conceived as a sanctuary of culinary artistry, an escape from the ordinary where every detail is meticulously curated. We believe that true luxury lies in simple elegance, stripping away the superfluous to reveal the profound and authentic soul of our ingredients.

Our philosophy is deeply rooted in our terroir. We journey across seasons to source the finest produce, treating each element with unwavering respect and innovative technique. It is a continuous dialogue between cherished traditions and refined modernity.

Step into our gallery, where the meticulously designed ambiance, the unobtrusive service, and the exquisite, artful creations on your plate merge into a singular, unforgettable narrative. Welcome to a space where flavors tell stories.`,
  about_image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  menu_pdf_url: 'https://drive.google.com/',
};

const STORAGE_KEY = 'ebony_site_settings';

export function getLocalSiteSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SITE_SETTINGS, ...parsed };
    }
  } catch {
    // fallback
  }
  return { ...DEFAULT_SITE_SETTINGS };
}

export async function getSiteSettings() {
  const local = getLocalSiteSettings();
  try {
    const res = await api.get('/settings');
    const data = res.data?.data || res.data;
    if (data && typeof data === 'object') {
      const merged = { ...DEFAULT_SITE_SETTINGS, ...local, ...data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch {
    // Backend offline / error: fallback to local cache
  }
  return local;
}

export async function updateSiteSettings(payload) {
  let resData;
  if (payload instanceof FormData) {
    const res = await api.post('/admin/settings', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    resData = res.data?.data || res.data;
  } else {
    const res = await api.post('/admin/settings', payload);
    resData = res.data?.data || res.data;
  }

  // Update localStorage cache
  const local = getLocalSiteSettings();
  const merged = { ...local, ...(resData || payload) };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

  // Notify listeners
  window.dispatchEvent(new CustomEvent('site-settings-updated', { detail: merged }));
  return merged;
}
