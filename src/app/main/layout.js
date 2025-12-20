"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { HapticImpactStyle, impactOccurred } from "../components/HapticFeedback";
import { initializeTelegramWebApp } from "../lib/telegramWebApp";
import projects from "../assets/images/projects.svg";
import requests from "../assets/images/requests.svg";
import mechanisation from "../assets/images/mechanisation.svg";
import profile from "../assets/images/profile.svg";

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Инициализация Telegram Web App (глобальные настройки уже установлены в RootLayout)
    // Здесь только убеждаемся, что приложение развернуто
    if (typeof window === "undefined" || !window.Telegram?.WebApp) return;

    const tg = window.Telegram.WebApp;

    // Глобальные настройки уже установлены в RootLayout, но убеждаемся, что они применены
    tg.isClosingConfirmationEnabled = true;
    tg.isVerticalSwipesEnabled = false;
    tg.isOrientationLocked = true;

    tg.ready();
    tg.expand();

    // Запрашиваем полноэкранный режим, если метод доступен
    if (typeof tg.requestFullscreen === "function") {
      tg.requestFullscreen();
    }

    // Стараемся не давать мини‑приложению оставаться свернутым:
    // как только высота стабилизировалась и мини‑приложение не развернуто — разворачиваем.
    const handleViewportChanged = ({ isStateStable }) => {
      try {
        if (isStateStable && !tg.isExpanded) {
          tg.expand();
        }
      } catch {
        // игнорируем ошибки Telegram WebApp
      }
    };

    try {
      tg.onEvent("viewportChanged", handleViewportChanged);
    } catch {
      // если события нет/сломано — молча игнорируем
    }

    return () => {
      try {
        tg.offEvent("viewportChanged", handleViewportChanged);
      } catch {
        // ignore
      }
    };
  }, []);

  const tabs = [
    { path: "/main/projects", label: "Проекты", icon: projects },
    { path: "/main/requests", label: "Заявки", icon: requests },
    { path: "/main/warehouse", label: "Склад", icon: mechanisation },
    { path: "/main/profile", label: "Профиль", icon: profile },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f6f6f8]">
      <main key={pathname} className="flex-1 pb-20 animate-fade-in">{children}</main>
      
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">
        <div className="flex h-20 w-full items-center justify-around">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => {
                  impactOccurred(HapticImpactStyle.LIGHT);
                  router.push(tab.path);
                }}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200 ease-in-out ${
                  isActive ? "text-[#000000]" : "text-[#6B7280]"
                }`}
              >
                <img
                  src={tab.icon.src}
                  alt={tab.label}
                  className={`w-6 h-6 transition-all duration-200 ease-in-out ${
                    isActive ? "opacity-100 scale-110" : "opacity-60 scale-100"
                  }`}
                />
                <span className="text-xs font-medium transition-all duration-200 ease-in-out">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
