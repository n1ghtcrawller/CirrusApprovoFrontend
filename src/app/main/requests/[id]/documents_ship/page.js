"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import TelegramBackButton from "@/app/components/TelegramBackButton";
import CustomButton from "../../../../components/СustomButton";
import { getRequestWithRelations, uploadDocument, updateRequestStatus } from "../../../../lib/api";

export default function DocumentsShip() {
    const router = useRouter();
    const params = useParams();
    const [request, setRequest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [error, setError] = useState(null);

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
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            // Проверка размера файлов (макс 10 МБ каждый)
            const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);
            if (invalidFiles.length > 0) {
                setError("Размер файлов не должен превышать 10 МБ");
                return;
            }
            setSelectedFiles(files);
            setError(null);
        }
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (selectedFiles.length === 0) {
                setError("Выберите хотя бы один файл для отправки");
                setIsSubmitting(false);
                return;
            }

            // Загружаем все выбранные документы
            for (const file of selectedFiles) {
                await uploadDocument(parseInt(params.id), file, "shipment");
            }
            
            // Обновляем статус заявки на documents_shipped
            await updateRequestStatus(parseInt(params.id), "documents_shipped");
            
            // Возвращаемся на страницу заявки
            router.push(`/main/requests/${params.id}`);
        } catch (error) {
            console.error("Ошибка отправки документов:", error);
            if (error.response?.status === 401) {
                window.location.href = '/';
                return;
            }
            if (error.response?.status === 400) {
                setError("Ошибка валидации данных. Проверьте правильность файлов.");
                return;
            }
            if (error.response?.status === 403) {
                setError("Нет доступа к заявке");
                return;
            }
            if (error.response?.status === 404) {
                setError("Заявка не найдена");
                return;
            }
            setError("Ошибка при отправке документов. Попробуйте еще раз.");
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

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + " Б";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " КБ";
        return (bytes / (1024 * 1024)).toFixed(1) + " МБ";
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
                    Передача документов
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
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-[#6B7280]">
                                Документы для отправки *
                            </label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                multiple
                                className="w-full rounded-xl bg-white border border-[#E5E7EB] px-4 py-3 text-base text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0"
                                style={{
                                    fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                }}
                                disabled={isSubmitting}
                                required
                            />
                            <span className="text-xs text-[#9CA3AF]">
                                Поддерживаемые форматы: PDF, JPG, PNG, DOC, DOCX. Максимальный размер каждого файла: 10 МБ
                            </span>
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="flex flex-col gap-2 pt-2 border-t border-[#E5E7EB]">
                                <span className="text-sm font-medium text-[#6B7280]">Выбранные файлы:</span>
                                <div className="flex flex-col gap-2">
                                    {selectedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between gap-3 rounded-lg bg-[#f6f6f8] p-3"
                                        >
                                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                                                <span className="text-sm font-medium text-[#111827] truncate">
                                                    {file.name}
                                                </span>
                                                <span className="text-xs text-[#9CA3AF]">
                                                    {formatFileSize(file.size)}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFile(index)}
                                                className="flex-shrink-0 p-1 hover:opacity-70 transition-opacity"
                                                disabled={isSubmitting}
                                            >
                                                <svg
                                                    className="w-4 h-4 text-[#EF4444]"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                        <button
                            type="submit"
                            disabled={isSubmitting || selectedFiles.length === 0}
                            className="flex-1 rounded-xl bg-[#111827] px-5 py-3 text-base font-semibold text-white hover:bg-[#1F2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                height: "50px",
                            }}
                        >
                            {isSubmitting ? "Отправка..." : "Отправить документы"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
