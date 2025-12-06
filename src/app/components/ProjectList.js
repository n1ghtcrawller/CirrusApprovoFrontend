"use client";

export default function ProjectList({ projects = [], onItemClick }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="w-full text-center text-[#9CA3AF] py-8">
        Проекты не найдены
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {projects.map((project) => (
        <div
          key={project.id}
          onClick={() => onItemClick && onItemClick(project)}
          className="flex w-full cursor-pointer flex-col gap-2 rounded-xl bg-white p-4 transition-all hover:shadow-md"
          style={{
            fontFamily: "var(--font-onest), -apple-system, sans-serif",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold text-[#111827]">{project.name}</h3>
            <span className="text-xs text-[#9CA3AF] whitespace-nowrap">
              {formatDate(project.created_at)}
            </span>
          </div>
          {project.description && (
            <p className="text-sm text-[#6B7280] line-clamp-2">{project.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
