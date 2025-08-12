import React, { createContext, ReactNode, useContext } from 'react';

import { useAuthViewModel } from '../viewmodels/useAuthViewModel';

type AuthContextType = ReturnType<typeof useAuthViewModel>;

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuthViewModel();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// Hook personalizado para consumir el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
