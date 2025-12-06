"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import User from "../../../../components/User";
import mockProjectTeam from "../../../../data/mockProjectTeam.json";

export default function ProjectTeamPage() {
    const router = useRouter();
    const params = useParams();
    const [projectData, setProjectData] = useState(null);
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [isChangingRole, setIsChangingRole] = useState(null);
    const [newMemberData, setNewMemberData] = useState({ user_id: "", role: "" });

    const roles = [
        { value: "director", label: "Директор" },
        { value: "foreman", label: "Прораб" },
        { value: "supply_specialist", label: "Специалист отдела снабжения" },
        { value: "accountant", label: "Бухгалтер" },
        { value: "chief_engineer", label: "Главный инженер" },
        { value: "warehouse_picker", label: "Комплектовщик" },
    ];

    useEffect(() => {
        loadTeamData();
    }, [params.id]);

    const loadTeamData = async () => {
        setIsLoading(true);
        try {
            // TODO: Заменить на реальный API запрос
            // const token = localStorage.getItem('token');
            // const response = await fetch(`/api/objects/${params.id}/with-members`, {
            //     headers: {
            //         'Authorization': `Bearer ${token}`
            //     }
            // });
            // if (!response.ok) throw new Error('Ошибка загрузки команды');
            // const data = await response.json();
            
            // Пока используем mock данные
            await new Promise(resolve => setTimeout(resolve, 300));
            const data = mockProjectTeam;
            setProjectData(data);
            
            // Формируем список участников с ролями
            // Проверяем, есть ли владелец уже в members, чтобы избежать дубликатов
            const ownerInMembers = data.members.some(m => m.user_id === data.owner.id);
            const allMembers = ownerInMembers 
                ? data.members 
                : [
                    {
                        object_id: data.id,
                        user_id: data.owner.id,
                        role: "director",
                        created_at: data.created_at,
                        user: data.owner
                    },
                    ...data.members
                ];
            setMembers(allMembers);
        } catch (error) {
            console.error("Ошибка загрузки команды:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMember = async () => {
        if (!newMemberData.user_id || !newMemberData.role) {
            alert("Заполните все поля");
            return;
        }

        try {
            // TODO: Заменить на реальный API запрос
            // const token = localStorage.getItem('token');
            // const response = await fetch(`/api/objects/${params.id}/members`, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`
            //     },
            //     body: JSON.stringify({
            //         user_id: parseInt(newMemberData.user_id),
            //         role: newMemberData.role
            //     })
            // });
            // if (!response.ok) {
            //     if (response.status === 403) {
            //         alert("Только владелец может добавлять участников");
            //         return;
            //     }
            //     throw new Error('Ошибка добавления участника');
            // }
            // const result = await response.json();
            
            // Имитация добавления
            await new Promise(resolve => setTimeout(resolve, 300));
            alert("Участник добавлен (mock)");
            setIsAddingMember(false);
            setNewMemberData({ user_id: "", role: "" });
            loadTeamData(); // Перезагружаем данные
        } catch (error) {
            console.error("Ошибка добавления участника:", error);
            alert("Ошибка при добавлении участника");
        }
    };

    const handleDeleteMember = async (userId) => {
        if (!confirm("Вы уверены, что хотите удалить этого участника?")) {
            return;
        }

        try {
            // TODO: Заменить на реальный API запрос
            // const token = localStorage.getItem('token');
            // const response = await fetch(`/api/objects/${params.id}/members/${userId}`, {
            //     method: 'DELETE',
            //     headers: {
            //         'Authorization': `Bearer ${token}`
            //     }
            // });
            // if (!response.ok) {
            //     if (response.status === 400) {
            //         alert("Нельзя удалить владельца объекта");
            //         return;
            //     }
            //     if (response.status === 403) {
            //         alert("Только владелец может удалять участников");
            //         return;
            //     }
            //     throw new Error('Ошибка удаления участника');
            // }
            
            // Имитация удаления
            await new Promise(resolve => setTimeout(resolve, 300));
            setMembers(members.filter(m => m.user_id !== userId));
            alert("Участник удалён (mock)");
        } catch (error) {
            console.error("Ошибка удаления участника:", error);
            alert("Ошибка при удалении участника");
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        try {
            // TODO: Заменить на реальный API запрос
            // const token = localStorage.getItem('token');
            // const response = await fetch(`/api/objects/${params.id}/members/${userId}/role`, {
            //     method: 'PUT',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`
            //     },
            //     body: JSON.stringify({ role: newRole })
            // });
            // if (!response.ok) {
            //     if (response.status === 400) {
            //         alert("Нельзя изменить роль владельца");
            //         return;
            //     }
            //     if (response.status === 403) {
            //         alert("Только владелец может изменять роли");
            //         return;
            //     }
            //     throw new Error('Ошибка изменения роли');
            // }
            // const result = await response.json();
            
            // Имитация изменения роли
            await new Promise(resolve => setTimeout(resolve, 300));
            setMembers(members.map(m => 
                m.user_id === userId ? { ...m, role: newRole } : m
            ));
            setIsChangingRole(null);
            alert("Роль изменена (mock)");
        } catch (error) {
            console.error("Ошибка изменения роли:", error);
            alert("Ошибка при изменении роли");
        }
    };

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

    if (isLoading) {
        return (
            <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-20 px-6">
                <div className="flex w-full max-w-2xl flex-col items-start gap-12">
                    <div className="w-full text-center text-[#9CA3AF] py-8">
                        Загрузка команды...
                    </div>
                </div>
            </main>
        );
    }

    if (!projectData) {
        return (
            <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-20 px-6">
                <div className="flex w-full max-w-2xl flex-col items-start gap-12">
                    <div className="w-full text-center text-[#9CA3AF] py-8">
                        Проект не найден
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] pt-20 px-6">
            <div className="flex w-full max-w-2xl flex-col items-start gap-6">
                <button
                    onClick={() => router.back()}
                    className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
                >
                    ← Назад
                </button>

                <h1 className="text-4xl font-bold text-[#111827] leading-[0.9]">
                    Команда проекта
                </h1>

                <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-[#111827]">Участники</h2>
                        <button
                            onClick={() => setIsAddingMember(!isAddingMember)}
                            className="text-sm font-medium text-[#135bec] hover:text-[#1E40AF] transition-colors"
                        >
                            {isAddingMember ? "Отмена" : "+ Добавить участника"}
                        </button>
                    </div>

                    {isAddingMember && (
                        <div className="flex flex-col gap-3 rounded-lg bg-[#f6f6f8] p-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-[#9CA3AF]">ID пользователя</label>
                                <input
                                    type="number"
                                    value={newMemberData.user_id}
                                    onChange={(e) => setNewMemberData({ ...newMemberData, user_id: e.target.value })}
                                    placeholder="5"
                                    className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0"
                                    style={{
                                        fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-[#9CA3AF]">Роль</label>
                                <select
                                    value={newMemberData.role}
                                    onChange={(e) => setNewMemberData({ ...newMemberData, role: e.target.value })}
                                    className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-0"
                                    style={{
                                        fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                    }}
                                >
                                    <option value="">Выберите роль</option>
                                    {roles.filter(r => r.value !== "director").map(role => (
                                        <option key={role.value} value={role.value}>
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleAddMember}
                                className="w-full rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1F2937] transition-colors"
                                style={{
                                    fontFamily: "var(--font-onest), -apple-system, sans-serif",
                                }}
                            >
                                Добавить
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        {members.map((member) => (
                            <User
                                key={`${member.object_id}-${member.user_id}`}
                                member={member}
                                onDelete={member.role !== "director" ? handleDeleteMember : null}
                                onChangeRole={member.role !== "director" ? handleChangeRole : null}
                                isEditingRole={isChangingRole === member.user_id}
                                onStartEditRole={member.role !== "director" ? setIsChangingRole : null}
                                onCancelEditRole={() => setIsChangingRole(null)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
