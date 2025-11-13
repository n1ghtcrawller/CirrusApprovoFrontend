"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { requests, objects } from "@/app/lib/api";
import haptic from "@/app/components/hapticFeedback";
import CustomButton from "@/app/components/customButton";
import Navigation from "@/app/components/Navigation";
import { HiArrowLeft, HiPlus, HiX } from "react-icons/hi";

function NewRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [formData, setFormData] = useState({
    number: "",
    object_id: searchParams?.get("object_id") || "",
    delivery_date: "",
    notes: "",
  });
  const [items, setItems] = useState([
    { name: "", unit: "", quantity: "" },
  ]);

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  const loadProjects = async () => {
    try {
      const data = await objects.getAll();
      setUserProjects(data || []);
    } catch (err) {
      console.error("Load projects error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.number.trim()) {
      setError("Номер заявки обязателен");
      haptic.error();
      return;
    }

    if (!formData.object_id) {
      setError("Выберите проект");
      haptic.error();
      return;
    }

    const validItems = items.filter(
      (item) => item.name.trim() && item.quantity
    );

    if (validItems.length === 0) {
      setError("Добавьте хотя бы один материал");
      haptic.error();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      haptic.medium();

      const requestData = {
        number: formData.number.trim(),
        object_id: parseInt(formData.object_id),
        items: validItems.map((item) => ({
          name: item.name.trim(),
          unit: item.unit.trim() || null,
          quantity: parseFloat(item.quantity) || null,
        })),
        delivery_date: formData.delivery_date || null,
        notes: formData.notes.trim() || null,
      };

      const request = await requests.create(requestData);

      haptic.success();
      router.push(`/requests/${request.id}`);
    } catch (err) {
      console.error("Create request error:", err);
      setError(err.message || "Ошибка создания заявки");
      haptic.error();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { name: "", unit: "", quantity: "" }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col pb-20">
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

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Создать заявку
        </h1>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Номер заявки *
            </label>
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="REQ-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Проект *
            </label>
            <select
              name="object_id"
              value={formData.object_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Выберите проект</option>
              {userProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Дата доставки
            </label>
            <input
              type="date"
              name="delivery_date"
              value={formData.delivery_date}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Материалы *
            </label>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 space-y-2"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Название материала"
                      value={item.name}
                      onChange={(e) =>
                        handleItemChange(index, "name", e.target.value)
                      }
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      required
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <HiX className="text-lg" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ед. измерения"
                      value={item.unit}
                      onChange={(e) =>
                        handleItemChange(index, "unit", e.target.value)
                      }
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Количество"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center justify-center gap-2"
              >
                <HiPlus className="text-base" />
                <span>Добавить материал</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Примечания
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Дополнительная информация..."
            />
          </div>

          <CustomButton type="submit" disabled={loading}>
            {loading ? "Создание..." : "Создать заявку"}
          </CustomButton>
        </form>
      </div>
      <Navigation />
    </div>
  );
}

export default function NewRequestPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Загрузка...</div>
      </div>
    }>
      <NewRequestForm />
    </Suspense>
  );
}

