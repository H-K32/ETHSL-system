import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Send, Flag } from "lucide-react";
import { api, getStoredUser } from "@/lib/api";
import PostCard from "@/components/PostCard";

export const Route = createFileRoute("/_app/community")({
  component: CommunityPage,
});

function CommunityPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [reportTarget, setReportTarget] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState("Spam");
  const [reportText, setReportText] = useState("");

  const me = getStoredUser();

  useEffect(() => {
    api.get("/community/posts/")
      .then((r) => setPosts(r.data))
      .catch(console.error);
  }, []);

  const handleCreate = (e: any) => {
    e.preventDefault();
    if (!content.trim()) return;

    api.post("/community/posts/", {
      title,
      content,
    })
      .then((r) => setPosts([r.data, ...posts]))
      .catch(console.error);

    setTitle("");
    setContent("");
  };

  const submitReport = (e: any) => {
    e.preventDefault();

    if (!reportTarget) return;

    api.post("/community/report/", {
      reported_user: reportTarget,
      reason: reportReason,
      details: reportText,
    })
      .then(() => {
        setReportTarget(null);
        setReportText("");
        setReportReason("Spam");
      })
      .catch(console.error);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold">Community</h1>

      {/* CREATE POST */}
      <form onSubmit={handleCreate} className="p-5 border rounded-xl space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border p-2 rounded"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share something..."
          className="w-full border p-2 rounded"
        />

        <button className="bg-black text-white px-4 py-2 rounded flex items-center gap-2">
          <Send className="h-4 w-4" />
          Post
        </button>
      </form>

      {/* POSTS */}
      <div className="space-y-4">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} onReport={setReportTarget} />
        ))}
      </div>

      {/* REPORT MODAL */}
      {reportTarget && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center"
          onClick={() => setReportTarget(null)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitReport}
            className="bg-white p-6 rounded-xl w-full max-w-md space-y-4"
          >
            <h2 className="font-bold flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Report User
            </h2>

            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option>Spam</option>
              <option>Harassment</option>
              <option>Inappropriate content</option>
              <option>Misinformation</option>
              <option>Other</option>
            </select>

            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Details..."
            />

            <button className="w-full bg-red-500 text-white py-2 rounded">
              Submit Report
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default CommunityPage;