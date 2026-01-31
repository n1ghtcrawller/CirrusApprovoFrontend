"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import TelegramBackButton from "@/app/components/TelegramBackButton";
import CustomButton from "../../../../components/СustomButton";
import { getRequestWithRelations, updateRequest, updateRequestStatus } from "../../../../lib/api";

export default function ForemanAgreement() {
    const router = useRouter();
    const params = useParams();
    const [request, setRequest] = useState(null);
    const [receiptNotes, setReceiptNotes] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadRequest = async () => {
            setIsLoading(true);
            try {
                const data = await getRequestWithRelations(parseInt(params.id));
                setRequest(data);
                setReceiptNotes(data.receipt_notes || "");
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

    const handleConfirmReceipt = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            await updateRequest(parseInt(params.id), { receipt_notes: receiptNotes.trim() || null });
            if (!isAlreadyConfirmed) {
                await updateRequestStatus(parseInt(params.id), "foreman_confirmed_receipt");
            }
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
                        <div className="flex flex-col gap-3">
                            {request.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-4 rounded-lg bg-[#f6f6f8] p-4"
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium text-[#111827]">{item.name}</span>
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

                {error && (
                    <div className="w-full rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                        {error}
                    </div>
                )}

                <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="receipt_notes" className="text-sm font-medium text-[#111827]">
                            Что фактически получено
                        </label>
                        <span className="text-xs text-[#6B7280]">
                            Укажите, какие материалы пришли (если приехало не всё — опишите, что получено). Это увидит вся команда в истории заявки.
                        </span>
                        <textarea
                            id="receipt_notes"
                            value={receiptNotes}
                            onChange={(e) => setReceiptNotes(e.target.value)}
                            placeholder="Например: Цемент 5 т — получено; Песок 10 м³ — частично 6 м³"
                            rows={4}
                            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-base text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent resize-y min-h-[100px]"
                            style={{ fontFamily: "var(--font-onest), -apple-system, sans-serif" }}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-[#6B7280]">
                            {isAlreadyConfirmed
                                ? "Сохраните изменения — отметка о получении обновится в заявке."
                                : "Подтвердите получение материалов для продолжения обработки заявки."}
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