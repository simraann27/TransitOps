/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('transitops_token');
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Validate persisted token on mount
  useEffect(() => {
    async function validatePersistedToken() {
      const storedToken = localStorage.getItem('transitops_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
            setToken(storedToken);
            setIsAuthenticated(true);
            // Sync user details to local storage user cache
            localStorage.setItem('transitops_user', JSON.stringify(data.user));
          } else {
            // Token invalid or expired
            localStorage.removeItem('transitops_token');
            localStorage.removeItem('transitops_user');
          }
        } else {
          // Token invalid or expired
          localStorage.removeItem('transitops_token');
          localStorage.removeItem('transitops_user');
        }
      } catch (err) {
        console.error("Token verification failed:", err);
        // On connection errors, do not immediately kick out if user is cached locally
        // to maintain offline resiliency of dashboards
        const cachedUser = localStorage.getItem('transitops_user');
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
            setIsAuthenticated(true);
          } catch {
            localStorage.removeItem('transitops_token');
            localStorage.removeItem('transitops_user');
          }
        }
      } finally {
        setLoading(false);
      }
    }

    validatePersistedToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('transitops_token', data.token);
      localStorage.setItem('transitops_user', JSON.stringify(data.user));
      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('transitops_token', data.token);
      localStorage.setItem('transitops_user', JSON.stringify(data.user));
      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('transitops_token');
    localStorage.removeItem('transitops_user');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  const loginWithGoogle = async (credential) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Google Sign-In failed');
      }

      localStorage.setItem('transitops_token', data.token);
      localStorage.setItem('transitops_user', JSON.stringify(data.user));
      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error("Google Login error:", error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
export default AuthContext;
