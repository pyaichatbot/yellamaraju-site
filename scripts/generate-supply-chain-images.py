#!/usr/bin/env python3
"""Generate blog images for supply chain attacks article."""

from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_DIR = "/Users/spy/Documents/PY/self/yellamaraju-site/public/images"

# Color palette
BG = "#0f172a"
BG_CARD = "#1e293b"
TEXT = "#e2e8f0"
TEXT_DIM = "#94a3b8"
RED = "#ef4444"
RED_BG = "#7f1d1d"
AMBER = "#f59e0b"
AMBER_BG = "#78350f"
BLUE = "#3b82f6"
BLUE_BG = "#1e3a5f"
GREEN = "#22c55e"
GREEN_BG = "#14532d"
PURPLE = "#a855f7"
PURPLE_BG = "#581c87"
BORDER = "#334155"

def get_font(size, bold=False):
    """Get a font, falling back to default if system fonts aren't available."""
    font_paths = [
        "/System/Library/Fonts/SFNSMono.ttf",
        "/System/Library/Fonts/Menlo.ttc",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/SFNS.ttf",
    ]
    if bold:
        font_paths = [
            "/System/Library/Fonts/SFNSMono.ttf",
            "/Library/Fonts/Arial Bold.ttf",
            "/System/Library/Fonts/SFNS.ttf",
        ] + font_paths

    for path in font_paths:
        try:
            return ImageFont.truetype(path, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def draw_rounded_rect(draw, xy, radius, fill=None, outline=None, width=1):
    """Draw a rounded rectangle."""
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def generate_trust_flow():
    """Generate the supply chain trust flow diagram."""
    W, H = 1200, 700
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    title_font = get_font(28, bold=True)
    label_font = get_font(18, bold=True)
    small_font = get_font(14)
    tiny_font = get_font(12)

    # Title
    draw.text((W // 2, 30), "How a Supply Chain Attack Breaks the Trust Chain",
              fill=TEXT, font=title_font, anchor="mt")

    # TOP ROW: Normal trust flow
    draw.text((W // 2, 80), "Normal Trust Flow", fill=GREEN, font=label_font, anchor="mt")

    boxes_top = [
        (80, 120, 260, 200, "Developer", "Writes code", GREEN_BG, GREEN),
        (320, 120, 500, 200, "Package\nRegistry", "PyPI / npm", GREEN_BG, GREEN),
        (560, 120, 740, 200, "CI / CD", "Builds & deploys", GREEN_BG, GREEN),
        (800, 120, 980, 200, "Production", "Runs in prod", GREEN_BG, GREEN),
    ]

    for x0, y0, x1, y1, label, sub, bg, border in boxes_top:
        draw_rounded_rect(draw, (x0, y0, x1, y1), 12, fill=bg, outline=border, width=2)
        draw.text(((x0+x1)//2, (y0+y1)//2 - 10), label, fill=TEXT, font=label_font, anchor="mm")
        draw.text(((x0+x1)//2, (y0+y1)//2 + 18), sub, fill=TEXT_DIM, font=tiny_font, anchor="mm")

    # Arrows
    for i in range(3):
        x_start = boxes_top[i][2] + 5
        x_end = boxes_top[i+1][0] - 5
        y_mid = 160
        draw.line([(x_start, y_mid), (x_end, y_mid)], fill=GREEN, width=2)
        draw.polygon([(x_end, y_mid), (x_end-10, y_mid-6), (x_end-10, y_mid+6)], fill=GREEN)

    # Check marks
    for x0, y0, x1, y1, _, _, _, _ in boxes_top:
        draw.text((x1-15, y0+8), "✓", fill=GREEN, font=small_font)

    # Divider
    draw.line([(40, 240), (W-40, 240)], fill=BORDER, width=1)

    # BOTTOM: Compromised flow
    draw.text((W // 2, 270), "Compromised Trust Flow", fill=RED, font=label_font, anchor="mt")

    boxes_bot = [
        (40, 310, 220, 420, "Attacker", "Steals maintainer\ncredentials", RED_BG, RED),
        (260, 310, 440, 420, "Package\nRegistry", "Malicious version\npublished", AMBER_BG, AMBER),
        (480, 310, 660, 420, "Developer\nMachine", "pip install\nnpm install", BLUE_BG, BLUE),
        (700, 310, 880, 420, "CI / CD\nPipeline", "Builds with\ncompromised pkg", BLUE_BG, BLUE),
        (920, 310, 1140, 420, "Attacker\nC2 Server", "Credentials\nexfiltrated", RED_BG, RED),
    ]

    for x0, y0, x1, y1, label, sub, bg, border in boxes_bot:
        draw_rounded_rect(draw, (x0, y0, x1, y1), 12, fill=bg, outline=border, width=2)
        draw.text(((x0+x1)//2, (y0+y1)//2 - 16), label, fill=TEXT, font=label_font, anchor="mm")
        draw.text(((x0+x1)//2, (y0+y1)//2 + 18), sub, fill=TEXT_DIM, font=tiny_font, anchor="mm")

    # Arrows for bottom row
    arrow_pairs = [(0,1), (1,2), (1,3)]
    for i, j in arrow_pairs:
        x_start = boxes_bot[i][2] + 5
        x_end = boxes_bot[j][0] - 5
        y_mid = 365
        draw.line([(x_start, y_mid), (x_end, y_mid)], fill=RED, width=2)
        draw.polygon([(x_end, y_mid), (x_end-10, y_mid-6), (x_end-10, y_mid+6)], fill=RED)

    # Exfiltration arrows from dev and CI to C2
    for src_idx in [2, 3]:
        sx = (boxes_bot[src_idx][0] + boxes_bot[src_idx][2]) // 2
        sy = boxes_bot[src_idx][3] + 5
        ex = (boxes_bot[4][0] + boxes_bot[4][2]) // 2
        ey = boxes_bot[4][3] + 5

        mid_y = 470
        draw.line([(sx, sy), (sx, mid_y), (ex, mid_y), (ex, ey)], fill=RED, width=2)
        draw.polygon([(ex, ey), (ex-6, ey+10), (ex+6, ey+10)], fill=RED)

    # Labels on exfiltration
    draw.text((680, 455), "secrets, keys, tokens exfiltrated", fill=RED, font=tiny_font, anchor="mt")

    # Warning boxes
    warnings = [
        (80, 540, "Developer trusts the registry"),
        (380, 540, "Registry trusts the token"),
        (680, 540, "Token was stolen"),
    ]
    for x, y, text in warnings:
        draw_rounded_rect(draw, (x, y, x+260, y+50), 8, fill=RED_BG, outline=RED, width=1)
        draw.text((x+130, y+25), text, fill=TEXT, font=small_font, anchor="mm")

    # Connect warnings with arrows
    for i in range(2):
        x_start = warnings[i][0] + 260 + 5
        x_end = warnings[i+1][0] - 5
        y_mid = warnings[i][1] + 25
        draw.line([(x_start, y_mid), (x_end, y_mid)], fill=RED, width=1)

    # Footer
    draw.text((W // 2, H - 30), "yellamaraju.com", fill=TEXT_DIM, font=tiny_font, anchor="mm")

    img.save(os.path.join(OUTPUT_DIR, "supply-chain-trust-flow.png"), "PNG", quality=95)
    print("Generated: supply-chain-trust-flow.png")


def generate_litellm_timeline():
    """Generate a timeline of the LiteLLM compromise."""
    W, H = 1400, 580
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    title_font = get_font(24, bold=True)
    label_font = get_font(16, bold=True)
    small_font = get_font(13)
    tiny_font = get_font(11)

    # Title
    draw.text((W // 2, 25), "LiteLLM Supply Chain Compromise Timeline",
              fill=TEXT, font=title_font, anchor="mt")

    # Timeline line
    y_line = 180
    draw.line([(60, y_line), (W - 60, y_line)], fill=BORDER, width=3)

    events = [
        ("Mar 1", "Aqua Security\ninitial breach", RED, 140),
        ("Mar 19-22", "Trivy\ncompromised\n75+ tags hijacked", RED, 350),
        ("Mar 23", "litellm.cloud\ndomain registered\nby attacker", AMBER, 560),
        ("Mar 24", "Malicious\n1.82.7 + 1.82.8\npublished to PyPI", RED, 770),
        ("Mar 24", "Community\ndetects payload\nin .pth file", GREEN, 980),
        ("Mar 24-25", "PyPI quarantines\nentire package\nAll versions blocked", BLUE, 1190),
    ]

    for i, (date, desc, color, x) in enumerate(events):
        # Dot on timeline
        draw.ellipse((x-8, y_line-8, x+8, y_line+8), fill=color)

        # Date above (handle multiline)
        date_lines = date.split("\n")
        y_date = y_line - 22 - (len(date_lines) - 1) * 18
        for line in date_lines:
            draw.text((x, y_date), line, fill=color, font=label_font, anchor="mt")
            y_date += 18

        # Description below
        y_desc = y_line + 25
        for line in desc.split("\n"):
            draw.text((x, y_desc), line, fill=TEXT_DIM, font=small_font, anchor="mt")
            y_desc += 18

    # Key facts section
    y_section = 340
    draw.line([(60, y_section), (W - 60, y_section)], fill=BORDER, width=1)

    facts = [
        ("Attack Vector", "PyPI token stolen via\ncompromised Trivy in CI/CD", RED),
        ("v1.82.7 Payload", "Embedded in proxy_server.py\nTriggered on import", AMBER),
        ("v1.82.8 Payload", ".pth startup hook\nNo import needed", RED),
        ("Exfiltration", "SSH keys, API keys,\ncloud creds to\nlitellm.cloud", PURPLE),
        ("Blast Radius", "~120,000 downloads\n47,000+ potentially\naffected", AMBER),
    ]

    card_w = (W - 120 - 40 * (len(facts) - 1)) // len(facts)
    for i, (title, desc, color) in enumerate(facts):
        x = 60 + i * (card_w + 40)
        y = y_section + 20

        draw_rounded_rect(draw, (x, y, x + card_w, y + 130), 10,
                         fill=BG_CARD, outline=color, width=2)
        draw.text((x + card_w // 2, y + 18), title, fill=color, font=label_font, anchor="mt")

        y_text = y + 50
        for line in desc.split("\n"):
            draw.text((x + card_w // 2, y_text), line, fill=TEXT_DIM, font=small_font, anchor="mt")
            y_text += 18

    # Footer
    draw.text((W // 2, H - 20), "yellamaraju.com", fill=TEXT_DIM, font=tiny_font, anchor="mm")

    img.save(os.path.join(OUTPUT_DIR, "supply-chain-litellm-timeline.png"), "PNG", quality=95)
    print("Generated: supply-chain-litellm-timeline.png")


def generate_defense_checklist():
    """Generate a defense checklist image."""
    W, H = 1200, 750
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    title_font = get_font(26, bold=True)
    heading_font = get_font(18, bold=True)
    item_font = get_font(15)
    small_font = get_font(13)
    tiny_font = get_font(11)

    # Title
    draw.text((W // 2, 30), "Supply Chain Defense Checklist",
              fill=TEXT, font=title_font, anchor="mt")

    draw.text((W // 2, 62), "Practical habits that reduce dependency risk",
              fill=TEXT_DIM, font=small_font, anchor="mt")

    # Two columns of practices
    left_items = [
        ("Pin Exact Versions", "Use =1.14.0 not ^1.14.0\nLock in known-good versions", GREEN),
        ("Commit Lockfiles", "package-lock.json, poetry.lock\nTreat as security boundary", GREEN),
        ("Deterministic Installs", "npm ci, pip --require-hashes\nSame input = same output", GREEN),
        ("Verify Provenance", "Check OIDC attestations\nTrusted publishers on PyPI/npm", BLUE),
        ("Delay New Releases", "Wait 24-48h on critical deps\nLet the ecosystem verify first", BLUE),
    ]

    right_items = [
        ("Review Before Adopting", "Check maintainer history\nRelease cadence, install scripts", AMBER),
        ("Minimize Dependencies", "Every dep = attack surface\nFewer deps = fewer trust decisions", AMBER),
        ("Gate Updates via Review", "No auto-merge on dep updates\nHuman reviews every change", AMBER),
        ("Watch Transitive Deps", "npm ls, pip list, uv tree\nYou inherit what you depend on", PURPLE),
        ("Rotate After Compromise", "All keys, tokens, SSH keys\nEvery secret on affected machine", RED),
    ]

    def draw_checklist_column(items, x_start, y_start):
        y = y_start
        for title, desc, color in items:
            # Card background
            draw_rounded_rect(draw, (x_start, y, x_start + 530, y + 105), 10,
                            fill=BG_CARD, outline=color, width=2)

            # Checkbox
            draw_rounded_rect(draw, (x_start + 18, y + 18, x_start + 38, y + 38), 4,
                            fill=None, outline=color, width=2)
            draw.text((x_start + 28, y + 28), "✓", fill=color, font=item_font, anchor="mm")

            # Title
            draw.text((x_start + 55, y + 20), title, fill=TEXT, font=heading_font)

            # Description
            y_desc = y + 48
            for line in desc.split("\n"):
                draw.text((x_start + 55, y_desc), line, fill=TEXT_DIM, font=small_font)
                y_desc += 18

            y += 120

    draw_checklist_column(left_items, 50, 100)
    draw_checklist_column(right_items, 620, 100)

    # Priority legend at bottom
    y_legend = H - 60
    legend_items = [
        ("Essential", GREEN),
        ("Recommended", BLUE),
        ("Important", AMBER),
        ("Advanced", PURPLE),
        ("Post-Incident", RED),
    ]
    total_w = sum(len(t) * 10 + 40 for t, _ in legend_items)
    x_legend = (W - total_w) // 2
    for label, color in legend_items:
        draw.ellipse((x_legend, y_legend + 4, x_legend + 12, y_legend + 16), fill=color)
        draw.text((x_legend + 18, y_legend + 10), label, fill=TEXT_DIM, font=small_font, anchor="lm")
        x_legend += len(label) * 9 + 50

    # Footer
    draw.text((W // 2, H - 20), "yellamaraju.com", fill=TEXT_DIM, font=tiny_font, anchor="mm")

    img.save(os.path.join(OUTPUT_DIR, "supply-chain-defense-checklist.png"), "PNG", quality=95)
    print("Generated: supply-chain-defense-checklist.png")


if __name__ == "__main__":
    generate_trust_flow()
    generate_litellm_timeline()
    generate_defense_checklist()
    print("All images generated successfully.")
