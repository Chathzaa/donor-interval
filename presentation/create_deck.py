"""Build the Group 40 DonorInterval presentation."""

from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt


GROUP = "40"
MEMBERS = ["Member 1", "Member 2", "Member 3"]
OUTPUT = Path(__file__).with_name(f"GP_{GROUP}_DonorInterval.pptx")

BACKGROUND = RGBColor(248, 250, 251)
WHITE = RGBColor(255, 255, 255)
NAVY = RGBColor(22, 48, 69)
BLUE = RGBColor(28, 84, 132)
TEAL = RGBColor(21, 126, 116)
PALE_TEAL = RGBColor(232, 245, 242)
PALE_BLUE = RGBColor(232, 240, 248)
PALE_SAND = RGBColor(249, 244, 235)
INK = RGBColor(42, 58, 72)
MUTED = RGBColor(102, 118, 132)
LINE = RGBColor(215, 224, 231)
AMBER = RGBColor(151, 96, 30)

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)


def rect(slide, x, y, width, height, fill=WHITE, border=None):
    shape = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(width), Inches(height)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill
    if border is None:
        shape.line.fill.background()
    else:
        shape.line.color.rgb = border
    return shape


def circle(slide, x, y, diameter, fill):
    shape = slide.shapes.add_shape(
        MSO_SHAPE.OVAL, Inches(x), Inches(y), Inches(diameter), Inches(diameter)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill
    shape.line.fill.background()
    return shape


def text(slide, value, x, y, width, height, size=18, color=INK,
         bold=False, align=PP_ALIGN.LEFT):
    shape = slide.shapes.add_textbox(
        Inches(x), Inches(y), Inches(width), Inches(height)
    )
    frame = shape.text_frame
    frame.word_wrap = True
    frame.margin_left = frame.margin_right = Inches(0.02)
    frame.margin_top = frame.margin_bottom = Inches(0.01)
    paragraph = frame.paragraphs[0]
    paragraph.text = value
    paragraph.font.name = "Segoe UI"
    paragraph.font.size = Pt(size)
    paragraph.font.bold = bold
    paragraph.font.color.rgb = color
    paragraph.alignment = align
    return shape


def slide(number, section):
    result = prs.slides.add_slide(prs.slide_layouts[6])
    result.background.fill.solid()
    result.background.fill.fore_color.rgb = BACKGROUND
    rect(result, 0, 0, .13, 7.5, TEAL)
    text(result, "EC8204  /  BLOCKCHAIN AND CYBER SECURITY", .73, .35,
         8, .27, 10, BLUE, True)
    text(result, section.upper(), 10.3, .35, 2.3, .27, 10, MUTED, True,
         PP_ALIGN.RIGHT)
    rect(result, .75, 6.93, 11.85, .015, LINE)
    text(result, "GROUP 40 · DONORINTERVAL", .76, 7.04, 5.8, .23,
         9, MUTED)
    text(result, f"{number:02d} / 03", 11.8, 7.04, .8, .23,
         9, MUTED, align=PP_ALIGN.RIGHT)
    return result


# Slide 1 — the problem.
s = slide(1, "Introduction")
text(s, "DonorInterval", .78, 1.25, 7.3, .8, 44, NAVY, True)
text(s, "Blood donation interval registry", .82, 2.16, 7.4, .47,
     24, BLUE)
rect(s, .82, 3.02, .8, .045, TEAL)
text(s, "A shared record of donation timing for participating blood banks.",
     .82, 3.41, 7.0, 1.12, 22, INK)
text(s, "GROUP 40", .82, 5.26, 2.2, .33, 14, TEAL, True)
text(s, "   |   ".join(MEMBERS), .82, 5.72, 7.6, .4, 17, NAVY)
rect(s, 8.72, 1.17, 3.85, 4.98, PALE_BLUE)
text(s, "THE PROBLEM", 9.04, 1.62, 3.15, .35, 15, BLUE, True)
rect(s, 9.04, 2.22, .48, .035, TEAL)
text(s, "A recent donation may be visible at one bank but absent from another bank's records.",
     9.04, 2.55, 3.0, 2.45, 21, NAVY)
text(s, "Source code: github.com/Chathzaa/donor-interval", .82, 6.47,
     10.8, .28, 11, MUTED)


# Slide 2 — the system.
s = slide(2, "Design")
text(s, "One record, visible to both banks", .78, .99, 11.7, .55,
     29, NAVY, True)
text(s, "The rule is checked by the smart contract, not by a single bank's interface.",
     .8, 1.59, 11.7, .42, 16, MUTED)
nodes = [
    ("01", "BANK A", "Signs the first donation record in MetaMask."),
    ("02", "SMART CONTRACT", "Stores a timestamp and checks the interval."),
    ("03", "BANK B", "Reads that record before another submission."),
]
for index, (number, title, description) in enumerate(nodes):
    x = .82 + index * 4.15
    rect(s, x, 2.42, 3.55, 2.20, WHITE, LINE)
    circle(s, x + .25, 2.68, .55, PALE_TEAL)
    text(s, number, x + .29, 2.83, .46, .22, 11, TEAL, True,
         PP_ALIGN.CENTER)
    text(s, title, x + .98, 2.75, 2.35, .34, 16, BLUE, True)
    text(s, description, x + .28, 3.39, 2.98, .91, 18, INK)
text(s, "→", 4.45, 3.15, .35, .55, 27, TEAL, True)
text(s, "→", 8.61, 3.15, .35, .55, 27, TEAL, True)
rect(s, .82, 5.02, 11.85, 1.11, NAVY)
text(s, "124 days", 1.12, 5.28, 2.3, .54, 25, WHITE, True)
text(s, "Fixed interval before another record for the same code",
     3.35, 5.32, 8.7, .45, 18, WHITE)
text(s, "Only a hash of the random code is submitted. Names and medical details remain off-chain.",
     .84, 6.42, 11.65, .28, 12, MUTED)


# Slide 3 — evidence and honest scope.
s = slide(3, "Results")
text(s, "What the prototype demonstrates", .78, .98, 11.7, .56,
     29, NAVY, True)
rect(s, .82, 1.85, 4.55, 4.43, PALE_TEAL)
text(s, "8 / 8", 1.13, 2.19, 3.95, .95, 47, TEAL, True)
text(s, "contract tests passing", 1.17, 3.16, 3.88, .5,
     18, NAVY, True)
rect(s, 1.16, 3.85, 3.72, .016, LINE)
text(s, "First record accepted\nEarly second record rejected\nBank authorization enforced",
     1.16, 4.17, 3.83, 1.65, 17, INK)
rect(s, 5.66, 1.85, 7.01, 4.43, WHITE, LINE)
text(s, "Scope and limitations", 6.01, 2.18, 6.26, .45,
     21, BLUE, True)
text(s, "This checks records on this contract only.", 6.02, 2.95,
     6.1, .43, 18, INK)
text(s, "A disclosed code can link public records.", 6.02, 3.70,
     6.1, .43, 18, INK)
text(s, "Clinical staff still decide donor eligibility.", 6.02, 4.45,
     6.1, .43, 18, INK)
rect(s, 6.01, 5.28, 5.97, .03, TEAL)
text(s, "The 124-day rule is a fixed demonstration approximation.",
     6.02, 5.51, 6.1, .44, 13, AMBER)
text(s, "Interval reference: Sri Lanka National Blood Transfusion Service · nbts.health.gov.lk",
     .84, 6.52, 11.7, .26, 10, MUTED)

prs.save(OUTPUT)
print(OUTPUT)
