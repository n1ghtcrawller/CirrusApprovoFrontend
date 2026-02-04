"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getRequestWithRelations, openDocument, deleteDocument, getCurrentUser, getObjectWithMembers, getObjectMembers } from "../../../lib/api";
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
            approved_for_supply: "Утверждено для снабжения",
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
            approved_for_supply: "bg-[#FEF3C7] text-[#92400E]",
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

    const handleDocumentClick = async (e, doc) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Проверяем тип файла - для PDF открываем на отдельной странице, для остальных используем старый способ
        const isPdf = doc.file_type?.includes('pdf') || doc.name?.toLowerCase().endsWith('.pdf');
        
        if (isPdf) {
            // Открываем PDF на отдельной странице
            router.push(`/main/requests/${params.id}/document/${doc.id}`);
        } else {
            // Для других типов файлов используем старый способ
            try {
                console.log("Открытие документа:", doc);
                await openDocument(doc.id, doc.name, doc.file_type);
            } catch (error) {
                console.error("Ошибка при открытии документа:", error);
                alert("Не удалось открыть документ. Попробуйте позже.");
            }
        }
    };

    const handleDeleteDocument = async (e, doc) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!confirm(`Вы уверены, что хотите удалить документ "${doc.name}"?`)) {
            return;
        }
        
        try {
            await deleteDocument(doc.id);
            // Перезагружаем заявку для обновления списка документов
            const data = await getRequestWithRelations(parseInt(params.id));
            setRequest(data);
        } catch (error) {
            console.error("Ошибка при удалении документа:", error);
            alert("Не удалось удалить документ. Попробуйте позже.");
        }
    };

    const getPendingActionByStatus = (status) => {
        const roleDisplayMap = {
            supply_specialist: "Специалист отдела снабжения",
            director: "Директор",
            deputy_director: "Заместитель директора",
            chief_engineer: "Главный инженер",
            accountant: "Бухгалтер",
            foreman: "Прораб",
        };

        const statusActionMap = {
            created: {
                role: ["director", "deputy_director", "chief_engineer"],
                role_display: "Директор / Заместитель директора / Главный инженер",
                action: "Утвердить для снабжения",
            },
            approved_for_supply: {
                role: "supply_specialist",
                role_display: roleDisplayMap.supply_specialist,
                action: "Добавить счёт",
            },
            supply_added_invoice: {
                role: "director",
                role_display: "Директор / Заместитель директора",
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
            "Утвердить для снабжения": "approve_for_supply",
            "Утвердить заявку для снабжения": "approve_for_supply",
            "Добавить счёт": "add_invoice",
            "Подтвердить счёт": "invoice_agreement",
            "Отметить как оплачено": "accountants_payment",
            "Отметить оплаченным": "accountants_payment",
            "Подтвердить получение": "foreman_agreement",
            "Подтвердить получение материалов": "foreman_agreement",
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
                        <div className="flex items-start justify-between gap-3">
                            <h1 className="text-3xl font-bold text-[#111827]">{request.number}</h1>
                            {(userRoleInObject === "director" || userRoleInObject === "deputy_director" || userRoleInObject === "chief_engineer") && 
                             (request.status === "created" || request.status === "approved_for_supply") && (
                                <button
                                    onClick={() => router.push(`/main/requests/${params.id}/edit`)}
                                    className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB] transition-colors whitespace-nowrap"
                                >
                                    Редактировать
                                </button>
                            )}
                        </div>
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
                        {request.total_amount != null && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-[#6B7280]">Сумма оплаты:</span>
                                <span className="text-[#111827] font-semibold">{request.total_amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</span>
                            </div>
                        )}
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
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-xl font-bold text-[#111827]">Материалы</h2>
                            {userRoleInObject === "foreman" && (request.status === "foreman_confirmed_receipt" || request.status === "documents_shipped") && (
                                <button
                                    onClick={() => router.push(`/main/requests/${params.id}/foreman_agreement`)}
                                    className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB] transition-colors"
                                >
                                    Редактировать
                                </button>
                            )}
                        </div>
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
                                    <div className="text-right flex flex-col gap-0.5">
                                        <span className="text-sm text-[#6B7280]">
                                            Заказано: <span className="font-semibold text-[#111827]">{item.quantity}</span> {item.unit}
                                        </span>
                                        <span className="text-sm text-[#6B7280]">
                                            Получено:{" "}
                                            {item.received_quantity != null ? (
                                                <span className="font-semibold text-[#111827]">{item.received_quantity}</span>
                                            ) : (
                                                <span className="text-[#9CA3AF]">—</span>
                                            )}
                                            {" "}{item.unit}
                                        </span>
                                        {item.received_quantity != null && (
                                            <span className="text-sm text-[#6B7280]">
                                                Остаток: <span className="font-semibold text-[#111827]">{Math.max(0, (item.quantity ?? 0) - item.received_quantity)}</span> {item.unit}
                                            </span>
                                        )}
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
                                    className="flex items-center justify-between gap-4 rounded-lg bg-[#f6f6f8] p-4 hover:bg-[#E5E7EB] transition-colors"
                                >
                                    <div
                                        onClick={(e) => handleDocumentClick(e, doc)}
                                        className="flex items-center justify-between gap-4 flex-1 cursor-pointer"
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
                                    <button
                                        onClick={(e) => handleDeleteDocument(e, doc)}
                                        className="ml-2 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Удалить документ"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.66683 4V10.6667H2.3335V4H7.66683ZM6.66683 0H3.3335L2.66683 0.666667H0.333496V2H9.66683V0.666667H7.3335L6.66683 0ZM9.00016 2.66667H1.00016V10.6667C1.00016 11.4 1.60016 12 2.3335 12H7.66683C8.40016 12 9.00016 11.4 9.00016 10.6667V2.66667Z" fill="#EF4444"/>
                                        </svg>
                                    </button>
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
                                // Имя из данных пользователя (Telegram: first_name, last_name, username)
                                const getDisplayName = () => {
                                    const user = entry.changed_by_user;
                                    if (user) {
                                        const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
                                        if (name) return name;
                                        if (user.username) return `@${user.username}`;
                                    }
                                    return entry.changed_by ? `Пользователь #${entry.changed_by}` : "—";
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
                                                <span>{getDisplayName()}</span>
                                                <span>•</span>
                                                <span>{formatDate(entry.created_at)}</span>
                                            </div>
                                            {entry.receipt_notes && (
                                                <div className="mt-2 text-sm text-[#6B7280] bg-[#f6f6f8] rounded-lg p-3 whitespace-pre-wrap">
                                                    {entry.receipt_notes}
                                                </div>
                                            )}
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
                    // Если role - массив, проверяем, входит ли роль пользователя в массив
                    // Для "Подтвердить счёт" (role === "director") могут и директор, и заместитель директора
                    const canPerformAction = pendingAction.role === null 
                        ? userRoleInObject !== null // Любой участник объекта может выполнить
                        : Array.isArray(pendingAction.role)
                            ? pendingAction.role.includes(userRoleInObject) // Роль должна быть в массиве
                            : pendingAction.role === "director"
                                ? (userRoleInObject === "director" || userRoleInObject === "deputy_director")
                                : userRoleInObject === pendingAction.role;

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
                                            alert(`Неизвестное действие: "${pendingAction.action}". Обратитесь к администратору.`);
                                        }
                                    }}
                                    fontSize="16"
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
