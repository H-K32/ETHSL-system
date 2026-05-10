import { useState } from "react";
import { Flag, X } from "lucide-react";
import { api } from "@/lib/api";

export default function CommentList({ comments }) {
  const [reportTarget, setReportTarget] = useState(null);
  const [reason, setReason] = useState("Spam");
  const [details, setDetails] = useState("");

  const submit = (e) => {
    e.preventDefault();
    api.post("/community/report/", { reported_user: reportTarget?.username, comment_id: reportTarget?.id, reason, details }).catch(() => {});
    setReportTarget(null);
    setDetails("");
    setReason("Spam");
  };

  if (!comments?.length) {
    return <p className="text-sm text-muted-foreground text-center py-6">No replies yet. Be the first!</p>;
  }
  return (
    <>
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="rounded-xl bg-muted/40 border border-border p-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">{c.username}</span>
                <span className="text-muted-foreground text-xs">· {c.timestamp}</span>
              </div>
              <button
                onClick={() => setReportTarget(c)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                aria-label="Report reply"
              >
                <Flag className="h-3 w-3" /> Report
              </button>
            </div>
            <p className="text-sm text-foreground/85">{c.content}</p>
          </div>
        ))}
      </div>

      {reportTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-foreground/40 backdrop-blur-sm" onClick={() => setReportTarget(null)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-[var(--shadow-soft)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2"><Flag className="h-5 w-5 text-destructive" /> Report reply</h3>
              <button type="button" onClick={() => setReportTarget(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-sm text-muted-foreground">Reporting reply by <strong>@{reportTarget.username}</strong></p>
            <div>
              <label className="text-sm font-medium block mb-1.5">Reason</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-input/50 border border-border text-sm">
                <option>Spam</option><option>Harassment</option><option>Inappropriate content</option><option>Misinformation</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Details</label>
              <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} placeholder="Tell us more…" className="w-full px-3 py-2.5 rounded-lg bg-input/50 border border-border text-sm resize-none" />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-lg text-sm font-medium text-destructive-foreground bg-destructive hover:opacity-90">
              Submit Report
            </button>
          </form>
        </div>
      )}
    </>
  );
}
