"use client";
import { useState, useEffect } from "react";
import { getCurrentUser, updateCurrentUser } from "../../lib/api";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        position: "",
        company: "",
        email: "",
        location: "",
        phone: "",
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setIsLoading(true);
        try {
            const data = await getCurrentUser();
            setUser(data);
            setFormData({
                first_name: data.first_name || "",
                position: data.position || "",
                company: data.company || "",
                email: data.email || "",
                location: data.location || "",
                phone: data.phone || "",
            });
        } catch (error) {
            console.error("Ошибка загрузки профиля:", error);
            if (error.response?.status === 401) {
                // Перенаправить на страницу входа
                window.location.href = '/';
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) {
            return;
        }
        
        setIsSaving(true);
        try {
            // Формируем объект только с изменёнными полями
            const updateData = {};
            if (formData.first_name !== (user.first_name || "")) updateData.first_name = formData.first_name;
            if (formData.position !== (user.position || "")) updateData.position = formData.position;
            if (formData.company !== (user.company || "")) updateData.company = formData.company;
            if (formData.email !== (user.email || "")) updateData.email = formData.email;
            if (formData.location !== (user.location || "")) updateData.location = formData.location;
            if (formData.phone !== (user.phone || "")) updateData.phone = formData.phone;

            if (Object.keys(updateData).length === 0) {
                setIsEditing(false);
                return;
            }

            const updatedData = await updateCurrentUser(updateData);
            setUser(updatedData);
            setIsEditing(false);
        } catch (error) {
            console.error("Ошибка обновления профиля:", error);
            if (error.response?.status === 401) {
                window.location.href = '/';
                return;
            }
            alert("Ошибка при сохранении профиля. Попробуйте еще раз.");
        } finally {
            setIsSaving(false);
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

    const getVerifiedStatusLabel = (status) => {
        const statusMap = {
            approved: "Одобрен",
            pending: "На рассмотрении",
            rejected: "Отклонён",
        };
        return statusMap[status] || status;
    };

    const getVerifiedStatusColor = (status) => {
        const colorMap = {
            approved: "bg-[#D1FAE5] text-[#065F46]",
            pending: "bg-[#FEF3C7] text-[#92400E]",
            rejected: "bg-[#FEE2E2] text-[#991B1B]",
        };
        return colorMap[status] || "bg-[#E5E7EB] text-[#6B7280]";
    };

    if (isLoading) {
        return (
            <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-20 px-6">
                <div className="flex w-full max-w-2xl flex-col items-start gap-12">
                    <div className="w-full text-center text-[#9CA3AF] py-8">
                        Загрузка профиля...
                    </div>
                </div>
            </main>
        );
    }

    if (!user) {
    return (
    <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-20 px-6">
        <div className="flex w-full max-w-2xl flex-col items-start gap-12">
                    <div className="w-full text-center text-[#9CA3AF] py-8">
                        Профиль не найден
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-20 px-6">
            <div className="flex w-full max-w-2xl flex-col items-start gap-6">
                <div className="flex w-full items-center justify-between">
                    <h1 className="text-4xl font-bold text-[#111827] leading-[0.9]">
                Профиль
            </h1>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-sm font-medium text-[#135bec] hover:text-[#1E40AF] transition-colors"
                        >
                            Редактировать
                        </button>
                    )}
                </div>

                <div className="flex w-full flex-col gap-6 rounded-xl bg-white p-6">
                    {isEditing ? (
                        <>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-[#6B7280]">
                                        Имя
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full rounded-xl bg-white border border-[#E5E7EB] px-4 py-3 text-base text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0"
                                        style={{
                                            fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                        }}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-[#6B7280]">
                                        Должность
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        className="w-full rounded-xl bg-white border border-[#E5E7EB] px-4 py-3 text-base text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0"
                                        style={{
                                            fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                        }}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-[#6B7280]">
                                        Компания
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full rounded-xl bg-white border border-[#E5E7EB] px-4 py-3 text-base text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0"
                                        style={{
                                            fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                        }}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-[#6B7280]">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full rounded-xl bg-white border border-[#E5E7EB] px-4 py-3 text-base text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0"
                                        style={{
                                            fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                        }}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-[#6B7280]">
                                        Местоположение
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full rounded-xl bg-white border border-[#E5E7EB] px-4 py-3 text-base text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0"
                                        style={{
                                            fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                        }}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-[#6B7280]">
                                        Телефон
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full rounded-xl bg-white border border-[#E5E7EB] px-4 py-3 text-base text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0"
                                        style={{
                                            fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-[#E5E7EB]">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            first_name: user.first_name || "",
                                            position: user.position || "",
                                            company: user.company || "",
                                            email: user.email || "",
                                            location: user.location || "",
                                            phone: user.phone || "",
                                        });
                                    }}
                                    className="flex-1 rounded-xl bg-white border border-[#E5E7EB] px-5 py-3 text-base font-semibold text-[#6B7280] hover:bg-[#f6f6f8] transition-colors"
                                    style={{
                                        fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                    }}
                                >
                                    Отмена
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-1 rounded-xl bg-[#111827] px-5 py-3 text-base font-semibold text-white hover:bg-[#1F2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                        height: "50px",
                                    }}
                                >
                                    {isSaving ? "Сохранение..." : "Сохранить"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-2xl font-bold text-[#111827]">
                                        {user.first_name || ""} {user.last_name || ""}
                                    </h2>
                                    <span className="text-sm text-[#9CA3AF]">@{user.username || "unknown"}</span>
                                </div>
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${getVerifiedStatusColor(
                                        user.verified_status
                                    )}`}
                                >
                                    {getVerifiedStatusLabel(user.verified_status)}
                                </span>
                            </div>

                            <div className="flex flex-col gap-4 pt-4 border-t border-[#E5E7EB]">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium text-[#6B7280] w-32">Должность:</span>
                                        <span className="text-[#111827]">{user.position || "—"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium text-[#6B7280] w-32">Компания:</span>
                                        <span className="text-[#111827]">{user.company || "—"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium text-[#6B7280] w-32">Email:</span>
                                        <span className="text-[#111827]">{user.email || "—"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium text-[#6B7280] w-32">Местоположение:</span>
                                        <span className="text-[#111827]">{user.location || "—"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium text-[#6B7280] w-32">Телефон:</span>
                                        <span className="text-[#111827]">{user.phone || "—"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium text-[#6B7280] w-32">В команде с:</span>
                                        <span className="text-[#111827]">{formatDate(user.team_join_date)}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
        </div>
    </main>
    );
}