"use client";

import Request from "./RequestListItem";

export default function RequestList({ requests = [], onItemClick }) {
  if (!requests || requests.length === 0) {
    return (
      <div className="w-full text-center text-[#9CA3AF] py-8">
        Заявки не найдены
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {requests.map((request) => (
        <Request
          key={request.id}
          request={request}
          onClick={() => onItemClick && onItemClick(request)}
        />
      ))}
    </div>
  );
}
