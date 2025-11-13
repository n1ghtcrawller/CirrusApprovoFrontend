"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import haptic from "@/app/components/hapticFeedback";
import Navigation from "@/app/components/Navigation";
import CustomButton from "@/app/components/customButton";

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile, logout, loading: authLoading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    position: "",
    company: "",
    email: "",
    location: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        position: user.position || "",
        company: user.company || "",
        email: user.email || "",
        location: user.location || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      haptic.medium();

      await updateProfile(formData);
      setEditing(false);
      haptic.success();
    } catch (err) {
      console.error("Update profile error:", err);
      setError(err.message || "Ошибка обновления профиля");
      haptic.error();
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    haptic.medium();
    logout();
    router.push("/");
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col pb-20">
      <div className="flex-1 px-3 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Профиль
        </h1>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Имя
            </label>
            {editing ? (
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white">
                {user.first_name || "Не указано"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Должность
            </label>
            {editing ? (
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white">
                {user.position || "Не указано"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Компания
            </label>
            {editing ? (
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white">
                {user.company || "Не указано"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            {editing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white">
                {user.email || "Не указано"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Телефон
            </label>
            {editing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white">
                {user.phone || "Не указано"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Местоположение
            </label>
            {editing ? (
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white">
                {user.location || "Не указано"}
              </p>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            {editing ? (
              <>
                <CustomButton
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? "Сохранение..." : "Сохранить"}
                </CustomButton>
                <button
                  onClick={() => {
                    haptic.light();
                    setEditing(false);
                    // Восстанавливаем исходные данные
                    setFormData({
                      first_name: user.first_name || "",
                      position: user.position || "",
                      company: user.company || "",
                      email: user.email || "",
                      location: user.location || "",
                      phone: user.phone || "",
                    });
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Отмена
                </button>
              </>
            ) : (
              <CustomButton
                onClick={() => {
                  haptic.light();
                  setEditing(true);
                }}
              >
                Редактировать
              </CustomButton>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <CustomButton
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              Выйти
            </CustomButton>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
}

