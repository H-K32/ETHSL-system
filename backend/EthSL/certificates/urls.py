from django.urls import path
from .views import (
    DownloadCertificateView,
    MyCertificatesView
)

urlpatterns=[

    path(
        "my-certificates/",
        MyCertificatesView.as_view()
    ),

    path(
        "download/<int:certificate_id>/",
        DownloadCertificateView.as_view()
    )

]