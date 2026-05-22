# Project Type Decision Tree — Tab Design

**Date:** 2026-05-22
**Status:** Approved for implementation planning

## Purpose

Add a new tab to the workflow-flowchart app that lets a user classify a project into one of 15 distinct workflow variants by walking a wizard-style decision tree. Each leaf of the tree resolves to a minimal "project type card" identifying that variant.

This tab is a **decision tree / intake flow** — its job is to *classify* projects, not to describe the workflow steps that follow. Detailed workflows already live on the existing "Design → Production" and "Production" tabs.

## Variant axes

A project type is determined by three axes:

1. **Minifig-only?** — `true` or `false`. If `true`, only timeframe applies (no brand, no minifig-included question).
2. **Brand** — `LEGO` or `Compatible`. Applies only when not minifig-only.
3. **Timeframe** — `Standard`, `Expedited`, or `Extended`. Applies in all branches.
4. **Minifigs included?** — `none` or `included`. Applies only when not minifig-only.

This produces 15 leaves:

- Minifig-only branch: 3 (one per timeframe)
- Non-minifig-only branch: 2 brands × 3 timeframes × 2 minifig states = 12

## End-state cards

Each leaf renders a **minimal identity card**:

- Project type name (e.g., `LEGO · Standard · w/ Minifigs`)
- Short code (e.g., `LEGO-STD-MF`)
- Total duration in weeks

Explicitly **out of scope** for the cards (deferred to future iterations):

- Workflow deltas / role lists / approval gates
- Cross-links to other tabs
- Pricing / SKU metadata
- Free-form notes

## User experience

**Style:** Wizard — one path through the tree at a time, not a full-tree exploration view.

**Rendering:** React Flow (matches the visual language of existing tabs — same pan/zoom/snap/theme via the existing `FlowView` component).

**Progressive reveal:**

- Fresh state: only Q1 ("Minifig-only project?") is rendered, centered.
- Clicking an answer pill on the active question reveals the next question (or the final card) to its right.
- Answered questions collapse into a compact chip showing the chosen answer.
- A breadcrumb strip under the header shows the chosen path (e.g., `No › LEGO › Standard › w/ Minifigs`). Each crumb is clickable to "rewind" to that step (truncates path).
- A **"Start over"** control (top-right of canvas) clears wizard state and returns to Q1 alone.

**Layout direction:** Left-to-right. Each tree depth occupies its own column (~280px wide). Y-positions are computed dynamically based on which nodes are currently revealed.

## Architecture

### Nav placement

- New top-level **dropdown** in the header bar (alongside the existing "Business Overview" dropdown and "Technical Flow" button).
- Dropdown label: **"Project Types"**.
- Initial single item: **"Decision Tree"** → `activeView: 'project-types'`.
- Structured so future siblings (e.g., archived types, variant comparison view) can be added without rework.
- Outside-click handling generalizes from the existing single-dropdown pattern to support multiple dropdowns.

### View configuration

Add to `VIEW_CONFIG` in `src/App.jsx`:

```js
'project-types': {
  title: 'Project Type Decision Tree',
  subtitle: 'Classify a project into one of 15 workflow variants',
  dropdownLabel: 'Decision Tree',
},
```

### Rendering

Reuses the existing `FlowView` component (same one used by all current tabs). Two new pieces inside `App.jsx`:

- `buildProjectTypeNodes(wizardState)` — produces the React Flow node array for the current wizard state.
- `buildProjectTypeEdges(wizardState)` — produces the matching edge array.
- `useProjectTypeWizard(viewId)` — new hook owning wizard state (the ordered list of answer values) with localStorage persistence.

### Custom node types

Two new node types registered alongside `customNode` / `stickyNote` / `timelinePhase`:

- **`decisionNode`** — renders the active question with 2–3 answer pills. Collapses to a compact answered-chip state once the path moves past it. Width ~240px.
- **`projectTypeCard`** — renders the leaf. Top: bold name. Middle: short code badge + weeks pill (inline-editable). Heavier accent border to distinguish it from decision nodes. Width ~280px.

### File layout

All code lives inline in `src/App.jsx`, matching the current single-file pattern. (Flagged for future refactor: App.jsx will grow ~300–500 lines with this addition; splitting `src/views/projectTypes.jsx` is a separate small refactor we may want later, but is out of scope for this work.)

## Data model

### Project type catalog

A static array of 15 entries (one per leaf). Week counts below are **placeholders** — final values to be filled in during implementation review.

