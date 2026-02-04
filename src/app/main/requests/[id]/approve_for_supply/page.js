"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import TelegramBackButton from "@/app/components/TelegramBackButton";
import CustomButton from "../../../../components/СustomButton";
import { getRequestWithRelations, updateRequestStatus, getCurrentUser, getObjectWithMembers, getObjectMembers } from "../../../../lib/api";

export default function ApproveForSupply() {
    const router = useRouter();
    const params = useParams();
    const [request, setRequest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [userRoleInObject, setUserRoleInObject] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);

    useEffect(() => {
        const loadRequest = async () => {
            setIsLoading(true);
            try {
                const data = await getRequestWithRelations(parseInt(params.id));
                setRequest(data);
                
                // Загружаем текущего пользователя и его роль в объекте
                try {
                    const user = await getCurrentUser();
                    setCurrentUser(user);
                    
                    if (data.object_id) {
                        try {
                            const objectData = await getObjectWithMembers(data.object_id);
                            const membersData = await getObjectMembers(data.object_id);
                            
                            // Проверяем, является ли пользователь владельцем (директором)
                            if (objectData.owner && objectData.owner.id === user.id) {
                                setUserRoleInObject('director');
                            } else {
                                // Ищем пользователя в списке участников
                                const userMember = membersData.find(m => m.user_id === user.id);
                                if (userMember) {
                                    setUserRoleInObject(userMember.role);
                                } else {
                                    setUserRoleInObject(null);
                                }
                            }
                        } catch (error) {
                            console.error("Ошибка загрузки объекта:", error);
                            setUserRoleInObject(null);
                        }
                    }
                } catch (error) {
                    console.error("Ошибка загрузки пользователя:", error);
                    setCurrentUser(null);
                    setUserRoleInObject(null);
                }
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
            await updateRequestStatus(parseInt(params.id), "approved_for_supply");
            router.push(`/main/requests/${params.id}`);
        } catch (error) {
            console.error("Ошибка утверждения для снабжения:", error);
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
            setError("Ошибка при утверждении заявки. Попробуйте еще раз.");
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
                    Утверждение для снабжения
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

                <div className="flex w-full flex-col gap-3 rounded-xl bg-white p-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-[#6B7280]">
                            {request.status === "approved_for_supply"
                                ? "Заявка уже утверждена для снабжения. Вы можете отменить утверждение."
                                : "Утвердите заявку для передачи в отдел снабжения. После утверждения отдел снабжения сможет добавить счёт."}
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
                            {request.status === "approved_for_supply" ? "Назад" : "Отмена"}
                        </button>
                        {request.status === "created" && (
                            <CustomButton
                                width="100%"
                                onClick={handleApprove}
                                disabled={isSubmitting || isRejecting}
                            >
                                {isSubmitting ? "Утверждение..." : "Утвердить"}
                            </CustomButton>
                        )}
                    </div>
                </div>

                {request.status === "created" && 
                 (userRoleInObject === "director" || userRoleInObject === "deputy_director" || userRoleInObject === "chief_engineer") && (
                    <div className="flex w-full flex-col gap-3 rounded-xl bg-white p-6 border-t-2 border-[#E5E7EB]">
                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={() => router.push(`/main/requests/${params.id}/edit`)}
                                disabled={isSubmitting || isRejecting}
                                className="w-full rounded-xl bg-[#111827] px-5 py-3 text-base font-semibold text-white hover:bg-[#1F2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                }}
                            >
                                Редактировать заявку
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowRejectModal(true)}
                                disabled={isSubmitting || isRejecting}
                                className="w-full rounded-xl bg-red-50 border border-red-200 px-5 py-3 text-base font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                }}
                            >
                                Отказать в согласовании
                            </button>
                        </div>
                    </div>
                )}

                {request.status === "approved_for_supply" && 
                 (userRoleInObject === "director" || userRoleInObject === "deputy_director" || userRoleInObject === "chief_engineer") && (
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
                            Отменить утверждение
                        </button>
                    </div>
                )}

                {showRejectModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full flex flex-col gap-4">
                            <h2 className="text-xl font-bold text-[#111827]">
                                {request.status === "approved_for_supply" 
                                    ? "Отмена утверждения" 
                                    : "Отказ в согласовании"}
                            </h2>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-[#6B7280]">
                                    Причина {request.status === "approved_for_supply" ? "отмены" : "отказа"} *
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder={request.status === "approved_for_supply"
                                        ? "Укажите причину отмены утверждения заявки"
                                        : "Укажите причину отказа в согласовании заявки"}
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
                                    {isRejecting 
                                        ? "Отправка..." 
                                        : (request.status === "approved_for_supply" 
                                            ? "Отменить утверждение" 
                                            : "Отказать в согласовании")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
