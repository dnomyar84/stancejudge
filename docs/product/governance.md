# Governance

## Roles

| Role | Owner | Responsibility |
| --- | --- | --- |
| **Product / design intent** | Raymond (user) | Review vision, UX flows, UI direction in `docs/product/`. Reprioritize via Issues labels/comments. |
| **Implementation** | Cursor agent (sole developer) | Code, test, **GitHub Issues** (features + bugs), commits to `main`, deploy. Close issues when verified. |

## What the user does *not* gate

- Code review, PR approval, or line-by-line implementation sign-off
- Branch strategy — agent works on `main` (or short-lived branches merged by agent)
- Releases to https://dnomyar84.github.io/stancejudge/ when user-facing changes ship

## What the user *does* gate

- Design intent: “is this the right experience for kids/coaches?”
- Changing priorities in `docs/product/roadmap.md` or feature order
- Secrets/credentials (never in repo; user provides via secure channels if needed)

## Backlog: Issues + docs

- **GitHub Issues** = what to build/fix next ([workflow](./issues-workflow.md)).
- **`features.md`** = stable F-### IDs and acceptance templates; link issue numbers when seeded.
- Testing finds a problem → **open a bug issue**; iterate until milestone P1 issues are closed.

## Agent default when design is silent

Pick highest-priority **open issue** (`priority:P1` first). If none, follow `features.md` for the next F-###. Implement, test, push `main`, close issue, deploy if UI changed.

## Changing this model

Edit this file on `main` and note in `features.md` if workflow rules change.
