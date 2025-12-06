 "use client";

import CustomButton from "./components/СustomButton";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const handleStart = () => {
    router.push("/menu");
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#f6f6f8]">
      <div className="flex w-full max-w-2xl flex-col items-center justify-center gap-12">
        <h1 className="w-90 text-start text-7xl font-bold text-[#111827] leading-[0.9]">
          Cirrus
          <br />
          Approvo.
        </h1>
        <div className="w-90 flex justify-center">
          <CustomButton width="100%" onClick={handleStart}>
            Начать работу
          </CustomButton>
        </div>
      </div>
    </main>
  );
}
