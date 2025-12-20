"use client";

import { useEffect } from "react";
import { initializeTelegramWebApp } from "../lib/telegramWebApp";

/**
 * Компонент для глобальной инициализации Telegram WebApp
 */
export default function TelegramWebAppInit() {
  useEffect(() => {
    // Инициализация Telegram WebApp с глобальными настройками
    // Используем небольшую задержку, чтобы скрипт Telegram успел загрузиться
    const timer = setTimeout(() => {
      initializeTelegramWebApp();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return null;
}

