"use client";

import { useEffect } from "react";
import { initTelegramWebApp, getTheme, getBackgroundColor, getTelegramWebApp } from "./telegramWebApp";

/**
 * Компонент для инициализации Telegram Web App
 * Автоматически инициализирует приложение при монтировании
 */
export default function TelegramInit() {
  useEffect(() => {
    // Инициализация Telegram Web App
    const initialized = initTelegramWebApp();

    const applyViewportVars = () => {
      const webApp = getTelegramWebApp?.();
      if (webApp) {
        const vh = webApp.viewportHeight; // фактическая высота видимой части
        const svh = webApp.viewportStableHeight; // стабильная высота без системных панелей
        const vw = webApp.viewportWidth;
        if (vh) document.documentElement.style.setProperty("--tg-viewport-height", `${vh}px`);
        if (svh) document.documentElement.style.setProperty("--tg-viewport-stable-height", `${svh}px`);
        if (vw) document.documentElement.style.setProperty("--tg-viewport-width", `${vw}px`);
      } else {
        // Фоллбек для обычного браузера
        document.documentElement.style.setProperty("--tg-viewport-height", `${window.innerHeight}px`);
        document.documentElement.style.setProperty("--tg-viewport-stable-height", `${window.innerHeight}px`);
        document.documentElement.style.setProperty("--tg-viewport-width", `${window.innerWidth}px`);
      }
    };

    // Применяем тему и фон
    const applyTheme = () => {
      const theme = getTheme();
      const bgColor = getBackgroundColor();

      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      if (bgColor) {
        document.body.style.setProperty("--tg-theme-bg-color", bgColor);
      }
    };

    // Первичное применение
    applyViewportVars();
    applyTheme();

    // Подписка на изменения вьюпорта Telegram
    const webApp = getTelegramWebApp?.();
    if (webApp && webApp.onEvent) {
      webApp.onEvent("viewportChanged", applyViewportVars);
      webApp.onEvent("themeChanged", applyTheme);
    } else {
      // Фоллбек: слушаем resize окна
      const onResize = () => applyViewportVars();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    console.log("Telegram Web App initialized");

    // Очистка подписок Telegram
    return () => {
      if (webApp && webApp.offEvent) {
        webApp.offEvent("viewportChanged", applyViewportVars);
        webApp.offEvent("themeChanged", applyTheme);
      }
    };
  }, []);

  return null;
}

