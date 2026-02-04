"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import plus from "../../../assets/components/plus.svg";
import Search from "../../../components/Search";
import RequestList from "../../../components/RequestList";
import TelegramBackButton from "@/app/components/TelegramBackButton";
import { getObject, getObjectRequests } from "../../../lib/api";

export default function ProjectDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const [project, setProject] = useState(null);
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState("");
    const [searchValue, setSearchValue] = useState("");

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
                <h1 className="w-full text-4xl font-bold text-[#111827] leading-[0.9]">
                        {project.name}
                </h1>
                </div>
                
                {project.description && (
                    <p className="text-base text-[#6B7280]">
                        {project.description}
                    </p>
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
                    </div>
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