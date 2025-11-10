"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { auth, users } from "@/app/lib/api";
import useTelegramWebApp from "@/app/components/useTelegramWebApp";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNew, setIsNew] = useState(false);
  const tg = useTelegramWebApp();

  /**
   * Авторизация через Telegram
   */
  const login = async (initData, refCode = null) => {
    try {
      const response = await auth.telegramLogin(initData, refCode);
      setIsNew(response.is_new || false);
      await fetchUser();
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  /**
   * Выход
   */
  const logout = () => {
    auth.logout();
    setUser(null);
    setIsNew(false);
  };

  /**
   * Получение данных пользователя
   */
  const fetchUser = async () => {
    try {
      const userData = await users.getMe();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Fetch user error:", error);
      setUser(null);
      throw error;
    }
  };

  /**
   * Обновление профиля
   */
  const updateProfile = async (data) => {
    try {
      const updatedUser = await users.updateMe(data);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  /**
   * Проверка авторизации при загрузке
   */
  useEffect(() => {
    const checkAuth = async () => {
      if (auth.isAuthenticated()) {
        try {
          await fetchUser();
        } catch (error) {
          // Если ошибка авторизации, очищаем состояние
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    isNew,
    login,
    logout,
    fetchUser,
    updateProfile,
    isAuthenticated: auth.isAuthenticated(),
    tg,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

