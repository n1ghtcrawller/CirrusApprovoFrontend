"use client";

import { useState, useEffect } from "react";
import telegramWebApp from "./telegramWebApp";

/**
 * Хук для работы с Telegram Web App
 * @returns {object} Объект с данными и методами Telegram Web App
 */
export default function useTelegramWebApp() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [userData, setUserData] = useState(null);
  const [theme, setTheme] = useState("light");
  const [platform, setPlatform] = useState("unknown");
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const checkAvailability = () => {
      const available = telegramWebApp.isAvailable();
      setIsAvailable(available);

      if (available) {
        // Инициализируем приложение
        telegramWebApp.init();

        // Получаем данные пользователя
        const user = telegramWebApp.getUserData();
        setUserData(user);

        // Получаем тему
        const currentTheme = telegramWebApp.getTheme();
        setTheme(currentTheme);

        // Получаем платформу
        const currentPlatform = telegramWebApp.getPlatform();
        setPlatform(currentPlatform);

        // Проверяем, мобильное ли устройство
        setIsMobileDevice(telegramWebApp.isMobile());

        // Слушаем изменения темы
        const webApp = telegramWebApp.isAvailable()
          ? window.Telegram.WebApp
          : null;

        if (webApp && webApp.onEvent) {
          webApp.onEvent("themeChanged", () => {
            const newTheme = telegramWebApp.getTheme();
            setTheme(newTheme);
          });
        }
      }
    };

    // Проверяем сразу
    checkAvailability();

    // Также проверяем после небольшой задержки (на случай, если скрипт загружается)
    const timeout = setTimeout(checkAvailability, 100);

    return () => clearTimeout(timeout);
  }, []);

  return {
    isAvailable,
    userData,
    theme,
    platform,
    isMobile: isMobileDevice,
    ...telegramWebApp, // Распаковываем все методы из telegramWebApp
  };
}

