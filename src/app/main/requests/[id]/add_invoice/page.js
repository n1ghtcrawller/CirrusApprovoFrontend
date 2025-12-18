"use client";
import { useRouter } from "next/navigation";
export default function AddInvoice() {
    const router = useRouter();
  
    return (
    <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-30 px-6">
        <div className="flex w-full max-w-2xl flex-col items-start gap-12">
            <h1 className="w-full text-4xl font-bold text-[#111827] leading-[0.9]">
                Добавление счета
            </h1>
        </div>
    </main>
    )  
}