# Contributing

Thanks for taking the time — seriously. Small library, small team, every
contribution is noticed.

## Our promise

Every issue and pull request gets a human response within a few days. If we
disagree with a proposal we'll say so and explain why, rather than letting it
sit. (Anyone who has watched a PR gather dust for years on an unmaintained
repo knows why we put this in writing.)

## Reporting bugs

Open an issue with:

- What you did (a minimal code snippet helps a lot)
- What you expected, and what happened instead
- Runtime and version (Node 20, Bun 1.x, browser, ...)

## Pull requests

1. Fork, branch, make your change.
2. `npm test` and `npm run typecheck` must pass.
3. Keep the SDK's constraints intact: **zero runtime dependencies**, works on
   Node ≥18 / Deno / Bun / browsers / Workers, fully typed public API.
4. Open the PR — a short description of the "why" is more useful than a long
   description of the "what".

## Scope

This SDK is intentionally small: a typed client for the whatsmy.fyi IP API.
Feature ideas that grow the API surface are welcome as issues first, so we can
talk before you spend time on code.
