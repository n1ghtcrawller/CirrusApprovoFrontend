"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { downloadDocument } from "../lib/api";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Настройка worker для react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * Компонент для просмотра PDF документов
 * @param {number} documentId - ID документа
 * @param {function} onClose - Функция для закрытия просмотрщика
 */
export default function DocumentViewer({ documentId, onClose }) {
    const [pdfData, setPdfData] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadDocument = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const blob = await downloadDocument(documentId);
                const url = URL.createObjectURL(blob);
                setPdfData(url);
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

        // Очистка URL при размонтировании
        return () => {
            if (pdfData && pdfData.startsWith('blob:')) {
                URL.revokeObjectURL(pdfData);
            }
        };
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
            <div className="flex-1 overflow-auto bg-gray-100 p-4">
                <div className="flex flex-col items-center gap-4">
                    {pdfData && (
                        <>
                            <Document
                                file={pdfData}
                                onLoadSuccess={({ numPages }) => {
                                    setNumPages(numPages);
                                    setIsLoading(false);
                                }}
                                onLoadError={(error) => {
                                    console.error("Ошибка загрузки PDF:", error);
                                    setError("Не удалось загрузить PDF документ");
                                    setIsLoading(false);
                                }}
                                loading={
                                    <div className="flex flex-col items-center gap-4 py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
                                        <p className="text-[#6B7280]">Загрузка PDF...</p>
                                    </div>
                                }
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                    className="shadow-lg"
                                />
                            </Document>
                            
                            {/* Навигация по страницам */}
                            {numPages && (
                                <div className="flex items-center gap-4 bg-white rounded-lg px-4 py-2 shadow-sm">
                                    <button
                                        onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                                        disabled={pageNumber <= 1}
                                        className="px-3 py-1 bg-[#3B82F6] text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#2563EB] transition-colors"
                                    >
                                        Назад
                                    </button>
                                    <span className="text-sm text-[#6B7280]">
                                        Страница {pageNumber} из {numPages}
                                    </span>
                                    <button
                                        onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))}
                                        disabled={pageNumber >= numPages}
                                        className="px-3 py-1 bg-[#3B82F6] text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#2563EB] transition-colors"
                                    >
                                        Вперед
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

