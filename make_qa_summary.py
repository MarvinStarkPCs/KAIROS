from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus.flowables import Flowable

W, H = letter

NAVY         = colors.HexColor("#1E3A5F")
WHITE        = colors.white
GRAY_BG      = colors.HexColor("#F5F5F5")
GRAY_LINE    = colors.HexColor("#DDDDDD")
RED_LIGHT    = colors.HexColor("#FDDEDE")
ORANGE_LIGHT = colors.HexColor("#FEE9D0")
YELLOW_LIGHT = colors.HexColor("#FFF9CC")
ORANGE_ACC   = colors.HexColor("#FF8C00")
RED_ACC      = colors.HexColor("#D9534F")
TEXT_DARK    = colors.HexColor("#1A1A2E")
TEXT_MID     = colors.HexColor("#444444")

def sty(name, **kw):
    return ParagraphStyle(name, **kw)

BODY = sty("body", fontName="Helvetica",      fontSize=8.2, leading=12, textColor=TEXT_MID, spaceAfter=2)
TAG  = sty("tag",  fontName="Helvetica",      fontSize=7.8, leading=11, textColor=NAVY)
FOOT = sty("foot", fontName="Helvetica",      fontSize=7,   leading=9,  textColor=TEXT_MID, alignment=TA_CENTER)

class Header(Flowable):
    def __init__(self, width):
        super().__init__()
        self.width  = width
        self.height = 68

    def draw(self):
        c = self.canv
        c.setFillColor(NAVY)
        c.rect(0, 0, self.width, self.height, fill=1, stroke=0)
        c.setFillColor(ORANGE_ACC)
        c.rect(0, 0, 5, self.height, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 15)
        c.drawString(16, self.height - 26, "QA Summary Report — Pre-Launch Review")
        c.setFont("Helvetica", 8)
        c.setFillColor(colors.HexColor("#B0C4DE"))
        meta = "Project: KAIROS   |   Tester: Marvin Eduardo Santos Perez   |   Date: April 8, 2025   |   Phase: Pre-Launch Final"
        c.drawString(16, self.height - 44, meta)
        c.setStrokeColor(ORANGE_ACC)
        c.setLineWidth(2)
        c.line(0, 2, self.width, 2)

class SectionHeader(Flowable):
    def __init__(self, text, width):
        super().__init__()
        self.text   = text
        self.width  = width
        self.height = 17

    def draw(self):
        c = self.canv
        c.setFillColor(GRAY_BG)
        c.rect(0, 0, self.width, self.height, fill=1, stroke=0)
        c.setFillColor(NAVY)
        c.rect(0, 0, 3, self.height, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 8.5)
        c.setFillColor(NAVY)
        c.drawString(10, 5, self.text)

class ReadinessBanner(Flowable):
    def __init__(self, width):
        super().__init__()
        self.width  = width
        self.height = 36

    def draw(self):
        c = self.canv
        c.setFillColor(ORANGE_ACC)
        c.roundRect(0, 4, self.width, self.height - 4, 4, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 13)
        c.setFillColor(WHITE)
        c.drawCentredString(self.width / 2, 16, "WARNING   READY WITH FIXES")

OUTPUT = r"C:\Users\Lemon Lab Electronic\Desktop\sample-qa-summary.pdf"
MARGIN = 0.45 * inch
CW     = W - 2 * MARGIN

doc = SimpleDocTemplate(
    OUTPUT, pagesize=letter,
    leftMargin=MARGIN, rightMargin=MARGIN,
    topMargin=MARGIN, bottomMargin=0.45 * inch,
)

story = []
story.append(Header(CW))
story.append(Spacer(1, 8))

# ── 1 · OVERVIEW ─────────────────────────────────────────────────────────────
story.append(SectionHeader("1 · OVERVIEW", CW))
story.append(Spacer(1, 4))
story.append(Paragraph(
    "A comprehensive manual QA review was conducted across all core modules of <b>KAIROS</b>, "
    "an academic program management system built for a music education institution, prior to its "
    "public launch. Testing covered functional behavior, user flows (enrollment, payments, attendance, "
    "grading), cross-browser compatibility, mobile responsiveness, and edge cases. "
    "A total of <b>11 bugs</b> were identified, including <b>3 critical issues</b> — one of which "
    "blocks the entire student enrollment flow and must be resolved before go-live. "
    "The platform demonstrates a solid architecture but requires targeted fixes to ensure a stable "
    "and trustworthy launch experience.", BODY))
story.append(Spacer(1, 6))

# ── 2 · TEST COVERAGE ────────────────────────────────────────────────────────
story.append(SectionHeader("2 · TEST COVERAGE", CW))
story.append(Spacer(1, 4))

