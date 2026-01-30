"use client";

import editPencil from "../assets/components/edit-pencil.svg";
import deleteIcon from "../assets/components/delete.svg";
import CustomSelect from "./CustomSelect";

export default function User({ 
    member, 
    onDelete, 
    onChangeRole, 
    isEditingRole = false,
    onStartEditRole,
    onCancelEditRole
}) {
    const roles = [
        { value: "director", label: "Директор" },
        { value: "deputy_director", label: "Заместитель директора" },
        { value: "foreman", label: "Прораб" },
        { value: "supply_specialist", label: "Специалист отдела снабжения" },
        { value: "accountant", label: "Бухгалтер" },
        { value: "chief_engineer", label: "Главный инженер" },
        { value: "warehouse_picker", label: "Комплектовщик" },
    ];

    const getRoleLabel = (role) => {
        const roleObj = roles.find(r => r.value === role);
        return roleObj ? roleObj.label : role;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const isOwner = member.role === "director";

    if (!member.user) {
        return null;
    }

    return (
        <div className="relative flex flex-col gap-2 rounded-lg bg-[#f6f6f8] p-4 pr-8">
            <div className="flex flex-col gap-1">
                <span className="font-medium text-[#111827]">
                    {member.user.first_name || ""} {member.user.last_name || ""}
                </span>
                {isEditingRole ? (
                    <CustomSelect
                        value={member.role}
                        onChange={(e) => {
                            if (isOwner) {
                                alert("Нельзя изменить роль владельца");
                                return;
                            }
                            onChangeRole && onChangeRole(member.user_id, e.target.value);
                        }}
                        onBlur={onCancelEditRole}
                        autoFocus
                        disabled={isOwner}
                        className="w-fit"
                        options={roles.filter(role => role.value !== "director")}
                        placeholder={null}
                    />
                ) : (
                    <span className="text-sm font-medium text-[#6B7280] bg-white px-3 py-1 rounded-lg w-fit ">
                        {getRoleLabel(member.role)}
                    </span>
                )}
            </div>
            <span className="text-xs text-[#9CA3AF]">
                @{member.user.username || "unknown"} • В команде с {formatDate(member.created_at)}
            </span>
            {!isOwner && !isEditingRole && (
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    {onStartEditRole && (
                        <button
                            onClick={() => onStartEditRole(member.user_id)}
                            className="p-1 hover:opacity-70 transition-opacity"
                        >
                            <img src={editPencil.src} alt="Изменить роль" className="w-4 h-4" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(member.user_id)}
                            className="p-1 hover:opacity-70 transition-opacity"
                        >
                            <img src={deleteIcon.src} alt="Удалить" className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
