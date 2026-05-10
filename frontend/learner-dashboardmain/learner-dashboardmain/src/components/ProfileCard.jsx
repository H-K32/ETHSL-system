export default function ProfileCard({ user }) {
  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-[var(--shadow-card)]">
      <div className="h-24" style={{ background: "var(--gradient-primary)" }} />
      <div className="px-6 pb-6 -mt-12">
      <img
            src={
              user.avatar
                ? user.avatar.startsWith("http")
                  ? user.avatar
                  : `http://127.0.0.1:8000${user.avatar}`
                : "https://via.placeholder.com/150"
            }
            alt={user.full_name}
            className="h-24 w-24 rounded-full border-4 border-card bg-card object-cover"
          />
        <h2 className="text-xl font-bold mt-3">{user.full_name}</h2>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
    </div>
  );
}
