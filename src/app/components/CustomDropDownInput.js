"use client";

import { useState, useRef, useEffect } from "react";
import { searchUsers } from "../lib/api";

export default function CustomDropDownInput({
    value,
    onChange,
    placeholder = "Поиск пользователя...",
    disabled = false,
    className = "",
    onBlur,
    excludeUserIds = [], // ID пользователей, которых нужно исключить из результатов
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    // Загружаем информацию о выбранном пользователе при изменении value
    useEffect(() => {
        if (value && !selectedUser) {
            // Если передан value (ID пользователя), но нет selectedUser,
            // можно попробовать найти его в списке или загрузить отдельно
            // Пока оставляем пустым, так как нет метода получения пользователя по ID
        }
    }, [value, selectedUser]);

    // Поиск пользователей при изменении запроса
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setUsers([]);
            return;
        }

        // Очищаем предыдущий таймаут
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Устанавливаем новый таймаут для debounce
        searchTimeoutRef.current = setTimeout(async () => {
            setIsLoading(true);
            try {
                const results = await searchUsers(searchQuery.trim(), 10);
                // Фильтруем исключенных пользователей
                const filteredResults = results.filter(
                    (user) => !excludeUserIds.includes(user.id)
                );
                setUsers(filteredResults);
            } catch (error) {
                console.error("Ошибка поиска пользователей:", error);
                setUsers([]);
            } finally {
                setIsLoading(false);
            }
        }, 300); // Задержка 300ms для debounce

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery, excludeUserIds]);

    // Закрытие при клике вне компонента
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                inputRef.current &&
                !inputRef.current.contains(event.target)
            ) {
                setIsOpen(false);
                if (onBlur) {
                    onBlur();
                }
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onBlur]);

    const handleInputChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        setIsOpen(true);
        setSelectedUser(null);
        if (onChange) {
            onChange({ target: { value: null } }); // Сбрасываем выбранное значение
        }
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setSearchQuery(`${user.first_name || ""} ${user.last_name || ""} (@${user.username || ""})`.trim());
        setIsOpen(false);
        if (onChange) {
            onChange({ target: { value: user.id } });
        }
    };
    const generateInviteLink = () => {
        const botUrl = 'https://t.me/cirrusapprovo_bot?startapp';
        const text = 'Приглашаю тебя принять участие в проекте в Cirrus Approvo!';
        const inviteLink = `https://t.me/share/url?url=${botUrl}&text=${text}`;
        
        // Открываем ссылку для шаринга в Telegram
        window.open(inviteLink);
    };

    const handleInputFocus = () => {
        if (searchQuery.trim().length >= 2 && users.length > 0) {
            setIsOpen(true);
        }
    };

    const handleClear = () => {
        setSearchQuery("");
        setSelectedUser(null);
        setUsers([]);
        setIsOpen(false);
        if (onChange) {
            onChange({ target: { value: null } });
        }
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const getUserDisplayName = (user) => {
        const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
        const username = user.username ? `@${user.username}` : "";
        return name ? `${name} ${username}`.trim() : username || `ID: ${user.id}`;
    };

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0 ${
                        disabled ? "opacity-50 cursor-not-allowed" : ""
                    } ${selectedUser ? "pr-8" : ""}`}
                    style={{
                        fontFamily: "var(--font-onest), -apple-system, sans-serif",
                    }}
                />
                {selectedUser && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
                        title="Очистить"
                    >
                        <svg
                            className="w-4 h-4 text-[#6B7280]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}
            </div>

            {isOpen && !disabled && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 mt-1 w-full rounded-lg bg-white border border-[#E5E7EB] shadow-lg max-h-60 overflow-auto"
                >
                    {isLoading ? (
                        <div className="px-3 py-2 text-sm text-[#9CA3AF] text-center">
                            Поиск...
                        </div>
                    ) : users.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-[#9CA3AF] flex items-center justify-between gap-2">
                            <span className="flex-1 text-center">
                                {searchQuery.trim().length < 2
                                    ? "Введите минимум 2 символа для поиска"
                                    : "Пользователи не найдены"}
                            </span>
                            {searchQuery.trim().length >= 2 && (
                                <button
                                    type="button"
                                    onClick={generateInviteLink}
                                    className="text-[#135bec] hover:text-[#1E40AF] transition-colors font-medium whitespace-nowrap"
                                    style={{
                                        fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                    }}
                                >
                                    Пригласить
                                </button>
                            )}
                        </div>
                    ) : (
                        users.map((user) => (
                            <button
                                key={user.id}
                                type="button"
                                onClick={() => handleSelectUser(user)}
                                className={`w-full px-3 py-2 text-sm text-left hover:bg-[#f6f6f8] transition-colors ${
                                    selectedUser?.id === user.id
                                        ? "bg-[#f6f6f8] font-medium text-[#111827]"
                                        : "text-[#111827]"
                                }`}
                                style={{
                                    fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                }}
                            >
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium">
                                        {getUserDisplayName(user)}
                                    </span>
                                    {user.position && (
                                        <span className="text-xs text-[#9CA3AF]">
                                            {user.position}
                                            {user.company && ` • ${user.company}`}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
