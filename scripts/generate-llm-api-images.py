#!/usr/bin/env python3
"""Generate blog images for 'What Happens When You Call an LLM API' article.

Inspired by the Brij Kishore Pandey visual on LinkedIn showing the full
LLM API request lifecycle.  Recreated as unique explanatory diagrams with
the same dark-slate palette used in the supply-chain blog images.
"""

from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_DIR = "/Users/spy/Documents/PY/self/yellamaraju-site/public/images"

# ── Colour palette (matches supply-chain images) ────────────────────────
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
    """Draw a line with a triangular arrowhead at (x2, y2)."""
    draw.line([(x1, y1), (x2, y2)], fill=color, width=width)
    # horizontal arrow
    if y1 == y2:
        d = 1 if x2 > x1 else -1
        draw.polygon(
            [(x2, y2), (x2 - d * tip, y2 - tip // 2), (x2 - d * tip, y2 + tip // 2)],
            fill=color,
        )
    # vertical arrow
    elif x1 == x2:
        d = 1 if y2 > y1 else -1
        draw.polygon(
            [(x2, y2), (x2 - tip // 2, y2 - d * tip), (x2 + tip // 2, y2 - d * tip)],
            fill=color,
        )


# ========================================================================
# Image 1 – Full request lifecycle (the "big picture" flow)
# ========================================================================

def generate_request_lifecycle():
    W, H = 1400, 900
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    title_font = get_font(28, bold=True)
    subtitle_font = get_font(16)
    heading_font = get_font(18, bold=True)
    label_font = get_font(15, bold=True)
    small_font = get_font(13)
    tiny_font = get_font(11)
    number_font = get_font(14, bold=True)

    # Title
    draw.text((W // 2, 28), "What Happens When You Call an LLM API",
              fill=TEXT, font=title_font, anchor="mt")
    draw.text((W // 2, 60), "The full journey in ~400 ms",
              fill=TEXT_DIM, font=subtitle_font, anchor="mt")

    # ── Stage definitions ───────────────────────────────────────────────
    stages = [
        ("1", "API Gateway", "~5 ms", AMBER, AMBER_BG,
         ["TLS termination", "Auth / API key check", "Rate limiting (TPM/RPM)",
          "Schema validation", "Billing meter starts"]),
        ("2", "Load Balancer", "~2 ms", CYAN, CYAN_BG,
         ["Geographic routing", "Least-connections algo", "Health checks",
          "GPU cluster selection"]),
        ("3", "Tokenization", "~3 ms", PURPLE, PURPLE_BG,
         ["BPE / SentencePiece", "Text to token IDs",
          "Context window check", "Token count = your cost"]),
        ("4", "Prefill", "varies", RED, RED_BG,
         ["Reads full prompt", "Attention computation",
          "KV cache built", "Drives TTFT"]),
        ("5", "Decode", "varies", RED, RED_BG,
         ["Autoregressive loop", "One token at a time",
          "Sampling (top_p/top_k)", "Streaming starts here"]),
        ("6", "Post-Processing", "~5 ms", GREEN, GREEN_BG,
         ["Detokenization", "Safety classifier", "Stop sequences",
          "JSON packaging"]),
        ("7", "Response & Billing", "~5 ms", BLUE, BLUE_BG,
         ["Streaming / complete", "Usage metadata",
          "Input + output tokens", "Total cost calculated"]),
    ]

    # Layout: two rows (4 top, 3 bottom)
    top_stages = stages[:4]
    bot_stages = stages[4:]

    card_w = 250
    card_h = 200
    gap = 30

    # ── Top row ─────────────────────────────────────────────────────────
    top_total = len(top_stages) * card_w + (len(top_stages) - 1) * gap
    # Reserve 140px on the left for the "Your App" box + arrow
    available = W - 140
    top_x0 = 140 + (available - top_total) // 2
    top_y = 100

    # YOUR APP box to the left
    app_x = 20
    app_y = top_y + 30
    draw_rounded_rect(draw, (app_x, app_y, app_x + 100, app_y + 80), 10,
                      fill=BG_CARD, outline=BLUE, width=2)
    draw.text((app_x + 50, app_y + 25), "Your App", fill=TEXT, font=label_font, anchor="mm")
    draw.text((app_x + 50, app_y + 48), "POST /v1/chat/", fill=TEXT_DIM, font=tiny_font, anchor="mm")
    draw.text((app_x + 50, app_y + 62), "completions", fill=TEXT_DIM, font=tiny_font, anchor="mm")

    draw_arrow(draw, app_x + 100 + 5, app_y + 40, top_x0 - 5, app_y + 40, BLUE)

    top_centers = []
    for i, (num, name, latency, color, bg, bullets) in enumerate(top_stages):
        x = top_x0 + i * (card_w + gap)
        y = top_y
        draw_rounded_rect(draw, (x, y, x + card_w, y + card_h), 12,
                          fill=BG_CARD, outline=color, width=2)
        # number badge
        cx = x + 22
        cy = y + 22
        draw.ellipse((cx - 12, cy - 12, cx + 12, cy + 12), fill=color)
        draw.text((cx, cy), num, fill=WHITE, font=number_font, anchor="mm")
        # title
        draw.text((x + card_w // 2, y + 22), name, fill=TEXT, font=label_font, anchor="mt")
        # latency badge
        lx = x + card_w - 60
        draw_rounded_rect(draw, (lx, y + 8, lx + 52, y + 26), 6, fill=bg, outline=color, width=1)
        draw.text((lx + 26, y + 17), latency, fill=color, font=tiny_font, anchor="mm")

        # bullet items
        by = y + 52
        for b in bullets:
            draw.text((x + 20, by), f"  {b}", fill=TEXT_DIM, font=small_font)
            by += 20

        top_centers.append((x + card_w // 2, y + card_h // 2))

        # arrow to next
        if i < len(top_stages) - 1:
            draw_arrow(draw, x + card_w + 5, y + card_h // 2,
                       x + card_w + gap - 5, y + card_h // 2, color)

    # ── GPU compute bracket around prefill (stage 4) ─────────────────
    s4_x = top_x0 + 3 * (card_w + gap)
    draw_rounded_rect(draw, (s4_x - 6, top_y - 14, s4_x + card_w + 6, top_y + card_h + 14),
                      14, outline=RED, width=2)
    draw.text((s4_x + card_w // 2, top_y - 8), "GPU COMPUTE", fill=RED, font=tiny_font, anchor="mb")

    # ── Arrow from top row to bottom row ──────────────────────────────
    # Descending arrow from last top card to first bottom card
    bot_total = len(bot_stages) * card_w + (len(bot_stages) - 1) * gap
    bot_x0 = (W - bot_total) // 2
    bot_y = top_y + card_h + 120

    # Connector: down from stage 4, across, down to stage 5
    s4_bottom = top_y + card_h + 14
    s5_x = bot_x0
    mid_y = s4_bottom + 30
    connector_start_x = s4_x + card_w // 2
    connector_end_x = s5_x + card_w // 2

    draw.line([(connector_start_x, s4_bottom + 2), (connector_start_x, mid_y)],
              fill=RED, width=2)
    draw.line([(connector_start_x, mid_y), (connector_end_x, mid_y)],
              fill=RED, width=2)
    draw_arrow(draw, connector_end_x, mid_y, connector_end_x, bot_y - 2, RED)

    # ── Bottom row ──────────────────────────────────────────────────────
    bot_centers = []
    for i, (num, name, latency, color, bg, bullets) in enumerate(bot_stages):
        x = bot_x0 + i * (card_w + gap)
        y = bot_y
        draw_rounded_rect(draw, (x, y, x + card_w, y + card_h), 12,
                          fill=BG_CARD, outline=color, width=2)
        cx = x + 22
        cy = y + 22
        draw.ellipse((cx - 12, cy - 12, cx + 12, cy + 12), fill=color)
        draw.text((cx, cy), num, fill=WHITE, font=number_font, anchor="mm")
        draw.text((x + card_w // 2, y + 22), name, fill=TEXT, font=label_font, anchor="mt")
        lx = x + card_w - 60
        draw_rounded_rect(draw, (lx, y + 8, lx + 52, y + 26), 6, fill=bg, outline=color, width=1)
        draw.text((lx + 26, y + 17), latency, fill=color, font=tiny_font, anchor="mm")

        by = y + 58
        for b in bullets:
            draw.text((x + 20, by), f"  {b}", fill=TEXT_DIM, font=small_font)
            by += 20

        bot_centers.append((x + card_w // 2, y + card_h // 2))

        if i < len(bot_stages) - 1:
            draw_arrow(draw, x + card_w + 5, y + card_h // 2,
                       x + card_w + gap - 5, y + card_h // 2, color)

    # GPU bracket around stage 5 (Decode)
    s5_x = bot_x0
    draw_rounded_rect(draw, (s5_x - 6, bot_y - 14, s5_x + card_w + 6, bot_y + card_h + 14),
                      14, outline=RED, width=2)
    draw.text((s5_x + card_w // 2, bot_y - 8), "GPU COMPUTE", fill=RED, font=tiny_font, anchor="mb")

    # ── Latency breakdown bar at the bottom ───────────────────────────
    bar_y = bot_y + card_h + 60
    bar_h = 36
    bar_x = 100
    bar_w = W - 200

    draw.text((W // 2, bar_y - 16), "Latency Breakdown (approximate, typical request)",
              fill=TEXT_DIM, font=small_font, anchor="mt")

    segments = [
        ("Network", 0.05, BLUE),
        ("Gateway", 0.04, AMBER),
        ("Route", 0.02, CYAN),
        ("Tokenize", 0.02, PURPLE),
        ("Prefill", 0.35, RED),
        ("Decode", 0.40, RED),
        ("Post", 0.04, GREEN),
        ("Response", 0.08, BLUE),
    ]

    cx = bar_x
    for label, frac, color in segments:
        seg_w = int(bar_w * frac)
        draw_rounded_rect(draw, (cx, bar_y, cx + seg_w, bar_y + bar_h), 4, fill=color)
        if seg_w > 50:
            draw.text((cx + seg_w // 2, bar_y + bar_h // 2), label,
                      fill=WHITE, font=tiny_font, anchor="mm")
        cx += seg_w + 2

    # callout
    draw.text((W // 2, bar_y + bar_h + 14),
              "Inference is ~75% of your wait time",
              fill=RED, font=label_font, anchor="mt")

    # Footer
    draw.text((W // 2, H - 16), "yellamaraju.com", fill=TEXT_DIM, font=tiny_font, anchor="mm")

    img.save(os.path.join(OUTPUT_DIR, "llm-api-request-lifecycle.png"), "PNG", quality=95)
    print("Generated: llm-api-request-lifecycle.png")


# ========================================================================
# Image 2 – Inference engine detail (Prefill + Decode internals)
# ========================================================================

def generate_inference_engine():
    W, H = 1400, 840
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    title_font = get_font(26, bold=True)
    heading_font = get_font(18, bold=True)
    label_font = get_font(15, bold=True)
    small_font = get_font(13)
    tiny_font = get_font(11)
    number_font = get_font(13, bold=True)

    draw.text((W // 2, 24), "Inside the Inference Engine: Where the Magic Happens",
              fill=TEXT, font=title_font, anchor="mt")
    draw.text((W // 2, 54), "Prefill reads your prompt.  Decode writes the answer.  Both run on GPUs.",
              fill=TEXT_DIM, font=small_font, anchor="mt")

    # ── Left panel: Prefill ─────────────────────────────────────────────
    px0, py0 = 40, 90
    pw, ph = 640, 380
    draw_rounded_rect(draw, (px0, py0, px0 + pw, py0 + ph), 14,
                      fill=BG_CARD, outline=RED, width=2)
    draw.text((px0 + pw // 2, py0 + 20), "1  Prefill Phase", fill=RED, font=heading_font, anchor="mt")
    draw.text((px0 + pw // 2, py0 + 46), "Processes the entire input prompt at once",
              fill=TEXT_DIM, font=small_font, anchor="mt")

    # prompt components flowing in
    components = [
        ("System prompt", 0.30),
        ("Chat history", 0.25),
        ("Tool definitions", 0.15),
        ("RAG documents", 0.20),
        ("User query", 0.10),
    ]
    bar_x = px0 + 30
    bar_y_start = py0 + 80
    total_bar_w = pw - 60
    for i, (comp, frac) in enumerate(components):
        y = bar_y_start + i * 34
        w = int(total_bar_w * frac)
        draw_rounded_rect(draw, (bar_x, y, bar_x + w, y + 24), 5, fill=RED_BG, outline=RED, width=1)
        draw.text((bar_x + 10, y + 12), comp, fill=TEXT, font=small_font, anchor="lm")
        draw.text((bar_x + w - 10, y + 12), f"{int(frac*100)}%", fill=RED, font=tiny_font, anchor="rm")

    # arrow to KV cache
    kv_y = bar_y_start + 5 * 34 + 16
    draw.text((px0 + pw // 2, kv_y), "All tokens processed in parallel",
              fill=TEXT_DIM, font=small_font, anchor="mt")
    draw_arrow(draw, px0 + pw // 2, kv_y + 18, px0 + pw // 2, kv_y + 38, RED)

    # KV cache box
    kv_box_y = kv_y + 40
    draw_rounded_rect(draw, (bar_x + 80, kv_box_y, bar_x + total_bar_w - 80, kv_box_y + 44),
                      8, fill=RED_BG, outline=RED, width=2)
    draw.text((px0 + pw // 2, kv_box_y + 14), "Attention computed  ->  KV Cache built",
              fill=TEXT, font=label_font, anchor="mt")

    # metric
    draw_rounded_rect(draw, (px0 + 20, py0 + ph - 40, px0 + pw - 20, py0 + ph - 10),
                      6, fill=RED_BG, outline=RED, width=1)
    draw.text((px0 + pw // 2, py0 + ph - 25), "Key metric: Time to First Token (TTFT)",
              fill=RED, font=label_font, anchor="mm")

    # ── Right panel: Decode ─────────────────────────────────────────────
    dx0, dy0 = 720, 90
    dw, dh = 640, 380
    draw_rounded_rect(draw, (dx0, dy0, dx0 + dw, dy0 + dh), 14,
                      fill=BG_CARD, outline=PURPLE, width=2)
    draw.text((dx0 + dw // 2, dy0 + 20), "2  Decode Phase (Autoregressive)",
              fill=PURPLE, font=heading_font, anchor="mt")
    draw.text((dx0 + dw // 2, dy0 + 46), "Generates output one token at a time",
              fill=TEXT_DIM, font=small_font, anchor="mt")

    # token chain – fit inside the decode panel
    chain_y = dy0 + 80
    tokens_row1 = ["The", "capital", "of", "France"]
    tokens_row2 = ["is", "Paris", ".", "<end>"]
    tok_font = get_font(11)
    pad = dx0 + 24               # left margin inside card
    avail = dw - 48              # usable width inside card
    arrow_gap = 10

    for row_idx, tok_row in enumerate((tokens_row1, tokens_row2)):
        n = len(tok_row)
        tok_w = (avail - arrow_gap * (n - 1)) // n
        ty = chain_y + row_idx * 38
        tx = pad
        for i, tok in enumerate(tok_row):
            draw_rounded_rect(draw, (tx, ty, tx + tok_w, ty + 26), 5,
                              fill=PURPLE_BG, outline=PURPLE, width=1)
            draw.text((tx + tok_w // 2, ty + 13), tok, fill=TEXT, font=tok_font, anchor="mm")
            if i < n - 1:
                draw_arrow(draw, tx + tok_w + 1, ty + 13,
                           tx + tok_w + arrow_gap - 1, ty + 13, PURPLE, tip=4, width=1)
            tx = tx + tok_w + arrow_gap

    # decode loop detail – two rows to stay inside container
    loop_y = chain_y + 90
    loop_row1 = ["KV Cache + Prev Token", "Attention Layer", "FFN Layer"]
    loop_row2 = ["Softmax", "Sample Next Token"]
    step_font = get_font(10)

    for row_idx, step_row in enumerate((loop_row1, loop_row2)):
        n = len(step_row)
        step_w = (avail - arrow_gap * (n - 1)) // n
        sy = loop_y + row_idx * 36
        sx = pad
        for i, step in enumerate(step_row):
            draw_rounded_rect(draw, (sx, sy, sx + step_w, sy + 24), 5,
                              fill=BG, outline=PURPLE, width=1)
            draw.text((sx + step_w // 2, sy + 12), step, fill=TEXT_DIM, font=step_font, anchor="mm")
            if i < n - 1:
                draw_arrow(draw, sx + step_w + 1, sy + 12,
                           sx + step_w + arrow_gap - 1, sy + 12, PURPLE, tip=4, width=1)
            sx = sx + step_w + arrow_gap

    # notes
    notes_y = loop_y + 82
    decode_notes = [
        "This loop repeats for every output token",
        "Streaming sends each token as generated",
        "top_p / top_k sampling at softmax step",
    ]
    for i, note in enumerate(decode_notes):
        draw.text((dx0 + 40, notes_y + i * 22), f"  {note}", fill=TEXT_DIM, font=small_font)

    # metric
    draw_rounded_rect(draw, (dx0 + 20, dy0 + dh - 40, dx0 + dw - 20, dy0 + dh - 10),
                      6, fill=PURPLE_BG, outline=PURPLE, width=1)
    draw.text((dx0 + dw // 2, dy0 + dh - 25), "Key metric: Tokens per Second (TPS)",
              fill=PURPLE, font=label_font, anchor="mm")

    # ── Bottom section: Hardware layer ──────────────────────────────────
    hw_y = py0 + ph + 40
    hw_h = 280
    draw_rounded_rect(draw, (40, hw_y, W - 40, hw_y + hw_h), 14,
                      fill=BG_CARD, outline=AMBER, width=2)
    draw.text((W // 2, hw_y + 18), "Hardware Layer: What Powers All of This",
              fill=AMBER, font=heading_font, anchor="mt")

    # GPU visual blocks
    gpu_desc = [
        ("HBM Memory (80 GB+)", "Stores model weights\n+ KV cache", RED),
        ("Tensor Cores", "Matrix multiply\nfor attention & FFN", AMBER),
        ("NVLink / NVSwitch", "Multi-GPU comms\n900 GB/s", CYAN),
        ("FlashAttention", "Fused kernels\nreduce memory traffic\n2x speedup on A100", GREEN),
        ("Tensor Parallelism", "Model split across\nmultiple GPUs for\nfrontier models", PURPLE),
    ]
    gw = 220
    gg = 30
    total_gw = len(gpu_desc) * gw + (len(gpu_desc) - 1) * gg
    gx0 = (W - total_gw) // 2
    gy = hw_y + 56

    for i, (title, desc, color) in enumerate(gpu_desc):
        x = gx0 + i * (gw + gg)
        draw_rounded_rect(draw, (x, gy, x + gw, gy + 150), 10,
                          fill=BG, outline=color, width=2)
        # draw title (single-line safe)
        draw.text((x + gw // 2, gy + 20), title, fill=color, font=label_font, anchor="mt")
        # multiline desc drawn line by line
        dy = gy + 50
        for line in desc.split("\n"):
            draw.text((x + gw // 2, dy), line, fill=TEXT_DIM, font=small_font, anchor="mt")
            dy += 18

    # bottom callout
    draw.text((W // 2, hw_y + hw_h - 28),
              "Entire inference: ~300-800 ms (varies by output length)    |    GPU compute costs $2-3/hour",
              fill=AMBER, font=small_font, anchor="mm")

    # Footer
    draw.text((W // 2, H - 14), "yellamaraju.com", fill=TEXT_DIM, font=tiny_font, anchor="mm")

    img.save(os.path.join(OUTPUT_DIR, "llm-api-inference-engine.png"), "PNG", quality=95)
    print("Generated: llm-api-inference-engine.png")


# ========================================================================
# Image 3 – Network vs Compute latency comparison
# ========================================================================

def generate_latency_comparison():
    W, H = 1200, 700
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    title_font = get_font(26, bold=True)
    heading_font = get_font(18, bold=True)
    label_font = get_font(15, bold=True)
    small_font = get_font(13)
    tiny_font = get_font(11)

    draw.text((W // 2, 24), "Where Your Wait Time Actually Goes",
              fill=TEXT, font=title_font, anchor="mt")
    draw.text((W // 2, 54), "Physics sets a floor.  Compute pays the bill.",
              fill=TEXT_DIM, font=small_font, anchor="mt")

    # ── Left: Network ───────────────────────────────────────────────────
    nx0, ny0 = 40, 90
    nw, nh = 540, 280
    draw_rounded_rect(draw, (nx0, ny0, nx0 + nw, ny0 + nh), 14,
                      fill=BG_CARD, outline=BLUE, width=2)
    draw.text((nx0 + nw // 2, ny0 + 18), "Network Transit", fill=BLUE, font=heading_font, anchor="mt")

    net_lines = [
        ("Speed of light in fiber", "~200,000 km/s (c / 1.5)"),
        ("Per-kilometer one-way", "~5 microseconds"),
        ("", ""),
        ("But real paths are not straight:", ""),
        ("  Circuitous fiber routes", ""),
        ("  Slack loops for maintenance", ""),
        ("  Router and switch queueing", ""),
        ("  Routing follows policy, not maps", ""),
        ("", ""),
        ("Typical same-region round trip:", "5 - 50 ms"),
    ]

    ly = ny0 + 52
    for left, right in net_lines:
        if left == "" and right == "":
            ly += 8
            continue
        draw.text((nx0 + 30, ly), left, fill=TEXT_DIM, font=small_font)
        if right:
            draw.text((nx0 + nw - 30, ly), right, fill=BLUE, font=small_font, anchor="rt")
        ly += 22

    # ── Right: Compute ──────────────────────────────────────────────────
    cx0 = nx0 + nw + 40
    cw = nw
    draw_rounded_rect(draw, (cx0, ny0, cx0 + cw, ny0 + nh), 14,
                      fill=BG_CARD, outline=RED, width=2)
    draw.text((cx0 + cw // 2, ny0 + 18), "GPU Inference Compute", fill=RED, font=heading_font, anchor="mt")

    comp_lines = [
        ("Prefill (reading your prompt)", ""),
        ("  Attention over full input", "O(n) with FlashAttn"),
        ("  Scales with token count", ""),
        ("", ""),
        ("Decode (writing the answer)", ""),
        ("  Sequential: one token at a time", ""),
        ("  Memory-bandwidth bound", ""),
        ("", ""),
        ("Typical inference for one request:", "200 - 5,000+ ms"),
        ("", ""),
    ]

    ly = ny0 + 52
    for left, right in comp_lines:
        if left == "" and right == "":
            ly += 8
            continue
        draw.text((cx0 + 30, ly), left, fill=TEXT_DIM, font=small_font)
        if right:
            draw.text((cx0 + cw - 30, ly), right, fill=RED, font=small_font, anchor="rt")
        ly += 22

    # ── Visual comparison bar ───────────────────────────────────────────
    bar_y = ny0 + nh + 40
    draw.text((W // 2, bar_y), "Proportional time breakdown (typical same-region, medium prompt)",
              fill=TEXT_DIM, font=small_font, anchor="mt")

    bar_y2 = bar_y + 28
    bar_x = 100
    bar_total = W - 200

    net_frac = 0.08
    queue_frac = 0.07
    prefill_frac = 0.35
    decode_frac = 0.42
    post_frac = 0.08

    parts = [
        ("Network", net_frac, BLUE),
        ("Queue", queue_frac, CYAN),
        ("Prefill", prefill_frac, RED),
        ("Decode", decode_frac, "#b91c1c"),
        ("Post + Response", post_frac, GREEN),
    ]

    bx = bar_x
    for label, frac, color in parts:
        seg_w = int(bar_total * frac)
        draw_rounded_rect(draw, (bx, bar_y2, bx + seg_w, bar_y2 + 40), 4, fill=color)
        if seg_w > 60:
            draw.text((bx + seg_w // 2, bar_y2 + 20), label,
                      fill=WHITE, font=small_font, anchor="mm")
        bx += seg_w + 2

    # ── Key insight cards ───────────────────────────────────────────────
    insight_y = bar_y2 + 70
    insights = [
        ("Why shrinking your prompt helps more than choosing a closer region",
         "Prefill scales with input tokens.  Network is usually a small fixed cost.", AMBER),
        ("Why streaming improves UX but not total cost",
         "You see tokens sooner, but the GPU still generates every single one.", PURPLE),
        ("Why the same API call varies in latency",
         "Queueing, batching, and routing differ from call to call.  The model itself is deterministic given the same state.", CYAN),
    ]

    card_w = (W - 120) // 3
    for i, (title, desc, color) in enumerate(insights):
        x = 40 + i * (card_w + 20)
        draw_rounded_rect(draw, (x, insight_y, x + card_w, insight_y + 140), 10,
                          fill=BG_CARD, outline=color, width=2)
        # wrap title
        draw.text((x + card_w // 2, insight_y + 16), title[:50],
                  fill=TEXT, font=label_font, anchor="mt")
        if len(title) > 50:
            draw.text((x + card_w // 2, insight_y + 36), title[50:],
                      fill=TEXT, font=label_font, anchor="mt")

        # wrap desc
        dy = insight_y + 62
        words = desc.split()
        line = ""
        for w in words:
            test = line + " " + w if line else w
            if len(test) * 7 > card_w - 40:
                draw.text((x + 20, dy), line, fill=TEXT_DIM, font=small_font)
                dy += 18
                line = w
            else:
                line = test
        if line:
            draw.text((x + 20, dy), line, fill=TEXT_DIM, font=small_font)

    # Footer
    draw.text((W // 2, H - 14), "yellamaraju.com", fill=TEXT_DIM, font=tiny_font, anchor="mm")

    img.save(os.path.join(OUTPUT_DIR, "llm-api-latency-comparison.png"), "PNG", quality=95)
    print("Generated: llm-api-latency-comparison.png")


# ========================================================================
# Image 4 – Practical optimization levers
# ========================================================================

def generate_optimization_levers():
    W, H = 1200, 650
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    title_font = get_font(26, bold=True)
    heading_font = get_font(18, bold=True)
    label_font = get_font(15, bold=True)
    small_font = get_font(13)
    tiny_font = get_font(11)

    draw.text((W // 2, 24), "What You Can Actually Control",
              fill=TEXT, font=title_font, anchor="mt")
    draw.text((W // 2, 54), "Six levers that reduce latency and cost without changing the model",
              fill=TEXT_DIM, font=small_font, anchor="mt")

    levers = [
        ("1", "Shrink Prompts", "Long prompts = more prefill\n= higher TTFT + more cost.\nRemove what the model\ndoes not need.",
         RED, RED_BG, "High"),
        ("2", "Shorter Outputs", "Every output token costs\ndecode time.  Ask for concise\nanswers.  Set max_tokens\nwhere appropriate.",
         RED, RED_BG, "High"),
        ("3", "Right-size Model", "Classification, extraction,\nand routing rarely need\nfrontier models. Smaller =\nfaster + cheaper.",
         AMBER, AMBER_BG, "High"),
        ("4", "Use Streaming", "Perceived latency drops when\nusers see tokens arriving.\nDoesn't reduce compute,\nbut improves UX.",
         GREEN, GREEN_BG, "Medium"),
        ("5", "Region Placement", "Keep your app in the same\nregion as the provider.\nAvoid transcontinental hops\nfor latency-sensitive calls.",
         BLUE, BLUE_BG, "Medium"),
        ("6", "Prompt Caching", "Reuse stable prefixes.\nOpenAI: up to 80% latency\nreduction, 90% input cost\nreduction for cached prompts.",
         PURPLE, PURPLE_BG, "Medium"),
    ]

    card_w = 340
    card_h = 220
    gap_x = 40
    gap_y = 30
    cols = 3
    rows = 2

    total_w = cols * card_w + (cols - 1) * gap_x
    total_h = rows * card_h + (rows - 1) * gap_y
    x0 = (W - total_w) // 2
    y0 = 90

    for idx, (num, title, desc, color, bg, impact) in enumerate(levers):
        col = idx % cols
        row = idx // cols
        x = x0 + col * (card_w + gap_x)
        y = y0 + row * (card_h + gap_y)

        draw_rounded_rect(draw, (x, y, x + card_w, y + card_h), 12,
                          fill=BG_CARD, outline=color, width=2)

        # number badge
        cx = x + 22
        cy = y + 22
        draw.ellipse((cx - 12, cy - 12, cx + 12, cy + 12), fill=color)
        draw.text((cx, cy), num, fill=WHITE, font=label_font, anchor="mm")

        # title
        draw.text((x + card_w // 2, y + 20), title, fill=TEXT, font=heading_font, anchor="mt")

        # impact badge
        ix = x + card_w - 70
        draw_rounded_rect(draw, (ix, y + 8, ix + 62, y + 26), 6, fill=bg, outline=color, width=1)
        draw.text((ix + 31, y + 17), impact, fill=color, font=tiny_font, anchor="mm")

        # description
        dy = y + 52
        for line in desc.split("\n"):
            draw.text((x + 24, dy), line, fill=TEXT_DIM, font=small_font)
            dy += 20

    # Footer
    draw.text((W // 2, H - 14), "yellamaraju.com", fill=TEXT_DIM, font=tiny_font, anchor="mm")

    img.save(os.path.join(OUTPUT_DIR, "llm-api-optimization-levers.png"), "PNG", quality=95)
    print("Generated: llm-api-optimization-levers.png")


# ========================================================================
# Image 5 – Model Router (replaces Mermaid diagram)
# ========================================================================

def generate_model_router():
    W, H = 1200, 500
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    title_font = get_font(22, bold=True)
    label_font = get_font(15, bold=True)
    small_font = get_font(13)
    tiny_font = get_font(11)

    draw.text((W // 2, 20), "Model Router: How Requests Get Dispatched",
              fill=TEXT, font=title_font, anchor="mt")
    draw.text((W // 2, 48), "Every provider with multiple models has this layer",
              fill=TEXT_DIM, font=small_font, anchor="mt")

    # Request box on the left
    rx, ry = 40, 185
    rw, rh = 160, 80
    draw_rounded_rect(draw, (rx, ry, rx + rw, ry + rh), 10, fill=BG_CARD, outline=BLUE, width=2)
    draw.text((rx + rw // 2, ry + 22), "Incoming", fill=TEXT, font=label_font, anchor="mt")
    draw.text((rx + rw // 2, ry + 44), "Request", fill=TEXT, font=label_font, anchor="mt")

    # Load Balancer in the middle
    lbx, lby = 300, 165
    lbw, lbh = 180, 120
    draw_rounded_rect(draw, (lbx, lby, lbx + lbw, lby + lbh), 10, fill=BG_CARD, outline=CYAN, width=2)
    draw.text((lbx + lbw // 2, lby + 18), "Load Balancer", fill=CYAN, font=label_font, anchor="mt")
    draw.text((lbx + lbw // 2, lby + 48), "Model routing", fill=TEXT_DIM, font=small_font, anchor="mt")
    draw.text((lbx + lbw // 2, lby + 66), "Capacity check", fill=TEXT_DIM, font=small_font, anchor="mt")
    draw.text((lbx + lbw // 2, lby + 84), "Batch scheduling", fill=TEXT_DIM, font=small_font, anchor="mt")

    # Arrow from Request to LB
    draw_arrow(draw, rx + rw + 5, ry + rh // 2, lbx - 5, lby + lbh // 2, BLUE)

    # GPU Clusters on the right
    clusters = [
        ("GPU Cluster A", "Heavy inference", "Frontier models", RED),
        ("GPU Cluster B", "Optimized models", "Low-latency tasks", AMBER),
        ("GPU Cluster C", "Embedding", "Vector generation", PURPLE),
    ]

    cx_start = 600
    cluster_w = 220
    cluster_h = 80
    cluster_gap = 20
    cluster_y0 = 90

    for i, (name, desc1, desc2, color) in enumerate(clusters):
        cx = cx_start
        cy = cluster_y0 + i * (cluster_h + cluster_gap)
        draw_rounded_rect(draw, (cx, cy, cx + cluster_w, cy + cluster_h), 10,
                          fill=BG_CARD, outline=color, width=2)
        draw.text((cx + cluster_w // 2, cy + 12), name, fill=color, font=label_font, anchor="mt")
        draw.text((cx + cluster_w // 2, cy + 36), desc1, fill=TEXT_DIM, font=small_font, anchor="mt")
        draw.text((cx + cluster_w // 2, cy + 54), desc2, fill=TEXT_DIM, font=small_font, anchor="mt")

        # Arrow from LB to cluster
        draw_arrow(draw, lbx + lbw + 5, lby + lbh // 2,
                   cx - 5, cy + cluster_h // 2, color)

    # Annotation on far right
    ax = cx_start + cluster_w + 40
    ann_items = [
        "Model weights loaded in HBM",
        "Requests batched per cluster",
        "Health + capacity checks",
        "Multi-GPU for large models",
    ]
    for i, item in enumerate(ann_items):
        draw.text((ax, 140 + i * 24), f"  {item}", fill=TEXT_DIM, font=small_font)

    # Bottom note
    draw.text((W // 2, H - 50),
              "Large models are split across multiple GPUs  |  Requests are batched for throughput",
              fill=TEXT_DIM, font=small_font, anchor="mt")

    # Footer
    draw.text((W // 2, H - 16), "yellamaraju.com", fill=TEXT_DIM, font=tiny_font, anchor="mm")

    img.save(os.path.join(OUTPUT_DIR, "llm-api-model-router.png"), "PNG", quality=95)
    print("Generated: llm-api-model-router.png")


# ========================================================================

if __name__ == "__main__":
    generate_request_lifecycle()
    generate_inference_engine()
    generate_latency_comparison()
    generate_optimization_levers()
    generate_model_router()
    print("\nAll LLM API images generated successfully.")
