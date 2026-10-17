/**
 * One-time / idempotent seed of GitHub Issues from docs/product/features.md backlog.
 * Skips if an open issue title already contains the feature ID.
 *
 * Usage: node scripts/seed-github-issues.mjs
 */
import { spawnSync } from "child_process";

const REPO = "dnomyar84/stancejudge";

const LABELS = [
  ["type:feature", "1D76DB"],
  ["type:bug", "D73A4A"],
  ["type:tech-debt", "FBCA04"],
  ["priority:P1", "B60205"],
  ["priority:P2", "D93F0B"],
  ["priority:P3", "FEF2C0"],
  ["area:live", "0E8A16"],
  ["area:routine", "5319E7"],
  ["area:admin", "C5DEF5"],
  ["area:deploy", "006B75"],
  ["status:in-progress", "FBCA04"],
];

const ISSUES = [
  {
    id: "F-010",
    title: "Practice home hub",
    labels: ["type:feature", "priority:P1", "area:routine"],
    body: `**Spec:** docs/product/ux-flows.md, F-010 in features.md

## Acceptance
- [ ] Landing shows Routine video and Live practice as primary cards
- [ ] Routine choice persists in localStorage
- [ ] Mobile: full-width cards, min 48px tap height`,
  },
  {
    id: "F-011",
    title: "First-run onboarding (skippable)",
    labels: ["type:feature", "priority:P1", "area:routine"],
    body: `## Acceptance
- [ ] 3 slides max; Skip always visible
- [ ] Sets stancejudge.onboarding.v1 = done
- [ ] Mentions camera + upload fallback`,
  },
  {
    id: "F-012",
    title: "Live practice layout refresh",
    labels: ["type:feature", "priority:P1", "area:live"],
    body: `**Spec:** docs/product/live-practice-spec.md

## Acceptance
- [ ] Matches wireframes in live-practice-spec.md
- [ ] Permission denied state implemented
- [ ] prefers-reduced-motion reduces animations`,
  },
  {
    id: "F-013",
    title: "Routine session layout refresh",
    labels: ["type:feature", "priority:P1", "area:routine"],
    body: `## Acceptance
- [ ] Clear hierarchy: rail → inputs → player → results
- [ ] Upload dropzone with drag-and-drop
- [ ] Loading skeleton for YouTube stream`,
  },
  {
    id: "F-014",
    title: "i18n labels (EN + 中文)",
    labels: ["type:feature", "priority:P1", "area:routine"],
    body: `## Acceptance
- [ ] src/lib/i18n/ or JSON messages
- [ ] Buttons/status translated; move names keep 中文`,
  },
  {
    id: "F-015",
    title: "Rescan / reset session",
    labels: ["type:feature", "priority:P1", "area:routine"],
    body: `## Acceptance
- [ ] Clear video revokes blob and resets report
- [ ] Rescan without re-upload`,
  },
  {
    id: "F-016",
    title: "Coach tip on active rail chip",
    labels: ["type:feature", "priority:P1", "area:routine"],
    body: `## Acceptance
- [ ] When chip isActive, show coachTip below rail or toast`,
  },
  {
    id: "F-017",
    title: "Automate gh-pages deploy via Actions",
    labels: ["type:feature", "priority:P1", "area:deploy"],
    body: `## Acceptance
- [ ] Single workflow build + deploy without manual gh-pages push
- [ ] Document in .github/DEPLOY.md`,
  },
  {
    id: "F-030",
    title: "Live routine follow (pose rail + live detection)",
    labels: ["type:feature", "priority:P2", "area:live"],
    body: `## Acceptance
- [ ] Rail visible in live mode for selected routine
- [ ] Active move from classification not video time
- [ ] Non-blocking on miss`,
  },
  {
    id: "T-01",
    title: "YouTube proxy reliability (bot detection)",
    labels: ["type:tech-debt", "priority:P1", "area:deploy"],
    body: `Improve UX when ytdl/proxy fails; document upload fallback.`,
  },
  {
    id: "T-02",
    title: "Calibrate all routines from reference MP4",
    labels: ["type:tech-debt", "priority:P2", "area:admin"],
    body: `Commit calibrated src/data/canonical/*.json for both routines.`,
  },
  {
    id: "T-03",
    title: "object-cover vs canvas alignment on resize",
    labels: ["type:bug", "priority:P2", "area:live"],
    body: `Skeleton may drift when video is object-cover scaled.`,
  },
  {
    id: "T-04",
    title: "Throttle live mode setState per frame",
    labels: ["type:tech-debt", "priority:P2", "area:live"],
    body: `Reduce React re-renders in stance-judge rAF loop.`,
  },
];

function gh(...args) {
  const r = spawnSync("gh", args, { encoding: "utf8" });
  if (r.status !== 0 && !r.stderr?.includes("already exists")) {
    console.error(r.stderr || r.stdout);
  }
  return r;
}

function listOpenTitles() {
  const r = gh("issue", "list", "--repo", REPO, "--state", "all", "--limit", "200", "--json", "title");
  if (r.status !== 0) return [];
  try {
    return JSON.parse(r.stdout).map((i) => i.title);
  } catch {
    return [];
  }
}

for (const [name, color] of LABELS) {
  gh("label", "create", name, "--repo", REPO, "--color", color, "--force");
}

const existing = listOpenTitles();

for (const item of ISSUES) {
  const title = `[${item.id}] ${item.title}`;
  if (existing.some((t) => t.includes(item.id))) {
    console.log("skip", item.id);
    continue;
  }
  const r = gh(
    "issue",
    "create",
    "--repo",
    REPO,
    "--title",
    title,
    "--body",
    item.body,
    "--label",
    item.labels.join(","),
  );
  if (r.status === 0) console.log("created", title);
}
