import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

const SESSION_KEY = 'local_auth_session';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings] = useState(null);

  useEffect(() => {
    // Citește sesiunea locală din localStorage
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        setUser(session);
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error('Failed to read local session', e);
    }
    setIsLoadingAuth(false);
  }, []);

  const logout = (shouldRedirect = true) => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) {
      window.location.href = '/';
    }
  };

  const navigateToLogin = () => {
    const currentPath = window.location.pathname;
    const safeUrl = currentPath === '/login' ? '/' : currentPath;
    window.location.href = `/login?from_url=${encodeURIComponent(window.location.origin + safeUrl)}`;
  };

  const checkAppState = () => {
    // No-op pentru local auth
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
