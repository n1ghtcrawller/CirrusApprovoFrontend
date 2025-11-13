"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import haptic from "@/app/components/hapticFeedback";
import { HiFolder, HiClipboardList, HiUser } from "react-icons/hi";

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
    { path: "/projects", label: "Проекты", icon: HiFolder },
    { path: "/requests", label: "Заявки", icon: HiClipboardList },
    { path: "/profile", label: "Профиль", icon: HiUser },
  ];

  return (
    <nav className="w-full fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="flex items-center justify-around px-2 py-2 max-w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.path || pathname?.startsWith(item.path + "/");
          return (
            <button
              key={item.path}
              onClick={() => {
                haptic.light();
                router.push(item.path);
              }}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <item.icon className="text-xl" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

