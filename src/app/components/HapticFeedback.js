"use client";

/**
 * Компонент и утилиты для тактильной обратной связи в Telegram Web App
 * 
 * Telegram Web App API предоставляет следующие методы:
 * - impactOccurred(style) - тактильная обратная связь при взаимодействии
 * - notificationOccurred(type) - тактильная обратная связь для уведомлений
 * - selectionChanged() - тактильная обратная связь при изменении выбора
 */

/**
 * Проверяет, доступен ли Telegram Web App
 */
const isTelegramWebAppAvailable = () => {
    return typeof window !== 'undefined' && window.Telegram?.WebApp;
};

/**
 * Типы тактильной обратной связи для impactOccurred
 */
export const HapticImpactStyle = {
    LIGHT: 'light',      // Легкая вибрация
    MEDIUM: 'medium',    // Средняя вибрация
    HEAVY: 'heavy',     // Сильная вибрация
    RIGID: 'rigid',     // Жесткая вибрация
    SOFT: 'soft'        // Мягкая вибрация
};

/**
 * Типы тактильной обратной связи для notificationOccurred
 */
export const HapticNotificationType = {
    ERROR: 'error',     // Ошибка
    SUCCESS: 'success', // Успех
    WARNING: 'warning'  // Предупреждение
};

/**
 * Тактильная обратная связь при взаимодействии (нажатие кнопки, клик и т.д.)
 * @param {string} style - Стиль вибрации (light, medium, heavy, rigid, soft)
 */
export const impactOccurred = (style = HapticImpactStyle.MEDIUM) => {
    if (isTelegramWebAppAvailable()) {
        try {
            window.Telegram.WebApp.impactOccurred(style);
        } catch (error) {
            console.warn('Haptic feedback not available:', error);
        }
    }
};

/**
 * Тактильная обратная связь для уведомлений (успех, ошибка, предупреждение)
 * @param {string} type - Тип уведомления (error, success, warning)
 */
export const notificationOccurred = (type = HapticNotificationType.SUCCESS) => {
    if (isTelegramWebAppAvailable()) {
        try {
            window.Telegram.WebApp.notificationOccurred(type);
        } catch (error) {
            console.warn('Haptic feedback not available:', error);
        }
    }
};

/**
 * Тактильная обратная связь при изменении выбора (в списках, селектах)
 */
export const selectionChanged = () => {
    if (isTelegramWebAppAvailable()) {
        try {
            window.Telegram.WebApp.selectionChanged();
        } catch (error) {
            console.warn('Haptic feedback not available:', error);
        }
    }
};

/**
 * Компонент-обертка для кнопок с тактильной обратной связью
 */
export default function HapticFeedback({ 
    children, 
    onPress, 
    impactStyle = HapticImpactStyle.MEDIUM,
    disabled = false,
    className = "",
    ...props 
}) {
    const handlePress = (e) => {
        if (!disabled) {
            impactOccurred(impactStyle);
            if (onPress) {
                onPress(e);
            }
        }
    };

    return (
        <div 
            onClick={handlePress}
            className={className}
            style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
            {...props}
        >
            {children}
        </div>
    );
}

/**
 * Хук для использования тактильной обратной связи в компонентах
 */
export const useHapticFeedback = () => {
    return {
        impactOccurred,
        notificationOccurred,
        selectionChanged,
        HapticImpactStyle,
        HapticNotificationType
    };
};
