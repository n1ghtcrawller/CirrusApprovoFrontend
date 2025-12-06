"use client";
import { useState, useEffect } from "react";
import { 
    getRequestComments, 
    createComment, 
    updateComment, 
    deleteComment,
    getCurrentUser 
} from "../lib/api";
import editPencil from "../assets/components/edit-pencil.svg";
import deleteIcon from "../assets/components/delete.svg";

export default function Comments({ requestId }) {
    const [comments, setComments] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [newCommentText, setNewCommentText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");

    useEffect(() => {
        loadComments();
        loadCurrentUser();
    }, [requestId]);

    const loadComments = async () => {
        try {
            const data = await getRequestComments(requestId);
            setComments(data);
        } catch (error) {
            console.error("Ошибка загрузки комментариев:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadCurrentUser = async () => {
        try {
            const user = await getCurrentUser();
            setCurrentUser(user);
        } catch (error) {
            console.error("Ошибка загрузки пользователя:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newCommentText.trim()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await createComment(requestId, newCommentText.trim());
            setNewCommentText("");
            await loadComments();
        } catch (error) {
            console.error("Ошибка создания комментария:", error);
            alert("Ошибка при создании комментария. Попробуйте еще раз.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStartEdit = (comment) => {
        setEditingId(comment.id);
        setEditText(comment.text);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditText("");
    };

    const handleSaveEdit = async (commentId) => {
        if (!editText.trim()) {
            return;
        }

        try {
            await updateComment(commentId, editText.trim());
            setEditingId(null);
            setEditText("");
            await loadComments();
        } catch (error) {
            console.error("Ошибка обновления комментария:", error);
            if (error.response?.status === 403) {
                alert("Только автор может редактировать комментарий");
            } else {
                alert("Ошибка при обновлении комментария. Попробуйте еще раз.");
            }
        }
    };

    const handleDelete = async (commentId) => {
        if (!confirm("Вы уверены, что хотите удалить этот комментарий?")) {
            return;
        }

        try {
            await deleteComment(commentId);
            await loadComments();
        } catch (error) {
            console.error("Ошибка удаления комментария:", error);
            if (error.response?.status === 403) {
                alert("Только автор может удалять комментарий");
            } else {
                alert("Ошибка при удалении комментария. Попробуйте еще раз.");
            }
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const canEdit = (comment) => {
        return currentUser && comment.author_id === currentUser.id;
    };

    if (isLoading) {
        return (
            <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6">
                <h2 className="text-xl font-bold text-[#111827]">Комментарии</h2>
                <div className="text-center text-[#9CA3AF] py-4">
                    Загрузка комментариев...
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6">
            <h2 className="text-xl font-bold text-[#111827]">Комментарии</h2>

            {/* Список комментариев */}
            <div className="flex flex-col gap-4">
                {comments.length === 0 ? (
                    <div className="text-center text-[#9CA3AF] py-4">
                        Пока нет комментариев
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="flex flex-col gap-2 rounded-lg bg-[#f6f6f8] p-4"
                        >
                            {editingId === comment.id ? (
                                <div className="flex flex-col gap-3">
                                    <textarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        rows={3}
                                        className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0 resize-none"
                                        style={{
                                            fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                        }}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleSaveEdit(comment.id)}
                                            className="px-4 py-2 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#1F2937] transition-colors"
                                            style={{
                                                fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                            }}
                                        >
                                            Сохранить
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-4 py-2 rounded-lg bg-white border border-[#E5E7EB] text-[#6B7280] text-sm font-medium hover:bg-[#f6f6f8] transition-colors"
                                            style={{
                                                fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                            }}
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <p className="text-sm text-[#111827] whitespace-pre-wrap">
                                                {comment.text}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-[#9CA3AF]">
                                                <span>{formatDate(comment.created_at)}</span>
                                                {comment.updated_at && comment.updated_at !== comment.created_at && (
                                                    <>
                                                        <span>•</span>
                                                        <span>Изменено</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {canEdit(comment) && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleStartEdit(comment)}
                                                    className="p-1 hover:opacity-70 transition-opacity"
                                                    title="Редактировать"
                                                >
                                                    <img src={editPencil.src} alt="Редактировать" className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(comment.id)}
                                                    className="p-1 hover:opacity-70 transition-opacity"
                                                    title="Удалить"
                                                >
                                                    <img src={deleteIcon.src} alt="Удалить" className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Форма создания нового комментария */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-4 border-t border-[#E5E7EB]">
                <textarea
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Добавить комментарий..."
                    rows={3}
                    className="w-full rounded-lg bg-white border border-[#E5E7EB] px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0 resize-none"
                    style={{
                        fontFamily: "var(--font-onest), -apple-system, sans-serif",
                    }}
                    disabled={isSubmitting}
                />
                <button
                    type="submit"
                    disabled={isSubmitting || !newCommentText.trim()}
                    className="self-end px-6 py-2 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#1F2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        fontFamily: "var(--font-onest), -apple-system, sans-serif",
                    }}
                >
                    {isSubmitting ? "Отправка..." : "Отправить"}
                </button>
            </form>
        </div>
    );
}
