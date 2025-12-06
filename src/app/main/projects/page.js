"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import plus from "../../assets/components/plus.svg";
import Search from "../../components/Search";
import ProjectList from "../../components/ProjectList";
import { getObjects } from "../../lib/api";

export default function Projects() {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProjects = async () => {
            setIsLoading(true);
            try {
                const data = await getObjects();
                setProjects(data);
                setFilteredProjects(data);
            } catch (error) {
                console.error("Ошибка загрузки проектов:", error);
                if (error.response?.status === 401) {
                    window.location.href = '/';
                    return;
                }
                setProjects([]);
                setFilteredProjects([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadProjects();
    }, []);

    const handleSearch = (value) => {
        if (!value.trim()) {
            setFilteredProjects(projects);
            return;
        }
        
        const filtered = projects.filter(project =>
            project.name.toLowerCase().includes(value.toLowerCase()) ||
            project.description?.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredProjects(filtered);
    };
    return (
    <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-20 px-6">
        <div className="flex w-full max-w-2xl flex-col items-start gap-12">
            <div className="flex w-full items-center justify-between gap-3">
                <h1 className="w-full text-4xl font-bold text-[#111827] leading-[0.9]">
                    Все проекты
                </h1>
                <div className="flex items-center justify-center">
                    <img src={plus.src} alt="plus" className="w-10 h-10" />
                </div>
            </div>
            <Search placeholder="Поиск проекта" onSearch={handleSearch} />
            {isLoading ? (
                <div className="w-full text-center text-[#9CA3AF] py-8">
                    Загрузка проектов...
                </div>
            ) : (
                <ProjectList 
                    projects={filteredProjects} 
                    onItemClick={(project) => router.push(`/main/projects/${project.id}`)}
                />
            )}
        </div>
    </main>
  );
}