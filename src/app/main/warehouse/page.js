"use client";
import { useRouter } from "next/navigation";
import TelegramBackButton from "@/app/components/TelegramBackButton";

export default function Warehouse() {
    const router = useRouter();
  
    return (
    <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-30 px-6">
        <TelegramBackButton/>
        <div className="flex w-full max-w-2xl flex-col items-start gap-12">
            <h1 className="w-full text-4xl font-bold text-[#111827] leading-[0.9]">
                Склад
            </h1>
            
            {/* Информационный блок о Cirrus Plus */}
            <div className="w-full rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] p-6 shadow-lg">
                <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-white mb-2">
                                Cirrus Plus
                            </h2>
                            <p className="text-white/90 text-base leading-relaxed">
                                Для доступа к расширенному функционалу Склада оформите <span className="font-semibold">Cirrus Plus</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
    )  
}