```js
const PROJECT_TYPES = [
  // Minifig-only branch (3)
  { id: 'mf-only-std', code: 'MF-STD', name: 'Minifig-Only · Standard',  weeks: 6,
    axes: { minifigOnly: true, brand: null, timeframe: 'std', minifigs: null } },
  { id: 'mf-only-exp', code: 'MF-EXP', name: 'Minifig-Only · Expedited', weeks: 4,
    axes: { minifigOnly: true, brand: null, timeframe: 'exp', minifigs: null } },
  { id: 'mf-only-ext', code: 'MF-EXT', name: 'Minifig-Only · Extended',  weeks: 8,
    axes: { minifigOnly: true, brand: null, timeframe: 'ext', minifigs: null } },

  // LEGO branch (6)
  { id: 'lego-std-none', code: 'LEGO-STD',    name: 'LEGO · Standard',                weeks: 14,
    axes: { minifigOnly: false, brand: 'lego', timeframe: 'std', minifigs: 'none' } },
  { id: 'lego-std-mf',   code: 'LEGO-STD-MF', name: 'LEGO · Standard · w/ Minifigs',  weeks: 14,
    axes: { minifigOnly: false, brand: 'lego', timeframe: 'std', minifigs: 'incl' } },
  { id: 'lego-exp-none', code: 'LEGO-EXP',    name: 'LEGO · Expedited',               weeks: 8,
    axes: { minifigOnly: false, brand: 'lego', timeframe: 'exp', minifigs: 'none' } },
  { id: 'lego-exp-mf',   code: 'LEGO-EXP-MF', name: 'LEGO · Expedited · w/ Minifigs', weeks: 8,
    axes: { minifigOnly: false, brand: 'lego', timeframe: 'exp', minifigs: 'incl' } },
  { id: 'lego-ext-none', code: 'LEGO-EXT',    name: 'LEGO · Extended',                weeks: 20,
    axes: { minifigOnly: false, brand: 'lego', timeframe: 'ext', minifigs: 'none' } },
  { id: 'lego-ext-mf',   code: 'LEGO-EXT-MF', name: 'LEGO · Extended · w/ Minifigs',  weeks: 20,
    axes: { minifigOnly: false, brand: 'lego', timeframe: 'ext', minifigs: 'incl' } },

  // Compatible branch (6)
  { id: 'compat-std-none', code: 'CMP-STD',    name: 'Compatible · Standard',                weeks: 14,
    axes: { minifigOnly: false, brand: 'compat', timeframe: 'std', minifigs: 'none' } },
  { id: 'compat-std-mf',   code: 'CMP-STD-MF', name: 'Compatible · Standard · w/ Minifigs',  weeks: 14,
    axes: { minifigOnly: false, brand: 'compat', timeframe: 'std', minifigs: 'incl' } },
  { id: 'compat-exp-none', code: 'CMP-EXP',    name: 'Compatible · Expedited',               weeks: 8,
    axes: { minifigOnly: false, brand: 'compat', timeframe: 'exp', minifigs: 'none' } },
  { id: 'compat-exp-mf',   code: 'CMP-EXP-MF', name: 'Compatible · Expedited · w/ Minifigs', weeks: 8,
    axes: { minifigOnly: false, brand: 'compat', timeframe: 'exp', minifigs: 'incl' } },
  { id: 'compat-ext-none', code: 'CMP-EXT',    name: 'Compatible · Extended',                weeks: 20,
    axes: { minifigOnly: false, brand: 'compat', timeframe: 'ext', minifigs: 'none' } },
  { id: 'compat-ext-mf',   code: 'CMP-EXT-MF', name: 'Compatible · Extended · w/ Minifigs',  weeks: 20,
    axes: { minifigOnly: false, brand: 'compat', timeframe: 'ext', minifigs: 'incl' } },
];
```

### Tree definition

Declarative tree — the rendering walks it based on the current wizard path. Each non-leaf node is `{ id, question, answers[] }`. Each `answer.next` is either another node id (continue branching) or `{ leaf: '<project-type-id>' }` (terminate).

