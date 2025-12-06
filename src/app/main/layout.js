"use client";

import { usePathname, useRouter } from "next/navigation";
import projects from "../assets/images/projects.svg";
import requests from "../assets/images/requests.svg";
import mechanisation from "../assets/images/mechanisation.svg";
import profile from "../assets/images/profile.svg";

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { path: "/main/projects", label: "Проекты", icon: projects },
    { path: "/main/requests", label: "Заявки", icon: requests },
    { path: "/main/warehouse", label: "Склад", icon: mechanisation },
    { path: "/main/profile", label: "Профиль", icon: profile },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f6f6f8]">
      <main key={pathname} className="flex-1 pb-20 animate-fade-in">{children}</main>
      
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">
        <div className="flex h-20 w-full items-center justify-around">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => router.push(tab.path)}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200 ease-in-out ${
                  isActive ? "text-[#000000]" : "text-[#6B7280]"
                }`}
              >
                <img
                  src={tab.icon.src}
                  alt={tab.label}
                  className={`w-6 h-6 transition-all duration-200 ease-in-out ${
                    isActive ? "opacity-100 scale-110" : "opacity-60 scale-100"
                  }`}
                />
                <span className="text-xs font-medium transition-all duration-200 ease-in-out">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
