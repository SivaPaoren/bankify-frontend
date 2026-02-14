import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'ADMIN', 'CLIENT', or 'USER'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on page load
  useEffect(() => {
    const savedUser = localStorage.getItem('bankify_user');
    const savedToken = localStorage.getItem('bankify_token');

    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setRole(parsedUser.role);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to parse saved user", e);
        // Clear invalid data
        localStorage.removeItem('bankify_token');
        localStorage.removeItem('bankify_user');
      }
    }
    setLoading(false);
  }, []);

  // Standard Login (Admin & Client)
  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);

      // API Standard: { token, email, role, ... } (Flat)
      // Or { token, user: { ... } } (Nested)

      let token = data.token;
      let user = data.user || data; // Fallback to data if user is not nested

      // If flat, valid user object should NOT contain the token ideally, but it's fine for now.
      // Ensure we have a valid user object with role
      if (!user.role && data.role) {
        user = { ...data }; // Treat the whole response as user data if flat
        // Remove token from user object if desired, but not strictly necessary for logic
      }

      localStorage.setItem('bankify_token', token);
      localStorage.setItem('bankify_user', JSON.stringify(user));

      setUser(user);
      setRole(user.role);
      setIsAuthenticated(true);
      // Return user/role so UI can direct immediately
      return { success: true, role: user.role, user };
    } catch (error) {
      // Handle error safely
      const message = error.response?.data?.message || error.message || "Login failed";
      return { success: false, message };
    }
  };

  // ATM Login (Bankuser)
  const atmLogin = async (bankId, password) => {
    try {
      const data = await authService.atmLogin(bankId, password);

      // Standardize response
      let token = data.token;
      let user = data.user || data;

      if (!user.role && data.role) {
        user = { ...data };
      }
      // Ensure specific fields for ATM user if missing
      if (!user.name) user.name = "ATM User";
      if (!user.role) user.role = "USER";

      localStorage.setItem('bankify_token', token);
      localStorage.setItem('bankify_user', JSON.stringify(user));

      setUser(user);
      setRole(user.role);
      setIsAuthenticated(true);
      return { success: true, role: user.role };
    } catch (error) {
      const message = error.response?.data?.message || error.message || "ATM Login failed";
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('bankify_token');
    localStorage.removeItem('bankify_user');
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      isAuthenticated,
      loading,
      login,
      atmLogin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// This is the hook we'll use in AppRouter and other pages
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};