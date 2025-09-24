// src/auth/useAuth.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, verifyFace, logoutUser, getProfile } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * 🔹 Restore session using cookie-stored JWT
   * Runs on app load and checks if user is logged in
   */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const profile = await getProfile(); // This sends cookies automatically
        if (profile?.username) {
          setUser({ username: profile.username });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Session restore failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  /**
   * 🔹 Login (username+password, optional face verification)
   */
  const login = async (username, password, faceBlob) => {
    setLoading(true);
    try {
      const res = faceBlob
        ? await verifyFace(username, password, faceBlob) // multipart/form-data login
        : await loginUser(username, password); // normal login

      if (res?.username || res?.access_token) {
        // ✅ Token is now set in cookies, fetch profile
        const profile = await getProfile();
        if (profile?.username) {
          setUser({ username: profile.username });
          return { success: true };
        }
      }
      return { success: false, error: "Invalid credentials" };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: "Login error" };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔹 Logout (clears cookie on server)
   */
  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.warn("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
