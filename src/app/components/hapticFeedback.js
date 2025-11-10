/**
 * Утилита для работы с тактильной обратной связью в Telegram Mini App
 * Использует Telegram Web App API для вибрации устройства
 */

/**
 * Проверяет доступность Telegram Web App API
 * @returns {boolean}
 */
const isTelegramWebAppAvailable = () => {
  return (
    typeof window !== "undefined" &&
    window.Telegram &&
    window.Telegram.WebApp &&
    window.Telegram.WebApp.HapticFeedback
  );
};

/**
 * Получает объект HapticFeedback из Telegram Web App API
 * @returns {object|null}
 */
const getHapticFeedback = () => {
  if (!isTelegramWebAppAvailable()) {
    return null;
  }
  return window.Telegram.WebApp.HapticFeedback;
};

/**
 * Типы вибрации для impactOccurred
 */
export const ImpactStyle = {
  LIGHT: "light",
  MEDIUM: "medium",
  HEAVY: "heavy",
  RIGID: "rigid",
  SOFT: "soft",
};

/**
 * Типы вибрации для notificationOccurred
 */
export const NotificationType = {
  ERROR: "error",
  SUCCESS: "success",
  WARNING: "warning",
};

/**
 * Выполняет вибрацию при воздействии (нажатие, удар)
 * @param {string} style - Стиль вибрации (light, medium, heavy, rigid, soft)
 */
export const impactOccurred = (style = ImpactStyle.MEDIUM) => {
  const haptic = getHapticFeedback();
  if (haptic && haptic.impactOccurred) {
    try {
      haptic.impactOccurred(style);
    } catch (error) {
      console.warn("Haptic feedback error:", error);
    }
  }
};

/**
 * Выполняет вибрацию при уведомлении
 * @param {string} type - Тип уведомления (error, success, warning)
 */
export const notificationOccurred = (type = NotificationType.SUCCESS) => {
  const haptic = getHapticFeedback();
  if (haptic && haptic.notificationOccurred) {
    try {
      haptic.notificationOccurred(type);
    } catch (error) {
      console.warn("Haptic feedback error:", error);
    }
  }
};

/**
 * Выполняет вибрацию при изменении выбора (например, при скролле списка)
 */
export const selectionChanged = () => {
  const haptic = getHapticFeedback();
  if (haptic && haptic.selectionChanged) {
    try {
      haptic.selectionChanged();
    } catch (error) {
      console.warn("Haptic feedback error:", error);
    }
  }
};

/**
 * Удобные методы для быстрого использования
 */
export const haptic = {
  // Легкая вибрация (для обычных действий)
  light: () => impactOccurred(ImpactStyle.LIGHT),
  
  // Средняя вибрация (для важных действий)
  medium: () => impactOccurred(ImpactStyle.MEDIUM),
  
  // Сильная вибрация (для критических действий)
  heavy: () => impactOccurred(ImpactStyle.HEAVY),
  
  // Вибрация при успехе
  success: () => notificationOccurred(NotificationType.SUCCESS),
  
  // Вибрация при ошибке
  error: () => notificationOccurred(NotificationType.ERROR),
  
  // Вибрация при предупреждении
  warning: () => notificationOccurred(NotificationType.WARNING),
  
  // Вибрация при изменении выбора
  selection: () => selectionChanged(),
};

export default haptic;

