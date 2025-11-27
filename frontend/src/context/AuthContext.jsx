import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await authApi.getMe();
          setUser(response.user);
        } catch (error) {
          // Token invalid or expired
          console.error('Auth check failed:', error);
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (userData = null) => {
    try {
      // Demo login - in production would use Google OAuth
      const response = await authApi.demoLogin(
        userData?.email || 'demo@algodeck.com',
        userData?.name || 'Demo User'
      );
      
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      return response.user;
    } catch (error) {
      console.error('Login failed:', error);
      // Fallback to local-only mode if backend is unavailable
      const localUser = {
        id: 'local_user_' + Date.now(),
        name: userData?.name || 'Demo User',
        email: userData?.email || 'demo@algodeck.com',
        avatar: null,
        createdAt: new Date().toISOString(),
      };
      setUser(localUser);
      localStorage.setItem('algodeck_user', JSON.stringify(localUser));
      return localUser;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('algodeck_user');
  };

  // Login with token (used after Google OAuth callback)
  const loginWithToken = async (token) => {
    try {
      localStorage.setItem('authToken', token);
      const response = await authApi.getMe();
      setUser(response.user);
      return response.user;
    } catch (error) {
      console.error('Token login failed:', error);
      localStorage.removeItem('authToken');
      throw error;
    }
  };

  const updatePreferences = async (preferences) => {
    try {
      const response = await authApi.updatePreferences(preferences);
      setUser(response.user);
      return response.user;
    } catch (error) {
      console.error('Update preferences failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    loginWithToken,
    logout,
    updatePreferences,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
