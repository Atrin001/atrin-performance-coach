# Atrin Performance Coach

A mobile-first workout logger and adaptive coaching app personalized for Atrin's three-night strength and athletic-performance plan.

## What is included

- A second five-week, three-day full-body block with bench and arm priority
- Week 6 load recalibration, weeks 7–9 progression, and a week 10 fatigue drop
- Readiness check using sleep, energy and soreness
- Set-by-set weight, reps and RIR logging
- Automatic double-progression targets from recent performance
- Rest timer and exercise alternatives
- Progress charts and JSON import/export
- Personal body-composition profile
- Gemini 3.8 Flash coach with recent workout and block context
- ChatGPT sign-in, including accounts that use **Continue with Google**
- Private, account-scoped cloud history backed by Cloudflare D1

Atrin's verified account starts with the summarized five-week history. Every other permitted account starts empty, and each account's workouts, targets and chat history remain separate. The original chat export is not included. Keep exported personal JSON files out of a public repository.

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open the local URL printed by the development server. Account identity and D1 persistence are supplied by the Sites hosting environment; local development does not inject a production user automatically.

## Connect Gemini

Create an API key in Google AI Studio and set:

```
GEMINI_API_KEY=your_key_here
```

The recommended production setup keeps this key as a server-side environment variable. For private personal testing, the app also lets you enter a key in **AI Coach → Connection**; that fallback is stored only in the current browser.

The coach endpoint uses `gemini-3.8-flash`, the latest generally available Flash model when this version was built (September 2026). To change models later, update `MODEL` in `app/api/coach/route.ts` after checking Google's current model documentation.

## Account access

The deployed Site uses the hosting platform's verified sign-in layer. A user with a Gmail address can sign into ChatGPT with **Continue with Google**, then open the Site after that exact email has been added to the Site access list. The application never trusts an email supplied by browser JavaScript; its server reads the verified user identity and keys all saved state by that identity.

## Put it on GitHub

1. Create a new private GitHub repository.
2. Upload this project's files or push the folder with Git.
3. Deploy the repository with a full-stack host such as Cloudflare Workers or Vercel.
4. Add `GEMINI_API_KEY` as a protected environment variable in the host dashboard.

GitHub Pages alone cannot run the server-side Gemini endpoint. You can still keep the source on GitHub and connect the repository to a full-stack host.

## Progression rules

- Own the top of the rep range with 1–3 RIR before adding the smallest practical load.
- Keep the load and add a rep when performance is inside the target range.
- Reduce one increment when reps fall below the range or sets repeatedly reach failure.
- On poor sleep or readiness, preserve the main lifts but remove one accessory set.
- Invalid history values above 100 reps or 500 kg are ignored.

## Health note

This app does not diagnose injuries. Stop a movement that causes sharp, worsening, radiating or persistent pain and seek an appropriate clinician.
