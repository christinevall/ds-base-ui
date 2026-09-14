# Sample Design System

A playground for designers learning AI design system workflows. It is a small, real design system built on [Base UI](https://base-ui.com) primitives, documented in [Storybook](https://storybook.js.org) and mirrored into Figma, so you can try the whole loop yourself: tokens in code, components in Storybook, the same system as Figma variables and components, and AI tools connected to both through MCP.

It is a teaching repo, not a production system. Some colour pairs still fail contrast (`npm run check:contrast`), and the places where Figma cannot match the code are listed in [`figma/GAPS.md`](figma/GAPS.md).

42 components, 4 foundations pages, 4 full-screen patterns.

**Live Storybook:** [christinevall.github.io/ds-base-ui](https://christinevall.github.io/ds-base-ui/) — no install needed. It updates on every merge to `main`.

**Figma library:** [Figma Community](https://www.figma.com/community/file/1681312616396112992) — the same system as Figma variables, text styles and components, generated from this code. Duplicate it to explore.

## How I use this playground

This is the workflow I'm exploring with it, and it will keep changing while I build a course around it.

1. **Work on the `design` branch.** A branch is a parallel copy of the code. `design` is where prototypes live, so nothing you try there touches `main` ([docs/branching.md](docs/branching.md)).
2. **See the system in Storybook.** Every component, live and working, so you can see the codebase instead of reading it.
3. **Keep Figma in step with the code.** The Figma library is generated from this code through the Figma Console MCP (MCP is a standard plug that lets an AI tool read from another tool and work in it), following the `figma-mirror` skill in `.claude/skills/`. Variables, text styles and components use the same names and options as the code. Where Figma cannot express the CSS, it is written down in `figma/GAPS.md` rather than simplifying the CSS.
4. **Prototype in Storybook with real components**, then ask the agent to build the screen in Figma, where the library is already set up.
5. **Explore in Figma.** Move things by hand, put research and references next to it, and stay in the system or step out of it on purpose when the design needs something custom.
6. **Bring it back to code.** Ask the agent to rebuild the Figma screen from the real components. `figma/manifest.json` is how a Figma name like `Button · variant=primary` resolves back to `<Button variant="primary">`. The result is a real, clickable prototype in Storybook.
7. **Hand off.** An accepted prototype does not merge as it is. It gets built properly on a `feature/*` branch through a pull request, where developers run the tests and checks production code needs.

**What has been tried and what has not.** The Figma to Storybook direction has been done here once: the booking flow under *Prototypes* in Storybook started as a Figma prototype. Steps 6 and 7 have not been run inside a real product team yet, and there is no packaged skill for moving prototypes between Figma and Storybook. You ask for it in plain words.

## Stack

- **Vite 8 + React 19 + TypeScript** for the build
- **`@base-ui/react` 1.8.0** for unstyled, accessible primitives
- **CSS Modules + custom properties** for styling, so tokens stay inspectable in the browser and portable to Figma
- **Storybook 10** for documentation, with the docs, a11y and MCP addons

## Getting started

**If you have never run code before, you need exactly two things:**

1. **[Claude Code](https://claude.com/claude-code)** — the desktop app.
2. **[Node.js](https://nodejs.org)** — download the LTS build and run the
   installer. Node 22 or newer (this repo is developed on Node 24). To check
   whether you already have it, open Terminal and type `node -v`.

Then download this repository (green **Code** button → **Download ZIP**),
unzip it, open the folder in Claude Code, and say:

> Show me Storybook

Claude installs the dependencies and starts it for you. To run the health
check on this system, say:

> Run the design system inspection

The inspection skill already ships inside this repo — nothing to install.

### Or, from the terminal

```bash
npm install
npm run storybook   # http://localhost:6001  <- the real workspace
npm run dev         # http://localhost:5173  <- scratch playground
npm run build       # tokens + typecheck + production build
npm run build:tokens # regenerate the CSS token layer from tokens/
npm run build-storybook
npm run check:contrast # colour contrast of every token pair
```

Open **Getting started** in the Storybook sidebar first.

## How it is organised

```
tokens/                SOURCE OF TRUTH for design decisions (DTCG JSON)
  tier-1-definitions/  raw ramps and scales, themeless
  tier-2-usage/        roles, themed light/dark, plus composite text styles
scripts/
  build-tokens.mjs     Style Dictionary build: tokens/ -> src/tokens/
src/
  tokens/              GENERATED — do not edit
    primitives.css     from tier-1-definitions/
    semantic.css       from tier-2-usage/, light and dark blocks
    breakpoints.ts     breakpoints as values, for media queries and viewports
    base.css           imports the generated CSS, plus a minimal reset
  components/          42 components, one folder each
  foundations/         Colour, Typography, Space and shape, Motion
  patterns/            Settings page, Sign-up form, Data table, App shell
  index.ts             the public surface of the library
CLAUDE.md              the rails: ground before writing, then the rules
docs/
  architecture.md      why the repo is shaped this way
  conventions.md       how to add a component
  branching.md         the Gitflow variant, including the design branch
```

### The two token tiers

**Edit `tokens/**/*.json`, then run `npm run build:tokens`.** The CSS is output.

Tier 1 is the raw material: `--sds-color-brand-600`, `--sds-space-4`. Nothing in a component may reference a tier-1 colour.

Tier 2 is the contract, organised into three categories — `--sds-color-background-*`, `--sds-color-content-*`, `--sds-color-border-*` — plus `--sds-typography-heading-lg-font-size` and friends. Components use only these. Theming means redefining tier 2, never touching tier 1 or components.

That separation is also what makes the Figma sync work. Tier-2 names map one-to-one to Figma variables, the light and dark files map to Figma variable modes, and the `var()` references map to Figma variable aliases.

Flip the theme in the Storybook toolbar to see it.

**Breakpoints are emitted twice**, to CSS and to TypeScript, because `@media (min-width: var(--x))` is not valid CSS. Storybook viewports are generated from the TypeScript so they cannot drift from the tokens.

## Adding a component

See [docs/conventions.md](docs/conventions.md). The short version:

1. If Base UI has a primitive, wrap it. Never rebuild focus management or ARIA.
2. Read the primitive's types and Base UI's own reference demo before writing. Not from memory.
3. Semantic tokens only. No raw hex, no primitive colours.
4. Style from Base UI's `data-` state attributes, not from React state.
5. A story per meaningful state, disabled included, and a clean a11y panel in both themes.

## Roadmap

- [x] Base UI + Storybook, token layer, 42 components, foundations and patterns
- [x] On GitHub with the branch model documented
- [ ] Semantic scale tokens for space, radius and type, so density theming is possible without editing primitives
- [x] Move tokens to a DTCG source of truth (`tokens/**/*.json`) with a generator emitting the CSS
- [x] Sync tokens to Figma variables (mirrored 2026-09-10 through the Figma Console bridge)
- [ ] Code Connect mappings so Figma components point at these files
- [x] Publish Storybook from `main` (GitHub Pages)
- [ ] Publish Storybook per branch, including `design`

## Branching

See [docs/branching.md](docs/branching.md). `main` is the design system; changes land on it through `feature/*` pull requests. `design` exists as a long-lived branch for designers to prototype in real code, and accepted prototypes come back through a normal feature branch rather than merging `design` directly.

## Made by

[Christine Vallaure](https://christinevallaure.com), founder of [moonlearning.io](https://moonlearning.io). I teach designers how Figma, code and AI fit together.

- **The full course on this workflow** is in the making: advanced, for designers with solid Figma skills. The [newsletter](https://moonlearning.io/newsletter) is where I announce it.
- **Live course on Maven:** [Build Scalable UI in Figma & AI: Design Systems Agents Can Actually Use](https://maven.com/moonlearning/figma). Four weeks, hybrid, all levels.
- **Lightning session:** *Design Figma Files That Scale with AI*, with materials at [moonlearning.io/scaleAI](https://moonlearning.io/scaleAI).
- **Self-paced Figma courses** in the [moonlearning store](https://moonlearning.io/store), and [free sessions](https://moonlearning.io/resources).
- **For design teams:** in-house AI workshops and consulting, through [moonlearning.io](https://moonlearning.io).

## Credits

The design system health check in `.claude/skills/ds-inspection/` is the
`ds-inspection` skill by **[Brad Frost](https://bradfrost.com)**, from
<https://github.com/bradfrost/skills>, bundled here under the MIT licence so
that it runs with no setup. See
[`.claude/skills/ds-inspection/ATTRIBUTION.md`](.claude/skills/ds-inspection/ATTRIBUTION.md).
