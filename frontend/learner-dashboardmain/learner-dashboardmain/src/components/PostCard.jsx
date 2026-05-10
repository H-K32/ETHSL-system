import { Link } from "@tanstack/react-router";
import { MessageCircle, Flag } from "lucide-react";

const getAvatarUrl = (avatar) => {
  if (!avatar) return "https://via.placeholder.com/100";
  if (avatar.startsWith("http")) return avatar;
  return `http://127.0.0.1:8000${avatar}`;
};

export default function PostCard({ post, onReport }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] transition-shadow">

      <div className="flex items-start gap-3">

        <img
          src={getAvatarUrl(post.avatar)}
          alt={post.username}
          className="h-10 w-10 rounded-full object-cover"
        />

        <div className="flex-1 min-w-0">

          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold">{post.username}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground text-xs">
              {new Date(post.created_at).toLocaleString()}
            </span>
          </div>

          {post.title && (
            <h3 className="font-bold mt-1">{post.title}</h3>
          )}

          <p className="text-sm text-foreground/80 mt-1.5 leading-relaxed">
            {post.content}
          </p>

          <div className="flex items-center gap-2 mt-4">

            <Link
              to="/community/$postId"
              params={{ postId: String(post.id) }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              View Discussion ({post.replies})
            </Link>

            <button
              onClick={() => onReport(post.user)} // IMPORTANT: user id
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Flag className="h-3.5 w-3.5" />
              Report
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}