 "use client";

import CustomButton from "./components/СustomButton";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { telegramLogin } from "./lib/api";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Инициализация Telegram Web App
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Получаем initData от Telegram Web App
      let initData = null;
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        initData = window.Telegram.WebApp.initData;
      }

      // Если нет initData (например, при запуске не из Telegram), 
      // можно использовать тестовые данные или показать ошибку
      if (!initData) {
        // Для разработки можно использовать тестовые данные
        // В продакшене это должно работать только внутри Telegram
        console.warn("Telegram Web App не обнаружен. Авторизация невозможна.");
        setError("Приложение должно быть запущено через Telegram");
        setIsLoading(false);
        return;
      }

      // Выполняем авторизацию
      await telegramLogin(initData);
      
      // После успешной авторизации перенаправляем на главную страницу
      router.push("/main/projects");
    } catch (error) {
      console.error("Ошибка авторизации:", error);
      setError(
        error.response?.data?.detail || 
        error.message || 
        "Ошибка при авторизации. Попробуйте еще раз."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#f6f6f8]">
      <div className="flex w-full max-w-2xl flex-col items-center justify-center gap-12">
        <h1 className="w-90 text-start text-7xl font-bold text-[#111827] leading-[0.9]">
          Cirrus
          <br />
          Approvo.
        </h1>
        <div className="w-90 flex flex-col items-center justify-center gap-4">
          {error && (
            <div className="w-full rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}
          <CustomButton 
            width="100%" 
            onClick={handleStart}
            disabled={isLoading}
          >
            {isLoading ? "Авторизация..." : "Начать работу"}
          </CustomButton>
        </div>
      </div>
    </main>
  );
}
