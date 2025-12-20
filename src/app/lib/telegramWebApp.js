/**
 * Утилита для глобальной инициализации Telegram WebApp
 */

/**
 * Инициализирует Telegram WebApp с глобальными настройками
 */
export const initializeTelegramWebApp = () => {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
    return;
  }

  const tg = window.Telegram.WebApp;

  // Глобальные настройки
  tg.isClosingConfirmationEnabled = true;
  tg.isVerticalSwipesEnabled = false;
  tg.isOrientationLocked = true;

  // Инициализация
  tg.ready();
  tg.expand();

  // Запрашиваем полноэкранный режим, если метод доступен
  if (typeof tg.requestFullscreen === 'function') {
    tg.requestFullscreen();
  }
};

