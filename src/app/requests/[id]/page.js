"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { requests, documents } from "@/app/lib/api";
import haptic from "@/app/components/hapticFeedback";
import Navigation from "@/app/components/Navigation";
import CustomButton from "@/app/components/customButton";
import { HiArrowLeft, HiPlus } from "react-icons/hi";

const STATUS_LABELS = {
  created: "Создана",
  supply_added_invoice: "Счёт добавлен",
  director_approved: "Подтверждена директором",
  accountant_paid: "Оплачена",
  foreman_confirmed_receipt: "Получена",
  documents_shipped: "Документы отправлены",
};

const NEXT_STATUS_ACTIONS = {
  created: { label: "Добавить счёт", status: "supply_added_invoice", role: "supply_specialist" },
  supply_added_invoice: { label: "Подтвердить", status: "director_approved", role: "director" },
  director_approved: { label: "Отметить оплату", status: "accountant_paid", role: "accountant" },
  accountant_paid: { label: "Подтвердить получение", status: "foreman_confirmed_receipt", role: "foreman" },
  foreman_confirmed_receipt: { label: "Отправить документы", status: "documents_shipped", role: "any" },
};

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const requestId = params?.id;

  const [request, setRequest] = useState(null);
  const [requestDocuments, setRequestDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (requestId) {
      loadRequest();
      loadDocuments();
    }
  }, [requestId]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await requests.getWithRelations(requestId);
      setRequest(data);
    } catch (err) {
      console.error("Load request error:", err);
      setError(err.message || "Ошибка загрузки заявки");
      haptic.error();
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const data = await documents.getByRequest(requestId);
      setRequestDocuments(data || []);
    } catch (err) {
      console.error("Load documents error:", err);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      haptic.medium();
      await requests.updateStatus(requestId, newStatus);
      await loadRequest();
      haptic.success();
    } catch (err) {
      console.error("Update status error:", err);
      setError(err.message || "Ошибка обновления статуса");
      haptic.error();
    } finally {
      setUpdating(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUpdating(true);
      haptic.medium();
      await documents.upload(requestId, file, "invoice");
      await loadDocuments();
      setShowUpload(false);
      haptic.success();
    } catch (err) {
      console.error("Upload document error:", err);
      setError(err.message || "Ошибка загрузки документа");
      haptic.error();
    } finally {
      setUpdating(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownload = async (documentId) => {
    try {
      haptic.light();
      const blob = await documents.download(documentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `document_${documentId}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
      setError("Ошибка скачивания документа");
      haptic.error();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Загрузка...</div>
      </div>
    );
  }

  if (error && !request) {
    return (
      <div className="flex min-h-screen w-full  flex-col pb-20">
        <div className="flex-1 px-3 py-4">
          <button
            onClick={() => {
              haptic.light();
              router.back();
            }}
            className="mb-4 text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Назад
          </button>
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
        <Navigation />
      </div>
    );
  }

  const nextAction = NEXT_STATUS_ACTIONS[request?.status];
  const canUpdateStatus = nextAction && (nextAction.role === "any" || true); // TODO: Проверка роли

  return (
    <div className="flex min-h-screen w-full  flex-col pb-20">
      <div className="flex-1 px-3 py-4">
        <button
          onClick={() => {
            haptic.light();
            router.back();
          }}
          className="mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
        >
          <HiArrowLeft className="text-lg" />
          <span>Назад</span>
        </button>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {request && (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {request.number}
                </h1>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                  {STATUS_LABELS[request.status] || request.status}
                </span>
              </div>
              {request.object && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Проект: {request.object.name}
                </p>
              )}
            </div>

            {/* Материалы */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Материалы
              </h2>
              <div className="space-y-2">
                {request.items?.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </p>
                    {(item.quantity || item.unit) && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.quantity} {item.unit}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Документы */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Документы ({requestDocuments.length})
                </h2>
                <button
                  onClick={() => {
                    haptic.light();
                    setShowUpload(!showUpload);
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <HiPlus className="text-base" />
                  <span>Загрузить</span>
                </button>
              </div>

              {showUpload && (
                <div className="mb-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="w-full text-sm"
                    disabled={updating}
                  />
                </div>
              )}

              {requestDocuments.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Документов нет
                </p>
              ) : (
                <div className="space-y-2">
                  {requestDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {doc.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {doc.document_type || "Документ"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownload(doc.id)}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        Скачать
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Дополнительная информация */}
            {request.delivery_date && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Дата доставки:</span>{" "}
                  {new Date(request.delivery_date).toLocaleDateString("ru-RU")}
                </p>
              </div>
            )}

            {request.notes && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Примечания:</span> {request.notes}
                </p>
              </div>
            )}

            {/* Действия */}
            {canUpdateStatus && nextAction && (
              <div className="mt-6">
                <CustomButton
                  onClick={() => handleStatusUpdate(nextAction.status)}
                  disabled={updating}
                >
                  {updating ? "Обновление..." : nextAction.label}
                </CustomButton>
              </div>
            )}
          </>
        )}
      </div>
      <Navigation />
    </div>
  );
}

