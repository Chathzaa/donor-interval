"""Build the EC8204 project presentation."""

from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt


GROUP = "40"
MEMBERS = ["Member 1", "Member 2", "Member 3"]
OUTPUT = Path(__file__).with_name(f"GP_{GROUP}_DonorInterval.pptx")

NAVY = RGBColor(25, 48, 72)
BLUE = RGBColor(27, 91, 151)
PALE_BLUE = RGBColor(234, 242, 249)
TEXT = RGBColor(47, 58, 70)
MUTED = RGBColor(97, 111, 124)
LINE = RGBColor(213, 222, 230)
WHITE = RGBColor(255, 255, 255)
AMBER = RGBColor(153, 93, 22)

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)


def rectangle(slide, x, y, w, h, fill=WHITE, border=LINE):
    shape = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill
    if border is None:
        shape.line.fill.background()
    else:
        shape.line.color.rgb = border
    return shape


def label(slide, value, x, y, w, h, size=18, color=TEXT, bold=False,
          align=PP_ALIGN.LEFT):
    shape = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    frame = shape.text_frame
    frame.word_wrap = True
    frame.margin_left = frame.margin_right = Inches(0.02)
    frame.margin_top = frame.margin_bottom = Inches(0.01)
    paragraph = frame.paragraphs[0]
    paragraph.text = value
    paragraph.font.name = "Aptos"
    paragraph.font.size = Pt(size)
    paragraph.font.bold = bold
    paragraph.font.color.rgb = color
    paragraph.alignment = align
    return shape


def base(number):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = WHITE
    rectangle(slide, 0, 0, 13.333, 0.13, BLUE, None)
    label(slide, "EC8204  |  BLOCKCHAIN AND CYBER SECURITY", .7, .31, 8.5, .3,
          11, BLUE, True)
    rectangle(slide, .7, 7.02, 11.9, .012, LINE, None)
    label(slide, "GROUP 40  |  DONORINTERVAL", .72, 7.08, 6, .23,
          9, MUTED)
    label(slide, str(number), 12.0, 7.08, .55, .23, 9, MUTED,
          align=PP_ALIGN.RIGHT)
    return slide


# Slide 1: problem and team.
s = base(1)
label(s, "DonorInterval", .72, 1.28, 11.6, .78, 38, NAVY, True)
label(s, "Blockchain-based blood donation interval registry", .75, 2.16,
      11.5, .5, 24, BLUE)
rectangle(s, .75, 3.03, 11.6, .025, LINE, None)
label(s, "Problem", .75, 3.43, 1.5, .4, 17, NAVY, True)
label(s, "A blood bank may not see a recent donation recorded by another participating bank.",
      2.35, 3.4, 9.5, .9, 21, TEXT)
label(s, "Group 40", .75, 5.12, 2.5, .38, 16, NAVY, True)
label(s, "   |   ".join(MEMBERS), .75, 5.62, 11.8, .45, 18, TEXT)
label(s, "Source: github.com/Chathzaa/donor-interval", .75, 6.33, 11.8, .32, 13, MUTED)


# Slide 2: system design.
s = base(2)
label(s, "System design", .72, .86, 11.8, .6, 29, NAVY, True)
steps = [
    ("BANK A", "Signs a transaction for a fictional donor code."),
    ("SMART CONTRACT", "Checks bank access and the recorded interval."),
    ("BANK B", "Reads the same history before submitting a record."),
]
for index, (title, description) in enumerate(steps):
    x = .75 + index * 4.2
    rectangle(s, x, 1.87, 3.7, 1.9, PALE_BLUE, LINE)
    label(s, title, x + .23, 2.13, 3.25, .36, 16, BLUE, True)
    label(s, description, x + .23, 2.67, 3.2, .86, 17, TEXT)
label(s, "→", 4.52, 2.53, .36, .55, 29, BLUE, True)
label(s, "→", 8.73, 2.53, .36, .55, 29, BLUE, True)
rectangle(s, .75, 4.37, 11.9, 1.45, WHITE, LINE)
label(s, "Contract rule", 1.01, 4.6, 2.1, .38, 16, NAVY, True)
label(s, "A second record for the same code is rejected within 124 days.",
      3.12, 4.57, 9.1, .55, 19, TEXT)
label(s, "The code is hashed before submission. Identity and medical data stay off-chain.",
      .77, 6.26, 11.8, .42, 14, MUTED)
label(s, "Interval reference: Sri Lanka National Blood Transfusion Service (nbts.health.gov.lk)",
      .77, 6.69, 11.8, .25, 10, MUTED)


# Slide 3: evidence and limits.
s = base(3)
label(s, "Results and limitations", .72, .86, 11.8, .6, 29, NAVY, True)
rectangle(s, .75, 1.82, 5.75, 4.32, PALE_BLUE, LINE)
label(s, "8 passing tests", 1.03, 2.08, 5.15, .55, 24, BLUE, True)
label(s, "• First donation recorded with a timestamp\n"
      "• Early second record blocked across banks\n"
      "• Unauthorized or revoked bank blocked\n"
      "• Later record accepted after simulated time",
      1.03, 2.91, 5.15, 2.8, 18, TEXT)
rectangle(s, 6.8, 1.82, 5.8, 4.32, WHITE, LINE)
label(s, "Important limits", 7.1, 2.08, 5.1, .5, 22, NAVY, True)
label(s, "• Only records on this contract are checked.\n"
      "• A known code can link public records.\n"
      "• Clinical staff decide donor eligibility.",
      7.1, 2.92, 5.1, 2.5, 18, TEXT)
label(s, "The 124-day rule is a fixed demonstration approximation, not a clinical decision.",
      .78, 6.42, 11.9, .35, 13, AMBER)

prs.save(OUTPUT)
print(OUTPUT)
