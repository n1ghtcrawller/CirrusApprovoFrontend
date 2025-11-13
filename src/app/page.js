"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import cirrus from "@/app/assets/cirrus.png";
import haptic from "@/app/components/hapticFeedback";
import CustomButton from "@/app/components/customButton";
import { useAuth } from "@/app/context/AuthContext";
import useTelegramWebApp from "@/app/components/useTelegramWebApp";

export default function Home() {
  const router = useRouter();
  const { login, isAuthenticated, loading } = useAuth();
  const tg = useTelegramWebApp();
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  // Если уже авторизован, перенаправляем на проекты
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/projects");
    }
  }, [isAuthenticated, loading, router]);

  const handleAuth = async () => {
    try {
      setAuthLoading(true);
      setError(null);
      haptic.medium();

      // Получаем initData из Telegram
      if (!tg.isAvailable) {
        throw new Error("Telegram Web App не доступен. Откройте приложение через Telegram.");
      }

      const initData = tg.getInitData();
      if (!initData) {
        throw new Error("Не удалось получить данные Telegram. Попробуйте перезагрузить страницу.");
      }

      // Авторизуемся
      await login(initData);
      
      // Успешная авторизация - перенаправление произойдет автоматически через useEffect
      haptic.success();
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "Ошибка авторизации");
      haptic.error();
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full  items-center justify-center font-sans">
        <div className="text-gray-600 dark:text-gray-400">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center font-sans">
      <main className="flex h-full w-full flex-col items-center justify-center px-4 py-6">
        <div className="flex flex-col items-center gap-8 w-full">
          {/* Логотип/Название */}
          <div className="flex flex-col items-center gap-4">
            <Image src={cirrus} alt="Cirrus Approvo" width={80} height={80} />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Cirrus Approvo
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400 text-center max-w-xs">
              Платформа для утверждения и управления документами
            </p>
          </div>

          {/* Ошибка */}
          {error && (
            <div className="w-full p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Кнопка авторизации */}
          <CustomButton onClick={handleAuth} disabled={authLoading}>
            {authLoading ? "Вход..." : "Войти"}
          </CustomButton>
        </div>
      </main>
    </div>
  );
}
