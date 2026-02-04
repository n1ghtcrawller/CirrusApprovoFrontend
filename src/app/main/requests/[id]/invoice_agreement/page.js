"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import TelegramBackButton from "@/app/components/TelegramBackButton";
import CustomButton from "../../../../components/СustomButton";
import { getRequestWithRelations, updateRequestStatus, openDocument } from "../../../../lib/api";

export default function InvoiceAgreement() {
    const router = useRouter();
    const params = useParams();
    const [request, setRequest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectTargetStatus, setRejectTargetStatus] = useState(null);

    useEffect(() => {
        const loadRequest = async () => {
            setIsLoading(true);
            try {
                const data = await getRequestWithRelations(parseInt(params.id));
                setRequest(data);
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

    const handleApprove = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            await updateRequestStatus(parseInt(params.id), "director_approved");
            router.push(`/main/requests/${params.id}`);
        } catch (error) {
            console.error("Ошибка подтверждения счета:", error);
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
            setError("Ошибка при подтверждении счета. Попробуйте еще раз.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            setError("Укажите причину отказа");
            return;
        }

        setIsRejecting(true);
        setError(null);

        try {
            await updateRequestStatus(parseInt(params.id), rejectTargetStatus, {
                receipt_notes: rejectReason.trim(),
            });
            router.push(`/main/requests/${params.id}`);
        } catch (error) {
            console.error("Ошибка отказа в согласовании:", error);
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
            setError("Ошибка при отказе в согласовании. Попробуйте еще раз.");
        } finally {
            setIsRejecting(false);
        }
    };

    const openRejectModal = (targetStatus) => {
        setRejectTargetStatus(targetStatus);
        setShowRejectModal(true);
        setRejectReason("");
        setError(null);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + " Б";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " КБ";
        return (bytes / (1024 * 1024)).toFixed(1) + " МБ";
    };

    const handleDocumentClick = (e, doc) => {
        e.preventDefault();
        e.stopPropagation();
        const isPdf = doc.file_type?.includes('pdf') || doc.name?.toLowerCase().endsWith('.pdf');
        if (isPdf) {
            router.push(`/main/requests/${params.id}/document/${doc.id}`);
        } else {
            openDocument(doc.id, doc.name, doc.file_type).catch((err) => {
                console.error("Ошибка открытия документа:", err);
                alert("Не удалось открыть документ. Попробуйте позже.");
            });
        }
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

    // Находим документы типа invoice
    const invoiceDocuments = request.documents?.filter(doc => doc.document_type === "invoice") || [];

    return (
        <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-20 px-6 overflow-x-hidden">
            <TelegramBackButton/>
            <div className="flex w-full max-w-2xl flex-col items-start gap-6 min-w-0">
                <h1 className="text-4xl font-bold text-[#111827] leading-[0.9]">
                    Согласование счета
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

                {invoiceDocuments.length > 0 && (
                    <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6">
                        <h2 className="text-xl font-bold text-[#111827]">Счет</h2>
                        <div className="flex flex-col gap-3">
                            {invoiceDocuments.map((doc) => (
                                <div
                                    key={doc.id}
                                    onClick={(e) => handleDocumentClick(e, doc)}
                                    className="flex items-center justify-between gap-4 rounded-lg bg-[#f6f6f8] p-4 cursor-pointer hover:bg-[#E5E7EB] transition-colors"
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium text-[#111827]">{doc.name}</span>
                                        <span className="text-xs text-[#9CA3AF]">
                                            {formatFileSize(doc.file_size)} • {formatDate(doc.created_at)}
                                        </span>
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

                <div className="flex w-full flex-col gap-3 rounded-xl bg-white p-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-[#6B7280]">
                            {request.status === "director_approved" 
                                ? "Счет уже подтвержден. Вы можете отменить подтверждение."
                                : "Подтвердите счет для продолжения обработки заявки."}
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            disabled={isSubmitting || isRejecting}
                            className="flex-1 rounded-xl bg-white border border-[#E5E7EB] px-5 py-3 text-base font-semibold text-[#6B7280] hover:bg-[#f6f6f8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                fontFamily: "var(--font-onest), -apple-system, sans-serif",
                            }}
                        >
                            {request.status === "director_approved" ? "Назад" : "Отмена"}
                        </button>
                        {request.status === "supply_added_invoice" && (
                            <CustomButton
                                width="100%"
                                onClick={handleApprove}
                                disabled={isSubmitting || isRejecting}
                            >
                                {isSubmitting ? "Подтверждение..." : "Подтвердить"}
                            </CustomButton>
                        )}
                    </div>
                </div>

                {(request.status === "supply_added_invoice" || request.status === "director_approved") && (
                    <div className="flex w-full flex-col gap-3 rounded-xl bg-white p-6 border-t-2 border-[#E5E7EB]">
                        <button
                            type="button"
                            onClick={() => openRejectModal(
                                request.status === "supply_added_invoice" 
                                    ? "approved_for_supply" 
                                    : "supply_added_invoice"
                            )}
                            disabled={isSubmitting || isRejecting}
                            className="w-full rounded-xl bg-red-50 border border-red-200 px-5 py-3 text-base font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                fontFamily: "var(--font-onest), -apple-system, sans-serif",
                            }}
                        >
                            {request.status === "supply_added_invoice" 
                                ? "Отказать в согласовании" 
                                : "Отменить подтверждение"}
                        </button>
                    </div>
                )}

                {showRejectModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full flex flex-col gap-4">
                            <h2 className="text-xl font-bold text-[#111827]">
                                {rejectTargetStatus === "approved_for_supply" 
                                    ? "Отказ в согласовании счёта" 
                                    : "Отмена подтверждения счёта"}
                            </h2>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-[#6B7280]">
                                    Причина {rejectTargetStatus === "approved_for_supply" ? "отказа" : "отмены"} *
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder={`Укажите причину ${rejectTargetStatus === "approved_for_supply" ? "отказа в согласовании" : "отмены подтверждения"}`}
                                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-base text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent min-h-[100px] resize-y"
                                    style={{
                                        fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                    }}
                                    disabled={isRejecting}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectReason("");
                                        setRejectTargetStatus(null);
                                        setError(null);
                                    }}
                                    disabled={isRejecting}
                                    className="flex-1 rounded-xl bg-white border border-[#E5E7EB] px-5 py-3 text-base font-semibold text-[#6B7280] hover:bg-[#f6f6f8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReject}
                                    disabled={isRejecting || !rejectReason.trim()}
                                    className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-base font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isRejecting ? "Отправка..." : "Подтвердить"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
