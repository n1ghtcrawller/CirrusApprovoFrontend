"use client";

export default function CustomButton({ width, onClick, children }) {
  const style = {
    height: "50px",
    fontFamily:
      '-apple-system, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
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

  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className="inline-flex items-center justify-center rounded-xl bg-[#111827] px-5 py-3 text-sm font-semibold text-[#fafcfe] shadow-md shadow-blue-200 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#135bec]"
    >
      {children}
    </button>
  );
}
