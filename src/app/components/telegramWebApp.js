/**
 * Утилита для работы с Telegram Web App API
 * Предоставляет доступ к основным функциям Telegram Mini App
 */

/**
 * Проверяет доступность Telegram Web App API
 * @returns {boolean}
 */
export const isTelegramWebAppAvailable = () => {
  return (
    typeof window !== "undefined" &&
    window.Telegram &&
    window.Telegram.WebApp
  );
};

/**
 * Получает объект WebApp из Telegram Web App API
 * @returns {object|null}
 */
export const getTelegramWebApp = () => {
  if (!isTelegramWebAppAvailable()) {
    return null;
  }
  return window.Telegram.WebApp;
};

/**
 * Инициализирует Telegram Web App
 * Вызывает ready() и expand() для полной инициализации
 */
export const initTelegramWebApp = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    try {
      // Говорим Telegram, что приложение готово
      webApp.ready();
      
      // Разворачиваем приложение на весь экран
      webApp.expand();
      
      // Включаем закрытие через свайп вниз
      webApp.enableClosingConfirmation();
      
      return true;
    } catch (error) {
      console.warn("Telegram Web App initialization error:", error);
      return false;
    }
  }
  return false;
};

/**
 * Получает данные пользователя из Telegram
 * @returns {object|null}
 */
export const getUserData = () => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.initDataUnsafe && webApp.initDataUnsafe.user) {
    return webApp.initDataUnsafe.user;
  }
  return null;
};

/**
 * Получает тему приложения (light/dark)
 * @returns {string}
 */
export const getTheme = () => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.colorScheme) {
    return webApp.colorScheme;
  }
  return "light";
};

/**
 * Получает цвет фона из Telegram
 * @returns {string}
 */
export const getBackgroundColor = () => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.backgroundColor) {
    return webApp.backgroundColor;
  }
  return null;
};

/**
 * Устанавливает цвет фона в Telegram
 * @param {string} color - Цвет в формате #RRGGBB
 */
export const setBackgroundColor = (color) => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.setHeaderColor) {
    try {
      webApp.setHeaderColor(color);
    } catch (error) {
      console.warn("Set background color error:", error);
    }
  }
};

/**
 * Показывает главную кнопку Telegram
 * @param {object} params - Параметры кнопки {text, onClick}
 */
export const showMainButton = (params = {}) => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.MainButton) {
    try {
      const mainButton = webApp.MainButton;
      
      if (params.text) {
        mainButton.setText(params.text);
      }
      
      if (params.onClick) {
        mainButton.onClick(params.onClick);
      }
      
      mainButton.show();
    } catch (error) {
      console.warn("Show main button error:", error);
    }
  }
};

/**
 * Скрывает главную кнопку Telegram
 */
export const hideMainButton = () => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.MainButton) {
    try {
      webApp.MainButton.hide();
    } catch (error) {
      console.warn("Hide main button error:", error);
    }
  }
};

/**
 * Показывает кнопку "Назад" в Telegram
 */
export const showBackButton = (onClick) => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.BackButton) {
    try {
      const backButton = webApp.BackButton;
      if (onClick) {
        backButton.onClick(onClick);
      }
      backButton.show();
    } catch (error) {
      console.warn("Show back button error:", error);
    }
  }
};

/**
 * Скрывает кнопку "Назад" в Telegram
 */
export const hideBackButton = () => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.BackButton) {
    try {
      webApp.BackButton.hide();
    } catch (error) {
      console.warn("Hide back button error:", error);
    }
  }
};

/**
 * Открывает ссылку в Telegram
 * @param {string} url - URL для открытия
 * @param {object} options - Опции {try_instant_view: boolean}
 */
export const openLink = (url, options = {}) => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.openLink) {
    try {
      webApp.openLink(url, options);
    } catch (error) {
      console.warn("Open link error:", error);
    }
  } else {
    // Fallback для обычного браузера
    window.open(url, "_blank");
  }
};

/**
 * Открывает Telegram
 * @param {string} username - Имя пользователя или бота
 */
export const openTelegramLink = (username) => {
  openLink(`https://t.me/${username.replace("@", "")}`);
};

/**
 * Открывает инвойс для оплаты
 * @param {string} invoiceUrl - URL инвойса
 */
export const openInvoice = (invoiceUrl) => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.openInvoice) {
    try {
      webApp.openInvoice(invoiceUrl, (status) => {
        console.log("Invoice status:", status);
      });
    } catch (error) {
      console.warn("Open invoice error:", error);
    }
  }
};

/**
 * Отправляет данные в бот
 * @param {string} data - Данные для отправки
 */
export const sendData = (data) => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.sendData) {
    try {
      webApp.sendData(data);
    } catch (error) {
      console.warn("Send data error:", error);
    }
  }
};

/**
 * Закрывает приложение
 */
export const close = () => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.close) {
    try {
      webApp.close();
    } catch (error) {
      console.warn("Close app error:", error);
    }
  }
};

/**
 * Получает версию платформы
 * @returns {string}
 */
export const getPlatform = () => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.platform) {
    return webApp.platform;
  }
  return "unknown";
};

/**
 * Проверяет, является ли платформа мобильной
 * @returns {boolean}
 */
export const isMobile = () => {
  const platform = getPlatform();
  return platform === "ios" || platform === "android";
};

/**
 * Получает initData (зашифрованные данные от Telegram)
 * @returns {string|null}
 */
export const getInitData = () => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.initData) {
    return webApp.initData;
  }
  return null;
};

/**
 * Получает initDataUnsafe (незашифрованные данные, только для разработки)
 * @returns {object|null}
 */
export const getInitDataUnsafe = () => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.initDataUnsafe) {
    return webApp.initDataUnsafe;
  }
  return null;
};

// Экспорт объекта с удобными методами
const telegramWebApp = {
  init: initTelegramWebApp,
  getUserData,
  getTheme,
  getBackgroundColor,
  setBackgroundColor,
  showMainButton,
  hideMainButton,
  showBackButton,
  hideBackButton,
  openLink,
  openTelegramLink,
  openInvoice,
  sendData,
  close,
  getPlatform,
  isMobile,
  getInitData,
  getInitDataUnsafe,
  isAvailable: isTelegramWebAppAvailable,
};

export default telegramWebApp;

