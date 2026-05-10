import { Link } from "@tanstack/react-router";

export default function CourseCard({ course }) {
  return (
    <Link
      to="/courses/$courseId"
      params={{ courseId: String(course.id) }}
      className="group block rounded-2xl bg-card border border-border overflow-hidden hover:shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1"
    >
      <div className="h-32 flex items-center justify-center text-5xl" style={{ background: course.color || "var(--gradient-primary)" }}>
        <span>{course.thumbnail || "📚"}</span>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{course.title}</h3>
        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{course.description}</p>
        <div className="mt-4">
          <div className="flex justify-between text-xs font-medium mb-1.5">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-primary">{course.progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${course.progress}%`, background: "var(--gradient-primary)" }} />
          </div>
        </div>
      </div>
    </Link>
  );
}
