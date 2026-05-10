import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { api, getStoredUser } from "@/lib/api";
import CommentList from "@/components/CommentList";

export const Route = createFileRoute("/_app/community_/$postId")({
  component: PostDetailPage,
});

function PostDetailPage() {
  const { postId } = Route.useParams();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [reply, setReply] = useState("");

  const me = getStoredUser();

  useEffect(() => {
    const id = Number(postId);

    api.get(`/community/posts/${id}/`)
      .then((r) => setPost(r.data))
      .catch((err) => console.error("Post load error:", err));

    api.get(`/community/comments/?post=${id}`)
      .then((r) => setComments(r.data))
      .catch((err) => console.error("Comments load error:", err));
  }, [postId]);

  const handleReply = (e: any) => {
    e.preventDefault();
    if (!reply.trim()) return;

    const newComment = {
      id: Date.now(),
      username: me?.username || "anonymous",
      content: reply,
      created_at: new Date().toISOString(),
    };

    setComments((prev) => [...prev, newComment]);

    api.post("/community/comments/", {
      post: postId,
      content: reply,
    }).catch(console.error);

    setReply("");
  };

  if (!post) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  const avatarUrl =
    post.avatar?.startsWith("http")
      ? post.avatar
      : post.avatar
      ? `http://127.0.0.1:8000${post.avatar}`
      : "https://via.placeholder.com/100";

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      <Link
        to="/community"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to community
      </Link>

      {/* POST */}
      <div className="rounded-2xl bg-card border border-border p-6">
        <div className="flex items-start gap-3">

          <img
            src={avatarUrl}
            className="h-12 w-12 rounded-full object-cover"
          />

          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">{post.username}</span>
              <span className="text-muted-foreground text-xs">
                · {new Date(post.created_at).toLocaleString()}
              </span>
            </div>

            {post.title && (
              <h1 className="text-2xl font-bold mt-2">{post.title}</h1>
            )}

            <p className="mt-2 text-foreground/90">{post.content}</p>
          </div>
        </div>
      </div>

      {/* COMMENTS */}
      <div>
        <h2 className="font-bold text-lg mb-3">
          Replies ({comments.length})
        </h2>

        <CommentList comments={comments} />
      </div>

      {/* REPLY BOX */}
      <form
        onSubmit={handleReply}
        className="rounded-2xl bg-card border border-border p-4 flex gap-2 sticky bottom-4"
      >
        <input
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write a reply…"
          className="flex-1 px-3 py-2.5 rounded-lg border border-border text-sm"
        />

        <button
          type="submit"
          className="px-4 rounded-lg text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

    </div>
  );
}