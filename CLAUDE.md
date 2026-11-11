# Stroller God Game — top-down guardian-angel game

A cozy top-down puzzle game set in Switzerland and Europe. A parent pushes a
sleeping baby along a path on a grid map. The player is an unseen guardian
angel who drags items and signs onto tiles to stop hazards before they wake
the baby. Target: a 4-level browser MVP in 12 weeks, Steam (Windows) after.

## Source of truth
- DESIGN.md — what the game is, plus the 12-week build plan (section 10).
  Never add features that aren't in it. Work on the current week only.
- specs/ — one approved spec per feature, with acceptance criteria.
- levels/ — one JSON grid file per level.
- TODO.md — leftovers and bugs, newest first.

## About me
I'm the product owner ("the owner" in the subagent files). I decide what gets
built, set priorities, approve specs and accept or reject finished work.
I have no coding experience and about 6 hours a week. I only use Claude Code
on the web and the Claude iOS app: no desktop computer for coding.
- Never start building without my approval, and never mark work done until I accept it.
- When there's a trade-off, give me 2–3 options with a recommendation; I decide.
- Explain things in plain words, briefly. No jargon without a one-line explanation.
- Tell me exactly how to test each change on my phone (what to tap, what I should see).

## Tech stack
- Phaser 3, plain JavaScript (no TypeScript), Vite for building.
- GitHub Actions deploys every push to main to GitHub Pages. That link is how
  I play and test.
- Node's built-in test runner (node --test) for automated tests. No test libraries.
- Electron for Windows and Mac builds, made by GitHub Actions (after the MVP only).
  I have no Windows PC. The Mac build is for my own testing; only Windows ships at launch.
- git for version control.

## Rules
1. No acceptance criteria, no build. Every feature starts as a spec in specs/.
2. One feature per session. Finish, review, test, commit, then stop.
3. Game rules (wake meter, item-to-hazard matching, sign routing, stars,
   upgrade math) are pure functions in src/logic/ with no Phaser code, so they
   can be tested without running the game. Phaser files only draw, play sound
   and read input.
4. Every tuning number lives in src/config.js as a named value.
5. Levels are data: JSON files in levels/, never hard-coded in scenes.
6. The agent that writes code never reviews or tests it.
7. Keep code simple and readable over clever. Small files, clear names.
8. Placeholder art (coloured squares) until the build plan says otherwise.
9. Every screen must work with both mouse and touch.
10. If a request would grow the scope, say so and suggest adding it to
    "Later" in DESIGN.md instead.
11. Commit and push once the tester passes, with a plain-English message, so
    the change appears on GitHub Pages. Only mark it done after I accept it.

## Team (subagents)
You are the producer: delegate, then summarise results for me in plain words.
Core team, every week:
- designer — writes the spec, acceptance criteria and level files. Never codes.
- gameplay-dev — builds exactly what the spec says. Never changes the spec.
- reviewer — reads the code for bugs. Read-only, cannot edit anything.
- tester — writes and runs automated tests, plus my phone checklist.
Specialists, only when the build plan reaches them:
- art-audio — from week 11: anime-style art and sound, wired in.
- steam-release — after the MVP: Electron build, Steamworks, store page.
Never use more than four agents in one session.

## Standard flow for a feature
1. designer writes specs/<feature>.md with acceptance criteria. STOP for my approval.
2. gameplay-dev builds it.
3. reviewer reviews it. High-severity issues go back to gameplay-dev, who fixes
   only the flagged spots; reviewer checks again.
4. tester writes and runs tests (one per acceptance criterion) and gives me a
   phone checklist.
5. Commit, push, wait for the GitHub Pages deploy, and give me the link.
6. I play it with the checklist and accept or reject it. If accepted: update
   TODO.md. If rejected: back to gameplay-dev with my notes.

Always run the agents in this order, one at a time.
When I end a request with "Order: designer → dev → reviewer → tester",
follow it exactly.
