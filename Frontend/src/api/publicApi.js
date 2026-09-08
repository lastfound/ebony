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

/** Submit reservasi publik */
export const submitReservation = async (formData) => {
  const res = await api.post('/reservations', formData);
  return res.data;
};
