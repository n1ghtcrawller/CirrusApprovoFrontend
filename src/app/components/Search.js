"use client";

import { useState } from "react";

export default function Search({ placeholder = "Поиск...", onSearch, className = "" }) {
  const [value, setValue] = useState("");

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (onSearch) {
      onSearch(newValue);
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full font-regular rounded-xl bg-white px-4 py-3 text-base text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0"
        style={{
          fontFamily: "var(--font-onest), -apple-system, sans-serif",
        }}
      />
      <svg
        className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
}
