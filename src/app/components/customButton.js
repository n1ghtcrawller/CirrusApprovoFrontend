"use client";

/**
 * Кастомная кнопка с поддержкой haptic feedback
 */
export default function CustomButton({ onClick, children, className = "", disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold text-base transition-colors duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 dark:disabled:hover:bg-blue-500 ${className}`}
    >
      {children}
    </button>
  );
}

