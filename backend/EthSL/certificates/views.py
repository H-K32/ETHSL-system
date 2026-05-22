from django.http import HttpResponse
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from reportlab.platypus import (
    SimpleDocTemplate,
    Spacer,
    Paragraph,
    Table,
    TableStyle
)
from reportlab.lib import styles, colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm

from .models import Certificate
from rest_framework.response import Response


def draw_certificate_background(canvas, doc):
    width, height = landscape(A4)

    canvas.saveState()

    canvas.setFillColor(colors.HexColor("#F8FAFC"))
    canvas.rect(0, 0, width, height, stroke=0, fill=1)

    canvas.setStrokeColor(colors.HexColor("#4F46E5"))
    canvas.setLineWidth(4)
    canvas.roundRect(12 * mm, 12 * mm, width - 24 * mm, height - 24 * mm, 18, stroke=1, fill=0)

    canvas.setStrokeColor(colors.HexColor("#7C3AED"))
    canvas.setLineWidth(1.5)
    canvas.roundRect(18 * mm, 18 * mm, width - 36 * mm, height - 36 * mm, 12, stroke=1, fill=0)

    canvas.setFillColor(colors.HexColor("#4F46E5"))
    canvas.circle(width / 2, height - 35 * mm, 15 * mm, stroke=0, fill=1)

    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 15)
    canvas.drawCentredString(width / 2, height - 39 * mm, "ETHSL")

    canvas.setStrokeColor(colors.HexColor("#A78BFA"))
    canvas.setLineWidth(1)
    canvas.line(30 * mm, height - 48 * mm, width - 30 * mm, height - 48 * mm)

    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#475569"))
    canvas.drawCentredString(width / 2, 18 * mm, "Ethiopian Sign Language Learning System")

    canvas.restoreState()


def build_certificate_story(certificate):
    style_sheet = styles.getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CertificateTitle",
        parent=style_sheet["Title"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=24,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=8,
    )

    subtitle_style = ParagraphStyle(
        "CertificateSubtitle",
        parent=style_sheet["Heading2"],
        fontName="Helvetica",
        fontSize=10.5,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#4F46E5"),
        spaceAfter=10,
    )

    name_style = ParagraphStyle(
        "RecipientName",
        parent=style_sheet["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=19,
        leading=22,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#1F1F1F"),
        spaceAfter=8,
    )

    body_style = ParagraphStyle(
        "CertificateBody",
        parent=style_sheet["BodyText"],
        fontName="Helvetica",
        fontSize=10.5,
        leading=15,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#334155"),
        spaceAfter=8,
    )

    detail_style = ParagraphStyle(
        "CertificateDetail",
        parent=style_sheet["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#0F172A"),
    )

    issued_style = ParagraphStyle(
        "CertificateIssued",
        parent=style_sheet["BodyText"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=10,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#475569"),
    )

    seal_style = ParagraphStyle(
        "SealText",
        parent=style_sheet["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#4F46E5"),
    )

    issued_date = timezone.localtime(certificate.issued_at).strftime("%d %B %Y")
    recipient_name = certificate.learner.get_full_name().strip() or certificate.learner.username

    content = [
        Spacer(1, 14),
        Paragraph("Certificate of Completion", title_style),
        Spacer(1, 8),
        Paragraph("This certifies that", subtitle_style),
        Spacer(1, 10),
        Paragraph(recipient_name, name_style),
        Spacer(1, 8),
        Paragraph(
            f"has successfully completed the <b>{certificate.level.name.title()}</b> level",
            body_style,
        ),
        Spacer(1, 8),
        Paragraph(
            "and has demonstrated dedication to learning Ethiopian Sign Language",
            body_style,
        ),
        Spacer(1, 16),
        Table(
            [[
                Paragraph(f"Certificate ID<br/><b>{certificate.certificate_id}</b>", detail_style),
                Paragraph(f"Issued On<br/><b>{issued_date}</b>", detail_style),
            ]],
            colWidths=[104 * mm, 104 * mm],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#EEF2FF")),
                ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#4F46E5")),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#A78BFA")),
                ("LEFTPADDING", (0, 0), (-1, -1), 14),
                ("RIGHTPADDING", (0, 0), (-1, -1), 14),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ]),
        ),
        Spacer(1, 18),
        Table(
            [[
                Paragraph("<b>Authorized Signature</b><br/>______________________", seal_style),
            ]],
            colWidths=[208 * mm],
            style=TableStyle([
                ("LEFTPADDING", (0, 0), (-1, -1), 14),
                ("RIGHTPADDING", (0, 0), (-1, -1), 14),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ]),
        ),
        Spacer(1, 8),
        Paragraph("ETHSL Academic Team", issued_style),
    ]

    return content

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

        response=HttpResponse(content_type='application/pdf')

        response['Content-Disposition'] = (
            f'attachment; filename=certificate_{certificate.certificate_id}.pdf'
        )

        doc = SimpleDocTemplate(
            response,
            pagesize=landscape(A4),
            leftMargin=24 * mm,
            rightMargin=24 * mm,
            topMargin=28 * mm,
            bottomMargin=26 * mm,
        )

        doc.build(
            build_certificate_story(certificate),
            onFirstPage=draw_certificate_background,
            onLaterPages=draw_certificate_background,
        )

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
