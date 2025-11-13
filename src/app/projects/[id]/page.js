"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { objects, requests } from "@/app/lib/api";
import haptic from "@/app/components/hapticFeedback";
import Navigation from "@/app/components/Navigation";
import CustomButton from "@/app/components/customButton";
import { HiArrowLeft, HiPlus } from "react-icons/hi";

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const projectId = params?.id;
  
  const [project, setProject] = useState(null);
  const [projectRequests, setProjectRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadRequests();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await objects.getWithMembers(projectId);
      setProject(data);
    } catch (err) {
      console.error("Load project error:", err);
      setError(err.message || "Ошибка загрузки проекта");
      haptic.error();
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const data = await requests.getByObject(projectId);
      setProjectRequests(data || []);
    } catch (err) {
      console.error("Load requests error:", err);
    }
  };

  const handleCreateRequest = () => {
    haptic.medium();
    router.push(`/requests/new?object_id=${projectId}`);
  };

  const handleRequestClick = (requestId) => {
    haptic.light();
    router.push(`/requests/${requestId}`);
  };

  const isOwner = project?.owner_id === user?.id;

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Загрузка...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex min-h-screen w-full  flex-col pb-20">
        <div className="flex-1 px-3 py-4">
          <button
            onClick={() => {
              haptic.light();
              router.back();
            }}
            className="mb-4 text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Назад
          </button>
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">
              {error || "Проект не найден"}
            </p>
          </div>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full  flex-col pb-20">
      <div className="flex-1 px-3 py-4">
        <button
          onClick={() => {
            haptic.light();
            router.back();
          }}
          className="mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
        >
          <HiArrowLeft className="text-lg" />
          <span>Назад</span>
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {project.description}
            </p>
          )}
        </div>

        {/* Участники */}
        <div className="mb-6">
          <button
            onClick={() => {
              haptic.light();
              setShowMembers(!showMembers);
            }}
            className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">
                Участники ({project.members?.length || 0})
              </span>
              <span>{showMembers ? "▼" : "▶"}</span>
            </div>
          </button>
          
          {showMembers && (
            <div className="mt-2 space-y-2">
              {project.members?.map((member) => (
                <div
                  key={member.user_id}
                  className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                >
                  <p className="font-medium text-gray-900 dark:text-white">
                    {member.user?.first_name} {member.user?.last_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Заявки */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Заявки ({projectRequests.length})
            </h2>
          </div>

          <CustomButton onClick={handleCreateRequest} className="mb-4">
            <div className="flex items-center justify-center gap-2">
              <HiPlus className="text-lg" />
              <span>Создать заявку</span>
            </div>
          </CustomButton>

          {projectRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>Заявок пока нет</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projectRequests.map((request) => (
                <div
                  key={request.id}
                  onClick={() => handleRequestClick(request.id)}
                  className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {request.number}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                      {request.status}
                    </span>
                  </div>
                  {request.delivery_date && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Доставка: {new Date(request.delivery_date).toLocaleDateString("ru-RU")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Navigation />
    </div>
  );
}