coverage = [
    ("Matricula Publica (/matricula)",         "Portal Profesor (grupos, asistencia, actividades)"),
    ("Flujo de Pago Wompi (sandbox)",          "Calificaciones y Avance Academico"),
    ("Autenticacion y recuperacion de cuenta", "Control de Asistencia y filtros"),
    ("Gestion de Usuarios y roles",            "Reportes de Pagos y exportacion CSV"),
]

cov_rows = []
for left, right in coverage:
    cov_rows.append([
        Paragraph(f'<font color="#28A745"><b>&#10003;</b></font>  {left}', TAG),
        Paragraph(f'<font color="#28A745"><b>&#10003;</b></font>  {right}', TAG),
    ])

cov_table = Table(cov_rows, colWidths=[CW * 0.5, CW * 0.5])
cov_table.setStyle(TableStyle([
    ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ("TOPPADDING",    (0, 0), (-1, -1), 3),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ("LEFTPADDING",   (0, 0), (-1, -1), 4),
    ("ROWBACKGROUNDS",(0, 0), (-1, -1), [GRAY_BG, WHITE]),
]))
story.append(cov_table)
story.append(Spacer(1, 6))

# ── 3 · FINDINGS SUMMARY ─────────────────────────────────────────────────────
story.append(SectionHeader("3 · FINDINGS SUMMARY", CW))
story.append(Spacer(1, 4))

def fp(text, bold=False, color=TEXT_DARK, size=8.2, align=TA_CENTER):
    fn = "Helvetica-Bold" if bold else "Helvetica"
    return Paragraph(text, ParagraphStyle("_", fontName=fn, fontSize=size,
                     textColor=color, alignment=align, leading=11))

