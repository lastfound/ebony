import api from './axiosInstance';

/** Ambil menu favorit untuk landing page */
export const getMenuFavorites = async () => {
  const res = await api.get('/menus', { params: { featured: true } });
  return res.data?.data || res.data || [];
};

/** Ambil semua event aktif */
export const getEvents = async () => {
  const res = await api.get('/events');
  return res.data?.data || res.data || [];
};

/** Ambil menu promo untuk banner landing page */
export const getPromoMenus = async () => {
  const res = await api.get('/menus');
  const list = res.data?.data || res.data || [];
  return (Array.isArray(list) ? list : []).filter(
    (item) => item.is_promo === 1 || item.is_promo === '1' || item.is_promo === true
  );
};

/** Submit reservasi publik */
export const submitReservation = async (formData) => {
  const res = await api.post('/reservations', formData);
  return res.data;
};

/** Denah meja: hanya yang kosong yang bisa dipilih user */
export const getAvailableTables = async ({ date, time, party_size }) => {
  const res = await api.get('/tables/available', { params: { date, time, party_size } });
  return res.data;
};
