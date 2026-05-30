import cloudinary.uploader
from cloudinary_storage.storage import MediaCloudinaryStorage
import os
from uuid import uuid4


class CustomMediaCloudinaryStorage(MediaCloudinaryStorage):

    def _upload(self, name, content):

        # safer unique ID (prevents collisions + weird file paths)
        public_id = f"lesson_{uuid4().hex}"

        return cloudinary.uploader.upload(
            content,
            resource_type="auto",   # supports video/image
            folder="lesson_videos",
            public_id=public_id,
            overwrite=True,
        )