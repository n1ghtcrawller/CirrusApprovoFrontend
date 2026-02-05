"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import TelegramBackButton from "@/app/components/TelegramBackButton";
import CustomButton from "../../../../components/СustomButton";
import { getRequestWithRelations, uploadDocument, uploadDocumentsBatch, updateRequestStatus } from "../../../../lib/api";
import { FaFilePdf, FaPlus, FaTimes } from "react-icons/fa";

export default function AddInvoice() {
    const router = useRouter();
    const params = useParams();
    const [request, setRequest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [error, setError] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);
    const fileInputRef = useRef(null);

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

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Фильтруем только PDF файлы
        const pdfFiles = files.filter(file => file.type === 'application/pdf');
        if (pdfFiles.length !== files.length) {
            setError("Поддерживается только формат PDF");
            return;
        }

        // Проверка общего количества файлов (макс 20)
        const totalFiles = selectedFiles.length + pdfFiles.length;
        if (totalFiles > 20) {
            setError(`Можно загрузить не более 20 файлов. Уже выбрано: ${selectedFiles.length}`);
            return;
        }

        // Проверка размера каждого файла (макс 10 МБ)
        const invalidFiles = pdfFiles.filter(file => file.size > 10 * 1024 * 1024);
        if (invalidFiles.length > 0) {
            setError(`Размер файла "${invalidFiles[0].name}" превышает 10 МБ`);
            return;
        }

        setSelectedFiles(prev => [...prev, ...pdfFiles]);
        setError(null);
        
        // Сбрасываем input для повторного выбора тех же файлов
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (selectedFiles.length === 0) {
                setError("Выберите хотя бы один файл счета");
                setIsSubmitting(false);
                return;
            }

            // Если один файл - используем обычный endpoint, если несколько - batch endpoint
            if (selectedFiles.length === 1) {
                await uploadDocument(parseInt(params.id), selectedFiles[0], "invoice");
            } else {
                await uploadDocumentsBatch(parseInt(params.id), selectedFiles, "invoice");
            }
            
            // Обновляем статус заявки на supply_added_invoice
            await updateRequestStatus(parseInt(params.id), "supply_added_invoice");
            
            // Возвращаемся на страницу заявки
            router.push(`/main/requests/${params.id}`);
        } catch (error) {
            console.error("Ошибка добавления счета:", error);
            if (error.response?.status === 401) {
                window.location.href = '/';
                return;
            }
            if (error.response?.status === 400) {
                const errorMessage = error.response?.data?.detail || error.response?.data?.message;
                setError(errorMessage || "Ошибка валидации данных. Проверьте правильность файлов.");
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
            setError("Ошибка при добавлении счетов. Попробуйте еще раз.");
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
            await updateRequestStatus(parseInt(params.id), "created", {
                receipt_notes: rejectReason.trim(),
            });
            router.push(`/main/requests/${params.id}`);
        } catch (error) {
            console.error("Ошибка отказа в обработке:", error);
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
            setError("Ошибка при отказе в обработке. Попробуйте еще раз.");
        } finally {
            setIsRejecting(false);
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
                    Добавление счета
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

                <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6 min-w-0">
                    {error && (
                        <div className="w-full rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                            {error}
                        </div>
                    )}

                    <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6">
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium text-[#6B7280]">
                                Файл(ы) счета *
                            </label>
                            
                            {/* Скрытый input для выбора файлов */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".pdf,application/pdf"
                                multiple
                                className="hidden"
                                disabled={isSubmitting}
                            />
                            
                            {/* Сетка с файлами и кнопкой добавления */}
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {/* Выбранные файлы */}
                                {selectedFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className="relative aspect-square rounded-xl bg-[#FEE2E2] border-2 border-[#FECACA] flex flex-col items-center justify-center p-2 group"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFile(index)}
                                            disabled={isSubmitting}
                                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50 shadow-md"
                                        >
                                            <FaTimes size={12} />
                                        </button>
                                        <FaFilePdf className="text-[#DC2626] text-3xl mb-1" />
                                        <span className="text-[10px] text-[#991B1B] text-center line-clamp-2 leading-tight px-1">
                                            {file.name}
                                        </span>
                                        <span className="text-[9px] text-[#B91C1C] mt-0.5">
                                            {(file.size / 1024).toFixed(0)} КБ
                                        </span>
                                    </div>
                                ))}
                                
                                {/* Кнопка добавления PDF */}
                                {selectedFiles.length < 20 && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isSubmitting}
                                        className="aspect-square rounded-xl border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] hover:border-[#3B82F6] hover:bg-[#EFF6FF] transition-colors flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FaPlus className="text-[#9CA3AF] text-xl" />
                                        <span className="text-xs text-[#6B7280] font-medium">Добавить</span>
                                        <span className="text-xs text-[#9CA3AF]">PDF</span>
                                    </button>
                                )}
                            </div>
                            
                            <span className="text-xs text-[#9CA3AF]">
                                Поддерживается только формат PDF. Максимальный размер файла: 10 МБ. Можно загрузить до 20 файлов.
                            </span>
                        </div>
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
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || isRejecting || selectedFiles.length === 0}
                            className="flex-1 rounded-xl bg-[#111827] px-5 py-3 text-base font-semibold text-white hover:bg-[#1F2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                height: "50px",
                            }}
                        >
                            {isSubmitting 
                                ? (selectedFiles.length === 1 ? "Добавление..." : "Загрузка счетов...") 
                                : (selectedFiles.length === 1 ? "Добавить счет" : `Добавить ${selectedFiles.length} счетов`)}
                        </button>
                    </div>
                </form>

                {request.status === "approved_for_supply" && (
                    <div className="flex w-full flex-col gap-3 rounded-xl bg-white p-6 border-t-2 border-[#E5E7EB]">
                        <button
                            type="button"
                            onClick={() => setShowRejectModal(true)}
                            disabled={isSubmitting || isRejecting}
                            className="w-full rounded-xl bg-red-50 border border-red-200 px-5 py-3 text-base font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                fontFamily: "var(--font-onest), -apple-system, sans-serif",
                            }}
                        >
                            Отказать в обработке
                        </button>
                    </div>
                )}

                {showRejectModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full flex flex-col gap-4">
                            <h2 className="text-xl font-bold text-[#111827]">Отказ в обработке</h2>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-[#6B7280]">
                                    Причина отказа *
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Укажите причину отказа в обработке заявки"
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
                                    {isRejecting ? "Отправка..." : "Отказать"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
