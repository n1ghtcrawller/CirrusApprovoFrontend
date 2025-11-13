"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { requests } from "@/app/lib/api";
import haptic from "@/app/components/hapticFeedback";
import Navigation from "@/app/components/Navigation";
import CustomButton from "@/app/components/customButton";
import { HiPlus } from "react-icons/hi";

const STATUS_LABELS = {
  created: "Создана",
  supply_added_invoice: "Счёт добавлен",
  director_approved: "Подтверждена директором",
  accountant_paid: "Оплачена",
  foreman_confirmed_receipt: "Получена",
  documents_shipped: "Документы отправлены",
};

export default function RequestsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [requestsList, setRequestsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadRequests();
    }
  }, [isAuthenticated]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await requests.getAll();
      setRequestsList(data || []);
    } catch (err) {
      console.error("Load requests error:", err);
      setError(err.message || "Ошибка загрузки заявок");
      haptic.error();
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = () => {
    haptic.medium();
    router.push("/requests/new");
  };

  const handleRequestClick = (requestId) => {
    haptic.light();
    router.push(`/requests/${requestId}`);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col pb-20">
      <div className="flex-1 px-3 py-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Заявки
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Все ваши заявки на материалы и оборудование
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="mb-4">
          <CustomButton onClick={handleCreateRequest}>
            <div className="flex items-center justify-center gap-2">
              <HiPlus className="text-lg" />
              <span>Создать заявку</span>
            </div>
          </CustomButton>
        </div>

        {requestsList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              У вас пока нет заявок
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Создайте первую заявку, чтобы начать работу
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requestsList.map((request) => (
              <div
                key={request.id}
                onClick={() => handleRequestClick(request.id)}
                className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {request.number}
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                    {STATUS_LABELS[request.status] || request.status}
                  </span>
                </div>
                {request.delivery_date && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Доставка: {new Date(request.delivery_date).toLocaleDateString("ru-RU")}
                  </p>
                )}
                {request.items && request.items.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Материалов: {request.items.length}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Navigation />
    </div>
  );
}

