"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { objects } from "@/app/lib/api";
import haptic from "@/app/components/hapticFeedback";
import CustomButton from "@/app/components/customButton";
import Navigation from "@/app/components/Navigation";

export default function NewProjectPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Название проекта обязательно");
      haptic.error();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      haptic.medium();

      const project = await objects.create({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      });

      haptic.success();
      router.push(`/projects/${project.id}`);
    } catch (err) {
      console.error("Create project error:", err);
      setError(err.message || "Ошибка создания проекта");
      haptic.error();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full max-w-[422px] flex-col pb-20">
      <div className="flex-1 px-4 py-6">
        <div className="mb-6">
          <button
            onClick={() => {
              haptic.light();
              router.back();
            }}
            className="mb-4 text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Назад
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Создать проект
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Название проекта *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Например: Строительство жилого комплекса"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Описание
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Описание проекта..."
            />
          </div>

          <CustomButton type="submit" disabled={loading}>
            {loading ? "Создание..." : "Создать проект"}
          </CustomButton>
        </form>
      </div>
      <Navigation />
    </div>
  );
}

