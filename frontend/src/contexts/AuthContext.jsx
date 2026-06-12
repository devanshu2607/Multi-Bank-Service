import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi, userApi, getSession, saveSession, clearSession } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const session = getSession();
      if (session) {
        try {
          // Fetch user profile from user-service using authUserId
          const profile = await userApi.getProfile(session.userId);
          setUser({
            id: session.userId,
            email: session.email,
            accessToken: session.accessToken,
            ...profile
          });
        } catch (err) {
          console.error("Failed to load profile", err);
          // If profile fetching fails (e.g. user exists in auth but no profile created yet), we try to create it or set fallback
          if (err.response?.status === 404) {
            setUser({
              id: session.userId,
              email: session.email,
              accessToken: session.accessToken,
              fullName: "User",
              phoneNumber: ""
            });
          } else {
            clearSession();
          }
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      saveSession(data);
      
      let profile = null;
      try {
        profile = await userApi.getProfile(data.userId);
      } catch (profileErr) {
        if (profileErr.response?.status === 404) {
          // If no profile exists yet, create one
          profile = await userApi.createProfile(data.userId, "New User", data.email, "");
        } else {
          throw profileErr;
        }
      }

      setUser({
        id: data.userId,
        email: data.email,
        accessToken: data.accessToken,
        ...profile
      });
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || err.message || "Failed to login";
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (fullName, email, phoneNumber, password) => {
    setError(null);
    setLoading(true);
    try {
      // 1. Register with auth-service
      const authData = await authApi.register(fullName, email, phoneNumber, password);
      saveSession(authData);
      
      // 2. Create user profile in user-service
      let profile;
      try {
        profile = await userApi.createProfile(authData.userId, fullName, email, phoneNumber);
      } catch (err) {
        console.error("Could not create user profile in profile service, fallback to default", err);
        profile = { id: authData.userId, authUserId: authData.userId, fullName, email, phoneNumber };
      }

      setUser({
        id: authData.userId,
        email: authData.email,
        accessToken: authData.accessToken,
        ...profile
      });
      setLoading(false);
      return authData;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || err.message || "Registration failed";
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  const updateProfile = async (fullName, phoneNumber) => {
    if (!user) return;
    try {
      const updated = await userApi.updateProfile(user.id, fullName, user.email, phoneNumber);
      setUser(prev => ({
        ...prev,
        ...updated
      }));
      return updated;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Profile update failed";
      throw new Error(errMsg);
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    if (!user) return;
    try {
      await authApi.changePassword(user.email, oldPassword, newPassword);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Password change failed";
      throw new Error(errMsg);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
