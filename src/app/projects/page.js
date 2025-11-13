"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { objects } from "@/app/lib/api";
import haptic from "@/app/components/hapticFeedback";
import Navigation from "@/app/components/Navigation";
import CustomButton from "@/app/components/customButton";
import { HiPlus } from "react-icons/hi";

export default function ProjectsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Проверка авторизации
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  // Загрузка проектов
  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await objects.getAll();
      setProjects(data || []);
    } catch (err) {
      console.error("Load projects error:", err);
      setError(err.message || "Ошибка загрузки проектов");
      haptic.error();
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    haptic.medium();
    router.push("/projects/new");
  };

  const handleProjectClick = (projectId) => {
    haptic.light();
    router.push(`/projects/${projectId}`);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen w-full max-w-[422px] items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full max-w-[422px] flex-col pb-20">
      <div className="flex-1 px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Проекты
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Управление строительными объектами
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="mb-4">
          <CustomButton onClick={handleCreateProject}>
            <div className="flex items-center justify-center gap-2">
              <HiPlus className="text-lg" />
              <span>Создать проект</span>
            </div>
          </CustomButton>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              У вас пока нет проектов
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Создайте первый проект, чтобы начать работу
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Создан: {new Date(project.created_at).toLocaleDateString("ru-RU")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Navigation />
    </div>
  );
}

