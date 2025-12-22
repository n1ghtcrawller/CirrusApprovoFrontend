"use client";
import { useRouter } from "next/navigation";
import TelegramBackButton from "@/app/components/TelegramBackButton";
import CustomButton from "@/app/components/СustomButton";

export default function Warehouse() {
    const router = useRouter();
  
    return (
    <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-30 px-6">
        <TelegramBackButton/>
        <div className="flex w-full max-w-2xl flex-col items-center gap-8">
            {/* Основной информационный блок о Cirrus Plus */}
            <div className="w-full rounded-xl bg-[#f6f6f8] p-6 border-2 border-[#111827] text-center" style={{ boxShadow: '0 0 20px rgba(17, 24, 39, 0.3), 0 0 40px rgba(17, 24, 39, 0.2)' }}>
                <h2 className="text-2xl font-bold text-[#111827] mb-2">
                    Cirrus Plus
                </h2>
                <p className="text-base text-[#111827]">
                    Для доступа к расширенному функционалу Склада оформите <span className="font-semibold">Cirrus Plus</span>
                </p>

            {/* Три блока с преимуществами */}
            <div className="w-full flex flex-col gap-4">
                <div className="w-full rounded-xl bg-[#f6f6f8] p-4 border-2 border-[#111827] text-center" style={{ boxShadow: '0 0 15px rgba(17, 24, 39, 0.25), 0 0 30px rgba(17, 24, 39, 0.15)' }}>
                    <p className="text-lg font-semibold text-[#111827]">Безлимитный учёт</p>
                </div>
                <div className="w-full rounded-xl bg-[#f6f6f8] p-4 border-2 border-[#111827] text-center" style={{ boxShadow: '0 0 15px rgba(17, 24, 39, 0.25), 0 0 30px rgba(17, 24, 39, 0.15)' }}>
                    <p className="text-lg font-semibold text-[#111827]">Аналитика Cirrus Plus</p>
                </div>
                <div className="w-full rounded-xl bg-[#f6f6f8] p-4 border-2 border-[#111827] text-center" style={{ boxShadow: '0 0 15px rgba(17, 24, 39, 0.25), 0 0 30px rgba(17, 24, 39, 0.15)' }}>
                    <p className="text-lg font-semibold text-[#111827]">VIP Поддержка 24/7</p>
                </div>
            </div>

            {/* Блок с подпиской */}
            <div className="w-full rounded-xl bg-[#f6f6f8] p-6 border-2 border-[#111827] text-center mt-4" style={{ boxShadow: '0 0 20px rgba(17, 24, 39, 0.3), 0 0 40px rgba(17, 24, 39, 0.2)' }}>
                <h3 className="text-lg font-bold text-[#111827] mb-3">
                    Ежемесячная подписка
                </h3>
                <p className="text-4xl font-bold text-[#111827] mb-6">
                    2999р./мес
                </p>
                <CustomButton 
                    width="100%"
                    onClick={() => {
                        // TODO: Добавить логику оформления подписки
                        console.log("Оформление подписки");
                    }}
                >
                    Оформить
                </CustomButton>
              </div>
            </div>

        </div>
    </main>
    )  
}