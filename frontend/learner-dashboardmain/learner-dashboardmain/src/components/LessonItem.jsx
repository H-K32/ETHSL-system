import { CheckCircle2, Circle, PlayCircle, FileQuestion } from "lucide-react";

export default function LessonItem({ lesson, onComplete, onTakeQuiz, expanded, onToggle }) {
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden shadow-[var(--shadow-card)]">
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors">
        {lesson.completed ? (
          <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
        )}
        <span className="flex-1 font-medium">{lesson.title}</span>
        {lesson.has_quiz && <FileQuestion className="h-4 w-4 text-accent shrink-0" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="rounded-lg bg-muted/50 aspect-video flex items-center justify-center text-muted-foreground">
            <PlayCircle className="h-12 w-12 opacity-40" />
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{lesson.content}</p>
          <div className="flex flex-wrap gap-2">
            {!lesson.completed && (
              <button
                onClick={() => onComplete(lesson.id)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                style={{ background: "var(--gradient-primary)" }}
              >
                Mark as Completed
              </button>
            )}
            {lesson.has_quiz && (
              <button
                onClick={() => onTakeQuiz(lesson.quiz_id)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-accent text-accent-foreground bg-accent/20 hover:bg-accent/30 transition-colors"
              >
                Take Quiz
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
