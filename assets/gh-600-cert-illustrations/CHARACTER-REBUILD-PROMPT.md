# The Worker Character — Explicit Rebuild Prompt

**Problem:** Previous generations merged head/torso/arms/legs into one blob shape.

**Solution:** Be ruthlessly specific about body part separation and visual structure.

---

## Ultra-Explicit Character Generation Prompt

```
Generate a simple human figure character for an educational illustration.

BODY STRUCTURE (must be clearly SEPARATE parts, NOT merged):

1. HEAD: One circle or oval shape at the very top. Small. Solid black outline only (not filled blob).
   - Inside the head: two white circular dot eyes, centered, 1/4 down from top.
   - NO MOUTH, NO NOSE, NO FACIAL FEATURES. Only the dots.
   - The head sits ON TOP, clearly separated from the torso below.

2. TORSO/BODY: One rectangle or vertical oval shape, directly below and attached to the bottom of the head.
   - Width: narrower than the head.
   - Height: about 1.5x the head's height.
   - Solid black outline, not filled blob.

3. ARMS: TWO SEPARATE thin lines extending horizontally from the sides of the torso, roughly 1/3 down from the top of the torso.
   - Each arm is one thin line (like a stick arm), slightly bent or straight.
   - Each arm ends in a small circle (hand).
   - Left arm extends left, right arm extends right.
   - Arms should be VISIBLY SEPARATE from the torso, not merged into it.

4. LEGS: TWO SEPARATE thin lines extending downward from the bottom of the torso.
   - Each leg is one thin line (like a stick leg).
   - Legs are slightly splayed or together; dealer's choice.
   - Legs extend downward, clearly separated from the torso.

OVERALL SILHOUETTE:
- When you squint, it looks like: circle (head) on top, rectangle (body) in middle, two lines extending left/right (arms), two lines extending down (legs).
- It should be RECOGNIZABLY HUMAN, like a simple stick figure drawn with a thick marker.
- NOT a blob. NOT abstract. NOT potato-shaped.
- GAPS and SEPARATION between head, torso, arms, legs should be visible.

STYLE:
- Solid black line art (no fill, just outlines).
- Hand-drawn feel: slightly wobbly, imperfect lines, not geometric or perfectly symmetrical.
- Minimalist: no clothing, no accessories, no extra details.

EXPRESSION/POSE:
- One arm gesturing outward (extended, making a point or showing direction).
- Other arm at rest or slightly bent.
- Legs grounded, standing stable.
- Eyes: white dots only, blank/neutral stare (not angry, not happy, not surprised).
- Overall pose: like a teacher standing at a whiteboard, calm and direct.

COLOR:
- Solid black for all outlines and lines.
- White for the eyes (circular dots).
- NO shading, NO gradients, NO fill.

DO NOT:
- ❌ Make it a rounded blob.
- ❌ Merge the head into the torso.
- ❌ Make arms and legs invisible or fused into the body.
- ❌ Add a mouth, nose, hair, clothes, or facial expression.
- ❌ Make it look like a potato, bean, or abstract shape.
- ❌ Fill the body with color (outline only).

DO:
- ✓ Make clear visual separation between head, torso, arms, legs.
- ✓ Make it look like a simple human figure, not an object.
- ✓ Keep it minimalist but RECOGNIZABLE as human.
- ✓ Use thin, slightly wobbly hand-drawn lines.
```

---

## Alternative Phrasing (if above doesn't work)

```
Create a character in the style of a child's simple drawing or a stick figure, but drawn by an adult with a thick pen.

The character has:
- A round head with two dot eyes
- A rectangular body directly under the head
- Two stick arms extending from the sides of the body
- Two stick legs extending from the bottom of the body

All parts are clearly separate (you can see where the head ends and body starts, where arms attach, where legs attach).

The character is entirely black line art, hand-drawn and slightly imperfect.

The character stands confidently, like someone giving a talk.

It should look HUMAN, not like a blob, animal, or object.

Think: simple stick figure, but with proportional limbs and a confident stance.
```

---

## If Still Getting Blob

**Last resort:** Request specific anatomical hints:

```
Character structure (use if generator defaults to blob):
- Head: Small circle at top (like a lollipop stick figure)
- Neck: Thin line connecting head to body (if needed)
- Torso: Tall narrow rectangle directly below head
- Left arm: Thin diagonal line from upper-left of torso, ending in small circle (hand)
- Right arm: Thin diagonal line from upper-right of torso, gesturing outward, ending in small circle (hand)
- Left leg: Thin vertical line from bottom-left of torso, extending down
- Right leg: Thin vertical line from bottom-right of torso, extending down
- Eyes: Two white circles inside the head, centered

Visual metaphor: "Stick figure that has grown up and learned to stand properly."
```

---

## Why This Matters

Previous prompt said "stick figure" but the generator interpreted it as "minimalist black creature," which merged into a blob.

This version:
- Names each body part explicitly (head, torso, arms, legs)
- Specifies SEPARATION and GAPS
- Uses simple geometric shapes (circle, rectangle, lines)
- Forbids blob/potato/abstract shapes
- Emphasizes HUMAN SILHOUETTE

The key: **clarity about what is separate**, not just "minimalist."
