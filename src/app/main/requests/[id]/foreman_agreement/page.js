"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import TelegramBackButton from "@/app/components/TelegramBackButton";
import CustomButton from "../../../../components/СustomButton";
import { getRequestWithRelations, updateForemanReceipt } from "../../../../lib/api";

export default function ForemanAgreement() {
    const router = useRouter();
    const params = useParams();
    const [request, setRequest] = useState(null);
    const [receivedQuantities, setReceivedQuantities] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadRequest = async () => {
            setIsLoading(true);
            try {
                const data = await getRequestWithRelations(parseInt(params.id));
                setRequest(data);
                const initial = {};
                if (data.items && data.items.length) {
                    data.items.forEach((item) => {
                        const val = item.received_quantity != null ? item.received_quantity : item.quantity;
                        initial[item.id] = String(val ?? "");
                    });
                }
                setReceivedQuantities(initial);
            } catch (error) {
                console.error("Ошибка загрузки заявки:", error);
                if (error.response?.status === 401) {
                    window.location.href = '/';
                    return;
                }
                if (error.response?.status === 403 || error.response?.status === 404) {
                    setRequest(null);
                    return;
                }
                setRequest(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadRequest();
    }, [params.id]);

    const isAlreadyConfirmed = request?.status === "foreman_confirmed_receipt" || request?.status === "documents_shipped";

    const handleReceivedQuantityChange = (itemId, value) => {
        setReceivedQuantities((prev) => ({ ...prev, [itemId]: value }));
    };

    const handleConfirmReceipt = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const items = (request.items || []).map((item) => {
                const raw = receivedQuantities[item.id];
                const num = raw !== "" && raw !== undefined ? parseFloat(String(raw).replace(",", ".")) : item.quantity;
                return { item_id: item.id, received_quantity: Number.isFinite(num) ? num : item.quantity };
            });
            const updated = await updateForemanReceipt(parseInt(params.id), items);
            setRequest(updated);
            router.push(`/main/requests/${params.id}`);
        } catch (error) {
            console.error("Ошибка подтверждения получения:", error);
            if (error.response?.status === 401) {
                window.location.href = '/';
                return;
            }
            if (error.response?.status === 403) {
                setError("Нет доступа к заявке или недостаточно прав");
                return;
            }
            if (error.response?.status === 404) {
                setError("Заявка не найдена");
                return;
            }
            setError("Ошибка при сохранении. Попробуйте еще раз.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    if (isLoading) {
        return (
            <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-20 px-6">
                <TelegramBackButton/>
                <div className="flex w-full max-w-2xl flex-col items-start gap-6">
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
                <TelegramBackButton/>
                <div className="flex w-full max-w-2xl flex-col items-start gap-6">
                    <div className="w-full text-center text-[#9CA3AF] py-8">
                        Заявка не найдена
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-20 px-6 overflow-x-hidden">
            <TelegramBackButton/>
            <div className="flex w-full max-w-2xl flex-col items-start gap-6 min-w-0">
                <h1 className="text-4xl font-bold text-[#111827] leading-[0.9]">
                    Подтверждение прорабом
                </h1>

                <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-[#6B7280]">Заявка</span>
                        <span className="text-lg font-bold text-[#111827]">{request.number}</span>
                    </div>
                    {request.delivery_date && (
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-[#6B7280]">Дата доставки</span>
                            <span className="text-base text-[#111827]">{formatDate(request.delivery_date)}</span>
                        </div>
                    )}
                </div>

                {request.items && request.items.length > 0 && (
                    <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6">
                        <h2 className="text-xl font-bold text-[#111827]">Материалы</h2>
                        <p className="text-sm text-[#6B7280]">
                            Укажите фактически полученное количество по каждой позиции. Если получили не всё — введите меньше; статус заявки останется «Подтверждение прорабом» до полного получения.
                        </p>
                        <div className="flex flex-col gap-3">
                            {request.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-4 rounded-lg bg-[#f6f6f8] p-4"
                                >
                                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                                        <span className="font-medium text-[#111827]">{item.name}</span>
                                        <span className="text-xs text-[#6B7280]">Заказано: {item.quantity} {item.unit}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={receivedQuantities[item.id] ?? ""}
                                            onChange={(e) => handleReceivedQuantityChange(item.id, e.target.value)}
                                            placeholder={String(item.quantity ?? "")}
                                            disabled={isSubmitting}
                                            className="w-24 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-right text-base font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                                            style={{ fontFamily: "var(--font-onest), -apple-system, sans-serif" }}
                                        />
                                        <span className="text-sm text-[#6B7280] w-8">{item.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="w-full rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                        {error}
                    </div>
                )}

                <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-[#6B7280]">
                            {isAlreadyConfirmed
                                ? "Сохраните изменения — количество полученного обновится в заявке."
                                : "Подтвердите получение материалов. Если по всем позициям получено не меньше заказанного, статус заявки изменится на «Подтверждено прорабом»."}
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                            className="flex-1 rounded-xl bg-white border border-[#E5E7EB] px-5 py-3 text-base font-semibold text-[#6B7280] hover:bg-[#f6f6f8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                fontFamily: "var(--font-onest), -apple-system, sans-serif",
                            }}
                        >
                            Отмена
                        </button>
                        <CustomButton
                            width="100%"
                            onClick={handleConfirmReceipt}
                            disabled={isSubmitting}
                            fontSize="18px"
                        >
                            {isSubmitting
                                ? (isAlreadyConfirmed ? "Сохранение..." : "Подтверждение...")
                                : isAlreadyConfirmed
                                    ? "Сохранить отметку о получении"
                                    : "Подтвердить получение"}
                        </CustomButton>
                    </div>
                </div>
            </div>
        </main>
    );
}