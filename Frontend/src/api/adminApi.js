import api from './axiosInstance';

/** === AUTH === */
export const adminLogin = async (credentials) => {
  const res = await api.post('/admin/login', credentials);
  return res.data;
};

export const adminLogout = async () => {
  const res = await api.post('/admin/logout');
  return res.data;
};

export const updateAdminProfile = async (data) => {
  const res = await api.put('/admin/profile', data);
  return res.data;
};

/** === DASHBOARD === */
export const getDashboardData = async () => {
  const res = await api.get('/admin/dashboard');
  return res.data;
};

/** === RESERVATIONS === */
export const getReservations = async (params = {}) => {
  const res = await api.get('/admin/reservations', { params });
  return res.data;
};

export const getReservationDetail = async (id) => {
  const res = await api.get(`/admin/reservations/${id}`);
  return res.data;
};

export const createReservation = async (data) => {
  const res = await api.post('/admin/reservations', data);
  return res.data;
};

export const updateReservation = async (id, data) => {
  const res = await api.put(`/admin/reservations/${id}`, data);
  return res.data;
};

export const confirmArrival = async (id) => {
  const res = await api.patch(`/admin/reservations/${id}/confirm`);
  return res.data;
};

export const exportReservationsCSV = () => {
  window.open(
    `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/admin/reservations/export-csv`,
    '_blank'
  );
};

/** === MENUS === */
export const getAdminMenus = async () => {
  const res = await api.get('/admin/menus');
  return res.data?.data || res.data || [];
};

export const createMenu = async (data) => {
  const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
  const res = await api.post('/admin/menus', data, { headers });
  return res.data;
};

export const updateMenu = async (id, data) => {
  const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
  if (data instanceof FormData) {
    data.append('_method', 'PUT');
    const res = await api.post(`/admin/menus/${id}`, data, { headers });
    return res.data;
  }
  const res = await api.put(`/admin/menus/${id}`, data);
  return res.data;
};

export const deleteMenu = async (id) => {
  const res = await api.delete(`/admin/menus/${id}`);
  return res.data;
};

export const toggleMenuStatus = async (id, isAvailable) => {
  const res = await api.patch(`/admin/menus/${id}/toggle`, { is_available: isAvailable });
  return res.data;
};

/** === EVENTS === */
export const getAdminEvents = async () => {
  const res = await api.get('/admin/events');
  return res.data?.data || res.data || [];
};

export const createEvent = async (data) => {
  const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
  const res = await api.post('/admin/events', data, { headers });
  return res.data;
};

export const updateEvent = async (id, data) => {
  const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
  if (data instanceof FormData) {
    data.append('_method', 'PUT');
    const res = await api.post(`/admin/events/${id}`, data, { headers });
    return res.data;
  }
  const res = await api.put(`/admin/events/${id}`, data);
  return res.data;
};

export const deleteEvent = async (id) => {
  const res = await api.delete(`/admin/events/${id}`);
  return res.data;
};
