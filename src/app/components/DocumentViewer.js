"use client";

import { useState, useEffect } from "react";
import { getDocumentViewUrl } from "../lib/api";

/**
 * Компонент для просмотра PDF документов
 * @param {number} documentId - ID документа
 * @param {function} onClose - Функция для закрытия просмотрщика
 */
export default function DocumentViewer({ documentId, onClose }) {
    const [viewUrl, setViewUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadDocument = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getDocumentViewUrl(documentId);
                // Если сервер возвращает объект с URL, извлекаем URL, иначе используем как есть
                const url = typeof data === 'string' ? data : (data.url || data.view_url);
                if (!url) {
                    throw new Error('URL для просмотра документа не получен от сервера');
                }
                setViewUrl(url);
            } catch (err) {
                console.error("Ошибка загрузки документа:", err);
                setError("Не удалось загрузить документ");
            } finally {
                setIsLoading(false);
            }
        };

        if (documentId) {
            loadDocument();
        }
    }, [documentId]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
                        <p className="text-[#6B7280]">Загрузка документа...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
            {/* Заголовок с кнопкой закрытия */}
            <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB] bg-white">
                <h2 className="text-lg font-semibold text-[#111827]">Просмотр документа</h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                    title="Закрыть"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>

            {/* PDF просмотрщик */}
            <div className="flex-1 overflow-hidden">
                <iframe
                    src={viewUrl}
                    className="w-full h-full border-0"
                    title="Просмотр документа"
                />
            </div>
        </div>
    );
}

