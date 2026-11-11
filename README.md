<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Minimal Clock (clock.gominimal.app)

A minimal, distraction-free clock, timer, stopwatch, and countdown web app — the companion to the Minimal Clock mobile app, sharing the same Supabase-backed accounts and countdowns.

View your app in AI Studio: https://ai.studio/apps/340e9808-45b2-4e35-bb4e-92b8f16bf21d

## Features

- **Digital & Analog Clock** — large, distraction-free time display with 12/24-hour format, optional seconds, and a choice of clock fonts.
- **World Clocks** — pin small tiles showing the current time in any city/timezone alongside the main clock.
- **Timer**
  - **Duration** or **Until Time** input modes.
  - **Multiple simultaneous timers** — start several independent, named timers at once (e.g. "10 min pasta" + "25 min laundry"), each with its own pause/resume/reset and a completion notification, shown as a list.
  - **Stopwatch** — counts up with start/pause/resume/reset, anchored to a wall-clock timestamp so time isn't lost if the tab is backgrounded or inactive. Displays `mm:ss.hundredths`, switching to `h:mm:ss.hundredths` past an hour.
- **Countdowns**
  - Create, edit, and share countdowns to a specific date/time, with confetti and an optional browser notification when they hit zero.
  - **Categories** — tag a countdown with a category (e.g. "Birthdays", "Trips", "Work") and filter your countdown list by it.
  - **Pinning** — pin a countdown as a personal preference so it's highlighted and sorted to the top of your list, independent of who else follows it.
  - Sign in to sync countdowns across devices and share a countdown via link (also openable in the mobile app).
- **Light/Dark mode**, hideable UI, and an Apple TV pairing flow (`?pair=<code>`).

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