```js
const DECISION_TREE = {
  'q-mfonly': {
    id: 'q-mfonly',
    question: 'Is this a minifig-only project?',
    answers: [
      { label: 'Yes', value: 'yes', next: 'q-mfonly-time' },
      { label: 'No',  value: 'no',  next: 'q-brand' },
    ],
  },
  'q-mfonly-time': {
    id: 'q-mfonly-time',
    question: 'What timeframe?',
    answers: [
      { label: 'Standard',  value: 'std', next: { leaf: 'mf-only-std' } },
      { label: 'Expedited', value: 'exp', next: { leaf: 'mf-only-exp' } },
      { label: 'Extended',  value: 'ext', next: { leaf: 'mf-only-ext' } },
    ],
  },
  'q-brand': {
    id: 'q-brand',
    question: 'Which brand?',
    answers: [
      { label: 'LEGO',       value: 'lego',   next: 'q-time-lego' },
      { label: 'Compatible', value: 'compat', next: 'q-time-compat' },
    ],
  },
  'q-time-lego': {
    id: 'q-time-lego',
    question: 'What timeframe?',
    answers: [
      { label: 'Standard',  value: 'std', next: 'q-mf-lego-std' },
      { label: 'Expedited', value: 'exp', next: 'q-mf-lego-exp' },
      { label: 'Extended',  value: 'ext', next: 'q-mf-lego-ext' },
    ],
  },
  'q-time-compat': {
    id: 'q-time-compat',
    question: 'What timeframe?',
    answers: [
      { label: 'Standard',  value: 'std', next: 'q-mf-compat-std' },
      { label: 'Expedited', value: 'exp', next: 'q-mf-compat-exp' },
      { label: 'Extended',  value: 'ext', next: 'q-mf-compat-ext' },
    ],
  },
  // q-mf-{brand}-{time} — six near-identical nodes, each:
  //   question: 'Will the project include minifigs?'
  //   answers:
  //     { label: 'No minifigs',  value: 'none', next: { leaf: '<brand>-<time>-none' } }
  //     { label: 'With minifigs', value: 'incl', next: { leaf: '<brand>-<time>-mf'   } }
};

// Walking the tree always starts at 'q-mfonly'.
```

### Wizard state

Persisted to localStorage under `project-type-wizard-project-types`:

```js
{
  path: ['no', 'lego', 'std', 'incl'],  // ordered answer values from root → leaf
}
```

- `path: []` — fresh wizard, only Q1 visible.
- Walking the tree with the current `path` yields the active question (or the terminal leaf).
- Reset = `path: []`.
- Breadcrumb rewind = truncate `path` to a given index.

## Visual specifics

### Decision node

- Header row: question text + small badge showing the step number (`Step 1`, `Step 2`, …). Total step count is intentionally omitted because branches have different depths (minifig-only path = 2 steps; non-minifig-only path = 4 steps).
- Body: 2–3 horizontal answer pills.
  - Unselected pill: neutral border, hover = accent border.
  - Selected pill (when this question has been answered and the path moves past it): accent fill, locked-in look.
- Collapsed answered state: compact chip showing `{question label} → {chosen answer}`, clickable to rewind.

### Project type card

- Top: bold project type name.
- Middle row: short code badge + weeks pill.
- Weeks value is inline-editable (click → input → blur saves). Edits flow through the existing `useFlowEditor` persistence (localStorage key `flow-editor-project-types`).
- Heavier accent border than decision nodes.

### Edges

- Smooth bezier from an answer pill's right handle to the next question's left handle.
- Solid accent stroke for the active path. (Since progressive reveal renders only the active path, all visible edges are active.)

### Header overlays

- Breadcrumb strip below the header (e.g., `No › LEGO › Standard › w/ Minifigs`). Each crumb clickable to rewind to that decision.
- "Start over" button in the top-right of the canvas, visible only when `path.length > 0`.

### Legend (bottom-right slot)

- "Step Types" with two entries: Decision node (neutral chip), Project Type card (accent chip).
- Footer hint: "Click answers to walk the tree · Click a step to rewind".

### Empty state

- When `path: []`, Q1 is rendered centered, accompanied by a small caption ("Answer the questions to identify the project type").
- No "Start over" until at least one answer is given.

## Persistence

- **Wizard path** → `localStorage['project-type-wizard-project-types']`.
- **Inline week edits** → `localStorage['flow-editor-project-types']` (reuses existing `useFlowEditor` namespace).
- Both survive refresh and tab switches. Returning to the tab restores the last position in the wizard.

## Testing & verification

No automated test framework is configured in this repo. Verification is manual via the dev server:

1. Fresh wizard (clear localStorage) shows only Q1, centered.
2. Each answer click reveals the next node (question or leaf).
3. All 15 paths terminate on the correct leaf id per the catalog above.
4. "Start over" clears `path` and re-renders Q1 alone.
5. Breadcrumb rewind truncates `path` to the clicked step.
6. Inline week edit persists across refresh.
7. Refreshing mid-wizard restores the partial path.
8. Pan/zoom/snap-to-grid behave identically to existing tabs.
9. Switching to and from this tab does not affect the state of other tabs.

The "walk all 15 paths" smoke test is the primary regression check.

## Out of scope

- Additional variant axes (size, custom printing, licensing review, etc.) — designed extensibly via the `axes` field on each project type, but not surfaced in the wizard.
- Cross-links from cards into the existing Design → Production / Production tabs.
- Backend or shared config — localStorage only.
- Workflow detail (steps, roles, approvals) on the leaf cards — explicitly chosen as out of scope; deferred to a future iteration if needed.
- Splitting `src/App.jsx` into per-view files. Flagged as future work.
