"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import TelegramBackButton from "@/app/components/TelegramBackButton";
import CustomButton from "../../../../components/СustomButton";
import { getRequestWithRelations, updateForemanReceipt, uploadShippingPhotos } from "../../../../lib/api";
import { FaPlus, FaTimes, FaCamera } from "react-icons/fa";

// Допустимые типы изображений
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic'];
const MAX_PHOTOS = 20;

export default function ForemanAgreement() {
    const router = useRouter();
    const params = useParams();
    const [request, setRequest] = useState(null);
    const [receivedQuantities, setReceivedQuantities] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    
    // Состояние для фотографий отгрузки
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
    const [photoError, setPhotoError] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const loadRequest = async () => {
            setIsLoading(true);
            try {
                const data = await getRequestWithRelations(parseInt(params.id));
                setRequest(data);
                // Инициализируем пустыми значениями - пользователь будет вводить "получено в этот раз"
                const initial = {};
                if (data.items && data.items.length) {
                    data.items.forEach((item) => {
                        initial[item.id] = ""; // Пустое поле для ввода "получено в этот раз"
                    });
                }
                setReceivedQuantities(initial);
            } catch (error) {
                console.error("Ошибка загрузки заявки:", error);
                if (error.response?.status === 401) {
                    window.location.href = '/';
                    return;
                }
                if (error.response?.status === 403 || error.response?.status === 404) {
                    setRequest(null);
                    return;
                }
                setRequest(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadRequest();
    }, [params.id]);

    const isAlreadyConfirmed = request?.status === "foreman_confirmed_receipt" || request?.status === "documents_shipped";

    const handleReceivedQuantityChange = (itemId, value) => {
        setReceivedQuantities((prev) => ({ ...prev, [itemId]: value }));
    };

    // Обработка выбора фотографий
    const handlePhotoSelect = (e) => {
        const files = Array.from(e.target.files || []);
        setPhotoError(null);
        
        // Фильтруем только допустимые типы изображений
        const validFiles = files.filter(file => ALLOWED_IMAGE_TYPES.includes(file.type));
        
        if (validFiles.length !== files.length) {
            setPhotoError("Некоторые файлы были пропущены. Допустимы только изображения: JPEG, PNG, GIF, WebP, HEIC");
        }
        
        // Проверяем лимит
        const totalPhotos = selectedPhotos.length + validFiles.length;
        if (totalPhotos > MAX_PHOTOS) {
            setPhotoError(`Максимум ${MAX_PHOTOS} фотографий. Выбрано: ${totalPhotos}`);
            return;
        }
        
        // Добавляем новые файлы
        setSelectedPhotos(prev => [...prev, ...validFiles]);
        
        // Создаём превью для новых файлов
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreviews(prev => [...prev, { file, preview: reader.result }]);
            };
            reader.readAsDataURL(file);
        });
        
        // Сбрасываем input для возможности повторного выбора тех же файлов
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Удаление фотографии из списка
    const handleRemovePhoto = (index) => {
        setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
        setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Загрузка фотографий на сервер
    const handleUploadPhotos = async () => {
        if (selectedPhotos.length === 0) return;
        
        setIsUploadingPhotos(true);
        setPhotoError(null);
        
        try {
            await uploadShippingPhotos(parseInt(params.id), selectedPhotos);
            // Очищаем выбранные фотографии после успешной загрузки
            setSelectedPhotos([]);
            setPhotoPreviews([]);
            // Перезагружаем заявку, чтобы увидеть загруженные документы
            const data = await getRequestWithRelations(parseInt(params.id));
            setRequest(data);
        } catch (error) {
            console.error("Ошибка загрузки фотографий:", error);
            if (error.response?.status === 401) {
                window.location.href = '/';
                return;
            }
            if (error.response?.status === 403) {
                setPhotoError("Нет доступа для загрузки фотографий");
                return;
            }
            if (error.response?.status === 400) {
                setPhotoError(error.response?.data?.detail || "Ошибка при загрузке фотографий");
                return;
            }
            setPhotoError("Ошибка при загрузке фотографий. Попробуйте еще раз.");
        } finally {
            setIsUploadingPhotos(false);
        }
    };

    const handleConfirmReceipt = async () => {
        setIsSubmitting(true);
        setError(null);
        setPhotoError(null);

        try {
            // Если есть выбранные фотографии - загружаем их параллельно с подтверждением
            const uploadPromise = selectedPhotos.length > 0 
                ? uploadShippingPhotos(parseInt(params.id), selectedPhotos)
                : Promise.resolve();

            // Формируем массив с delta (получено в этот раз)
            const items = (request.items || []).map((item) => {
                const raw = receivedQuantities[item.id];
                // Парсим введенное значение (получено в этот раз)
                const num = raw !== "" && raw !== undefined && raw !== null 
                    ? parseFloat(String(raw).replace(",", ".")) 
                    : 0;
                // Передаем delta (получено в этот раз), бэкенд сам суммирует с текущим received_quantity
                return { 
                    item_id: item.id, 
                    received_quantity: Number.isFinite(num) && num >= 0 ? num : 0 
                };
            });
            
            // Выполняем оба запроса параллельно
            const [updated] = await Promise.all([
                updateForemanReceipt(parseInt(params.id), items),
                uploadPromise
            ]);
            
            // Очищаем фотографии после успешной загрузки
            setSelectedPhotos([]);
            setPhotoPreviews([]);
            
            setRequest(updated);
            router.push(`/main/requests/${params.id}`);
        } catch (error) {
            console.error("Ошибка подтверждения получения:", error);
            if (error.response?.status === 401) {
                window.location.href = '/';
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
            setError("Ошибка при сохранении. Попробуйте еще раз.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
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
                    Подтверждение прорабом
                </h1>

                <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-[#6B7280]">Заявка</span>
                        <span className="text-lg font-bold text-[#111827]">{request.number}</span>
                    </div>
                    {request.delivery_date && (
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-[#6B7280]">Дата доставки</span>
                            <span className="text-base text-[#111827]">{formatDate(request.delivery_date)}</span>
                        </div>
                    )}
                </div>

                {request.items && request.items.length > 0 && (
                    <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6">
                        <h2 className="text-xl font-bold text-[#111827]">Материалы</h2>
                        <p className="text-sm text-[#6B7280]">
                            Укажите количество, полученное в этот раз. Бэкенд автоматически суммирует с уже полученным. Если по всем позициям получено не меньше заказанного, статус заявки изменится на «Подтверждено прорабом».
                        </p>
                        <div className="flex flex-col gap-3">
                            {request.items.map((item) => {
                                const currentReceived = item.received_quantity ?? 0;
                                const ordered = item.quantity ?? 0;
                                const remaining = Math.max(0, ordered - currentReceived);
                                
                                return (
                                    <div
                                        key={item.id}
                                        className="flex flex-col gap-3 rounded-lg bg-[#f6f6f8] p-4"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex flex-col gap-1 min-w-0 flex-1">
                                                <span className="font-medium text-[#111827]">{item.name}</span>
                                                <div className="flex flex-col gap-0.5 text-xs text-[#6B7280]">
                                                    <span>Заказано: <span className="font-semibold text-[#111827]">{ordered}</span> {item.unit}</span>
                                                    <span>Получено всего: <span className="font-semibold text-[#111827]">{currentReceived}</span> {item.unit}</span>
                                                    <span>Остаток: <span className="font-semibold text-[#111827]">{remaining}</span> {item.unit}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                <label className="text-xs text-[#6B7280]">Получено в этот раз:</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={receivedQuantities[item.id] ?? ""}
                                                        onChange={(e) => handleReceivedQuantityChange(item.id, e.target.value)}
                                                        placeholder="0"
                                                        disabled={isSubmitting}
                                                        className="w-24 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-right text-base font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                                                        style={{ fontFamily: "var(--font-onest), -apple-system, sans-serif" }}
                                                    />
                                                    <span className="text-sm text-[#6B7280] w-8">{item.unit}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Секция загрузки фотографий отгрузки */}
                <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6">
                    <h2 className="text-xl font-bold text-[#111827]">Фотографии отгрузки</h2>
                    
                    {/* Скрытый input для выбора файлов */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoSelect}
                        accept="image/jpeg,image/png,image/gif,image/webp,image/heic"
                        multiple
                        className="hidden"
                    />
                    
                    {/* Сетка с превью фотографий и кнопкой добавления */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 pt-1 pr-1">
                        {/* Превью выбранных фотографий */}
                        {photoPreviews.map((item, index) => (
                            <div
                                key={index}
                                className="relative aspect-square"
                            >
                                <div className="absolute inset-0 rounded-xl overflow-hidden bg-[#f6f6f8] border-2 border-[#E5E7EB]">
                                    <Image
                                        src={item.preview}
                                        alt={`Фото ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemovePhoto(index)}
                                    disabled={isUploadingPhotos}
                                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50 shadow-md z-10"
                                >
                                    <FaTimes size={12} />
                                </button>
                            </div>
                        ))}
                        
                        {/* Кнопка добавления фото */}
                        {selectedPhotos.length < MAX_PHOTOS && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingPhotos}
                                className="aspect-square rounded-xl border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] hover:border-[#3B82F6] hover:bg-[#EFF6FF] transition-colors flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaCamera className="text-[#9CA3AF] text-xl" />
                                <span className="text-xs text-[#6B7280] font-medium">Добавить</span>
                                <span className="text-xs text-[#9CA3AF]">фото</span>
                            </button>
                        )}
                    </div>
                    
                    {photoError && (
                        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                            {photoError}
                        </div>
                    )}
                    
                    {selectedPhotos.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <p className="text-xs text-[#9CA3AF]">
                                Выбрано: {selectedPhotos.length} из {MAX_PHOTOS}. Форматы: JPEG, PNG, GIF, WebP, HEIC.
                            </p>
                            <button
                                type="button"
                                onClick={handleUploadPhotos}
                                disabled={isUploadingPhotos}
                                className="w-full rounded-xl bg-[#3B82F6] px-5 py-3 text-base font-semibold text-white hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                style={{ fontFamily: "var(--font-onest), -apple-system, sans-serif" }}
                            >
                                {isUploadingPhotos ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Загрузка...
                                    </>
                                ) : (
                                    <>Загрузить фото ({selectedPhotos.length})</>
                                )}
                            </button>
                        </div>
                    )}
                    
                    {selectedPhotos.length === 0 && (
                        <p className="text-xs text-[#9CA3AF]">
                            Форматы: JPEG, PNG, GIF, WebP, HEIC. До {MAX_PHOTOS} фотографий.
                        </p>
                    )}
                </div>

                {error && (
                    <div className="w-full rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                        {error}
                    </div>
                )}

                <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-[#6B7280]">
                            {isAlreadyConfirmed
                                ? "Сохраните изменения — количество полученного обновится в заявке."
                                : "Подтвердите получение материалов. Если по всем позициям получено не меньше заказанного, статус заявки изменится на «Подтверждено прорабом»."}
                        </span>
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
                        <CustomButton
                            width="100%"
                            onClick={handleConfirmReceipt}
                            disabled={isSubmitting}
                            fontSize="18px"
                        >
                            {isSubmitting
                                ? (isAlreadyConfirmed ? "Сохранение..." : "Подтверждение...")
                                : isAlreadyConfirmed
                                    ? "Сохранить отметку о получении"
                                    : "Подтвердить получение"}
                        </CustomButton>
                    </div>
                </div>
            </div>
        </main>
    );
}