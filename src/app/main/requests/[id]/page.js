"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import mockRequestDetail from "../../../data/mockRequestDetail.json";

export default function RequestDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [request, setRequest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Имитация загрузки данных (в будущем здесь будет API запрос)
        const loadRequest = async () => {
            setIsLoading(true);
            try {
                // TODO: Заменить на реальный API запрос
                // const response = await fetch(`/api/requests/${params.id}`);
                // const data = await response.json();
                
                // Пока используем mock данные
                await new Promise(resolve => setTimeout(resolve, 300)); // Имитация задержки сети
                setRequest(mockRequestDetail);
            } catch (error) {
                console.error("Ошибка загрузки заявки:", error);
                setRequest(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadRequest();
    }, [params.id]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatShortDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "short",
        });
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            created: "Создана",
            supply_added_invoice: "Добавлен счет",
            director_approved: "Одобрена директором",
            accountant_paid: "Оплачена бухгалтером",
            foreman_confirmed_receipt: "Подтверждено получение",
            documents_shipped: "Документы отправлены",
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        const colorMap = {
            created: "bg-[#E5E7EB] text-[#6B7280]",
            supply_added_invoice: "bg-[#DBEAFE] text-[#1E40AF]",
            director_approved: "bg-[#D1FAE5] text-[#065F46]",
            accountant_paid: "bg-[#FEF3C7] text-[#92400E]",
            foreman_confirmed_receipt: "bg-[#E0E7FF] text-[#3730A3]",
            documents_shipped: "bg-[#D1FAE5] text-[#065F46]",
        };
        return colorMap[status] || "bg-[#E5E7EB] text-[#6B7280]";
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + " Б";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " КБ";
        return (bytes / (1024 * 1024)).toFixed(1) + " МБ";
    };

    if (isLoading) {
        return (
            <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-20 px-6">
                <div className="flex w-full max-w-2xl flex-col items-start gap-12">
                    <div className="w-full text-center text-[#9CA3AF] py-8">
                        Загрузка заявки...
                    </div>
                </div>
            </main>
        );
    }

    if (!request) {
        return (
            <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-20 px-6">
                <div className="flex w-full max-w-2xl flex-col items-start gap-12">
                    <div className="w-full text-center text-[#9CA3AF] py-8">
                        Заявка не найдена
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-20 px-6">
            <div className="flex w-full max-w-2xl flex-col items-start gap-6">
                <button
                    onClick={() => router.back()}
                    className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
                >
                    ← Назад
                </button>

                <div className="flex w-full flex-col gap-6 rounded-xl bg-white p-6">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold text-[#111827]">{request.number}</h1>
                            <span className="text-sm text-[#9CA3AF]">
                                Создана: {formatDate(request.created_at)}
                            </span>
                        </div>
                        <span
                            className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap ${getStatusColor(
                                request.status
                            )}`}
                        >
                            {getStatusLabel(request.status)}
                        </span>
                    </div>

                    <div className="flex flex-col gap-4 pt-4 border-t border-[#E5E7EB]">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-[#6B7280]">Дата доставки:</span>
                            <span className="text-[#111827]">{formatShortDate(request.delivery_date)}</span>
                        </div>
                        {request.notes && (
                            <div className="flex items-start gap-2 text-sm">
                                <span className="font-medium text-[#6B7280]">Примечания:</span>
                                <span className="text-[#111827]">{request.notes}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-[#6B7280]">Обновлена:</span>
                            <span className="text-[#111827]">{formatDate(request.updated_at)}</span>
                        </div>
                    </div>
                </div>

                {request.items && request.items.length > 0 && (
                    <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6">
                        <h2 className="text-xl font-bold text-[#111827]">Позиции</h2>
                        <div className="flex flex-col gap-3">
                            {request.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-4 rounded-lg bg-[#f6f6f8] p-4"
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium text-[#111827]">{item.name}</span>
                                        <span className="text-xs text-[#9CA3AF]">
                                            Добавлено: {formatDate(item.created_at)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-bold text-[#111827]">
                                            {item.quantity}
                                        </span>
                                        <span className="text-sm text-[#6B7280] ml-1">{item.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {request.documents && request.documents.length > 0 && (
                    <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6">
                        <h2 className="text-xl font-bold text-[#111827]">Документы</h2>
                        <div className="flex flex-col gap-3">
                            {request.documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between gap-4 rounded-lg bg-[#f6f6f8] p-4 hover:bg-[#E5E7EB] transition-colors cursor-pointer"
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium text-[#111827]">{doc.name}</span>
                                        <span className="text-xs text-[#9CA3AF]">
                                            {formatFileSize(doc.file_size)} • {formatDate(doc.created_at)}
                                        </span>
                                    </div>
                                    <span className="text-xs text-[#6B7280] bg-white px-2 py-1 rounded">
                                        {doc.document_type}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
