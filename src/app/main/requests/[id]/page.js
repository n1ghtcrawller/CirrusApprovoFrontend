"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getRequestWithRelations, openDocument, getCurrentUser, getObjectWithMembers, getObjectMembers } from "../../../lib/api";
import CustomButton from "../../../components/СustomButton";
import Comments from "../../../components/Comments";
import TelegramBackButton from "@/app/components/TelegramBackButton";


export default function RequestDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [request, setRequest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [userRoleInObject, setUserRoleInObject] = useState(null);

    useEffect(() => {
        const loadRequest = async () => {
            setIsLoading(true);
            try {
                const data = await getRequestWithRelations(parseInt(params.id));
                setRequest(data);
                
                // Загружаем текущего пользователя
                try {
                    const user = await getCurrentUser();
                    setCurrentUser(user);
                    
                    // Загружаем объект с участниками для определения роли пользователя
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

    const handleDocumentClick = async (doc) => {
        try {
            await openDocument(doc.id, doc.name, doc.file_type);
        } catch (error) {
            console.error("Ошибка при открытии документа:", error);
            alert("Не удалось открыть документ. Попробуйте позже.");
        }
    };

    const getPendingActionByStatus = (status) => {
        const roleDisplayMap = {
            supply_specialist: "Специалист отдела снабжения",
            director: "Директор",
            accountant: "Бухгалтер",
            foreman: "Прораб",
        };

        const statusActionMap = {
            created: {
                role: "supply_specialist",
                role_display: roleDisplayMap.supply_specialist,
                action: "Добавить счёт",
            },
            supply_added_invoice: {
                role: "director",
                role_display: roleDisplayMap.director,
                action: "Подтвердить счёт",
            },
            director_approved: {
                role: "accountant",
                role_display: roleDisplayMap.accountant,
                action: "Отметить оплаченным",
            },
            accountant_paid: {
                role: "foreman",
                role_display: roleDisplayMap.foreman,
                action: "Подтвердить получение",
            },
            foreman_confirmed_receipt: {
                role: null,
                role_display: "Любой участник",
                action: "Отгрузить документы",
            },
        };

        return statusActionMap[status] || null;
    };

    const getActionRoute = (action) => {
        const routeMap = {
            "Добавить счёт": "add_invoice",
            "Подтвердить счёт": "invoice_agreement",
            "Отметить как оплачено": "accountants_payment",
            "Подтвердить получение": "foreman_agreement",
            "Отгрузить документы": "documents_ship",
        };
        return routeMap[action] || null;
    };


    if (isLoading) {
        return (
            <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-30 px-6">
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
            <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-30 px-6">
                <div className="flex w-full max-w-2xl flex-col items-start gap-12">
                    <div className="w-full text-center text-[#9CA3AF] py-8">
                        Заявка не найдена
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-30 px-6">
            <TelegramBackButton/>
            <div className="flex w-full max-w-2xl flex-col items-start gap-6">
                <div className="flex w-full flex-col gap-6 rounded-xl bg-white p-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold text-[#111827]">{request.number}</h1>
                        <span
                            className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap w-fit ${getStatusColor(
                                request.status
                            )}`}
                        >
                            {getStatusLabel(request.status)}
                        </span>
                        <span className="text-sm text-[#9CA3AF]">
                            Создана: {formatDate(request.created_at)}
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
                                    onClick={() => handleDocumentClick(doc)}
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

                {request.status_history && request.status_history.length > 0 && (
                    <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6">
                        <h2 className="text-xl font-bold text-[#111827]">История</h2>
                        <div className="flex flex-col gap-4">
                            {request.status_history.map((entry, index) => {
                                const getUserName = (userId) => {
                                    // Временный маппинг для демонстрации (в будущем будет из API)
                                    const userMap = {
                                        3: "Мария Смирнова",
                                        5: "Иван Петров",
                                    };
                                    return userMap[userId] || `Пользователь #${userId}`;
                                };

                                return (
                                    <div
                                        key={entry.id}
                                        className="flex gap-4 relative"
                                    >
                                        {index < request.status_history.length - 1 && (
                                            <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-[#E5E7EB]"></div>
                                        )}
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#DBEAFE] border-2 border-white flex items-center justify-center relative z-10">
                                            <div className="w-2 h-2 rounded-full bg-[#1E40AF]"></div>
                                        </div>
                                        <div className="flex-1 flex flex-col gap-2 pb-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium text-[#111827]">
                                                        {entry.action}
                                                    </span>
                                                    {entry.status && (
                                                        <span className={`text-xs px-2 py-1 rounded-full inline-block w-fit mt-1 ${getStatusColor(entry.status)}`}>
                                                            {getStatusLabel(entry.status)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                                                <span>{getUserName(entry.changed_by)}</span>
                                                <span>•</span>
                                                <span>{formatDate(entry.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {(() => {
                    // Определяем pending_action на основе статуса, если он не пришел с сервера
                    const pendingAction = request.pending_action || getPendingActionByStatus(request.status);
                    
                    // Не показываем кнопку, если статус финальный (documents_shipped)
                    if (!pendingAction || request.status === "documents_shipped") {
                        return null;
                    }

                    // Определяем, может ли текущий пользователь выполнить действие
                    // Если role === null, то действие может выполнить любой участник объекта
                    const canPerformAction = pendingAction.role === null 
                        ? userRoleInObject !== null // Любой участник объекта может выполнить
                        : userRoleInObject === pendingAction.role; // Только пользователь с нужной ролью

                    return (
                        <div className="flex w-full flex-col gap-3 rounded-xl bg-white p-6">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm text-[#6B7280]">
                                    От <span className="font-medium text-[#111827]">{pendingAction.role_display}</span> требуется:
                                </span>
                                <CustomButton
                                    width="100%"
                                    onClick={() => {
                                        const route = getActionRoute(pendingAction.action);
                                        if (route) {
                                            router.push(`/main/requests/${params.id}/${route}`);
                                        } else {
                                            console.error("Неизвестное действие:", pendingAction.action);
                                        }
                                    }}
                                    disabled={!canPerformAction}
                                >
                                    {pendingAction.action}
                                </CustomButton>
                            </div>
                        </div>
                    );
                })()}

                {/* Комментарии */}
                <Comments requestId={parseInt(params.id)} />
            </div>
        </main>
    );
}
