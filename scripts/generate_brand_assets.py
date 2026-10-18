from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math

ROOT = Path(__file__).resolve().parents[1]
RES = ROOT / "android/app/src/main/res"
BG = "#10201D"
SPLASH_BG = "#121316"
EMERALD = "#4FC69A"
GOLD = "#D7BE79"
PAPER = "#F7F4EA"
PAPER_DARK = "#E9E2CF"
INK = "#52776A"


def draw_mark(size: int, background: str | None) -> Image.Image:
    scale = 4
    canvas = Image.new("RGBA", (size * scale, size * scale), background or (0, 0, 0, 0))
    d = ImageDraw.Draw(canvas)

    def p(value: float) -> int:
        return round(value * size / 108 * scale)

    if background:
        d.rounded_rectangle((p(2), p(2), p(106), p(106)), radius=p(26), outline="#34564B", width=p(1.2))
        # Subtle eight-point ornament, kept away from the adaptive icon mask edge.
        cx, cy, outer, inner = p(54), p(54), p(43), p(40)
        points = []
        for index in range(16):
            angle = -math.pi / 2 + index * math.pi / 8
            radius = outer if index % 2 == 0 else inner
            points.append((cx + radius * math.cos(angle), cy + radius * math.sin(angle)))
        d.polygon(points, outline="#28443B", width=p(0.8))

    # Mihrab arch.
    d.arc((p(24), p(18), p(84), p(78)), 180, 360, fill=GOLD, width=p(4))
    d.line((p(24), p(48), p(24), p(78)), fill=GOLD, width=p(4))
    d.line((p(84), p(48), p(84), p(78)), fill=GOLD, width=p(4))

    # Open Quran, with two gently curved page shapes.
    d.polygon([(p(33),p(45)), (p(39),p(42)), (p(48),p(44)), (p(54),p(48)), (p(54),p(75)), (p(47),p(70)), (p(39),p(69)), (p(33),p(72))], fill=PAPER)
    d.polygon([(p(75),p(45)), (p(69),p(42)), (p(60),p(44)), (p(54),p(48)), (p(54),p(75)), (p(61),p(70)), (p(69),p(69)), (p(75),p(72))], fill=PAPER_DARK)
    d.line((p(40),p(52),p(48),p(54)), fill=INK, width=p(1.6))
    d.line((p(40),p(60),p(48),p(62)), fill=INK, width=p(1.6))
    d.line((p(68),p(52),p(60),p(54)), fill=INK, width=p(1.6))
    d.line((p(68),p(60),p(60),p(62)), fill=INK, width=p(1.6))
    d.polygon([(p(54),p(12)),(p(56),p(16)),(p(60),p(18)),(p(56),p(20)),(p(54),p(24)),(p(52),p(20)),(p(48),p(18)),(p(52),p(16))], fill=GOLD)
    return canvas.resize((size, size), Image.Resampling.LANCZOS)


for density, size in {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}.items():
    directory = RES / f"mipmap-{density}"
    directory.mkdir(parents=True, exist_ok=True)
    icon = draw_mark(size, BG)
    icon.save(directory / "ic_launcher.png", optimize=True)
    icon.save(directory / "ic_launcher_round.png", optimize=True)
    for stale_format in ("ic_launcher.webp", "ic_launcher_round.webp"):
        stale_icon = directory / stale_format
        if stale_icon.exists():
            stale_icon.unlink()

for size in (108, 162, 216, 324, 432):
    density = {108:"mdpi",162:"hdpi",216:"xhdpi",324:"xxhdpi",432:"xxxhdpi"}[size]
    draw_mark(size, None).save(RES / f"mipmap-{density}" / "ic_launcher_foreground.png", optimize=True)

icon_preview = draw_mark(512, BG)
icon_preview.save(ROOT / "public/app_logo.png", optimize=True)
icon_preview.save(ROOT / "public/app_icon.png", optimize=True)

mark = draw_mark(300, None)
for resource in [RES / "drawable"] + sorted(RES.glob("drawable-*")):
    splash = Image.new("RGB", (1080, 1920), SPLASH_BG)
    splash.alpha_composite(mark, ((1080 - 300) // 2, (1920 - 300) // 2 - 90)) if splash.mode == "RGBA" else None
    # Paste through alpha compositing while retaining the opaque launch canvas.
    layer = Image.new("RGBA", splash.size, (0, 0, 0, 0))
    layer.alpha_composite(mark, ((1080 - 300) // 2, (1920 - 300) // 2 - 90))
    splash = Image.alpha_composite(splash.convert("RGBA"), layer)
    d = ImageDraw.Draw(splash)
    font_path = Path(r"C:\Windows\Fonts\segoeui.ttf")
    try:
        font = ImageFont.truetype(str(font_path), 52)
    except OSError:
        font = ImageFont.load_default()
    label = "AyahFlow"
    bounds = d.textbbox((0, 0), label, font=font, stroke_width=0)
    x = (1080 - (bounds[2] - bounds[0])) // 2
    d.text((x, 1110), label, font=font, fill="#F5F5F2", stroke_width=0)
    resource.mkdir(parents=True, exist_ok=True)
    splash.save(resource / "splash.png", optimize=True)
