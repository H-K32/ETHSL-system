from django.http import HttpResponse
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from reportlab.platypus import (
    SimpleDocTemplate,
    Spacer,
    Paragraph,
    Table,
    TableStyle,
    KeepTogether
)
from reportlab.lib import styles, colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm

from .models import Certificate


CERTIFICATE_FONT_NAME = "Ebrima"
CERTIFICATE_FONT_BOLD_NAME = "Ebrima-Bold"


def register_certificate_fonts():
    for font_name, font_path in (
        (CERTIFICATE_FONT_NAME, r"C:\Windows\Fonts\ebrima.ttf"),
        (CERTIFICATE_FONT_BOLD_NAME, r"C:\Windows\Fonts\ebrimabd.ttf"),
    ):
        if font_name in pdfmetrics.getRegisteredFontNames():
            continue

        try:
            pdfmetrics.registerFont(TTFont(font_name, font_path))
        except Exception:
            continue


register_certificate_fonts()


def certificate_text_font(is_bold=False):
    if is_bold and CERTIFICATE_FONT_BOLD_NAME in pdfmetrics.getRegisteredFontNames():
        return CERTIFICATE_FONT_BOLD_NAME

    if CERTIFICATE_FONT_NAME in pdfmetrics.getRegisteredFontNames():
        return CERTIFICATE_FONT_NAME

    return "Helvetica-Bold" if is_bold else "Helvetica"


def get_level_display_name(certificate):
    level = getattr(certificate, "level", None)
    if not level:
        return "Level"
    try:
        # Keep the Amharic display but show the English tier (Beginner/Intermediate/Advanced)
        amharic = level.get_name_display() or level.name

        # Determine first/last level by order
        from courses.models import Level as CourseLevel

        levels = list(CourseLevel.objects.order_by('order'))
        if not levels:
            return amharic

        first_id = levels[0].id
        last_id = levels[-1].id

        if level.id == first_id:
            eng = "Beginner"
        elif level.id == last_id:
            eng = "Advanced"
        else:
            eng = "Intermediate"

        # Return only the English tier label (no Amharic) to avoid rendering issues
        return eng
    except Exception:
        return level.name or "Level"


def draw_certificate_background(canvas, doc):
    """Certificate background with footer outside border"""

    width, height = landscape(A4)

    canvas.saveState()

    # Background
    canvas.setFillColor(colors.HexColor("#F8FAFC"))
    canvas.rect(0, 0, width, height, stroke=0, fill=1)

    # Outer border — use app primary indigo to match frontend aesthetic
    canvas.setStrokeColor(colors.HexColor("#4F46E5"))
    canvas.setLineWidth(3)
    canvas.roundRect(
        15 * mm,
        15 * mm,
        width - 30 * mm,
        height - 30 * mm,
        15,
        stroke=1,
        fill=0
    )

    # Inner border — darker indigo to match certificate visuals
    canvas.setStrokeColor(colors.HexColor("#003380"))
    canvas.setLineWidth(1.2)
    canvas.roundRect(
        20 * mm,
        20 * mm,
        width - 40 * mm,
        height - 40 * mm,
        10,
        stroke=1,
        fill=0
    )

    # Decorative top line
    canvas.setStrokeColor(colors.HexColor("#0052CC"))
    canvas.setLineWidth(1.5)

    canvas.line(
        35 * mm,
        height - 58 * mm,
        width - 35 * mm,
        height - 58 * mm
    )

    # Decorative bottom line
    canvas.line(
        35 * mm,
        25 * mm,
        width - 35 * mm,
        25 * mm
    )

    # Corner decorations
    corner_offset = 25 * mm
    corner_size = 8 * mm

    canvas.setStrokeColor(colors.HexColor("#003380"))
    canvas.setLineWidth(2)

    # Top-left
    canvas.line(
        corner_offset,
        height - corner_offset,
        corner_offset + corner_size,
        height - corner_offset
    )

    canvas.line(
        corner_offset,
        height - corner_offset,
        corner_offset,
        height - corner_offset - corner_size
    )

    # Top-right
    canvas.line(
        width - corner_offset,
        height - corner_offset,
        width - corner_offset - corner_size,
        height - corner_offset
    )

    canvas.line(
        width - corner_offset,
        height - corner_offset,
        width - corner_offset,
        height - corner_offset - corner_size
    )

    # Bottom-left
    canvas.line(
        corner_offset,
        corner_offset,
        corner_offset + corner_size,
        corner_offset
    )

    canvas.line(
        corner_offset,
        corner_offset,
        corner_offset,
        corner_offset + corner_size
    )

    # Bottom-right
    canvas.line(
        width - corner_offset,
        corner_offset,
        width - corner_offset - corner_size,
        corner_offset
    )

    canvas.line(
        width - corner_offset,
        corner_offset,
        width - corner_offset,
        corner_offset + corner_size
    )

    # Footer text OUTSIDE border — use Times for consistent rendering
    canvas.setFont("Times-Roman", 8)
    canvas.setFillColor(colors.HexColor("#64748B"))

    canvas.drawCentredString(
        width / 2,
        10 * mm,
        "Ethiopian Sign Language Learning System"
    )

    canvas.drawCentredString(
        width / 2,
        6 * mm,
        "Empowering Communication Through Sign Language"
    )

    canvas.restoreState()


