"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import plus from "../../../assets/components/plus.svg";
import EditPencilIcon from "../../../assets/components/white-edit-pencil.svg";
import Search from "../../../components/Search";
import RequestList from "../../../components/RequestList";
import TelegramBackButton from "@/app/components/TelegramBackButton";
import { getObject, getObjectRequests, getCurrentUser, getObjectWithMembers, getObjectMembers, updateObject } from "../../../lib/api";

export default function ProjectDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const [project, setProject] = useState(null);
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [userRoleInObject, setUserRoleInObject] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", description: "", planned_budget: "" });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [projectData, requestsData] = await Promise.all([
                    getObject(parseInt(params.id)),
                    getObjectRequests(parseInt(params.id))
                ]);
                
                setProject(projectData);
                setRequests(requestsData);
                setFilteredRequests(requestsData);
                
                // Загружаем текущего пользователя и определяем его роль
                try {
                    const user = await getCurrentUser();
                    setCurrentUser(user);
                    
                    try {
                        const objectData = await getObjectWithMembers(parseInt(params.id));
                        const membersData = await getObjectMembers(parseInt(params.id));
                        
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
                } catch (error) {
                    console.error("Ошибка загрузки пользователя:", error);
                    setCurrentUser(null);
                    setUserRoleInObject(null);
                }
            } catch (error) {
                console.error("Ошибка загрузки данных:", error);
                if (error.response?.status === 401) {
                    window.location.href = '/';
                    return;
                }
                if (error.response?.status === 403 || error.response?.status === 404) {
                    setProject(null);
                    setRequests([]);
                    setFilteredRequests([]);
                    return;
                }
                setProject(null);
                setRequests([]);
                setFilteredRequests([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [params.id]);

    const handleSearch = (value) => {
        setSearchValue(value);
        applyFilters(value, selectedDate);
    };

    const handleDateFilter = (date) => {
        setSelectedDate(date);
        applyFilters(searchValue, date);
    };

    const applyFilters = (search, date) => {
        let filtered = [...requests];

        // Фильтр по поисковому запросу
        if (search && search.trim()) {
            filtered = filtered.filter(request =>
                request.number.toLowerCase().includes(search.toLowerCase()) ||
                request.notes?.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Фильтр по дате создания
        if (date) {
            filtered = filtered.filter(request => {
                if (!request.created_at) return false;
                const requestDate = new Date(request.created_at);
                const selectedDateObj = new Date(date);
                
                // Сравниваем только даты (без времени)
                return requestDate.toDateString() === selectedDateObj.toDateString();
            });
        }

        setFilteredRequests(filtered);
    };

    const handleStartEdit = () => {
        setEditForm({
            name: project.name || "",
            description: project.description || "",
            planned_budget: project.planned_budget != null ? project.planned_budget.toString() : ""
        });
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditForm({ name: "", description: "", planned_budget: "" });
    };

    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            const updateData = {
                name: editForm.name,
                description: editForm.description || null,
                planned_budget: editForm.planned_budget ? parseFloat(editForm.planned_budget) : null
            };
            
            const updatedProject = await updateObject(parseInt(params.id), updateData);
            setProject(updatedProject);
            setIsEditing(false);
        } catch (error) {
            console.error("Ошибка обновления объекта:", error);
            if (error.response?.status === 401) {
                window.location.href = '/';
                return;
            }
            alert("Ошибка при сохранении изменений. Попробуйте еще раз.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-30 px-6">
                <div className="flex w-full max-w-2xl flex-col items-start gap-12">
                    <div className="w-full text-center text-[#9CA3AF] py-8">
                        Загрузка...
                    </div>
                </div>
            </main>
        );
    }

    if (!project) {
        return (
            <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-30 px-6">
                <div className="flex w-full max-w-2xl flex-col items-start gap-12">
                    <div className="w-full text-center text-[#9CA3AF] py-8">
                        Проект не найден
                    </div>
                </div>
            </main>
        );
    }

    return (
    <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-30 px-6">
        <TelegramBackButton/>
        <div className="flex w-full max-w-2xl flex-col items-start gap-12">
            <div className="flex w-full items-center justify-between gap-3">
                {isEditing ? (
                    <div className="flex-1 flex flex-col gap-3">
                        <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full text-4xl font-bold text-[#111827] leading-[0.9] bg-transparent border-b-2 border-[#3B82F6] focus:outline-none"
                            placeholder="Название объекта"
                        />
                    </div>
                ) : (
                    <h1 className="w-full text-4xl font-bold text-[#111827] leading-[0.9]">
                        {project.name}
                    </h1>
                )}
                {userRoleInObject === "director" && !isEditing && (
                    <button
                        onClick={handleStartEdit}
                        className="flex-shrink-0 flex items-center justify-center p-2 rounded-xl bg-[#111827] text-white hover:bg-[#1F2937] transition-colors"
                        title="Редактировать"
                    >
                        <Image src={EditPencilIcon} alt="Редактировать" width={24} height={24} className="flex-shrink-0" />
                    </button>
                )}
                {isEditing && (
                    <div className="flex-shrink-0 flex gap-2">
                        <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 rounded-xl bg-white border border-[#E5E7EB] text-[#6B7280] text-sm font-medium hover:bg-[#F9FAFB] transition-colors"
                            disabled={isSaving}
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleSaveEdit}
                            className="px-4 py-2 rounded-xl bg-[#111827] text-white text-sm font-medium hover:bg-[#1F2937] transition-colors disabled:opacity-50"
                            disabled={isSaving || !editForm.name.trim()}
                        >
                            {isSaving ? "Сохранение..." : "Сохранить"}
                        </button>
                    </div>
                )}
            </div>
                
            {isEditing ? (
                <div className="flex w-full flex-col gap-3">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#6B7280]">Описание</label>
                        <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="w-full rounded-xl bg-white border border-[#E5E7EB] px-4 py-3 text-base text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent resize-none"
                            rows="3"
                            placeholder="Описание объекта"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#6B7280]">Планируемый бюджет (₽)</label>
                        <input
                            type="number"
                            value={editForm.planned_budget}
                            onChange={(e) => setEditForm({ ...editForm, planned_budget: e.target.value })}
                            className="w-full rounded-xl bg-white border border-[#E5E7EB] px-4 py-3 text-base text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                        />
                    </div>
                </div>
            ) : (
                project.description && (
                    <p className="text-base text-[#6B7280]">
                        {project.description}
                    </p>
                )
            )}

                {(project.planned_budget != null || project.actual_spent != null) && (
                    <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6">
                        <h2 className="text-xl font-bold text-[#111827]">Бюджет</h2>
                        <div className="flex flex-col gap-3">
                            {project.planned_budget != null && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-[#6B7280]">Планируемый бюджет:</span>
                                    <span className="text-lg font-bold text-[#111827]">
                                        {project.planned_budget.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                                    </span>
                                </div>
                            )}
                            {project.actual_spent != null && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-[#6B7280]">Фактически потрачено:</span>
                                    <span className="text-lg font-bold text-[#111827]">
                                        {project.actual_spent.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                                    </span>
                                </div>
                            )}
                            {project.planned_budget != null && project.actual_spent != null && (
                                <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
                                    <span className="text-sm font-medium text-[#6B7280]">Остаток:</span>
                                    <span className={`text-lg font-bold ${(project.planned_budget - project.actual_spent) >= 0 ? 'text-[#065F46]' : 'text-[#DC2626]'}`}>
                                        {(project.planned_budget - project.actual_spent).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                                    </span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => router.push(`/main/projects/${params.id}/analytics`)}
                            className="w-full mt-4 rounded-xl bg-[#111827] px-6 py-3 text-center text-white text-sm font-medium hover:bg-[#1F2937] transition-colors"
                        >
                            Аналитика
                        </button>
                    </div>
                )}

                {(!project.planned_budget && !project.actual_spent) && (
                    <button
                        onClick={() => router.push(`/main/projects/${params.id}/analytics`)}
                        className="w-full rounded-xl bg-white px-6 py-4 text-left hover:shadow-md transition-all"
                    >
                        <span className="text-lg font-semibold text-[#111827]">Аналитика</span>
                    </button>
                )}

                <div className="flex w-full flex-col gap-6">
                    <button
                        onClick={() => router.push(`/main/projects/${params.id}/team`)}
                        className="w-full rounded-xl bg-white px-6 py-4 text-left hover:shadow-md transition-all"
                    >
                        <span className="text-lg font-semibold text-[#111827]">Команда проекта</span>
                    </button>

                    <div className="flex w-full items-center justify-between">
                        <h2 className="text-2xl font-bold text-[#111827]">Заявки</h2>
                        <button
                            onClick={() => router.push(`/main/projects/${params.id}/newRequest`)}
                            className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                        >
                    <img src={plus.src} alt="plus" className="w-10 h-10" />
                        </button>
            </div>
            <div className="flex w-full flex-col gap-4">
                <div className="flex w-full items-center gap-3">
                    <div className="flex-1">
                        <Search placeholder="Поиск заявки" onSearch={handleSearch} />
                    </div>
                </div>
                <div className="w-full">
                    <label htmlFor="date-filter" className="block text-sm font-medium text-[#6B7280] mb-2">
                        Фильтр по дате создания
                    </label>
                    <input
                        id="date-filter"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => handleDateFilter(e.target.value)}
                        className="w-[90%] rounded-xl bg-white px-4 py-3 text-base text-[#111827] border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    />
                    {selectedDate && (
                        <button
                            onClick={() => handleDateFilter("")}
                            className="mt-2 text-sm text-[#3B82F6] hover:text-[#2563EB] transition-colors"
                        >
                            Сбросить фильтр по дате
                        </button>
                    )}
                </div>
            </div>
                    {filteredRequests.length > 0 ? (
                        <RequestList 
                            requests={filteredRequests} 
                            onItemClick={(request) => router.push(`/main/requests/${request.id}`)}
                        />
                    ) : (
                        <div className="w-full text-center text-[#9CA3AF] py-8">
                            Заявки не найдены
                        </div>
                    )}
                </div>
        </div>
    </main>
    );
}