import { createContext, useContext } from 'react';

const NotificationContext = createContext(null);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications harus dipakai di dalam <AdminLayout>.');
  }
  return ctx;
}

export { NotificationContext };
