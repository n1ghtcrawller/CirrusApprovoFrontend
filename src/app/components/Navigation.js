"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import haptic from "@/app/components/hapticFeedback";

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    haptic.medium();
    logout();
    router.push("/");
  };

  const navItems = [
    { path: "/projects", label: "Проекты", icon: "📁" },
    { path: "/requests", label: "Заявки", icon: "📋" },
    { path: "/profile", label: "Профиль", icon: "👤" },
  ];

  return (
    <nav className="w-full max-w-[422px] fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path || pathname?.startsWith(item.path + "/");
          return (
            <button
              key={item.path}
              onClick={() => {
                haptic.light();
                router.push(item.path);
              }}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

