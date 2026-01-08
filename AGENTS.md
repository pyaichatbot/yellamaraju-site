# AGENTS

## Project Overview
- Astro site for yellamaraju.com with content in `src/content` and pages in `src/pages`.
- Styling lives in `src/styles/global.css` plus component-local styles.

## Workflow
- Prefer `rg` for searches and keep changes scoped to relevant files.
- Avoid editing `node_modules` and `dist`.
- When updating UI components, keep styles co-located in the component file.

## Content and Metadata
- Blog content is sourced from the `blog` collection; use `post.body` for full-content metrics.
- Canonical site URL should align with `astro.config.mjs`.

## Testing
- No automated tests are defined; validate changes by running the Astro dev server if needed.
