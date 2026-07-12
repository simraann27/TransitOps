/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Use lazy state initialization to avoid useEffect setState triggers
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('transitops_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to read stored user:", error);
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return !!localStorage.getItem('transitops_user');
    } catch {
      return false;
    }
  });

  const [loading] = useState(false);

  const login = (email, password, role) => {
    // Demo authentication: Accept any valid email and password >= 6 characters
    // Store user as "Simran Tupe" with entered email and selected role
    const demoUser = {
      name: "Simran Tupe",
      email: email.trim(),
      role: role
    };

    localStorage.setItem('transitops_user', JSON.stringify(demoUser));
    setUser(demoUser);
    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('transitops_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
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
