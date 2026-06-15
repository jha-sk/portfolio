# `src/data` — Career OS content architecture

All visitor-facing content reads from these editable, in-repo data files. No CMS,
no network — Phases 2-6 import only the file they need, keeping diffs small and
placeholders easy to find.

## Architecture (D-01: split per-domain files)

| File | Exports | Consumed by |
|------|---------|-------------|
| `identity.js` | `identity` | hero, meta, about |
| `links.js` | `links` | dock, contact, footer |
| `stats.js` | `stats` | dashboard cards (DASH-01) |
| `skills.js` | `skills` | technology constellation (SKL-01/02/03) |
| `projects.js` | `projects` | project capsules (PRJ-01..05) |
| `experience.js` | `experience` | mission log (EXP-01/02) |
| `placeholders.js` | `TODO`, `isPlaceholder`, `TODO_TOKEN` | the placeholder convention itself |

Each file default-exports the same object/array it names-exports.

## Placeholder convention (D-02 / D-03)

**Known facts** (identity, links, skill names, project names) are written as plain
values and are NEVER wrapped.

**Unknown values** (stat numbers, repo/demo URLs, project detail, achievements,
experience timeline, resume path) are produced by `TODO(label)` from
`placeholders.js`. A placeholder is exactly:

```js
{ __placeholder: true, TODO: 'TODO_<label>' }
```

- Detect one at runtime with `isPlaceholder(value)`.
- Find every placeholder across all files with a single grep:

  ```bash
  grep -rn "TODO_" src/data
  ```

The grep finds **every** placeholder and **nothing else** — that is the whole
point of the convention. Filling real data in v2 (CNT2-01) is: grep the token,
replace each `TODO(...)` with the real value.

The empty-state UI path (UI-SPEC Copywriting Contract: "Nothing here yet" /
"This section is awaiting data...") renders whenever `isPlaceholder(value)` is
true, so the raw `TODO_` token never surfaces to a visitor.

## Field shapes

Field names are stable now so later phases bind against them without churn.

### `identity` (object)
`name`, `title`, `tagline` — all known facts.

### `links` (object)
`github`, `linkedin`, `email` — known facts (URLs / address).
`resume` — placeholder (PDF dropped into `/public` later, CNT2-01).

### `stats` (array of objects)
Five labelled metrics. `id`, `label` (known) · `value` (placeholder number) ·
`unit` (optional known suffix, e.g. `+`).

### `skills` (array of constellation nodes)
`id`, `name` (known) · `category` (known grouping) · `level`, `experience`,
`relatedProjects`, `relatedTech` (placeholders — filled per real history).

### `projects` (array of capsules)
`id`, `name` (known) · `overview`, `architecture`, `techStack`, `features`,
`challenges`, `lessonsLearned`, `githubUrl`, `demoUrl`, `screenshot`
(all placeholders).

### `experience` (array of mission-log entries)
`id` (known slug) · `role`, `company`, `timeline`, `description`, `technologies`,
`achievements` (all placeholders).
