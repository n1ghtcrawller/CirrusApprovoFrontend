"use client";
import { useRouter } from "next/navigation";
import TelegramBackButton from "@/app/components/TelegramBackButton";
import CustomButton from "@/app/components/СustomButton";
import sbpImage from "@/app/assets/images/sbp.png";

export default function PayPage() {
    const router = useRouter();
  
    return (
        <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-30 px-6">
            <TelegramBackButton/>
            <div className="flex w-full max-w-2xl flex-col items-center gap-8 pb-12">
                <h1 className="w-full text-4xl font-bold text-[#111827] leading-[0.9] text-center">
                    Оплата по СБП
                </h1>

                {/* Блок с информацией о платеже */}
                <div className="w-full rounded-xl bg-[#f6f6f8] p-6 border-2 border-[#111827] text-center" style={{ boxShadow: '0 0 20px rgba(17, 24, 39, 0.3), 0 0 40px rgba(17, 24, 39, 0.2)' }}>
                    <h2 className="text-2xl font-bold text-[#111827] mb-4">
                        Cirrus Plus
                    </h2>
                    <p className="text-4xl font-bold text-[#111827] mb-6">
                        2999₽/мес
                    </p>
                </div>

                {/* Блок с QR-кодом */}
                <div className="w-full rounded-xl bg-white p-6 border-2 border-[#111827] flex flex-col items-center gap-4" style={{ boxShadow: '0 0 20px rgba(17, 24, 39, 0.3), 0 0 40px rgba(17, 24, 39, 0.2)' }}>
                    <h3 className="text-xl font-bold text-[#111827] text-center">
                        Отсканируйте QR-код для оплаты
                    </h3>
                    <div className="w-full max-w-xs flex items-center justify-center bg-white p-4 rounded-lg">
                        <img 
                            src={sbpImage.src}
                            alt="QR-код для оплаты по СБП"
                            className="w-full h-auto"
                        />
                    </div>
                    <p className="text-sm text-[#6B7280] text-center">
                        Используйте приложение вашего банка для сканирования QR-кода
                    </p>
                </div>

                {/* Инструкции по оплате */}
                <div className="w-full rounded-xl bg-white p-6 border-2 border-[#111827]" style={{ boxShadow: '0 0 15px rgba(17, 24, 39, 0.25), 0 0 30px rgba(17, 24, 39, 0.15)' }}>
                    <h3 className="text-lg font-bold text-[#111827] mb-4">
                        Как оплатить:
                    </h3>
                    <div className="flex flex-col gap-3 text-base text-[#111827]">
                        <div className="flex gap-3">
                            <span className="font-bold text-[#111827]">1.</span>
                            <span>Откройте приложение вашего банка</span>
                        </div>
                        <div className="flex gap-3">
                            <span className="font-bold text-[#111827]">2.</span>
                            <span>Выберите функцию оплаты по QR-коду</span>
                        </div>
                        <div className="flex gap-3">
                            <span className="font-bold text-[#111827]">3.</span>
                            <span>Отсканируйте QR-код на экране</span>
                        </div>
                        <div className="flex gap-3">
                            <span className="font-bold text-[#111827]">4.</span>
                            <span>Подтвердите оплату в приложении банка</span>
                        </div>
                    </div>
                </div>

                {/* Кнопка возврата */}
                <CustomButton 
                    width="100%"
                    onClick={() => {
                        router.push("/main/warehouse");
                    }}
                >
                    Вернуться назад
                </CustomButton>
            </div>
        </main>
    )  
}

