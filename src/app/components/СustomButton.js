"use client";
import { HapticNotificationType, impactOccurred } from './HapticFeedback';


export default function CustomButton({ width, onClick, children, disabled = false }) {
  const style = {
    height: "50px",
    fontFamily: "var(--font-onest), -apple-system, sans-serif",
    fontSize: "24px",
    fontWeight: "500",
    lineHeight: "28px",
    letterSpacing: "0.01em",
    textAlign: "center",
    textDecoration: "none",
    textShadow: "none",
    textOverflow: "ellipsis",
    ...(width ? { width } : {}),
  };

  const handleClick = (e) => {
    impactOccurred(HapticNotificationType.SUCCESS);
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      style={style}
      className="inline-flex items-center justify-center rounded-xl bg-[#111827] px-5 py-3 text-sm font-semibold text-[#fafcfe] shadow-md shadow-blue-200 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#135bec] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
    >
      {children}
    </button>
  );
}