findings_data = [
    [fp("Severity", bold=True, color=WHITE), fp("Count", bold=True, color=WHITE), fp("% of Total", bold=True, color=WHITE)],
    [fp("Critical"), fp("3"), fp("27%")],
    [fp("Major"),    fp("5"), fp("45%")],
    [fp("Minor"),    fp("3"), fp("27%")],
    [fp("Total", bold=True, color=NAVY), fp("11", bold=True, color=NAVY), fp("100%", bold=True, color=NAVY)],
]
CW3 = CW * 0.55
ft = Table(findings_data, colWidths=[CW3 * 0.4, CW3 * 0.3, CW3 * 0.3])
ft.setStyle(TableStyle([
    ("BACKGROUND",    (0, 0), (-1, 0), NAVY),
    ("BACKGROUND",    (0, 1), (-1, 1), RED_LIGHT),
    ("BACKGROUND",    (0, 2), (-1, 2), ORANGE_LIGHT),
    ("BACKGROUND",    (0, 3), (-1, 3), YELLOW_LIGHT),
    ("BACKGROUND",    (0, 4), (-1, 4), GRAY_BG),
    ("GRID",          (0, 0), (-1, -1), 0.5, GRAY_LINE),
    ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ("TOPPADDING",    (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ("LEFTPADDING",   (0, 0), (-1, -1), 8),
]))
story.append(ft)
story.append(Spacer(1, 6))

# ── 4 · TOP 3 CRITICAL ISSUES ────────────────────────────────────────────────
story.append(SectionHeader("4 · TOP 3 CRITICAL ISSUES", CW))
story.append(Spacer(1, 4))

criticals = [
    ("BUG-001", "Public enrollment form crashes with accented characters in student name",
     "Names with accents or apostrophes (very common in the target user base) trigger a 500 server error at /matricula. No enrollment record is created, blocking all new student registrations."),
    ("BUG-002", "Wompi webhook does not update enrollment status after successful payment",
     "After completing payment, enrollment remains in 'waiting' status indefinitely. The /webhook/wompi endpoint fails silently. Admins must manually update every enrollment, making the payment flow non-functional at scale."),
    ("BUG-003", "Password reset link is invalid immediately after it is sent",
     "Users who forget their password receive a reset email but the link is already expired when clicked. No account recovery path exists, locking users out permanently unless an admin intervenes."),
]

crit_rows = []
for i, (bug_id, title, desc) in enumerate(criticals):
    p = Paragraph(
        f'<font color="#D9534F"><b>{i+1}. {bug_id}</b></font> — <b>{title}</b><br/>'
        f'<font color="#555555">{desc}</font>',
        ParagraphStyle("ci", fontName="Helvetica", fontSize=7.8, leading=11, textColor=TEXT_DARK)
    )
    crit_rows.append([p])

ct = Table(crit_rows, colWidths=[CW])
ct.setStyle(TableStyle([
    ("LEFTPADDING",   (0, 0), (-1, -1), 10),
    ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
    ("TOPPADDING",    (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ("LINEBEFORE",    (0, 0), (-1, -1), 3, RED_ACC),
    ("ROWBACKGROUNDS",(0, 0), (-1, -1), [WHITE, RED_LIGHT]),
]))
story.append(ct)
story.append(Spacer(1, 6))

# ── 5 · TOP 5 UX ISSUES ──────────────────────────────────────────────────────
story.append(SectionHeader("5 · TOP 5 UX ISSUES", CW))
story.append(Spacer(1, 4))

ux_issues = [
    ("BUG-009", "Failed login shows raw English message 'These credentials do not match our records' — the app is in Spanish."),
    ("BUG-007", "Teacher portal hamburger menu covers the entire screen on mobile, blocking group cards."),
    ("BUG-008", "Deleting an enrollment has no confirmation dialog — irreversible action with no undo."),
    ("BUG-010", "Guardar Asistencia button stays active during submission — double-clicks create duplicate records."),
    ("BUG-011", "Student grades page shows 'NaN%' when no activities have been evaluated — confuses students."),
]

ux_rows = []
for i, (bug_id, desc) in enumerate(ux_issues):
    p = Paragraph(
        f'<font color="#FF8C00"><b>{i+1}. {bug_id}</b></font> — {desc}',
        ParagraphStyle("ux", fontName="Helvetica", fontSize=7.8, leading=11, textColor=TEXT_DARK)
    )
    ux_rows.append([p])

ut = Table(ux_rows, colWidths=[CW])
ut.setStyle(TableStyle([
    ("LEFTPADDING",   (0, 0), (-1, -1), 10),
    ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
    ("TOPPADDING",    (0, 0), (-1, -1), 3),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ("LINEBEFORE",    (0, 0), (-1, -1), 3, ORANGE_ACC),
    ("ROWBACKGROUNDS",(0, 0), (-1, -1), [WHITE, ORANGE_LIGHT]),
]))
story.append(ut)
story.append(Spacer(1, 6))

# ── 6 · LAUNCH READINESS ─────────────────────────────────────────────────────
story.append(SectionHeader("6 · LAUNCH READINESS", CW))
story.append(Spacer(1, 4))
story.append(ReadinessBanner(CW))
story.append(Spacer(1, 4))
story.append(Paragraph(
    "All 3 critical bugs must be resolved before go-live — BUG-001 and BUG-002 directly block "
    "the core enrollment and payment flow. Major and minor issues may be addressed in a first "
    "post-launch patch within 48 hours of deployment.",
    ParagraphStyle("cap", fontName="Helvetica-Oblique", fontSize=7.5, leading=10,
                   textColor=TEXT_MID, alignment=TA_CENTER)
))
story.append(Spacer(1, 6))

# ── 7 · RECOMMENDATIONS ──────────────────────────────────────────────────────
story.append(SectionHeader("7 · RECOMMENDATIONS", CW))
story.append(Spacer(1, 4))

recs = [
    "Fix BUG-001 and BUG-002 immediately — they block the entire enrollment and payment flow.",
    "Test the Wompi webhook in sandbox with all transaction states (approved, declined, voided).",
    "Add server-side input sanitization for all text fields in the enrollment form.",
    "Disable submit buttons during async requests to prevent duplicate submissions (BUG-010).",
    "Replace all raw English error messages with Spanish user-friendly copy throughout the app.",
    "Conduct a dedicated mobile pass on the Teacher Portal for screens under 400px.",
    "Add a 'Sin datos' fallback state wherever percentages or averages can result in NaN.",
]

rec_style = ParagraphStyle("rec", fontName="Helvetica", fontSize=7.8, leading=11,
                            textColor=TEXT_DARK, leftIndent=10)

rec_rows = [[Paragraph(f'<font color="#1E3A5F"><b>&#8226;</b></font>  {r}', rec_style)] for r in recs]
rt = Table(rec_rows, colWidths=[CW])
rt.setStyle(TableStyle([
    ("LEFTPADDING",   (0, 0), (-1, -1), 8),
    ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
    ("TOPPADDING",    (0, 0), (-1, -1), 2),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ("ROWBACKGROUNDS",(0, 0), (-1, -1), [WHITE, GRAY_BG]),
]))
story.append(rt)

story.append(Spacer(1, 8))
story.append(HRFlowable(width=CW, thickness=1, color=GRAY_LINE))
story.append(Spacer(1, 4))
story.append(Paragraph(
    "Prepared by Marvin Eduardo Santos Perez  &#8212;  Manual QA Review  &#8212;  April 2025  &#8212;  Confidential",
    FOOT
))

doc.build(story)
print("OK")
