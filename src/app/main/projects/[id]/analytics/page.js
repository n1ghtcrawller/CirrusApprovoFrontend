"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import TelegramBackButton from "@/app/components/TelegramBackButton";
import { getObjectAnalytics } from "../../../../lib/api";

const MONTH_NAMES = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

function formatPeriod(period, groupBy) {
  if (groupBy === "year") return period;
  const [y, m] = period.split("-");
  const monthIdx = parseInt(m, 10) - 1;
  return `${MONTH_NAMES[monthIdx] ?? m}. ${y}`;
}

function formatMoney(str) {
  const n = parseFloat(str);
  return isNaN(n) ? "0,00" : n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ObjectAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const objectId = parseInt(params.id, 10);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [groupBy, setGroupBy] = useState("month");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getObjectAnalytics(objectId, { year, group_by: groupBy });
        setData(result);
      } catch (e) {
        console.error("Ошибка загрузки аналитики:", e);
        if (e.response?.status === 401) {
          window.location.href = "/";
          return;
        }
        setError("Не удалось загрузить аналитику");
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [objectId, year, groupBy]);

  if (isLoading && !data) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-30 px-6">
        <TelegramBackButton />
        <div className="flex w-full max-w-2xl flex-col items-start gap-12">
          <div className="w-full text-center text-[#9CA3AF] py-8">Загрузка...</div>
        </div>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-30 px-6">
        <TelegramBackButton />
        <div className="flex w-full max-w-2xl flex-col items-start gap-12">
          <div className="w-full text-center text-[#DC2626] py-8">{error}</div>
          <button
            onClick={() => router.push(`/main/projects/${objectId}`)}
            className="w-full rounded-xl bg-[#111827] px-6 py-3 text-white text-sm font-medium"
          >
            К объекту
          </button>
        </div>
      </main>
    );
  }

  const summary = data?.summary ?? {};
  const byPeriod = data?.by_period ?? [];
  const byMaterial = data?.by_material ?? [];
  const byCreator = data?.by_creator ?? [];

  const maxAmount = byPeriod.length
    ? Math.max(...byPeriod.map((p) => parseFloat(p.total_amount || 0)))
    : 1;

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-30 px-6 pb-12">
      <TelegramBackButton />
      <div className="flex w-full max-w-2xl flex-col items-start gap-8">
        <h1 className="text-2xl font-bold text-[#111827]">Аналитика</h1>

        {/* Фильтры */}
        <div className="w-full rounded-xl bg-white p-4 flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#6B7280]">Год</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10) || new Date().getFullYear())}
              min={2000}
              max={2100}
              className="rounded-xl border border-[#E5E7EB] px-3 py-2 text-[#111827] w-24"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#6B7280]">Группировка</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="rounded-xl border border-[#E5E7EB] px-3 py-2 text-[#111827] bg-white"
            >
              <option value="month">По месяцам</option>
              <option value="year">По годам</option>
            </select>
          </div>
        </div>

        {/* Сводка */}
        <div className="w-full rounded-xl bg-white p-6">
          <h2 className="text-xl font-bold text-[#111827] mb-4">Сводка</h2>
          <div className="flex flex-col gap-3">
            {summary.object_name && (
              <p className="text-sm text-[#6B7280]">{summary.object_name}</p>
            )}
            {summary.planned_budget != null && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-[#6B7280]">Планируемый бюджет:</span>
                <span className="font-bold text-[#111827]">{formatMoney(summary.planned_budget)} ₽</span>
              </div>
            )}
            {summary.actual_spent != null && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-[#6B7280]">Фактически потрачено:</span>
                <span className="font-bold text-[#111827]">{formatMoney(summary.actual_spent)} ₽</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-[#E5E7EB]">
              <span className="text-sm font-medium text-[#6B7280]">Заявок за период:</span>
              <span className="font-bold text-[#111827]">{summary.total_requests ?? 0}</span>
            </div>
          </div>
        </div>

        {/* График по периодам */}
        {byPeriod.length > 0 && (
          <div className="w-full rounded-xl bg-white p-6">
            <h2 className="text-xl font-bold text-[#111827] mb-4">Расход по периодам</h2>
            <div className="flex flex-col gap-3">
              {byPeriod.map((row) => {
                const amount = parseFloat(row.total_amount || 0);
                const pct = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                return (
                  <div key={row.period} className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#111827] font-medium">{formatPeriod(row.period, groupBy)}</span>
                      <span className="text-[#6B7280]">{formatMoney(row.total_amount)} ₽ · {row.request_count} заявок</span>
                    </div>
                    <div className="h-6 rounded-lg bg-[#E5E7EB] overflow-hidden">
                      <div
                        className="h-full rounded-lg bg-[#3B82F6] transition-all duration-300"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* По материалам */}
        {byMaterial.length > 0 && (
          <div className="w-full rounded-xl bg-white p-6">
            <h2 className="text-xl font-bold text-[#111827] mb-4">По материалам</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-left text-[#6B7280] font-medium">
                    <th className="pb-2 pr-2">Материал</th>
                    <th className="pb-2 pr-2 text-right">Кол-во</th>
                    <th className="pb-2 text-right">Заявок</th>
                  </tr>
                </thead>
                <tbody>
                  {byMaterial.map((row, i) => (
                    <tr key={i} className="border-b border-[#E5E7EB]/60">
                      <td className="py-2 pr-2 text-[#111827]">{row.material_name}</td>
                      <td className="py-2 pr-2 text-right text-[#6B7280]">
                        {row.total_quantity} {row.unit ? row.unit : ""}
                      </td>
                      <td className="py-2 text-right text-[#6B7280]">{row.request_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* По создателям */}
        {byCreator.length > 0 && (
          <div className="w-full rounded-xl bg-white p-6">
            <h2 className="text-xl font-bold text-[#111827] mb-4">По пользователям</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-left text-[#6B7280] font-medium">
                    <th className="pb-2 pr-2">Пользователь</th>
                    <th className="pb-2 pr-2 text-right">Заявок</th>
                    <th className="pb-2 text-right">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {byCreator.map((row) => (
                    <tr key={row.creator_id} className="border-b border-[#E5E7EB]/60">
                      <td className="py-2 pr-2 text-[#111827]">{row.creator_name ?? `ID ${row.creator_id}`}</td>
                      <td className="py-2 pr-2 text-right text-[#6B7280]">{row.request_count}</td>
                      <td className="py-2 text-right text-[#111827] font-medium">{formatMoney(row.total_amount)} ₽</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!byPeriod.length && !byMaterial.length && !byCreator.length && data && (
          <div className="w-full rounded-xl bg-white p-6 text-center text-[#6B7280]">
            Нет данных за выбранный период
          </div>
        )}
      </div>
    </main>
  );
}
