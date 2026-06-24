# Bud Balcony

A project-based grow + content tracker. Built to document a balcony cannabis grow from seed to smoke and turn it into a social series, but the project model means the same tool works for any venture you want to track and post about.

Vite + React. Installable as a PWA. Data lives on your device; you move it between machines with JSON export/import. No accounts, no server, no cloud.

---

## Run it locally

```bash
npm install
npm run dev
```

Open the printed URL (usually http://localhost:5173).

To make a production build:

```bash
npm run build      # outputs to /dist
npm run preview    # serve the built version locally
```

---

## Deploy to GitHub + Vercel

**1. Push to GitHub**

```bash
git init
git add .
git commit -m "Bud Balcony v1"
git branch -M main
git remote add origin https://github.com/<you>/bud-balcony.git
git push -u origin main
```

**2. Import in Vercel**

- Go to vercel.com, New Project, import the repo.
- Vercel auto-detects Vite. Defaults are correct:
  - Build command: `npm run build`
  - Output directory: `dist`
- Deploy. You get a live URL.

Every push to `main` redeploys automatically.

---

## Install as a PWA on iPhone

1. Open the Vercel URL in **Safari** (it has to be Safari, not Chrome, for install).
2. Tap the Share button.
3. Tap **Add to Home Screen**.

It launches full-screen like a native app and works offline. Same steps with the install icon on a laptop browser.

> Heads up: data is stored per-browser, per-device. The phone and the laptop are separate. To carry data across, use Export on one and Import on the other (Settings, or the project menu).

---

## How it's built

- **Projects.** Everything is scoped to a project. Switch, create, duplicate, rename, delete, export, and import from the project menu at the bottom of the sidebar. Start a new project for a new venture.
- **Grow module.** Plants, Grow Log, and Milestones can be turned off in Settings for non-grow projects.
- **Day counting.** Set a germination date in Settings. That date is Day 1, and every day number across the app counts from it.
- **Platforms.** Instagram, TikTok, YT Shorts. Toggle in Settings.

### Data model

One JSON object per project: `settings`, `plants`, `growLog`, `posts`, `ideas`, `stories`, `milestones`, `calendar`, `followers`. Dates are stored as `YYYY-MM-DD` strings to avoid timezone drift. An export is just this object wrapped with a version tag.

### Structure

```
src/
  lib/        date math, ids, colors
  store/      project state, persistence, defaults/seed
  components/ sidebar, switcher, modal, chart, icons
  views/      dashboard, grow log, plants, calendar,
              content, ideas, stories, milestones, settings
```

## Notes

- A starter "Bud Balcony" project is seeded on first load with your five plants, milestones, and content ideas. Edit or delete anything.
- Clearing your browser data wipes local storage. Export first if it matters.
