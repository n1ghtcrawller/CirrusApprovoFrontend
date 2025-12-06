"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Search from "../../components/Search";
import RequestList from "../../components/RequestList";
import mockRequests from "../../data/mockRequests.json";

export default function Requests() {
    const router = useRouter();
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Имитация загрузки данных (в будущем здесь будет API запрос)
        const loadRequests = async () => {
            setIsLoading(true);
            try {
                // TODO: Заменить на реальный API запрос
                // const response = await fetch('/api/requests');
                // const data = await response.json();
                
                // Пока используем mock данные
                await new Promise(resolve => setTimeout(resolve, 300)); // Имитация задержки сети
                setRequests(mockRequests);
                setFilteredRequests(mockRequests);
            } catch (error) {
                console.error("Ошибка загрузки заявок:", error);
                setRequests([]);
                setFilteredRequests([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadRequests();
    }, []);

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

    return (
    <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-20 px-6">
        <div className="flex w-full max-w-2xl flex-col items-start gap-12">
            <h1 className="w-full text-4xl font-bold text-[#111827] leading-[0.9]">
                Заявки
            </h1>
            <Search placeholder="Поиск заявки" onSearch={handleSearch} />
                {isLoading ? (
                    <div className="w-full text-center text-[#9CA3AF] py-8">
                        Загрузка заявок...
                    </div>
                ) : (
                    <RequestList 
                        requests={filteredRequests} 
                        onItemClick={(request) => router.push(`/main/requests/${request.id}`)}
                    />
                )}
        </div>
    </main>
    );
}