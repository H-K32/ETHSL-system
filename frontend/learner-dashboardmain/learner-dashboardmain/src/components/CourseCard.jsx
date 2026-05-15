import { Link } from "@tanstack/react-router";

export default function CourseCard({
  course,
  locked,
  onLockedClick,
  onClick,
}) {
  if (locked) {
    return (
      <div
        onClick={onLockedClick}
        className="cursor-not-allowed opacity-40 rounded-2xl border p-5 bg-card"
      >
        <div className="text-4xl mb-2">🔒</div>
        <h3 className="font-bold">{course.title}</h3>
        <p className="text-sm text-muted-foreground">
          Finish previous course to unlock
        </p>
      </div>
    );
  }

  // IMPORTANT: wrap Link but still allow custom click logic
  return (
    <div onClick={onClick}>
      <Link
        to="/courses/$courseId"
        params={{ courseId: String(course.id) }}
        className="group block rounded-2xl bg-card border border-border overflow-hidden hover:shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1"
      >
        <div
          className="h-32 flex items-center justify-center text-5xl"
          style={{
            background: course.color || "var(--gradient-primary)",
          }}
        >
          <span>{course.thumbnail || "📚"}</span>
        </div>

        <div className="p-5">
          <h3 className="font-bold text-lg group-hover:text-primary">
            {course.title}
          </h3>

          <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
            {course.description}
          </p>

          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary">{course.progress}%</span>
            </div>

            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full"
                style={{
                  width: `${course.progress}%`,
                  background: "var(--gradient-primary)",
                }}
              />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}