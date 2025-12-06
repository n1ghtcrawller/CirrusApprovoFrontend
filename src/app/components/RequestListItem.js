"use client";

export default function RequestListItem({ request, onClick }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      created: "Создана",
      supply_added_invoice: "Добавлен счет",
      director_approved: "Одобрена директором",
      accountant_paid: "Оплачена бухгалтером",
      foreman_confirmed_receipt: "Подтверждено получение",
      documents_shipped: "Документы отправлены",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      created: "bg-[#E5E7EB] text-[#6B7280]",
      supply_added_invoice: "bg-[#DBEAFE] text-[#1E40AF]",
      director_approved: "bg-[#D1FAE5] text-[#065F46]",
      accountant_paid: "bg-[#FEF3C7] text-[#92400E]",
      foreman_confirmed_receipt: "bg-[#E0E7FF] text-[#3730A3]",
      documents_shipped: "bg-[#D1FAE5] text-[#065F46]",
    };
    return colorMap[status] || "bg-[#E5E7EB] text-[#6B7280]";
  };

  return (
    <div
      onClick={onClick}
      className="flex w-full cursor-pointer flex-col gap-3 rounded-xl bg-white p-4 transition-all hover:shadow-md"
      style={{
        fontFamily: "var(--font-onest), -apple-system, sans-serif",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-[#111827]">{request.number}</h3>
          <span className="text-xs text-[#9CA3AF]">
            Создана: {formatDate(request.created_at)}
          </span>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${getStatusColor(
            request.status
          )}`}
        >
          {getStatusLabel(request.status)}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <span className="font-medium">Дата доставки:</span>
          <span>{formatShortDate(request.delivery_date)}</span>
        </div>
        {request.notes && (
          <div className="flex items-start gap-2 text-sm text-[#6B7280]">
            <span className="font-medium">Примечания:</span>
            <span>{request.notes}</span>
          </div>
        )}
        <div className="flex items-center gap-4 text-xs text-[#9CA3AF] pt-1 border-t border-[#E5E7EB]">
          <span>
            Позиций: <span className="font-medium text-[#6B7280]">{request.items?.length || 0}</span>
          </span>
          <span>
            Документов: <span className="font-medium text-[#6B7280]">{request.documents?.length || 0}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
