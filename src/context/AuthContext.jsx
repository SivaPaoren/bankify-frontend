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

  // Standard Login (Admin & Client) - Smart Fallback Logic
  const login = async (email, password) => {
    try {
      // 1. First attempt Admin Login
      const data = await authService.login(email, password);
      return handleLoginSuccess(data, 'ADMIN');
    } catch (adminError) {
      // If Admin fails, check if the error was a 401/403/404 indicating invalid credentials
      // and not a network error.
      try {
        // 2. Fallback to Partner/Client Login
        const partnerData = await authService.partnerLogin(email, password);
        return handleLoginSuccess(partnerData, 'CLIENT');
      } catch (partnerError) {
        // Both failed
        return { success: false, message: "Invalid email or password." };
      }
    }
  };

  // Helper method to standardize local storage and state upon login success
  const handleLoginSuccess = (data, fallbackRole) => {
    let token = data.token;
    let user = data.user || data;

    if (!user.role) {
      user = { ...data, role: data.role || fallbackRole };
    }

    localStorage.setItem('bankify_token', token);
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