def build_certificate_story(certificate):

    style_sheet = styles.getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CertificateTitle",
        parent=style_sheet["Title"],
        # Use a built-in PDF font so it renders consistently on any machine
        fontName="Times-BoldItalic",
        fontSize=28,
        leading=30,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=16,
    )

    # Larger subtitle
    subtitle_style = ParagraphStyle(
        "CertificateSubtitle",
        parent=style_sheet["Heading2"],
        fontName="Times-Roman",
        fontSize=15,
        leading=20,
        alignment=TA_CENTER,
        # use app darker indigo for subtitle
        textColor=colors.HexColor("#003380"),
        spaceBefore=6,
        spaceAfter=8,
    )

    # Slightly smaller name
    name_style = ParagraphStyle(
        "RecipientName",
        parent=style_sheet["Heading1"],
        fontName="Times-Bold",
        fontSize=34,
        leading=36,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#1E293B"),
        spaceAfter=6,
        spaceBefore=2,
    )

    body_style = ParagraphStyle(
        "CertificateBody",
        parent=style_sheet["BodyText"],
        fontName="Times-Roman",
        fontSize=12,
        leading=18,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#334155"),
        spaceAfter=4,
    )

    detail_style = ParagraphStyle(
        "CertificateDetail",
        parent=style_sheet["BodyText"],
        fontName="Times-Bold",
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#0F172A"),
    )

    signature_style = ParagraphStyle(
        "SignatureText",
        parent=style_sheet["BodyText"],
        fontName="Times-Roman",
        fontSize=9,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#475569"),
    )

    seal_style = ParagraphStyle(
        "SealText",
        parent=style_sheet["BodyText"],
        fontName="Times-Bold",
        fontSize=10,
        leading=15,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#003380"),
    )

    issued_date = timezone.localtime(
        certificate.issued_at
    ).strftime("%d %B %Y")

    recipient_name = (
        certificate.learner.get_full_name().strip()
        or certificate.learner.username
    )

    content = [

        Spacer(1, 50),

        Paragraph(
            "CERTIFICATE OF COMPLETION",
            title_style
        ),

        Spacer(1, 30),

        Paragraph(
            "This certifies that",
            subtitle_style
        ),

        Spacer(1, 2),

        Paragraph(
            recipient_name,
            name_style
        ),

        Spacer(1, 6),

        # Bold and color the level name (e.g. Advanced) so it stands out
        Paragraph(
            f"Has successfully completed the "
            f"<font color='#4F46E5'><b>{get_level_display_name(certificate)}</b></font> level",
            body_style
        ),

        Spacer(1, 2),

        Paragraph(
            "and has demonstrated dedication to learning "
            "Ethiopian Sign Language",
            body_style
        ),

        Spacer(1, 20),

        KeepTogether(
            Table(
                [
                    [
                        Paragraph(
                            "<b>Certificate ID</b>",
                            detail_style
                        ),
                        Paragraph(
                            "<b>Issue Date</b>",
                            detail_style
                        ),
                    ],
                    [
                        Paragraph(
                            certificate.certificate_id,
                            detail_style
                        ),
                        Paragraph(
                            issued_date,
                            detail_style
                        ),
                    ]
                ],
                colWidths=[100 * mm, 100 * mm],
                style=TableStyle([

                    ("BACKGROUND",
                     (0, 0), (-1, 0),
                     colors.HexColor("#EEF2FF")),

                    ("TEXTCOLOR",
                     (0, 0), (-1, 0),
                     colors.HexColor("#4F46E5")),

                    ("FONTNAME",
                     (0, 0), (-1, 0),
                     certificate_text_font(is_bold=True)),

                    ("ALIGN",
                     (0, 0), (-1, -1),
                     "CENTER"),

                    ("VALIGN",
                     (0, 0), (-1, -1),
                     "MIDDLE"),

                    ("BOX",
                     (0, 0), (-1, -1),
                     1,
                     colors.HexColor("#C7D2FE")),

                    ("INNERGRID",
                     (0, 0), (-1, -1),
                     0.5,
                     colors.HexColor("#E0E7FF")),

                    ("TOPPADDING",
                     (0, 0), (-1, -1),
                     8),

                    ("BOTTOMPADDING",
                     (0, 0), (-1, -1),
                     8),

                ])
            )
        ),

        Spacer(1, 24),

        Table(
            [
                [
                    Paragraph(
                        "Authorized Signature",
                        signature_style
                    ),

                    Paragraph(
                        "Verified By",
                        signature_style
                    )
                ],

                [
                    Paragraph(
                        "_____________________",
                        seal_style
                    ),

                    Paragraph(
                        "<b>ETHSL Academic Team</b>",
                        seal_style
                    )
                ]
            ],
            colWidths=[100 * mm, 100 * mm],
            style=TableStyle([

                ("ALIGN",
                 (0, 0), (-1, -1),
                 "CENTER"),

                ("VALIGN",
                 (0, 0), (-1, -1),
                 "MIDDLE"),

                ("TOPPADDING",
                 (0, 0), (-1, -1),
                 6),

                ("BOTTOMPADDING",
                 (0, 0), (-1, -1),
                 6),
            ])
        ),

        Spacer(1, 15)
    ]

    return content


class DownloadCertificateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, certificate_id):

        try:
            certificate = Certificate.objects.get(
                id=certificate_id,
                learner=request.user
            )

        except Certificate.DoesNotExist:

            return HttpResponse(
                "Certificate not found",
                status=404
            )

        response = HttpResponse(
            content_type="application/pdf"
        )

        response["Content-Disposition"] = (
            f'attachment; filename='
            f'certificate_{certificate.certificate_id}.pdf'
        )

        doc = SimpleDocTemplate(
            response,
            pagesize=landscape(A4),
            leftMargin=25 * mm,
            rightMargin=25 * mm,
            topMargin=20 * mm,
            bottomMargin=20 * mm,
        )

        story = build_certificate_story(
            certificate
        )

        doc.build(
            story,
            onFirstPage=draw_certificate_background,
            onLaterPages=draw_certificate_background,
        )

        return response


class MyCertificatesView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:
            certificates = Certificate.objects.filter(
                learner=request.user
            ).order_by("-issued_at")
        except Exception as e:
            print(f"Error fetching certificates: {e}")
            return Response([])

        data = []

        for cert in certificates:
            try:
                level_name = cert.level.name if cert.level else "Unknown"
                level_display = cert.level.get_name_display() if cert.level else "Unknown"
            except Exception as e:
                print(f"Error accessing level for cert {cert.id}: {e}")
                level_name = "Unknown"
                level_display = "Unknown"

            data.append({
                "id": cert.id,
                "level": level_name,
                "level_display": level_display,
                "issued_at": cert.issued_at.isoformat(),
                "certificate_id": cert.certificate_id,
            })

        return Response(data) 