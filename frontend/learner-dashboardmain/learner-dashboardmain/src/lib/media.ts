export function getMediaUrl(path?: string) {
  if (!path) return "https://via.placeholder.com/150";

  if (path.startsWith("http")) return path;

  // IMPORTANT: your Django media root is /media/avatars
  return `http://127.0.0.1:8000${path}`;
}