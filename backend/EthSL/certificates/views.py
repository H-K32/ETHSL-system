from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from reportlab.platypus import (
    SimpleDocTemplate,
    Spacer,
    Paragraph
)
from reportlab.lib import styles
from reportlab.lib.enums import TA_CENTER

from .models import Certificate
from rest_framework.response import Response

class DownloadCertificateView(APIView):

    permission_classes=[IsAuthenticated]

    def get(self,request,certificate_id):

        try:
            certificate=Certificate.objects.get(
                id=certificate_id,
                learner=request.user
            )

        except Certificate.DoesNotExist:

            return HttpResponse(
                "Certificate not found",
                status=404
            )

        response=HttpResponse(
            content_type='application/pdf'
        )

        response[
            'Content-Disposition'
        ]=f'attachment; filename=certificate_{certificate.id}.pdf'

        doc=SimpleDocTemplate(response)

        styleSheet=styles.getSampleStyleSheet()

        titleStyle=styleSheet['Title']
        titleStyle.alignment=TA_CENTER

        centerStyle=styleSheet['Heading2']
        centerStyle.alignment=TA_CENTER


        content=[]

        content.append(
            Spacer(1,40)
        )

        content.append(
            Paragraph(
                "Certificate of Completion",
                titleStyle
            )
        )

        content.append(
            Spacer(1,50)
        )

        content.append(
            Paragraph(
                "This certifies that",
                centerStyle
            )
        )

        content.append(
            Spacer(1,20)
        )

        content.append(
            Paragraph(
                f"{certificate.learner.username}",
                centerStyle
            )
        )

        content.append(
            Spacer(1,30)
        )

        content.append(
            Paragraph(
                f"has successfully completed the {certificate.level.name} level",
                centerStyle
            )
        )

        content.append(
            Spacer(1,30)
        )

        content.append(
            Paragraph(
                "Ethiopian Sign Language Learning System",
                centerStyle
            )
        )

        doc.build(content)

        return response


class MyCertificatesView(APIView):

    permission_classes=[IsAuthenticated]

    def get(self,request):

        certificates=Certificate.objects.filter(
            learner=request.user
        )

        data=[]

        for cert in certificates:

            data.append({

                "id":cert.id,
                "level":cert.level.name,
                "issued_at":cert.issued_at.isoformat(),
                "certificate_id":cert.certificate_id

            })

        return Response(data)