"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createObject } from "../../../lib/api";

export default function NewProjectPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Валидация
            if (!name.trim()) {
                setError("Введите название проекта");
                setIsSubmitting(false);
                return;
            }

            // Формируем данные для отправки
            const projectData = {
                name: name.trim(),
                description: description.trim() || undefined
            };

            const createdProject = await createObject(projectData);
            
            // После успешного создания перенаправляем на страницу проекта
            router.push(`/main/projects/${createdProject.id}`);
        } catch (error) {
            console.error("Ошибка создания проекта:", error);
            if (error.response?.status === 401) {
                window.location.href = '/';
                return;
            }
            if (error.response?.status === 400) {
                setError("Ошибка валидации данных. Проверьте правильность заполнения полей.");
                return;
            }
            setError("Ошибка при создании проекта. Попробуйте еще раз.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-30 px-6">
            <div className="flex w-full max-w-2xl flex-col items-start gap-6">
                <button
                    onClick={() => router.back()}
                    className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
                >
                    ← Назад
                </button>

                <h1 className="text-4xl font-bold text-[#111827] leading-[0.9]">
                    Новый проект
                </h1>

                <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
                    {error && (
                        <div className="w-full rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                            {error}
                        </div>
                    )}

                    <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-[#6B7280]">
                                Название проекта *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Строительство жилого комплекса"
                                className="w-full rounded-xl bg-white border border-[#E5E7EB] px-4 py-3 text-base text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0"
                                style={{
                                    fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                }}
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-[#6B7280]">
                                Описание
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Строительство многоэтажного жилого комплекса в центре города"
                                rows={4}
                                className="w-full rounded-xl bg-white border border-[#E5E7EB] px-4 py-3 text-base text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0 resize-none"
                                style={{
                                    fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                }}
                                disabled={isSubmitting}
                            />
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
                            disabled={isSubmitting}
                            className="flex-1 rounded-xl bg-[#111827] px-5 py-3 text-base font-semibold text-white hover:bg-[#1F2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                height: "50px",
                            }}
                        >
                            {isSubmitting ? "Создание..." : "Создать"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
