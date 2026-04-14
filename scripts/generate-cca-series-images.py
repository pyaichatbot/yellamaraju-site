#!/usr/bin/env python3
"""Generate blog images for the Claude Certified Architect Learning Series.

Uses the same dark-slate palette as the LLM API and supply-chain blog images.
"""

from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_DIR = "/Users/spy/Documents/PY/self/yellamaraju-site/public/images"

# ── Colour palette (matches existing blog images) ───────────────────────
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
CYAN = "#06b6d4"
CYAN_BG = "#164e63"
BORDER = "#334155"
WHITE = "#ffffff"


# ── Font helpers ─────────────────────────────────────────────────────────

def get_font(size, bold=False):
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
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def draw_arrow(draw, x1, y1, x2, y2, color, tip=8, width=2):
    draw.line([(x1, y1), (x2, y2)], fill=color, width=width)
    if y1 == y2:
        d = 1 if x2 > x1 else -1
        draw.polygon(
            [(x2, y2), (x2 - d * tip, y2 - tip // 2), (x2 - d * tip, y2 + tip // 2)],
            fill=color,
        )
    elif x1 == x2:
        d = 1 if y2 > y1 else -1
        draw.polygon(
            [(x2, y2), (x2 - tip // 2, y2 - d * tip), (x2 + tip // 2, y2 - d * tip)],
            fill=color,
        )


# ========================================================================
# Image 1 – CCA Series Overview: Domain Weight Map
# ========================================================================

def generate_series_overview():
    W, H = 1400, 750
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    title_font = get_font(28, bold=True)
    subtitle_font = get_font(16)
    heading_font = get_font(18, bold=True)
    label_font = get_font(15, bold=True)
    small_font = get_font(13)
    tiny_font = get_font(11)
    number_font = get_font(22, bold=True)

    draw.text((W // 2, 28), "Claude Certified Architect — Foundations",
              fill=TEXT, font=title_font, anchor="mt")
    draw.text((W // 2, 62), "5 Domains  |  77 Questions  |  720 to Pass  |  ~150 Minutes",
              fill=TEXT_DIM, font=subtitle_font, anchor="mt")

    # Domain cards with weight bars
    domains = [
        ("1", "Agentic Architecture\n& Orchestration", "27%", 0.27, RED, RED_BG,
         ["stop_reason control flow", "Coordinator-subagent", "Task tool & AgentDefinition",
          "PostToolUse hooks", "fork_session"]),
        ("2", "Tool Design &\nMCP Integration", "18%", 0.18, CYAN, CYAN_BG,
         ["Tool descriptions", "Structured errors", "tool_choice modes",
          ".mcp.json config", "Built-in tools"]),
        ("3", "Claude Code Config\n& Workflows", "20%", 0.20, AMBER, AMBER_BG,
         ["CLAUDE.md hierarchy", "@import directive", "Commands vs Skills",
          "Plan mode", "CI/CD with -p flag"]),
        ("4", "Prompt Engineering\n& Structured Output", "20%", 0.20, PURPLE, PURPLE_BG,
         ["Explicit criteria", "Few-shot prompting", "tool_use schemas",
          "Validation loops", "Batch API (50% savings)"]),
        ("5", "Context Management\n& Reliability", "15%", 0.15, GREEN, GREEN_BG,
         ["Context preservation", "Escalation patterns", "Error propagation",
          "Confidence calibration", "Source attribution"]),
    ]

    card_w = 230
    card_h = 340
    gap = 22
    total = len(domains) * card_w + (len(domains) - 1) * gap
    x0 = (W - total) // 2
    y0 = 100

    for i, (num, name, pct, frac, color, bg, bullets) in enumerate(domains):
        x = x0 + i * (card_w + gap)
        y = y0

        draw_rounded_rect(draw, (x, y, x + card_w, y + card_h), 12,
                          fill=BG_CARD, outline=color, width=2)

        # Weight bar at top
        bar_w = int((card_w - 20) * frac / 0.27)  # scale relative to max
        draw_rounded_rect(draw, (x + 10, y + 10, x + 10 + bar_w, y + 30), 4,
                          fill=color)
        draw.text((x + 10 + bar_w + 8, y + 20), pct, fill=color, font=label_font, anchor="lm")

        # Number badge
        cx = x + card_w // 2
        cy = y + 54
        draw.ellipse((cx - 16, cy - 16, cx + 16, cy + 16), fill=color)
        draw.text((cx, cy), num, fill=WHITE, font=number_font, anchor="mm")

        # Title
        lines = name.split("\n")
        ty = y + 82
        for line in lines:
            draw.text((x + card_w // 2, ty), line, fill=TEXT, font=label_font, anchor="mt")
            ty += 20

        # Bullets
        by = y + 132
        for b in bullets:
            draw.text((x + 16, by), f"  {b}", fill=TEXT_DIM, font=small_font)
            by += 22

    # Bottom bar: passing info
    bar_y = y0 + card_h + 40
    draw_rounded_rect(draw, (100, bar_y, W - 100, bar_y + 80), 12,
                      fill=BG_CARD, outline=BORDER, width=1)

    tips = [
        ("Passing Score", "720 / 1000", BLUE),
        ("Questions", "77 MCQ", AMBER),
        ("Scenario Sets", "4 of 6 random", RED),
        ("Time Budget", "~2 min / question", GREEN),
    ]
    tw = (W - 240) // len(tips)
    for i, (label, value, color) in enumerate(tips):
        tx = 120 + i * tw
        draw.text((tx + tw // 2, bar_y + 24), value, fill=color, font=heading_font, anchor="mt")
        draw.text((tx + tw // 2, bar_y + 52), label, fill=TEXT_DIM, font=small_font, anchor="mt")

    # Footer
    draw.text((W // 2, H - 16), "yellamaraju.com", fill=TEXT_DIM, font=tiny_font, anchor="mm")

    img.save(os.path.join(OUTPUT_DIR, "cca-series-overview.png"), "PNG", quality=95)
    print("Generated: cca-series-overview.png")


# ========================================================================
# Image 2 – Agentic Loop: stop_reason control flow
# ========================================================================

def generate_agentic_loop():
    W, H = 1200, 700
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    title_font = get_font(26, bold=True)
    heading_font = get_font(18, bold=True)
    label_font = get_font(15, bold=True)
    small_font = get_font(13)
    tiny_font = get_font(11)

    draw.text((W // 2, 24), "The Agentic Loop: stop_reason-Driven Control Flow",
              fill=TEXT, font=title_font, anchor="mt")
    draw.text((W // 2, 54), "The agent drives.  You respond to signals.",
              fill=TEXT_DIM, font=small_font, anchor="mt")

    # Flow boxes
    steps = [
        ("Agent receives\ngoal + tools", BLUE, BLUE_BG),
        ("Claude API\ncall", PURPLE, PURPLE_BG),
        ("Check\nstop_reason", RED, RED_BG),
    ]

    box_w = 180
    box_h = 80
    gap = 60
    total_w = len(steps) * box_w + (len(steps) - 1) * gap
    sx0 = (W - total_w) // 2
    sy = 100

    centers = []
    for i, (label, color, bg) in enumerate(steps):
        x = sx0 + i * (box_w + gap)
        draw_rounded_rect(draw, (x, sy, x + box_w, sy + box_h), 10,
                          fill=bg, outline=color, width=2)
        lines = label.split("\n")
        ty = sy + (box_h - len(lines) * 20) // 2
        for line in lines:
            draw.text((x + box_w // 2, ty + 10), line, fill=TEXT, font=label_font, anchor="mt")
            ty += 20
        centers.append((x + box_w // 2, sy + box_h // 2))

        if i < len(steps) - 1:
            draw_arrow(draw, x + box_w + 5, sy + box_h // 2,
                       x + box_w + gap - 5, sy + box_h // 2, color)

    # Branch from stop_reason
    branch_x = centers[2][0]
    branch_y = sy + box_h

    # tool_use branch (left-down)
    tu_x = branch_x - 200
    tu_y = branch_y + 100
    draw_rounded_rect(draw, (tu_x - 90, tu_y - 30, tu_x + 90, tu_y + 30), 10,
                      fill=AMBER_BG, outline=AMBER, width=2)
    draw.text((tu_x, tu_y), "tool_use", fill=AMBER, font=heading_font, anchor="mm")

    draw.line([(branch_x - 20, branch_y + 2), (tu_x, tu_y - 32)], fill=AMBER, width=2)
    draw.text((branch_x - 130, branch_y + 30), "stop_reason", fill=AMBER, font=tiny_font, anchor="mm")

    # end_turn branch (right-down)
    et_x = branch_x + 200
    et_y = branch_y + 100
    draw_rounded_rect(draw, (et_x - 90, et_y - 30, et_x + 90, et_y + 30), 10,
                      fill=GREEN_BG, outline=GREEN, width=2)
    draw.text((et_x, et_y), "end_turn", fill=GREEN, font=heading_font, anchor="mm")

    draw.line([(branch_x + 20, branch_y + 2), (et_x, et_y - 32)], fill=GREEN, width=2)
    draw.text((branch_x + 130, branch_y + 30), "stop_reason", fill=GREEN, font=tiny_font, anchor="mm")

    # tool_use actions
    tu_actions = [
        "Execute tool(s)",
        "Append results as user msg",
        "Loop back to API call",
    ]
    ay = tu_y + 50
    for a in tu_actions:
        draw.text((tu_x, ay), a, fill=TEXT_DIM, font=small_font, anchor="mt")
        ay += 22

    # Loop arrow from tool_use back to API call
    loop_y = tu_y + 130
    api_cx = centers[1][0]
    draw.line([(tu_x, ay - 10), (tu_x, loop_y)], fill=AMBER, width=2)
    draw.line([(tu_x, loop_y), (api_cx, loop_y)], fill=AMBER, width=2)
    draw_arrow(draw, api_cx, loop_y, api_cx, sy + box_h + 2, AMBER)

    # end_turn actions
    et_actions = [
        "Extract final message",
        "Return response to user",
        "Done!",
    ]
    ay = et_y + 50
    for a in et_actions:
        draw.text((et_x, ay), a, fill=TEXT_DIM, font=small_font, anchor="mt")
        ay += 22

    # Anti-pattern callout
    ap_y = 480
    draw_rounded_rect(draw, (60, ap_y, W // 2 - 20, ap_y + 140), 10,
                      fill=RED_BG, outline=RED, width=2)
    draw.text((80, ap_y + 14), "WRONG", fill=RED, font=heading_font)
    wrong_lines = [
        'if "complete" in response.text:',
        '    # Parse natural language',
        '    return response',
        '',
        'Fragile. Non-deterministic.',
    ]
    ly = ap_y + 42
    for line in wrong_lines:
        draw.text((80, ly), line, fill=TEXT_DIM, font=tiny_font)
        ly += 16

    draw_rounded_rect(draw, (W // 2 + 20, ap_y, W - 60, ap_y + 140), 10,
                      fill=GREEN_BG, outline=GREEN, width=2)
    draw.text((W // 2 + 40, ap_y + 14), "RIGHT", fill=GREEN, font=heading_font)
    right_lines = [
        'if response.stop_reason == "end_turn":',
        '    return final_response',
        'elif response.stop_reason == "tool_use":',
        '    execute_tools_and_continue()',
        '',
        'Deterministic. Reliable.',
    ]
    ly = ap_y + 42
    for line in right_lines:
        draw.text((W // 2 + 40, ly), line, fill=TEXT_DIM, font=tiny_font)
        ly += 16

    draw.text((W // 2, H - 16), "yellamaraju.com", fill=TEXT_DIM, font=tiny_font, anchor="mm")

    img.save(os.path.join(OUTPUT_DIR, "cca-agentic-loop.png"), "PNG", quality=95)
    print("Generated: cca-agentic-loop.png")


# ========================================================================
# Image 3 – Tool Design: Description as Selection Mechanism
# ========================================================================

def generate_tool_design():
    W, H = 1200, 650
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    title_font = get_font(26, bold=True)
    heading_font = get_font(18, bold=True)
    label_font = get_font(15, bold=True)
    small_font = get_font(13)
    tiny_font = get_font(11)

    draw.text((W // 2, 24), "Tool Descriptions Are the Primary Selection Mechanism",
              fill=TEXT, font=title_font, anchor="mt")
    draw.text((W // 2, 54), "Claude reads descriptions, not code.  Precision prevents misrouting.",
              fill=TEXT_DIM, font=small_font, anchor="mt")

    # Left: BAD tool
    bx0, by0 = 40, 90
    bw, bh = 530, 240
    draw_rounded_rect(draw, (bx0, by0, bx0 + bw, by0 + bh), 12,
                      fill=BG_CARD, outline=RED, width=2)
    draw.text((bx0 + 20, by0 + 16), "BAD: Vague Description", fill=RED, font=heading_font)

    bad_lines = [
        '{',
        '  "name": "get_data",',
        '  "description": "Gets data from the system"',
        '}',
        '',
        'Problems:',
        '  What data?  Which system?',
        '  When to use vs other tools?',
        '  What format?  What errors?',
        '  Claude guesses → wrong tool 30%+',
    ]
    ly = by0 + 46
    for line in bad_lines:
        draw.text((bx0 + 30, ly), line, fill=TEXT_DIM, font=tiny_font)
        ly += 18

    # Right: GOOD tool
    gx0 = bx0 + bw + 40
    gw = bw
    draw_rounded_rect(draw, (gx0, by0, gx0 + gw, by0 + bh), 12,
                      fill=BG_CARD, outline=GREEN, width=2)
    draw.text((gx0 + 20, by0 + 16), "GOOD: Specific Description", fill=GREEN, font=heading_font)

    good_lines = [
        '{',
        '  "name": "search_product_catalog",',
        '  "description": "Search products by',
        '    keyword, category, or price range.',
        '    DO NOT use for inventory checks.',
        '    Returns: id, name, price, stock.',
        '    Max 50 results per request."',
        '}',
        '',
        'Claude knows when, why, and how.',
    ]
    ly = by0 + 46
    for line in good_lines:
        draw.text((gx0 + 30, ly), line, fill=TEXT_DIM, font=tiny_font)
        ly += 18

    # Error response pattern
    ey0 = by0 + bh + 30
    ew = W - 80
    eh = 230
    draw_rounded_rect(draw, (40, ey0, 40 + ew, ey0 + eh), 12,
                      fill=BG_CARD, outline=CYAN, width=2)
    draw.text((W // 2, ey0 + 16), "Structured Error Categories", fill=CYAN, font=heading_font, anchor="mt")

    cats = [
        ("Transient", "Retry ✓", "Timeout, 503, rate limit", AMBER),
        ("Validation", "Retry ✗", "Bad input, wrong format", RED),
        ("Business", "Retry ✗", "Insufficient funds, expired", PURPLE),
        ("Permission", "Retry ✗", "No access, invalid API key", BLUE),
    ]

    cw = (ew - 100) // len(cats)
    for i, (name, retry, desc, color) in enumerate(cats):
        cx = 80 + i * cw
        cy = ey0 + 54
        draw_rounded_rect(draw, (cx, cy, cx + cw - 20, cy + 140), 8,
                          fill=BG, outline=color, width=2)
        draw.text((cx + (cw - 20) // 2, cy + 18), name, fill=color, font=label_font, anchor="mt")
        draw.text((cx + (cw - 20) // 2, cy + 44), retry, fill=TEXT, font=small_font, anchor="mt")
        # Wrap desc
        words = desc.split(", ")
        dy = cy + 72
        for w in words:
            draw.text((cx + (cw - 20) // 2, dy), w, fill=TEXT_DIM, font=tiny_font, anchor="mt")
            dy += 16

    draw.text((W // 2, H - 16), "yellamaraju.com", fill=TEXT_DIM, font=tiny_font, anchor="mm")

    img.save(os.path.join(OUTPUT_DIR, "cca-tool-design.png"), "PNG", quality=95)
    print("Generated: cca-tool-design.png")


# ========================================================================
# Image 4 – CLAUDE.md Hierarchy
# ========================================================================

def generate_claude_md_hierarchy():
    W, H = 1200, 600
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    title_font = get_font(26, bold=True)
    heading_font = get_font(18, bold=True)
    label_font = get_font(15, bold=True)
    small_font = get_font(13)
    tiny_font = get_font(11)

    draw.text((W // 2, 24), "CLAUDE.md Configuration Hierarchy",
              fill=TEXT, font=title_font, anchor="mt")
    draw.text((W // 2, 54), "Closest file wins.  @import splits config into modules.",
              fill=TEXT_DIM, font=small_font, anchor="mt")

    # Three levels as stacked cards
    levels = [
        ("~/.claude/CLAUDE.md", "User Level", "Highest precedence",
         ["Personal preferences", "Global tool defaults"], GREEN),
        ("./src/CLAUDE.md", "Subdirectory Level", "Medium precedence",
         ["Scope-specific rules", "Overrides project root"], AMBER),
        ("./CLAUDE.md", "Project Root", "Lowest precedence",
         ["@import modules", "Team conventions"], BLUE),
    ]

    card_w = 320
    card_h = 180
    gap = 30
    total = len(levels) * card_w + (len(levels) - 1) * gap
    x0 = (W - total) // 2
    y0 = 90

    for i, (path, level, prec, items, color) in enumerate(levels):
        x = x0 + i * (card_w + gap)
        draw_rounded_rect(draw, (x, y0, x + card_w, y0 + card_h), 12,
                          fill=BG_CARD, outline=color, width=2)

        # Precedence badge
        draw_rounded_rect(draw, (x + card_w - 120, y0 + 8, x + card_w - 10, y0 + 26), 6,
                          fill=color + "33", outline=color, width=1)
        draw.text((x + card_w - 65, y0 + 17), prec, fill=color, font=tiny_font, anchor="mm")

        draw.text((x + card_w // 2, y0 + 22), level, fill=TEXT, font=heading_font, anchor="mt")
        draw.text((x + card_w // 2, y0 + 48), path, fill=color, font=small_font, anchor="mt")

        by = y0 + 78
        for item in items:
            draw.text((x + 24, by), f"  {item}", fill=TEXT_DIM, font=small_font)
            by += 22

        if i < len(levels) - 1:
            draw.text((x + card_w + gap // 2, y0 + card_h // 2), ">",
                      fill=TEXT_DIM, font=heading_font, anchor="mm")

    # @import section
    imp_y = y0 + card_h + 40
    draw_rounded_rect(draw, (100, imp_y, W - 100, imp_y + 200), 12,
                      fill=BG_CARD, outline=PURPLE, width=2)
    draw.text((W // 2, imp_y + 16), "@import: Modular Configuration", fill=PURPLE, font=heading_font, anchor="mt")

    imports = [
        ('@import "./claude-config/core-conventions.md"', BLUE),
        ('@import "./claude-config/testing-rules.md"', GREEN),
        ('@import "./claude-config/api-standards.md"', AMBER),
        ('@import "./claude-config/security-policies.md"', RED),
    ]
    iy = imp_y + 50
    for imp, color in imports:
        draw_rounded_rect(draw, (140, iy, W - 140, iy + 28), 6,
                          fill=BG, outline=color, width=1)
        draw.text((160, iy + 14), imp, fill=TEXT_DIM, font=small_font, anchor="lm")
        iy += 36

    draw.text((W // 2, H - 16), "yellamaraju.com", fill=TEXT_DIM, font=tiny_font, anchor="mm")

    img.save(os.path.join(OUTPUT_DIR, "cca-claude-md-hierarchy.png"), "PNG", quality=95)
    print("Generated: cca-claude-md-hierarchy.png")


# ========================================================================
# Image 5 – Prompt Engineering: Explicit Criteria + Validation Loop
# ========================================================================

def generate_prompt_engineering():
    W, H = 1200, 650
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    title_font = get_font(26, bold=True)
    heading_font = get_font(18, bold=True)
    label_font = get_font(15, bold=True)
    small_font = get_font(13)
    tiny_font = get_font(11)

    draw.text((W // 2, 24), "Production Prompt Engineering: The Six Techniques",
              fill=TEXT, font=title_font, anchor="mt")
    draw.text((W // 2, 54), "Vague prompts produce vague results.  Explicit criteria produce reliability.",
              fill=TEXT_DIM, font=small_font, anchor="mt")

    techniques = [
        ("1", "Explicit\nCriteria", "Define categories,\nboundary cases,\nevidence requirements", RED, RED_BG, "70% fewer\nfalse positives"),
        ("2", "Few-Shot\nExamples", "2-5 examples\nspan input range,\nexact output format", AMBER, AMBER_BG, "40-60% more\nconsistent"),
        ("3", "tool_use\nSchemas", "JSON schemas\nvia input_schema,\nnever free-text", PURPLE, PURPLE_BG, "Schema\nguaranteed"),
        ("4", "Validation\nLoops", "Check → feedback\n→ retry, usually\n1-2 fixes 90%", CYAN, CYAN_BG, "90% error\nrecovery"),
        ("5", "Batch\nAPI", "Async processing,\nlower priority,\n50% cost savings", BLUE, BLUE_BG, "50% cost\nreduction"),
        ("6", "Multi-Pass\nReview", "Claude reviews\nits own output,\ncheaper than retry", GREEN, GREEN_BG, "Higher quality\nfirst pass"),
    ]

    card_w = 170
    card_h = 260
    gap = 16
    total = len(techniques) * card_w + (len(techniques) - 1) * gap
    x0 = (W - total) // 2
    y0 = 90

    for i, (num, name, desc, color, bg, metric) in enumerate(techniques):
        x = x0 + i * (card_w + gap)
        draw_rounded_rect(draw, (x, y0, x + card_w, y0 + card_h), 10,
                          fill=BG_CARD, outline=color, width=2)

        # Number
        cx = x + 22
        cy = y0 + 22
        draw.ellipse((cx - 12, cy - 12, cx + 12, cy + 12), fill=color)
        draw.text((cx, cy), num, fill=WHITE, font=label_font, anchor="mm")

        # Name
        lines = name.split("\n")
        ny = y0 + 18
        for line in lines:
            draw.text((x + card_w // 2, ny), line, fill=TEXT, font=label_font, anchor="mt")
            ny += 18

        # Desc
        dlines = desc.split("\n")
        dy = y0 + 74
        for line in dlines:
            draw.text((x + 14, dy), line, fill=TEXT_DIM, font=tiny_font)
            dy += 16

        # Metric badge
        draw_rounded_rect(draw, (x + 10, y0 + card_h - 60, x + card_w - 10, y0 + card_h - 10), 6,
                          fill=bg, outline=color, width=1)
        mlines = metric.split("\n")
        my = y0 + card_h - 52
        for line in mlines:
            draw.text((x + card_w // 2, my), line, fill=color, font=tiny_font, anchor="mt")
            my += 14

    # Validation loop diagram
    vy = y0 + card_h + 30
    draw_rounded_rect(draw, (80, vy, W - 80, vy + 200), 12,
                      fill=BG_CARD, outline=CYAN, width=2)
    draw.text((W // 2, vy + 14), "The Validation-Retry Loop", fill=CYAN, font=heading_font, anchor="mt")

    loop_steps = [
        ("Request\nwith schema", PURPLE),
        ("Validate\noutput", CYAN),
        ("Valid?", AMBER),
        ("Return\nresult", GREEN),
    ]

    sw = 140
    sh = 60
    sgap = 80
    stotal = len(loop_steps) * sw + (len(loop_steps) - 1) * sgap
    sx0 = (W - stotal) // 2
    sy = vy + 60

    for j, (label, color) in enumerate(loop_steps):
        sx = sx0 + j * (sw + sgap)
        draw_rounded_rect(draw, (sx, sy, sx + sw, sy + sh), 8,
                          fill=BG, outline=color, width=2)
        lines = label.split("\n")
        ly = sy + (sh - len(lines) * 16) // 2
        for line in lines:
            draw.text((sx + sw // 2, ly + 8), line, fill=TEXT, font=small_font, anchor="mt")
            ly += 16

        if j < len(loop_steps) - 1:
            draw_arrow(draw, sx + sw + 2, sy + sh // 2,
                       sx + sw + sgap - 2, sy + sh // 2, color, tip=6)

    # Retry arrow from "Valid?" back to "Request"
    valid_x = sx0 + 2 * (sw + sgap) + sw // 2
    req_x = sx0 + sw // 2
    retry_y = sy + sh + 30
    draw.line([(valid_x, sy + sh + 2), (valid_x, retry_y)], fill=RED, width=2)
    draw.line([(valid_x, retry_y), (req_x, retry_y)], fill=RED, width=2)
    draw_arrow(draw, req_x, retry_y, req_x, sy + sh + 2, RED)
    draw.text(((valid_x + req_x) // 2, retry_y + 8), "Invalid → feed error back → retry",
              fill=RED, font=tiny_font, anchor="mt")

    draw.text((W // 2, H - 16), "yellamaraju.com", fill=TEXT_DIM, font=tiny_font, anchor="mm")

    img.save(os.path.join(OUTPUT_DIR, "cca-prompt-engineering.png"), "PNG", quality=95)
    print("Generated: cca-prompt-engineering.png")


# ========================================================================
# Image 6 – Context Management: Confidence-Based Routing
# ========================================================================

def generate_context_management():
    W, H = 1200, 650
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    title_font = get_font(26, bold=True)
    heading_font = get_font(18, bold=True)
    label_font = get_font(15, bold=True)
    small_font = get_font(13)
    tiny_font = get_font(11)

    draw.text((W // 2, 24), "Context Management & Reliability",
              fill=TEXT, font=title_font, anchor="mt")
    draw.text((W // 2, 54), "Reliability comes from transparency, not perfection.",
              fill=TEXT_DIM, font=small_font, anchor="mt")

    # Left: Confidence routing
    rx0, ry0 = 40, 90
    rw, rh = 540, 300
    draw_rounded_rect(draw, (rx0, ry0, rx0 + rw, ry0 + rh), 12,
                      fill=BG_CARD, outline=GREEN, width=2)
    draw.text((rx0 + rw // 2, ry0 + 16), "Confidence-Based Routing", fill=GREEN, font=heading_font, anchor="mt")

    bands = [
        ("95-100%", "AUTONOMOUS PROCEED", GREEN, GREEN_BG),
        ("75-94%", "PROCEED WITH FLAG", AMBER, AMBER_BG),
        ("50-74%", "HUMAN REVIEW", PURPLE, PURPLE_BG),
        ("0-49%", "ESCALATE IMMEDIATELY", RED, RED_BG),
    ]

    by = ry0 + 50
    bar_w = rw - 60
    for score, action, color, bg in bands:
        draw_rounded_rect(draw, (rx0 + 30, by, rx0 + 30 + bar_w, by + 44), 8,
                          fill=bg, outline=color, width=1)
        draw.text((rx0 + 50, by + 22), score, fill=color, font=label_font, anchor="lm")
        draw.text((rx0 + 30 + bar_w - 20, by + 22), action, fill=TEXT, font=small_font, anchor="rm")
        by += 56

    # Right: Error propagation
    ex0 = rx0 + rw + 40
    ew = rw
    draw_rounded_rect(draw, (ex0, ry0, ex0 + ew, ry0 + rh), 12,
                      fill=BG_CARD, outline=RED, width=2)
    draw.text((ex0 + ew // 2, ry0 + 16), "Error Propagation Pattern", fill=RED, font=heading_font, anchor="mt")

    # Anti-pattern
    draw.text((ex0 + 30, ry0 + 52), "WRONG: Silent failure", fill=RED, font=label_font)
    wrong = ['except Exception:', '    pass  # Lost forever']
    wy = ry0 + 78
    for line in wrong:
        draw.text((ex0 + 40, wy), line, fill=TEXT_DIM, font=tiny_font)
        wy += 16

    draw.line([(ex0 + 30, wy + 6), (ex0 + ew - 30, wy + 6)], fill=BORDER, width=1)

    # Good pattern
    draw.text((ex0 + 30, wy + 16), "RIGHT: Graceful degradation", fill=GREEN, font=label_font)
    good = [
        "Preserve partial results",
        "Capture error context + retry count",
        "Route: systematic → ESCALATE",
        "Route: partial (>70%) → PROCEED + FLAG",
        "Route: high failure → ESCALATE",
    ]
    gy = wy + 42
    for line in good:
        draw.text((ex0 + 40, gy), f"  {line}", fill=TEXT_DIM, font=small_font)
        gy += 22

    # Bottom: Context strategies
    cy0 = ry0 + rh + 30
    ch = 170
    draw_rounded_rect(draw, (40, cy0, W - 40, cy0 + ch), 12,
                      fill=BG_CARD, outline=BLUE, width=2)
    draw.text((W // 2, cy0 + 14), "Context Preservation Strategies",
              fill=BLUE, font=heading_font, anchor="mt")

    strategies = [
        ("Scratchpad\nSummaries", "Persistent summary\nupdated periodically\nfor 20+ exchanges", AMBER),
        ("Structured\nHandoff Docs", "JSON state objects\nfor cross-session\nor cross-agent", CYAN),
        ("Per-File\nIsolation", "Analyze one file\nat a time, synthesize\nin integration pass", PURPLE),
        ("Source\nAttribution", "Tag each claim\nwith provenance\nand confidence", GREEN),
    ]

    sw = 240
    sgap = 20
    stotal = len(strategies) * sw + (len(strategies) - 1) * sgap
    sx0 = (W - stotal) // 2
    sy = cy0 + 46

    for i, (name, desc, color) in enumerate(strategies):
        sx = sx0 + i * (sw + sgap)
        draw_rounded_rect(draw, (sx, sy, sx + sw, sy + 100), 8,
                          fill=BG, outline=color, width=1)
        lines = name.split("\n")
        ny = sy + 8
        for line in lines:
            draw.text((sx + sw // 2, ny), line, fill=color, font=label_font, anchor="mt")
            ny += 16
        dlines = desc.split("\n")
        dy = ny + 4
        for line in dlines:
            draw.text((sx + sw // 2, dy), line, fill=TEXT_DIM, font=tiny_font, anchor="mt")
            dy += 14

    draw.text((W // 2, H - 16), "yellamaraju.com", fill=TEXT_DIM, font=tiny_font, anchor="mm")

    img.save(os.path.join(OUTPUT_DIR, "cca-context-management.png"), "PNG", quality=95)
    print("Generated: cca-context-management.png")


# ========================================================================

if __name__ == "__main__":
    generate_series_overview()
    generate_agentic_loop()
    generate_tool_design()
    generate_claude_md_hierarchy()
    generate_prompt_engineering()
    generate_context_management()
    print("\nAll CCA series images generated successfully.")
