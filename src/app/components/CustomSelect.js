"use client";

import { useState, useRef, useEffect } from "react";

export default function CustomSelect({
    value,
    onChange,
    options = [],
    placeholder = "Выберите...",
    disabled = false,
    className = "",
    onBlur,
    autoFocus = false,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
        if (autoFocus) {
            setIsOpen(true);
        }
    }, [autoFocus]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
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

    const selectedOption = options.find((opt) => opt.value === value);

    const handleSelect = (optionValue) => {
        if (onChange) {
            const event = {
                target: { value: optionValue },
            };
            onChange(event);
        }
        setIsOpen(false);
    };

    return (
        <div ref={selectRef} className={`relative ${className}`} style={{ width: "240px" }}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-1 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0 text-left flex items-center justify-between ${
                    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
                style={{
                    fontFamily: "var(--font-onest), -apple-system, sans-serif",
                }}
            >
                <span>{selectedOption ? selectedOption.label : placeholder}</span>
                <svg
                    className={`w-4 h-4 text-[#6B7280] transition-transform ${
                        isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && !disabled && (
                <div className="absolute z-50 mt-1 w-full rounded-lg bg-white border border-[#E5E7EB] shadow-lg max-h-60 overflow-auto" style={{ width: "240px" }}>
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option.value)}
                            className={`w-full px-3 py-2 text-sm text-left hover:bg-[#f6f6f8] transition-colors ${
                                value === option.value
                                    ? "bg-[#f6f6f8] font-medium text-[#111827]"
                                    : "text-[#111827]"
                            }`}
                            style={{
                                fontFamily: "var(--font-onest), -apple-system, sans-serif",
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
