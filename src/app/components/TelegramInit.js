"use client";

import { useEffect } from "react";
import { initTelegramWebApp, getTheme, getBackgroundColor } from "./telegramWebApp";

/**
 * Компонент для инициализации Telegram Web App
 * Автоматически инициализирует приложение при монтировании
 */
export default function TelegramInit() {
  useEffect(() => {
    // Инициализация Telegram Web App
    const initialized = initTelegramWebApp();
    
    if (initialized) {
      // Применяем тему из Telegram
      const theme = getTheme();
      const bgColor = getBackgroundColor();
      
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      
      // Применяем цвет фона из Telegram, если доступен
      if (bgColor) {
        document.body.style.setProperty("--tg-theme-bg-color", bgColor);
      }
      
      console.log("Telegram Web App initialized");
    } else {
      console.log("Telegram Web App not available (running in browser)");
    }
  }, []);

  return null;
}

