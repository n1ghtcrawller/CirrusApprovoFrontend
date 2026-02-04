"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import CustomButton from "../../../../components/СustomButton";
import { getRequestWithRelations, updateRequest } from "../../../../lib/api";
import TelegramBackButton from "@/app/components/TelegramBackButton";

export default function EditRequestPage() {
    const router = useRouter();
    const params = useParams();
    const [request, setRequest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    
    const [requestNumber, setRequestNumber] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState([]);

    useEffect(() => {
        const loadRequest = async () => {
            setIsLoading(true);
            try {
                const data = await getRequestWithRelations(parseInt(params.id));
                setRequest(data);
                
                // Проверяем, можно ли редактировать заявку
                if (data.status !== "created" && data.status !== "approved_for_supply") {
                    router.push(`/main/requests/${params.id}`);
                    return;
                }
                
                // Заполняем форму данными заявки
                setRequestNumber(data.number || "");
                setDeliveryDate(data.delivery_date ? data.delivery_date.split('T')[0] : "");
                setNotes(data.notes || "");
                
                // Заполняем позиции
                if (data.items && data.items.length > 0) {
                    setItems(data.items.map(item => ({
                        id: item.id,
                        name: item.name || "",
                        unit: item.unit || "",
                        quantity: String(item.quantity || ""),
                    })));
                } else {
                    setItems([{ id: null, name: "", unit: "", quantity: "" }]);
                }
            } catch (error) {
                console.error("Ошибка загрузки заявки:", error);
                if (error.response?.status === 401) {
                    window.location.href = '/';
                    return;
                }
                if (error.response?.status === 403 || error.response?.status === 404) {
                    router.push(`/main/requests/${params.id}`);
                    return;
                }
                setError("Ошибка загрузки заявки");
            } finally {
                setIsLoading(false);
            }
        };

        loadRequest();
    }, [params.id, router]);

    const handleEnterAsTab = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const form = e.currentTarget.form;
            if (!form) return;
            const elements = Array.from(form.elements).filter((el) => {
                return (
                    el.tagName !== "FIELDSET" &&
                    !el.disabled &&
                    el.type !== "hidden" &&
                    el.tabIndex !== -1
                );
            });
            const index = elements.indexOf(e.currentTarget);
            if (index >= 0 && index < elements.length - 1) {
                const next = elements[index + 1];
                if (next && typeof next.focus === "function") {
                    next.focus();
                }
            }
        }
    };

    const addItem = () => {
        setItems([...items, { id: null, name: "", unit: "", quantity: "" }]);
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
        setError(null);

        try {
            // Валидация
            if (!deliveryDate) {
                setError("Выберите дату доставки");
                setIsSubmitting(false);
                return;
            }

            if (!requestNumber.trim()) {
                setError("Укажите номер заявки");
                setIsSubmitting(false);
                return;
            }

            const validItems = items.filter(
                item => item.name.trim() && item.unit.trim() && item.quantity
            );

            if (validItems.length === 0) {
                setError("Добавьте хотя бы один материал");
                setIsSubmitting(false);
                return;
            }

            // Формируем данные для отправки
            const requestData = {
                number: requestNumber.trim(),
                delivery_date: deliveryDate,
                notes: notes.trim() || undefined,
                items: validItems.map(item => ({
                    id: item.id || undefined, // ID для существующих позиций
                    name: item.name.trim(),
                    unit: item.unit.trim(),
                    quantity: parseFloat(item.quantity)
                }))
            };

            await updateRequest(parseInt(params.id), requestData);
            
            // После успешного обновления возвращаемся на страницу заявки
            router.push(`/main/requests/${params.id}`);
        } catch (error) {
            console.error("Ошибка обновления заявки:", error);
            if (error.response?.status === 401) {
                window.location.href = '/';
                return;
            }
            if (error.response?.status === 400) {
                setError("Ошибка валидации данных. Проверьте правильность заполнения полей.");
                return;
            }
            if (error.response?.status === 403) {
                setError("Нет доступа к заявке или недостаточно прав");
                return;
            }
            if (error.response?.status === 404) {
                setError("Заявка не найдена");
                return;
            }
            setError("Ошибка при обновлении заявки. Попробуйте еще раз.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-20 px-6">
                <TelegramBackButton/>
                <div className="flex w-full max-w-2xl flex-col items-start gap-6">
                    <div className="w-full text-center text-[#9CA3AF] py-8">
                        Загрузка заявки...
                    </div>
                </div>
            </main>
        );
    }

    if (!request) {
        return (
            <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-20 px-6">
                <TelegramBackButton/>
                <div className="flex w-full max-w-2xl flex-col items-start gap-6">
                    <div className="w-full text-center text-[#9CA3AF] py-8">
                        Заявка не найдена
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-20 px-6 overflow-x-hidden">
            <TelegramBackButton/>
            <div className="flex w-full max-w-2xl flex-col items-start gap-6 min-w-0">
                <h1 className="text-4xl font-bold text-[#111827] leading-[0.9]">
                    Редактирование заявки
                </h1>
                
                <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6 min-w-0">
                    {error && (
                        <div className="w-full rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                            {error}
                        </div>
                    )}

                    <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6 overflow-hidden min-w-0">
                        <div className="flex flex-col gap-2 min-w-0 w-full">
                            <label className="text-sm font-medium text-[#6B7280]">
                                Номер заявки *
                            </label>
                            <input
                                type="text"
                                value={requestNumber}
                                onChange={(e) => setRequestNumber(e.target.value)}
                                onKeyDown={handleEnterAsTab}
                                className="w-full rounded-xl bg-white px-4 py-3 text-base text-[#111827] border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                                required
                                style={{
                                    fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                }}
                            />
                        </div>

                        <div className="flex flex-col gap-2 min-w-0 w-full">
                            <label className="text-sm font-medium text-[#6B7280]">
                                Дата доставки *
                            </label>
                            <input
                                type="date"
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                onKeyDown={handleEnterAsTab}
                                className="w-full rounded-xl bg-white px-4 py-3 text-base text-[#111827] border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                                required
                                style={{
                                    fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                }}
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
                                    key={item.id || `new-${index}`}
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
                                                onKeyDown={handleEnterAsTab}
                                                placeholder="Цемент"
                                                className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-2 text-base text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0"
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
                                                onKeyDown={handleEnterAsTab}
                                                placeholder="тонн"
                                                className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-2 text-base text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0"
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
                                                onKeyDown={handleEnterAsTab}
                                                placeholder="500"
                                                min="0"
                                                step="0.01"
                                                className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-2 text-base text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0"
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
                            disabled={isSubmitting}
                            className="flex-1 rounded-xl bg-white border border-[#E5E7EB] px-5 py-3 text-base font-semibold text-[#6B7280] hover:bg-[#f6f6f8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                            {isSubmitting ? "Сохранение..." : "Сохранить"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
