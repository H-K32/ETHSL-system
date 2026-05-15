import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/AppShell";
import { LoadingSpinner, ErrorState } from "@/components/Loading";
import { api, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/lesson/$id")({
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <LessonDetailPage />
      </AppShell>
    </ProtectedRoute>
  ),
});

function getEmbedUrl(url) {
  if (!url) return null;
  // YouTube
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  return url;
}

function LessonDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marking, setMarking] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/lessons/${id}/`);
      setLesson(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleComplete = async () => {
    setMarking(true);
    try {
      await api.post(`/lessons/${id}/complete/`);
      toast.success("Lesson marked complete");
      setLesson({ ...lesson, is_completed: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading lesson..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!lesson) return null;

  const videoUrl = lesson.video_url || lesson.video;
  const embed = getEmbedUrl(videoUrl);
  const isVideoFile = videoUrl && /\.(mp4|webm|ogg)$/i.test(videoUrl);
  const completed = lesson.is_completed || lesson.completed;
  const quizId = lesson.quiz?.id || lesson.quiz_id;

  return (
    <div className="space-y-6">
      <button onClick={() => window.history.back()} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>

      <div>
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
      </div>

      {videoUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-2xl border bg-black shadow-sm">
          {isVideoFile ? (
            <video src={videoUrl} controls className="h-full w-full" />
          ) : (
            <iframe
              src={embed}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={lesson.title}
            />
          )}
        </div>
      )}

      {lesson.description && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="font-semibold">About this lesson</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{lesson.description}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {completed ? (
          <Button variant="secondary" disabled className="gap-2">
            <CheckCircle2 className="h-4 w-4" /> Completed
          </Button>
        ) : (
          <Button onClick={handleComplete} disabled={marking} className="gap-2">
            <CheckCircle2 className="h-4 w-4" /> {marking ? "Saving..." : "Mark as complete"}
          </Button>
        )}
        {quizId && (
          <Link to="/quiz/$id" params={{ id: String(quizId) }}>
            <Button variant="outline" className="gap-2">
              <ClipboardCheck className="h-4 w-4" /> Take quiz
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
