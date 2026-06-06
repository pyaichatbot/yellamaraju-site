---
name: concept-illustration
description: Generate minimalist conceptual illustrations for technical and business content. Create sketch-style diagrams that explain complex ideas, structures, workflows, and systems through clean hand-drawn visuals with a recurring absurd character. Works with any language content.
---

# Concept Illustration Skill

## Core Purpose

Design and generate 16:9 horizontal sketch-style illustrations for technical articles, documentation, blog posts, and conceptual content. Goal is not commercial illustration, PPT infographics, or cute cartoons—but turning key concepts, workflows, structures, states, or metaphors from your content into clean, absurd, creative, readable sketch explanations.

Default visual IP is "The Worker"—a solid-black minimalist character with white dot eyes, thin legs, blank serious expression, doing strange but logical work. The Worker must actively participate in the core action, never just stand as decoration.

## References

Load by task need, don't cram everything at once:

- `references/style-dna.md`—visual identity, color palette, typography, taboos.
- `references/character-ip.md`—character appearance, personality, action library, taboos.
- `references/composition-patterns.md`—structure types, original metaphor generation, reuse rules.
- `references/prompt-template.md`—single-image generation template.
- `references/qa-checklist.md`—post-generation review and iteration rules.
- `assets/examples/`—low-frequency visual calibration only, never copy compositions directly.

## Workflow

### 1. Digest the Content

Read user-provided text, links, documents, Markdown, or screenshots. Extract:

- What is the core insight or concept?
- Which sections are cognitive turning points?
- What content actually benefits from visual explanation?
- Where does text alone suffice?

Don't spread illustrations evenly. Prioritize *cognitive anchors*: core judgments, key transitions, input-output loops, branching points, before-after contrasts, unified concepts, connection paths, common pitfalls, state changes.

### 2. Create an Illustration Strategy (Shot List)

If user asks to "analyze illustration placement" or "think about where images help," output a shot list before generating. For each image, write:

- Where it goes in the document
- Image theme/topic
- Core idea the image conveys
- Structure type (see references/composition-patterns.md)
- What the Worker is doing
- Suggested visual elements
- Suggested labels/annotations

Default 4–8 images. Short articles: 1–3. Long articles: rarely exceed 9. Use as many as necessary; don't turn content into a picture book.

### 3. Generate Single Images

If user explicitly requests "generate / create / produce / make images," don't wait for approval—generate each image separately using the provided template. Never combine multiple concepts into one image.

Each image explains exactly one core structure. Generation prompt must include:

- 16:9 horizontal sketch-style illustration
- Pure white background
- Black hand-drawn line art
- Sparse red/orange/blue handwritten annotations
- Heavy white space
- The Worker performing the core action
- No PPT, commercial illustration, cute mascots, complex architecture, top-left titles

Don't recycle prior examples. Examples provide style density and character participation—not reusable compositions. Invent a fresh, strange-but-logical visual metaphor from the current content every time.

### 4. Review and Iterate

After generation, check `references/qa-checklist.md`. If issues appear, regenerate or edit:

- Worker is only decoration, not doing core work
- Composition feels too crowded
- Looks like a formal diagram, flowchart, or slide
- Text is excessive or poorly written
- Top-left title appears
- Aesthetic is too cute, childish, or rigid
- Background is not clean white

### 5. Save and Deliver

If working in a project workspace, save final images to:

```
assets/<article-slug>-illustrations/
```

Name sequentially:

```
01-concept-name.png
02-concept-name.png
```

Keep original generated files; don't overwrite unless explicitly requested.

## Output Standards

**Pre-generation strategy:** short and clear.

**Post-generation delivery:**
- How many images generated
- Purpose of each
- Save location
- Which images are stable, which are optional

Don't explain style theory at length. Let the images speak.
