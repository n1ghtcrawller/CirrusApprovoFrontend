"use client";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import CustomButton from "../../../../components/СustomButton";
import { createRequest } from "../../../../lib/api";

export default function NewRequestPage() {
    const router = useRouter();
    const params = useParams();
    const [deliveryDate, setDeliveryDate] = useState("");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState([
        { name: "", unit: "", quantity: "" }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addItem = () => {
        setItems([...items, { name: "", unit: "", quantity: "" }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Валидация
            if (!deliveryDate) {
                alert("Выберите дату доставки");
                setIsSubmitting(false);
                return;
            }

            const validItems = items.filter(
                item => item.name.trim() && item.unit.trim() && item.quantity
            );

            if (validItems.length === 0) {
                alert("Добавьте хотя бы один материал");
                setIsSubmitting(false);
                return;
            }

            // Формируем данные для отправки
            // Номер заявки будет сгенерирован автоматически на бекенде
            const requestData = {
                object_id: parseInt(params.id),
                items: validItems.map(item => ({
                    name: item.name.trim(),
                    unit: item.unit.trim(),
                    quantity: parseFloat(item.quantity)
                })),
                delivery_date: deliveryDate,
                notes: notes.trim() || undefined
            };

            await createRequest(requestData);
            
            // После успешного создания возвращаемся на страницу проекта
            router.push(`/main/projects/${params.id}`);
        } catch (error) {
            console.error("Ошибка создания заявки:", error);
            if (error.response?.status === 401) {
                window.location.href = '/';
                return;
            }
            if (error.response?.status === 400) {
                alert("Ошибка валидации данных. Проверьте правильность заполнения полей.");
                return;
            }
            if (error.response?.status === 403) {
                alert("Нет доступа к объекту");
                return;
            }
            if (error.response?.status === 404) {
                alert("Объект не найден");
                return;
            }
            alert("Ошибка при создании заявки. Попробуйте еще раз.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-30 px-6">
            <div className="flex w-full max-w-2xl flex-col items-start gap-6">
                <button
                    onClick={() => router.back()}
                    className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
                >
                    ← Назад
                </button>

                <h1 className="text-4xl font-bold text-[#111827] leading-[0.9]">
                    Новая заявка
                </h1>

                <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
                    <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-[#6B7280]">
                                Дата доставки *
                            </label>
                            <input
                                type="date"
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                className="w-full rounded-xl bg-white border border-[#E5E7EB] px-4 py-3 text-base text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0"
                                style={{
                                    fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                }}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-[#6B7280]">
                                Примечания
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Дополнительная информация..."
                                rows={3}
                                className="w-full rounded-xl bg-white border border-[#E5E7EB] px-4 py-3 text-base text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0 resize-none"
                                style={{
                                    fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[#111827]">Материалы</h2>
                            <button
                                type="button"
                                onClick={addItem}
                                className="text-sm font-medium text-[#135bec] hover:text-[#1E40AF] transition-colors"
                            >
                                + Добавить материал
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col gap-3 rounded-lg bg-[#f6f6f8] p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-[#6B7280]">
                                            Материал {index + 1}
                                        </span>
                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="text-sm text-[#EF4444] hover:text-[#DC2626] transition-colors"
                                            >
                                                Удалить
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-[#9CA3AF]">Название</label>
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => updateItem(index, "name", e.target.value)}
                                                placeholder="Цемент"
                                                className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0"
                                                style={{
                                                    fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                                }}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-[#9CA3AF]">Единица</label>
                                            <input
                                                type="text"
                                                value={item.unit}
                                                onChange={(e) => updateItem(index, "unit", e.target.value)}
                                                placeholder="тонн"
                                                className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0"
                                                style={{
                                                    fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                                }}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-[#9CA3AF]">Количество</label>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, "quantity", e.target.value)}
                                                placeholder="500"
                                                min="0"
                                                step="0.01"
                                                className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0"
                                                style={{
                                                    fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 rounded-xl bg-white border border-[#E5E7EB] px-5 py-3 text-base font-semibold text-[#6B7280] hover:bg-[#f6f6f8] transition-colors"
                            style={{
                                fontFamily: "var(--font-onest), -apple-system, sans-serif",
                            }}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 rounded-xl bg-[#111827] px-5 py-3 text-base font-semibold text-white hover:bg-[#1F2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                height: "50px",
                            }}
                        >
                            {isSubmitting ? "Создание..." : "Создать заявку"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
