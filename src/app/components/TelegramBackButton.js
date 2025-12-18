"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TelegramBackButton({ onClick }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined" || !window.Telegram?.WebApp) return;

    const tg = window.Telegram.WebApp;

    const handleClick = () => {
      if (typeof onClick === "function") {
        onClick();
      } else {
        router.back();
      }
    };

    try {
      tg.BackButton.show();
      tg.BackButton.onClick(handleClick);
    } catch (e) {
      console.warn("Telegram BackButton error:", e);
    }

    return () => {
      try {
        tg.BackButton.offClick(handleClick);
      } catch (e) {
        // ignore
      }
    };
  }, [onClick, router]);

  return null;
}


