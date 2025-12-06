"use client";

import { useRouter } from "next/navigation";
import requests from "../assets/images/requests.svg";
import money from "../assets/images/money.svg";
import mechanisation from "../assets/images/mechanisation.svg";
import profile from "../assets/images/profile.svg";
import projects from "../assets/images/projects.svg";
export default function Home() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-20 px-6">
      <div className="flex w-full max-w-2xl flex-col items-start gap-12">
        <h1 className="w-full text-4xl font-bold text-[#111827] leading-[0.9]">
          Главное меню
        </h1>
        
        <div className="flex w-full flex-col gap-3">
        <div 
        onClick={() => router.push("/main/projects")}
        className="flex h-[150px] w-full items-center justify-center rounded-xl bg-white text-[#111827] gap-4">
            <img src={projects.src} alt="projects" className="w-10 h-10" />
            <div className="text-2xl font-bold ">Все проекты</div>
          </div>
          <div 
          onClick={() => router.push("/main/requests")}
          className="flex h-[150px] w-full items-center justify-center rounded-xl bg-white text-[#111827] gap-4">
            <img src={requests.src} alt="requests" className="w-10 h-10" />
            <div className="text-2xl font-bold ">Заявки</div>
          </div>
          
          <div className="flex w-full gap-3">
            <div 
            onClick={() => router.push("/main/invoices")}
            className="flex h-[100px] w-[50%] items-center justify-center rounded-xl bg-white text-[#111827] gap-4">
              <img src={money.src} alt="money" className="w-10 h-10" />
              <div className="text-2xl font-bold">Счета</div>
            </div>
            <div 
            onClick={() => router.push("/main/warehouse")}
            className="flex h-[100px] w-[50%] items-center justify-center rounded-xl bg-white text-[#111827] gap-4">
              <img src={mechanisation.src} alt="mechanisation" className="w-10 h-10" />
              <div className="text-2xl font-bold">Склад</div>
            </div>
            
          </div>
          
          <div 
          onClick={() => router.push("/main/profile")}
          className="flex h-[150px] w-full items-center justify-center rounded-xl bg-white text-[#111827] gap-4">
            <img src={profile.src} alt="profile" className="w-10 h-10" />
            <div className="text-2xl font-bold">Профиль</div>
          </div>
        </div>
      </div>
    </main>
  );
}
