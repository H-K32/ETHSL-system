import cloudinary.uploader
from cloudinary_storage.storage import MediaCloudinaryStorage
from uuid import uuid4


class CustomMediaCloudinaryStorage(MediaCloudinaryStorage):

    def _upload(self, name, content):

        ext = name.split(".")[-1].lower()

        # ---------------- FILE TYPE DETECTION ----------------
        if ext in ["mp4", "mov", "avi", "mkv", "webm", "gif"]:
            folder = "videos"
        elif ext in ["jpg", "jpeg", "png", "webp"]:
            folder = "images"
        else:
            folder = "files"

        # ---------------- SMART SUB-FOLDERS ----------------
        # optional routing based on filename prefix
        if "lesson" in name:
            folder = f"{folder}/lesson"
        elif "question" in name:
            folder = f"{folder}/question"
        elif "option" in name:
            folder = f"{folder}/option"

        public_id = f"{folder}_{uuid4().hex}"

        # For video files, preserve the original audio track by explicitly
        # setting audio_codec="copy". Without this Cloudinary may strip audio
        # during transcoding when resource_type="auto" is used.
        is_video = ext in ["mp4", "mov", "avi", "mkv", "webm"]
        upload_options = {
            "resource_type": "video" if is_video else "auto",
            "folder": folder,
            "public_id": public_id,
            "overwrite": True,
        }

        return cloudinary.uploader.upload(content, **upload_options)