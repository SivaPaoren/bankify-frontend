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
    const adminToken = localStorage.getItem('bankify_admin_token');
    const partnerToken = localStorage.getItem('bankify_partner_token');
    const atmToken = localStorage.getItem('bankify_atm_token');

    if (savedUser && (adminToken || partnerToken || atmToken)) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setRole(parsedUser.role);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to parse saved user", e);
        // Clear invalid data
        localStorage.removeItem('bankify_admin_token');
        localStorage.removeItem('bankify_partner_token');
        localStorage.removeItem('bankify_atm_token');
        localStorage.removeItem('bankify_user');
      }
    }
    setLoading(false);
  }, []);

  // Admin Login - Strict
  const adminLogin = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      return handleLoginSuccess(data, 'ADMIN', 'bankify_admin_token');
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Invalid Admin credentials." };
    }
  };

  // Partner Login - Strict
  const partnerLogin = async (email, password) => {
    try {
      const data = await authService.partnerLogin(email, password);
      return handleLoginSuccess(data, 'CLIENT', 'bankify_partner_token');
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Invalid Partner credentials." };
    }
  };

  // Helper method to standardize local storage and state upon login success
  const handleLoginSuccess = (data, fallbackRole, tokenKey) => {
    let token = data.token;
    let user = data.user || data;

    if (!user.role) {
      user = { ...data, role: data.role || fallbackRole };
    }

    localStorage.setItem(tokenKey, token);
    localStorage.setItem('bankify_user', JSON.stringify(user));

    setUser(user);
    setRole(user.role);
    setIsAuthenticated(true);
    return { success: true, role: user.role, user };
  };

  // Partner Signup
  const partnerSignup = async (appName, email, password) => {
    try {
      const result = await authService.partnerSignup(appName, email, password);
      // Wait for the signup to complete. We will force the user to log in manually afterward.
      return { success: true, data: result };
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Signup failed";
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

      localStorage.setItem('bankify_atm_token', token);
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
    localStorage.removeItem('bankify_admin_token');
    localStorage.removeItem('bankify_partner_token');
    localStorage.removeItem('bankify_atm_token');
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
      adminLogin,
      partnerLogin,
      partnerSignup,
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