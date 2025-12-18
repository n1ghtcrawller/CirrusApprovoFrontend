"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import TelegramBackButton from "@/app/components/TelegramBackButton";
import CustomButton from "../../../../components/СustomButton";
import { getRequestWithRelations, uploadDocument, updateRequestStatus } from "../../../../lib/api";

export default function AddInvoice() {
    const router = useRouter();
    const params = useParams();
    const [request, setRequest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
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
        const file = e.target.files[0];
        if (file) {
            // Проверка размера файла (макс 10 МБ)
            if (file.size > 10 * 1024 * 1024) {
                setError("Размер файла не должен превышать 10 МБ");
                return;
            }
            setSelectedFile(file);
            setError(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (!selectedFile) {
                setError("Выберите файл счета");
                setIsSubmitting(false);
                return;
            }

            // Загружаем документ типа invoice
            await uploadDocument(parseInt(params.id), selectedFile, "invoice");
            
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
                setError("Ошибка валидации данных. Проверьте правильность файла.");
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
            setError("Ошибка при добавлении счета. Попробуйте еще раз.");
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
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-[#6B7280]">
                                Файл счета *
                            </label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                className="w-full rounded-xl bg-white border border-[#E5E7EB] px-4 py-3 text-base text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0"
                                style={{
                                    fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                }}
                                disabled={isSubmitting}
                                required
                            />
                            {selectedFile && (
                                <span className="text-sm text-[#6B7280]">
                                    Выбран файл: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} КБ)
                                </span>
                            )}
                            <span className="text-xs text-[#9CA3AF]">
                                Поддерживаемые форматы: PDF, JPG, PNG, DOC, DOCX. Максимальный размер: 10 МБ
                            </span>
                        </div>
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
                            disabled={isSubmitting || !selectedFile}
                            className="flex-1 rounded-xl bg-[#111827] px-5 py-3 text-base font-semibold text-white hover:bg-[#1F2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                height: "50px",
                            }}
                        >
                            {isSubmitting ? "Добавление..." : "Добавить счет"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
