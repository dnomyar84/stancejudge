# Governance

## Roles

| Role | Owner | Responsibility |
| --- | --- | --- |
| **Product / design intent** | Raymond (user) | Review vision, UX flows, UI direction, feature priorities in `docs/product/`. Feedback in chat or by editing docs on GitHub. |
| **Implementation** | Cursor agent (sole developer) | All coding, tests, commits, merge to `main`, `gh-pages` deploy, backlog updates in `features.md`. |

## What the user does *not* gate

- Code review, PR approval, or line-by-line implementation sign-off
- Branch strategy — agent works on `main` (or short-lived branches merged by agent)
- Releases to https://dnomyar84.github.io/stancejudge/ when user-facing changes ship

## What the user *does* gate

- Design intent: “is this the right experience for kids/coaches?”
- Changing priorities in `docs/product/roadmap.md` or feature order
- Secrets/credentials (never in repo; user provides via secure channels if needed)

## Agent default when design is silent

Follow `docs/product/features.md` priority order. If ambiguous, pick the smallest shippable slice that matches `vision.md` and `ui-design-system.md`, implement, push `main`, deploy `gh-pages` if UI changed.

## Changing this model

Edit this file on `main` and note in `features.md` if workflow rules change.
