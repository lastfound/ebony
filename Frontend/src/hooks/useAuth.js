import { createContext, useContext } from 'react';

// Context didefinisikan di berkas ini (bukan di AuthContext.jsx) supaya
// AuthContext.jsx hanya mengekspor komponen — aturan react-refresh
// mensyaratkan satu berkas fast-refresh hanya berisi komponen.
export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
