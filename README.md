# Charles John Duot — Portfolio

Personal portfolio site for Charles John Duot, an AI-assisted full-stack web developer (Next.js, React, TypeScript, Tailwind CSS, Supabase/PostgreSQL). Static site built with Vite and deployed on Netlify.

## Stack

- Plain HTML + CSS + vanilla JS (ES modules)
- [Vite](https://vitejs.dev/) for bundling (multi-page build, see `vite.config.js`)
- Font Awesome 6 and Devicon 2.16 icon fonts via CDN
- Formspree for the contact form

## Project structure

```text
Portfolio/
├─ index.html                 # main single-page portfolio
├─ projects/                  # one detail page per project
│  ├─ event-core.html
│  ├─ lux-kitchens.html
│  ├─ helpdesk-ticketing-system.html
│  ├─ cj-ai-assistant.html
│  └─ starlegends-rodriguez.html
├─ css/
│  └─ style.css               # global styles (theme, layout, components, project-page utilities)
├─ js/
│  └─ main.js                 # nav, theme toggle, typing effect, scroll reveal
├─ assets/
│  ├─ Charles_John_Duot_Resume.pdf
│  └─ images/                 # profile, project cards, tool icons
├─ public/                    # copied verbatim into dist/ (favicon, icons, og-image, manifest, resume PDF)
├─ scripts/
│  └─ optimize-images.mjs     # sharp-based WebP converter (npm run images)
├─ vite.config.js
└─ netlify.toml
```

## Development

```bash
npm install
npm run dev      # local dev server with HMR
npm run build    # production build to dist/
npm run preview  # serve the built dist/ locally
npm run images   # convert large PNG/JPG in assets/images to WebP (max 1400px wide)
```

## Editing content

- **Hero / About / Experience / Education** — edit the sections in `index.html`.
- **Typing tagline** — `phrases` array in `js/main.js`.
- **Skills & Tools** — chip groups under `#skills` in `index.html`.
- **Projects** — add a card under `#projects` in `index.html`, create `projects/<slug>.html` (copy an existing page), add a preview image in `assets/images/`, and register the page in `vite.config.js` under `rollupOptions.input`.
- **Images** — drop PNG/JPG into `assets/images/`, run `npm run images`, and reference the generated `.webp` in HTML with `loading="lazy"`.
- **Site URL** — the canonical, Open Graph, and JSON-LD tags in `index.html` point at `https://charlesjohnduot.netlify.app/`; search-and-replace that when the domain changes.
- **Resume** — replace `assets/Charles_John_Duot_Resume.pdf` and `public/assets/Charles_John_Duot_Resume.pdf`.
- **Styling** — keep styles in `css/style.css` (no inline `style=""` attributes; the project uses named utility classes such as `.project-hero`, `.project-subhead`, `.btn-gap`). Page-specific CSS goes in its own file under `css/`.
- **Colors / theme** — CSS variables in `:root` and `[data-theme="light"]` in `css/style.css`.

## Deployment

Netlify builds with `npm run build` and publishes `dist/` (see `netlify.toml`). Any static host works: push the repo and point the host at the Vite build output.

## Accessibility

Skip link, semantic landmarks, keyboard-accessible modals with focus trapping, `prefers-reduced-motion` support, and a light/dark theme toggle persisted in `localStorage`.
