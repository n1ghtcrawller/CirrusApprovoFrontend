"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import plus from "../../../assets/components/plus.svg";
import Search from "../../../components/Search";
import RequestList from "../../../components/RequestList";
import { getObject, getObjectRequests } from "../../../lib/api";

export default function ProjectDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const [project, setProject] = useState(null);
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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
        if (!value.trim()) {
            setFilteredRequests(requests);
            return;
        }
        
        const filtered = requests.filter(request =>
            request.number.toLowerCase().includes(value.toLowerCase()) ||
            request.notes?.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredRequests(filtered);
    };

    if (isLoading) {
        return (
            <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-20 px-6">
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
            <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-20 px-6">
                <div className="flex w-full max-w-2xl flex-col items-start gap-12">
                    <div className="w-full text-center text-[#9CA3AF] py-8">
                        Проект не найден
                    </div>
                </div>
            </main>
        );
    }

    return (
    <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-20 px-6">
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
            <Search placeholder="Поиск заявки" onSearch={handleSearch} />
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