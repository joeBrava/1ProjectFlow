# Project Type Decision Tree Tab — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a wizard-style "Project Types" tab to the workflow-flowchart React app that walks a user through 2–4 decisions to classify a project into one of 15 named workflow variants.

**Architecture:** All new code lives in `src/App.jsx`. A new lightweight `ProjectTypeFlowView` component renders React Flow directly (it does NOT wrap the existing `FlowView`, because that component owns editor/sticky-note/presentation state that conflicts with a dynamic wizard graph). State lives in two new hooks: `useProjectTypeWizard` (the answer path) and `useProjectTypeWeeks` (inline week-count edits). Both persist to `localStorage`. The wizard renders progressively — only the active path of the tree is materialized as React Flow nodes.

**Tech Stack:** React 18, `@xyflow/react` 12 (React Flow), Vite. No test framework is installed; verification is via `npm run dev` in a browser. Plan uses manual verification checkpoints in place of automated tests.

**Spec:** `docs/superpowers/specs/2026-05-22-project-workflow-tab-design.md`

**Deviations from spec (intentional):**

1. Spec says the new tab "reuses `FlowView`". Implementation instead introduces a sibling `ProjectTypeFlowView` because `FlowView` owns `useFlowEditor`, sticky-note state, and presentation mode that all assume a static default graph with persistent overlay edits — not a dynamic graph that regenerates from wizard state. The new component shares the visual language (same `ReactFlow`, same `Background`, same theme via `colors.bg`, same `MiniMap`/`Controls` placement) but skips the editor machinery.
2. Spec says inline week edits persist under `localStorage['flow-editor-project-types']` reusing `useFlowEditor`. Implementation instead uses a dedicated `useProjectTypeWeeks` hook with key `project-type-weeks-project-types`. Reason: `useFlowEditor` persists whole node arrays (adds/deletes/resizes), not per-field overrides on dynamically generated nodes — using it here would fight the wizard's regeneration. The new hook is ~25 lines, scoped exactly to the override use case.

---

## File map

- **Modify:** `src/App.jsx` — all new code goes here, inserted at the locations called out per task.

No new files are created. App.jsx grows by ~500 lines.

---

## Task 1 — Add static data constants

**Files:**
- Modify: `src/App.jsx` (insert new constants directly above the existing `VIEW_CONFIG` definition near line 2886)

- [ ] **Step 1: Confirm dev server still builds before any changes**

Run: `npm run dev`

Expected: Vite starts, console shows `Local: http://localhost:<port>/`. Open the URL — the existing three tabs (Business Overview dropdown, Technical Flow) load with no errors in the browser console. Stop the dev server.

- [ ] **Step 2: Add PROJECT_TYPES catalog**

Insert directly above the `const VIEW_CONFIG = {` line (around line 2886):

```js
/* ═══════════════════════════════════════════════════════════════════════
   PROJECT TYPE DECISION TREE — static data
   ═══════════════════════════════════════════════════════════════════════ */

// 15 project type leaves. `weeks` values are placeholders; edit later via the UI.
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

const PROJECT_TYPES_BY_ID = Object.fromEntries(PROJECT_TYPES.map((p) => [p.id, p]));
```

- [ ] **Step 3: Add DECISION_TREE constant**

Append directly below the `PROJECT_TYPES_BY_ID` line:

```js
// Decision tree. Each non-leaf is { id, question, answers[] }.
// Each answer.next is either another node id (continue) or { leaf: '<project-type-id>' } (terminate).
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
  'q-mf-lego-std':   { id: 'q-mf-lego-std',   question: 'Will the project include minifigs?',
    answers: [ { label: 'No minifigs', value: 'none', next: { leaf: 'lego-std-none' } },
               { label: 'With minifigs', value: 'incl', next: { leaf: 'lego-std-mf' } } ] },
  'q-mf-lego-exp':   { id: 'q-mf-lego-exp',   question: 'Will the project include minifigs?',
    answers: [ { label: 'No minifigs', value: 'none', next: { leaf: 'lego-exp-none' } },
               { label: 'With minifigs', value: 'incl', next: { leaf: 'lego-exp-mf' } } ] },
  'q-mf-lego-ext':   { id: 'q-mf-lego-ext',   question: 'Will the project include minifigs?',
    answers: [ { label: 'No minifigs', value: 'none', next: { leaf: 'lego-ext-none' } },
               { label: 'With minifigs', value: 'incl', next: { leaf: 'lego-ext-mf' } } ] },
  'q-mf-compat-std': { id: 'q-mf-compat-std', question: 'Will the project include minifigs?',
    answers: [ { label: 'No minifigs', value: 'none', next: { leaf: 'compat-std-none' } },
               { label: 'With minifigs', value: 'incl', next: { leaf: 'compat-std-mf' } } ] },
  'q-mf-compat-exp': { id: 'q-mf-compat-exp', question: 'Will the project include minifigs?',
    answers: [ { label: 'No minifigs', value: 'none', next: { leaf: 'compat-exp-none' } },
               { label: 'With minifigs', value: 'incl', next: { leaf: 'compat-exp-mf' } } ] },
  'q-mf-compat-ext': { id: 'q-mf-compat-ext', question: 'Will the project include minifigs?',
    answers: [ { label: 'No minifigs', value: 'none', next: { leaf: 'compat-ext-none' } },
               { label: 'With minifigs', value: 'incl', next: { leaf: 'compat-ext-mf' } } ] },
};

const DECISION_TREE_ROOT = 'q-mfonly';
```

- [ ] **Step 4: Verify the file still loads**

Run: `npm run dev`

Expected: Vite reloads with no errors. The browser console shows no errors. Existing tabs still render. The new constants aren't referenced anywhere yet, so nothing visible changes. Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "Add PROJECT_TYPES catalog and DECISION_TREE for new wizard tab"
```

---

## Task 2 — Add tree-walking helpers

**Files:**
- Modify: `src/App.jsx` (append below `DECISION_TREE_ROOT`)

- [ ] **Step 1: Add `walkTree` helper**

Append below the `DECISION_TREE_ROOT` line:

```js
/**
 * Walk the decision tree along the given answer path.
 * Returns:
 *   - { kind: 'question', node, depth }   when the path stops at a question waiting to be answered
 *   - { kind: 'leaf',     leaf,  depth }  when the path ends at a project-type leaf
 * `chain` is the ordered list of decision-tree nodes traversed (including the active one).
 */
function walkTree(tree, root, path) {
  const chain = [];
  let currentId = root;
  let depth = 0;
  while (currentId) {
    const node = tree[currentId];
    chain.push({ node, answeredValue: path[depth] });
    const answerValue = path[depth];
    if (answerValue === undefined) {
      return { kind: 'question', node, depth, chain };
    }
    const answer = node.answers.find((a) => a.value === answerValue);
    if (!answer) {
      // Stale path (e.g., catalog changed) — treat as if not yet answered.
      chain[chain.length - 1].answeredValue = undefined;
      return { kind: 'question', node, depth, chain };
    }
    if (typeof answer.next === 'string') {
      currentId = answer.next;
      depth += 1;
    } else if (answer.next && answer.next.leaf) {
      const leaf = PROJECT_TYPES_BY_ID[answer.next.leaf];
      return { kind: 'leaf', leaf, depth: depth + 1, chain };
    } else {
      // Defensive: malformed tree.
      return { kind: 'question', node, depth, chain };
    }
  }
  return { kind: 'question', node: tree[root], depth: 0, chain };
}
```

- [ ] **Step 2: Verify with a temporary console smoke test**

Append temporarily, immediately below `walkTree`:

```js
// TEMP smoke test — remove before commit
if (typeof window !== 'undefined') {
  const t1 = walkTree(DECISION_TREE, DECISION_TREE_ROOT, []);
  console.assert(t1.kind === 'question' && t1.node.id === 'q-mfonly', 'walkTree empty path');
  const t2 = walkTree(DECISION_TREE, DECISION_TREE_ROOT, ['no', 'lego', 'std', 'incl']);
  console.assert(t2.kind === 'leaf' && t2.leaf.id === 'lego-std-mf', 'walkTree full LEGO path');
  const t3 = walkTree(DECISION_TREE, DECISION_TREE_ROOT, ['yes', 'exp']);
  console.assert(t3.kind === 'leaf' && t3.leaf.id === 'mf-only-exp', 'walkTree MF-only path');
  const t4 = walkTree(DECISION_TREE, DECISION_TREE_ROOT, ['no', 'compat']);
  console.assert(t4.kind === 'question' && t4.node.id === 'q-time-compat', 'walkTree partial Compatible');
  console.log('walkTree smoke OK');
}
```

Run: `npm run dev`

Expected: open the browser, open devtools console. See exactly `walkTree smoke OK` and no `console.assert` failures.

- [ ] **Step 3: Remove the temporary smoke test**

Delete the `// TEMP smoke test` block from Step 2 entirely.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "Add walkTree helper for decision-tree traversal"
```

---

## Task 3 — Add `useProjectTypeWizard` hook

**Files:**
- Modify: `src/App.jsx` (append below `walkTree`)

- [ ] **Step 1: Add the hook**

Append below `walkTree`:

```js
/**
 * Owns the wizard path (array of answer values) and persists it to localStorage.
 * Returns { path, appendAnswer, rewindTo, reset }.
 */
function useProjectTypeWizard(viewId) {
  const key = `project-type-wizard-${viewId || 'default'}`;
  const [path, setPath] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      const parsed = s ? JSON.parse(s) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(path));
  }, [key, path]);

  const appendAnswer = useCallback((value) => {
    setPath((prev) => [...prev, value]);
  }, []);

  const rewindTo = useCallback((depth) => {
    // depth = number of answers to keep (0 = reset, 1 = keep Q1's answer, etc.)
    setPath((prev) => prev.slice(0, depth));
  }, []);

  const reset = useCallback(() => setPath([]), []);

  return { path, appendAnswer, rewindTo, reset };
}
```

- [ ] **Step 2: Verify with a temporary in-component check**

Temporarily add a one-liner inside the existing `export default function App() { ... }` near the top:

Find this block (around line 2904):

```js
export default function App() {
  const [activeView, setActiveView] = useState('design-production');
```

Insert directly below:

```js
  // TEMP wizard hook smoke — remove before commit
  const _wizardSmoke = useProjectTypeWizard('smoke');
  useEffect(() => {
    console.log('wizard path:', _wizardSmoke.path);
  }, [_wizardSmoke.path]);
```

Run: `npm run dev`. Open the app. Open devtools.

In the devtools console, run:

```js
localStorage.setItem('project-type-wizard-smoke', JSON.stringify(['no','lego']));
location.reload();
```

Expected: After reload, the console logs `wizard path: ['no', 'lego']`.

Then run:

```js
localStorage.removeItem('project-type-wizard-smoke');
location.reload();
```

Expected: After reload, console logs `wizard path: []`.

- [ ] **Step 3: Remove the temp smoke**

Delete the `// TEMP wizard hook smoke` lines added in Step 2 (the `_wizardSmoke` declaration and the `useEffect`).

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "Add useProjectTypeWizard hook with localStorage persistence"
```

---

## Task 4 — Add `useProjectTypeWeeks` hook

**Files:**
- Modify: `src/App.jsx` (append below `useProjectTypeWizard`)

- [ ] **Step 1: Add the hook**

Append below `useProjectTypeWizard`:

```js
/**
 * Inline week-count overrides per project-type leaf, persisted to localStorage.
 * Returns { getWeeks(leafId, defaultWeeks), setWeeks(leafId, weeks), resetWeeks() }.
 */
function useProjectTypeWeeks(viewId) {
  const key = `project-type-weeks-${viewId || 'default'}`;
  const [overrides, setOverrides] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      const parsed = s ? JSON.parse(s) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(overrides));
  }, [key, overrides]);

  const getWeeks = useCallback(
    (leafId, defaultWeeks) => (overrides[leafId] != null ? overrides[leafId] : defaultWeeks),
    [overrides]
  );

  const setWeeks = useCallback((leafId, weeks) => {
    setOverrides((prev) => ({ ...prev, [leafId]: weeks }));
  }, []);

  const resetWeeks = useCallback(() => setOverrides({}), []);

  return { getWeeks, setWeeks, resetWeeks };
}
```

- [ ] **Step 2: Verify no regressions**

Run: `npm run dev`

Expected: app loads, no errors in browser console, existing tabs work. Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "Add useProjectTypeWeeks hook for inline week-count edits"
```

---

## Task 5 — Add `DecisionNode` custom node component

**Files:**
- Modify: `src/App.jsx` (insert below `useProjectTypeWeeks`)

- [ ] **Step 1: Add the component**

Append below `useProjectTypeWeeks`:

```js
/* ── Custom node: decision question (active or answered state) ── */
function DecisionNode({ id, data }) {
  // data = {
  //   question: string, step: number, state: 'active' | 'answered',
  //   answers?: [{label, value}],   // active state only
  //   chosenAnswer?: {label, value},// answered state only
  //   onAnswer?: (value) => void,   // active state only
  //   onRewind?: () => void,        // answered state only
  // }
  const isActive = data.state === 'active';
  return (
    <div
      style={{
        width: 240,
        background: colors.surface,
        border: `1.5px solid ${isActive ? colors.cyan : colors.border}`,
        borderRadius: 12,
        padding: 14,
        fontFamily: "'Inter', sans-serif",
        color: colors.text,
        boxShadow: isActive ? `0 0 0 3px ${colors.cyan}22` : 'none',
        cursor: isActive ? 'default' : 'pointer',
      }}
      onClick={!isActive ? data.onRewind : undefined}
      title={!isActive ? 'Click to rewind to this step' : undefined}
    >
      <Handle type="target" position={Position.Left} style={{ background: colors.border, width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} style={{ background: colors.border, width: 8, height: 8 }} />

      <div style={{ fontSize: 9, fontWeight: 700, color: colors.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
        Step {data.step}
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, marginBottom: 10 }}>
        {data.question}
      </div>

      {isActive ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {data.answers.map((a) => (
            <button
              key={a.value}
              onClick={(e) => { e.stopPropagation(); data.onAnswer(a.value); }}
              style={{
                width: '100%',
                padding: '8px 10px',
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                color: colors.text,
                fontSize: 12,
                fontFamily: "'Inter', sans-serif",
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.cyan; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; }}
            >
              {a.label}
            </button>
          ))}
        </div>
      ) : (
        <div style={{
          padding: '6px 10px',
          background: `${colors.cyan}22`,
          border: `1px solid ${colors.cyan}66`,
          borderRadius: 8,
          color: colors.cyan,
          fontSize: 12,
          fontWeight: 600,
          display: 'inline-block',
        }}>
          {data.chosenAnswer.label}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify the file still parses**

Run: `npm run dev`

Expected: app loads, no errors. The component is defined but not yet rendered anywhere.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "Add DecisionNode component for the wizard tab"
```

---

## Task 6 — Add `ProjectTypeCard` custom node component

**Files:**
- Modify: `src/App.jsx` (insert below `DecisionNode`)

- [ ] **Step 1: Add the component**

Append below `DecisionNode`:

```js
/* ── Custom node: project type leaf card with inline-editable weeks ── */
function ProjectTypeCard({ id, data }) {
  // data = {
  //   name: string, code: string, weeks: number,
  //   onWeeksChange: (number) => void,
  // }
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(data.weeks));

  // Re-sync draft when external value changes (e.g., reset).
  useEffect(() => { setDraft(String(data.weeks)); }, [data.weeks]);

  const commit = () => {
    const parsed = parseInt(draft, 10);
    if (Number.isFinite(parsed) && parsed > 0 && parsed !== data.weeks) {
      data.onWeeksChange(parsed);
    } else {
      setDraft(String(data.weeks));
    }
    setEditing(false);
  };

  return (
    <div
      style={{
        width: 280,
        background: colors.surface,
        border: `2px solid ${colors.emerald}`,
        borderRadius: 12,
        padding: 16,
        fontFamily: "'Inter', sans-serif",
        color: colors.text,
        boxShadow: `0 0 0 3px ${colors.emerald}22`,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: colors.emerald, width: 8, height: 8 }} />

      <div style={{ fontSize: 9, fontWeight: 700, color: colors.emerald, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
        Project Type
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, marginBottom: 10 }}>
        {data.name}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{
          padding: '3px 8px',
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: 6,
          fontFamily: 'monospace',
          fontSize: 11,
          color: colors.textDim,
        }}>
          {data.code}
        </div>

        {editing ? (
          <input
            autoFocus
            type="number"
            min="1"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.currentTarget.blur(); }
              if (e.key === 'Escape') { setDraft(String(data.weeks)); setEditing(false); }
            }}
            style={{
              width: 60,
              padding: '3px 6px',
              background: colors.bg,
              border: `1px solid ${colors.emerald}`,
              borderRadius: 6,
              color: colors.text,
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
            }}
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            title="Click to edit"
            style={{
              padding: '3px 8px',
              background: `${colors.emerald}22`,
              border: `1px solid ${colors.emerald}66`,
              borderRadius: 6,
              color: colors.emerald,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {data.weeks} wks
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the file still parses**

Run: `npm run dev`

Expected: app loads, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "Add ProjectTypeCard component with inline-editable weeks"
```

---

## Task 7 — Add `buildProjectTypeGraph` layout function

**Files:**
- Modify: `src/App.jsx` (append below `ProjectTypeCard`)

- [ ] **Step 1: Add the function**

Append below `ProjectTypeCard`:

```js
/**
 * Build React Flow nodes + edges for the wizard, given current path.
 * Materializes only the active path (progressive reveal).
 *
 *   path           — wizard path (array of answer values)
 *   getWeeks       — (leafId, defaultWeeks) => number    (from useProjectTypeWeeks)
 *   onAnswer       — (value) => void                     (called when user clicks an answer pill)
 *   onRewind       — (depth) => void                     (called when user clicks an answered chip)
 *   onWeeksChange  — (leafId, weeks) => void
 */
function buildProjectTypeGraph(path, { getWeeks, onAnswer, onRewind, onWeeksChange }) {
  const COL_WIDTH = 320;
  const Y = 0;
  const nodes = [];
  const edges = [];

  const walk = walkTree(DECISION_TREE, DECISION_TREE_ROOT, path);
  const { chain } = walk;

  chain.forEach((step, idx) => {
    const { node, answeredValue } = step;
    const isActive = answeredValue === undefined;
    const data = isActive
      ? {
          question: node.question,
          step: idx + 1,
          state: 'active',
          answers: node.answers,
          onAnswer,
        }
      : {
          question: node.question,
          step: idx + 1,
          state: 'answered',
          chosenAnswer: node.answers.find((a) => a.value === answeredValue),
          onRewind: () => onRewind(idx),
        };
    nodes.push({
      id: node.id,
      type: 'decisionNode',
      position: { x: idx * COL_WIDTH, y: Y },
      data,
      draggable: false,
      selectable: false,
    });
    if (idx > 0) {
      const prev = chain[idx - 1];
      edges.push({
        id: `e-${prev.node.id}-${node.id}`,
        source: prev.node.id,
        target: node.id,
        style: { stroke: colors.cyan, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: colors.cyan, width: 14, height: 14 },
      });
    }
  });

  if (walk.kind === 'leaf') {
    const leaf = walk.leaf;
    const leafNodeId = `leaf-${leaf.id}`;
    const leafX = chain.length * COL_WIDTH;
    nodes.push({
      id: leafNodeId,
      type: 'projectTypeCard',
      position: { x: leafX, y: Y },
      data: {
        name: leaf.name,
        code: leaf.code,
        weeks: getWeeks(leaf.id, leaf.weeks),
        onWeeksChange: (w) => onWeeksChange(leaf.id, w),
      },
      draggable: false,
      selectable: false,
    });
    const lastDecision = chain[chain.length - 1];
    edges.push({
      id: `e-${lastDecision.node.id}-${leafNodeId}`,
      source: lastDecision.node.id,
      target: leafNodeId,
      type: 'smoothstep',
      style: { stroke: colors.emerald, strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: colors.emerald, width: 14, height: 14 },
    });
  }

  return { nodes, edges };
}
```

- [ ] **Step 2: Verify with a temporary console smoke test**

Append directly below `buildProjectTypeGraph`:

```js
// TEMP layout smoke — remove before commit
if (typeof window !== 'undefined') {
  const noop = () => {};
  const g1 = buildProjectTypeGraph([], { getWeeks: (_id, d) => d, onAnswer: noop, onRewind: noop, onWeeksChange: noop });
  console.assert(g1.nodes.length === 1 && g1.nodes[0].id === 'q-mfonly' && g1.nodes[0].data.state === 'active', 'graph empty');
  const g2 = buildProjectTypeGraph(['no', 'lego', 'std', 'incl'], { getWeeks: (_id, d) => d, onAnswer: noop, onRewind: noop, onWeeksChange: noop });
  const leafN = g2.nodes.find((n) => n.type === 'projectTypeCard');
  console.assert(leafN && leafN.id === 'leaf-lego-std-mf', 'graph full LEGO path');
  console.assert(g2.nodes.length === 5 && g2.edges.length === 4, 'graph full LEGO path counts');
  console.log('buildProjectTypeGraph smoke OK');
}
```

Run: `npm run dev`. Open the app and the devtools console.

Expected: console shows `buildProjectTypeGraph smoke OK` and no assert failures.

- [ ] **Step 3: Remove the temporary smoke test**

Delete the `// TEMP layout smoke` block from Step 2.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "Add buildProjectTypeGraph layout function"
```

---

## Task 8 — Add `ProjectTypeFlowView` component

**Files:**
- Modify: `src/App.jsx` (insert below `buildProjectTypeGraph`)
- Modify: `src/App.jsx` (extend `nodeTypes` map at line 911 to register the new node types)

- [ ] **Step 1: Extend the `nodeTypes` map**

Find line 911:

```js
const nodeTypes = { stage: StageNode, stickyNote: StickyNote, thoughtBubble: ThoughtBubble, spanBar: SpanBar, timelinePhase: TimelinePhase, weekGrid: WeekGrid };
```

Replace it with:

```js
const nodeTypes = { stage: StageNode, stickyNote: StickyNote, thoughtBubble: ThoughtBubble, spanBar: SpanBar, timelinePhase: TimelinePhase, weekGrid: WeekGrid, decisionNode: DecisionNode, projectTypeCard: ProjectTypeCard };
```

Note: `DecisionNode` and `ProjectTypeCard` are defined later in the file but JavaScript hoists function declarations, so this works.

- [ ] **Step 2: Add `ProjectTypeFlowView`**

Append below `buildProjectTypeGraph`:

```js
/* ═══════════════════════════════════════════════════════════════════════
   PROJECT TYPE FLOW VIEW — wizard rendered in React Flow
   ═══════════════════════════════════════════════════════════════════════ */
function ProjectTypeFlowView({ viewId }) {
  const { path, appendAnswer, rewindTo, reset } = useProjectTypeWizard(viewId);
  const { getWeeks, setWeeks } = useProjectTypeWeeks(viewId);

  const { nodes, edges } = useMemo(
    () => buildProjectTypeGraph(path, {
      getWeeks,
      onAnswer: appendAnswer,
      onRewind: rewindTo,
      onWeeksChange: setWeeks,
    }),
    [path, getWeeks, appendAnswer, rewindTo, setWeeks]
  );

  // Build breadcrumb labels from the path.
  const crumbs = useMemo(() => {
    const out = [];
    let currentId = DECISION_TREE_ROOT;
    let depth = 0;
    while (currentId && depth < path.length) {
      const node = DECISION_TREE[currentId];
      const answer = node.answers.find((a) => a.value === path[depth]);
      if (!answer) break;
      out.push({ depth, label: answer.label });
      if (typeof answer.next === 'string') {
        currentId = answer.next;
        depth += 1;
      } else {
        break; // leaf — no further crumbs
      }
    }
    return out;
  }, [path]);

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.4 }}
        minZoom={0.3}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
        style={{ background: colors.bg }}
      >
        <Background color={colors.border} gap={50} size={1} />
        <Controls position="top-right" style={{ marginTop: 64 }} showInteractive={false} />
        <MiniMap nodeColor={() => colors.surface} maskColor={`${colors.bg}cc`} position="bottom-right" style={{ marginBottom: 48 }} />
      </ReactFlow>

      {/* Breadcrumb strip */}
      {crumbs.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 80,
          left: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          background: `${colors.surface}cc`,
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          backdropFilter: 'blur(4px)',
          fontFamily: "'Inter', sans-serif",
          fontSize: 11,
          color: colors.textDim,
          zIndex: 5,
        }}>
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Path:</span>
          {crumbs.map((c, i) => (
            <React.Fragment key={c.depth}>
              {i > 0 && <span style={{ opacity: 0.4 }}>›</span>}
              <button
                onClick={() => rewindTo(c.depth)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '2px 4px',
                  color: colors.text,
                  fontSize: 11,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  textDecoration: 'underline dotted',
                }}
                title="Rewind to this step"
              >
                {c.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Start Over button */}
      {path.length > 0 && (
        <button
          onClick={reset}
          style={{
            position: 'absolute',
            top: 80,
            right: 80,
            padding: '6px 12px',
            background: `${colors.surface}cc`,
            border: `1px solid ${colors.rose}66`,
            borderRadius: 8,
            color: colors.rose,
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
            zIndex: 5,
          }}
          title="Reset the wizard"
        >
          ↺ Start over
        </button>
      )}

      {/* Empty-state hint */}
      {path.length === 0 && (
        <div style={{
          position: 'absolute',
          top: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '6px 14px',
          background: `${colors.surface}cc`,
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          color: colors.textDim,
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          backdropFilter: 'blur(4px)',
          zIndex: 5,
        }}>
          Answer the questions to identify the project type
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 3: Verify the component is parseable but not yet wired up**

Run: `npm run dev`

Expected: app loads, no errors, existing tabs still work. `ProjectTypeFlowView` is defined but not yet referenced anywhere visible.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "Add ProjectTypeFlowView with breadcrumb and start-over overlay"
```

---

## Task 9 — Wire the new tab into the header and view switcher

**Files:**
- Modify: `src/App.jsx` (VIEW_CONFIG ~line 2886, App component header ~line 2937, conditional renderer ~line 2972, legend ~line 3011)

- [ ] **Step 1: Add `'project-types'` to `VIEW_CONFIG`**

Find the `VIEW_CONFIG` object near line 2886:

```js
const VIEW_CONFIG = {
  'design-production': {
    title: 'Design → Production Workflow',
    subtitle: 'Full lifecycle from design request to production',
    dropdownLabel: 'Design → Production',
  },
  production: {
    title: 'Production Workflow',
    subtitle: 'Post-handoff through shipping and delivery',
    dropdownLabel: 'Production',
  },
  technical: {
    title: 'Stage 2: n8n Technical Flow',
    subtitle: 'HubSpot Deal → Teamwork Project Sync (Automation A)',
  },
};
```

Replace it with:

```js
const VIEW_CONFIG = {
  'design-production': {
    title: 'Design → Production Workflow',
    subtitle: 'Full lifecycle from design request to production',
    dropdownLabel: 'Design → Production',
  },
  production: {
    title: 'Production Workflow',
    subtitle: 'Post-handoff through shipping and delivery',
    dropdownLabel: 'Production',
  },
  technical: {
    title: 'Stage 2: n8n Technical Flow',
    subtitle: 'HubSpot Deal → Teamwork Project Sync (Automation A)',
  },
  'project-types': {
    title: 'Project Type Decision Tree',
    subtitle: 'Classify a project into one of 15 workflow variants',
    dropdownLabel: 'Decision Tree',
  },
};
```

- [ ] **Step 2: Add a second dropdown in the header**

Find the existing dropdown markup inside the App component (around line 2937, beneath `<div className="tab-bar">`). The structure is:

```jsx
        <div className="tab-bar">
          {/* Business Overview dropdown */}
          <div className="dropdown-wrap" ref={dropdownRef}>
            <button ...>Business Overview ...</button>
            {dropdownOpen && ( <div className="dropdown-menu"> ... </div> )}
          </div>
          <button className={`tab-btn ${activeView === 'technical' ? 'active' : ''}`} ...>Technical Flow</button>
        </div>
```

We need a second independent dropdown for "Project Types". Refactor the dropdown state and ref to support multiple dropdowns.

Find these lines near line 2904–2917 in the App component:

```js
  const [activeView, setActiveView] = useState('design-production');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
```

Replace with:

```js
  const [activeView, setActiveView] = useState('design-production');
  const [openDropdown, setOpenDropdown] = useState(null); // 'business' | 'project-types' | null
  const businessDropdownRef = useRef(null);
  const projectTypesDropdownRef = useRef(null);

  // Close any open dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      const insideBusiness = businessDropdownRef.current && businessDropdownRef.current.contains(e.target);
      const insideProjectTypes = projectTypesDropdownRef.current && projectTypesDropdownRef.current.contains(e.target);
      if (!insideBusiness && !insideProjectTypes) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
```

Then find the `<div className="tab-bar">` block (around line 2937) and replace its inner contents:

```jsx
        <div className="tab-bar">
          {/* Business Overview dropdown */}
          <div className="dropdown-wrap" ref={dropdownRef}>
            <button
              className={`tab-btn ${isBusiness ? 'active' : ''}`}
              onClick={() => setDropdownOpen((p) => !p)}
            >
              Business Overview
              <span style={{ marginLeft: 6, fontSize: 9, opacity: 0.7 }}>▼</span>
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <button
                  className={`dropdown-item ${activeView === 'design-production' ? 'active' : ''}`}
                  onClick={() => { setActiveView('design-production'); setDropdownOpen(false); }}
                >
                  Design → Production
                </button>
                <button
                  className={`dropdown-item ${activeView === 'production' ? 'active' : ''}`}
                  onClick={() => { setActiveView('production'); setDropdownOpen(false); }}
                >
                  Production
                </button>
              </div>
            )}
          </div>
          <button className={`tab-btn ${activeView === 'technical' ? 'active' : ''}`} onClick={() => { setActiveView('technical'); setDropdownOpen(false); }}>
            Technical Flow
          </button>
        </div>
```

Replace with:

```jsx
        <div className="tab-bar">
          {/* Business Overview dropdown */}
          <div className="dropdown-wrap" ref={businessDropdownRef}>
            <button
              className={`tab-btn ${isBusiness ? 'active' : ''}`}
              onClick={() => setOpenDropdown((p) => (p === 'business' ? null : 'business'))}
            >
              Business Overview
              <span style={{ marginLeft: 6, fontSize: 9, opacity: 0.7 }}>▼</span>
            </button>
            {openDropdown === 'business' && (
              <div className="dropdown-menu">
                <button
                  className={`dropdown-item ${activeView === 'design-production' ? 'active' : ''}`}
                  onClick={() => { setActiveView('design-production'); setOpenDropdown(null); }}
                >
                  Design → Production
                </button>
                <button
                  className={`dropdown-item ${activeView === 'production' ? 'active' : ''}`}
                  onClick={() => { setActiveView('production'); setOpenDropdown(null); }}
                >
                  Production
                </button>
              </div>
            )}
          </div>

          {/* Project Types dropdown */}
          <div className="dropdown-wrap" ref={projectTypesDropdownRef}>
            <button
              className={`tab-btn ${activeView === 'project-types' ? 'active' : ''}`}
              onClick={() => setOpenDropdown((p) => (p === 'project-types' ? null : 'project-types'))}
            >
              Project Types
              <span style={{ marginLeft: 6, fontSize: 9, opacity: 0.7 }}>▼</span>
            </button>
            {openDropdown === 'project-types' && (
              <div className="dropdown-menu">
                <button
                  className={`dropdown-item ${activeView === 'project-types' ? 'active' : ''}`}
                  onClick={() => { setActiveView('project-types'); setOpenDropdown(null); }}
                >
                  Decision Tree
                </button>
              </div>
            )}
          </div>

          <button className={`tab-btn ${activeView === 'technical' ? 'active' : ''}`} onClick={() => { setActiveView('technical'); setOpenDropdown(null); }}>
            Technical Flow
          </button>
        </div>
```

- [ ] **Step 3: Wire conditional rendering for the new view**

Find the `{/* flow views */}` block (around line 2970). The existing structure is a ternary chain:

```jsx
        {activeView === 'technical' ? ( ... ) : activeView === 'design-production' ? ( ... ) : ( ... production ... )}
```

Replace that ternary chain with:

```jsx
        {activeView === 'technical' ? (
          <FlowView
            key="technical"
            viewId="technical"
            nodeDataList={technicalNodes}
            edgeList={technicalEdges}
            sideNode={writebackNodeData}
            sideNodeYIndex={3}
            xCenter={400}
          />
        ) : activeView === 'design-production' ? (
          <FlowView
            key="design-production"
            viewId="design-production"
            nodeDataList={businessNodes}
            edgeList={businessEdges}
            sideNode={null}
            sideNodeYIndex={0}
            xCenter={400}
            extraNodes={designThoughtBubbles}
            extraEdges={designThoughtEdges}
          />
        ) : activeView === 'production' ? (
          <FlowView
            key="production"
            viewId="production"
            nodeDataList={prodNodes}
            edgeList={productionEdges}
            sideNode={null}
            sideNodeYIndex={0}
            xCenter={400}
            positionFn={computeProductionPositions}
            snapGridY={WEEK_HEIGHT}
            weekGrid={{ x: -550, weeks: PROD_WEEKS, rowHeight: WEEK_HEIGHT, gridWidth: 1300 }}
          />
        ) : (
          <ProjectTypeFlowView key="project-types" viewId="project-types" />
        )}
```

- [ ] **Step 4: Add the legend variant for the new view**

Find the legend block at the bottom of the App component (starts around line 3011 with `{activeView === 'technical' ? (`). The existing structure is another ternary chain. Replace the entire legend chain — from the opening `{activeView === 'technical' ? (` of the legend block down to its closing `)}` directly above `{/* hint */}` — with:

```jsx
      {/* legend */}
      {activeView === 'technical' ? (
        <div className="legend">
          <div className="legend-title">Stage Colors</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.orange }} />Trigger & Gate</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.blue }} />HubSpot API Read</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.purple }} />Designer Rotation (LRU)</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.green }} />Project Creation (TW)</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.cyan }} />Task Assignment (fan-out)</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.rose }} />HubSpot Writeback (parallel)</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.amber }} />Design Brief Comment</div>
          <div style={{ marginTop: 8, borderTop: `1px solid ${colors.border}`, paddingTop: 8 }}>
            <div className="legend-item"><div style={{ width: 20, height: 2, background: colors.textDim, flexShrink: 0 }} />Sequential flow</div>
            <div className="legend-item"><div style={{ width: 20, height: 0, borderTop: `2px dashed ${colors.rose}`, flexShrink: 0 }} />Parallel branch</div>
          </div>
        </div>
      ) : activeView === 'production' ? (
        <div className="legend">
          <div className="legend-title">Roles</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.sky }} />Procurement</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.amber }} />Brick Designer</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.pink }} />Graphic Designer</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.orange }} />Production Coordinator</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: '#94a3b8' }} />Supplier / Factory</div>
          <div style={{ marginTop: 8, borderTop: `1px solid ${colors.border}`, paddingTop: 8 }}>
            <div className="legend-item"><div style={{ width: 20, height: 2, background: colors.textDim, flexShrink: 0 }} />Sequential flow</div>
            <div className="legend-item"><div style={{ width: 20, height: 0, borderTop: `2px dashed #94a3b8`, flexShrink: 0 }} />Background process</div>
          </div>
          <div style={{ marginTop: 8, borderTop: `1px solid ${colors.border}`, paddingTop: 8 }}>
            <div className="legend-item">
              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${colors.pink}22`, color: colors.pink }}>CLIENT APPROVAL</span>
              Requires client sign-off
            </div>
          </div>
        </div>
      ) : activeView === 'project-types' ? (
        <div className="legend">
          <div className="legend-title">Step Types</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.cyan }} />Decision node</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.emerald }} />Project Type card</div>
          <div style={{ marginTop: 8, borderTop: `1px solid ${colors.border}`, paddingTop: 8, fontSize: 10, color: colors.textDim, lineHeight: 1.4 }}>
            Click answers to walk the tree · Click a step to rewind
          </div>
        </div>
      ) : (
        <div className="legend">
          <div className="legend-title">Step Types</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.blue }} />HubSpot</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.purple }} />Teamwork</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.indigo }} />DocuSign</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.sky }} />QuickBooks</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.green }} />Approval / Manual</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.pink }} />Data Entry</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.lime }} />Production</div>
          <div style={{ marginTop: 8, borderTop: `1px solid ${colors.border}`, paddingTop: 8 }}>
            <div className="legend-item">
              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${colors.orange}22`, color: colors.orange }}>AUTO</span>
              Automated step
            </div>
            <div className="legend-item">
              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${colors.green}22`, color: colors.green }}>MANUAL</span>
              Human action required
            </div>
          </div>
        </div>
      )}
```

Note: the existing `design-production` view falls into the final `else` branch in the existing code (it shares the legend with `design-production`). Keep that behavior — the final `:` branch above remains the design-production-style legend.

- [ ] **Step 5: Verify the new tab loads end-to-end**

Run: `npm run dev`

Open the app in the browser. Expected:

- Header now shows three top-level buttons: "Business Overview ▼", "Project Types ▼", "Technical Flow".
- Click "Project Types ▼" → dropdown shows "Decision Tree".
- Click "Decision Tree" → header switches to "Brava Brands — Project Type Decision Tree" with the new subtitle.
- The canvas shows a single decision node ("Is this a minifig-only project?") with two answer pills, "Yes" and "No".
- The empty-state hint "Answer the questions to identify the project type" appears at top center.
- No "Start over" button or breadcrumb visible yet.
- Click "No" → wizard advances; Q2 (Which brand?) appears to the right; the answered Q1 chip shows "No"; the breadcrumb appears showing "No"; "Start over" button appears top-right.
- Continue clicking through: "LEGO" → "Standard" → "With minifigs". The final step replaces the question with a green-bordered card titled "LEGO · Standard · w/ Minifigs", with a `LEGO-STD-MF` code badge and a `14 wks` button.
- Click the `14 wks` button → it becomes an input. Type `15`, press Enter → it now shows `15 wks`.
- Refresh the browser → wizard returns to the same final state (path persisted) and the weeks override (`15`) is preserved.
- Click "Start over" → wizard resets to the initial Q1 state. Refresh again → still the initial state.
- Click "Business Overview ▼" → "Design → Production" → the Project Types tab is no longer shown and the original tab renders correctly. Switch back to "Decision Tree" → wizard state is empty (since we just reset).

Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx
git commit -m "Wire Project Type Decision Tree tab into header, view switcher, and legend"
```

---

## Task 10 — Full path smoke test

This task does NOT modify code; it walks every one of the 15 paths and verifies the correct leaf id materializes. Catching any leaf-id mismatch here is much cheaper than catching it later.

**Files:**
- None (verification only)

- [ ] **Step 1: Open the app and clear wizard state**

Run: `npm run dev`. Open the app. Switch to the **Project Types → Decision Tree** tab.

In devtools console, run:

```js
localStorage.removeItem('project-type-wizard-project-types');
localStorage.removeItem('project-type-weeks-project-types');
location.reload();
```

Expected: wizard shows Q1 ("Is this a minifig-only project?") with no breadcrumb and no Start Over button.

- [ ] **Step 2: Walk all 15 paths and verify each leaf**

For each row in the table below: click "Start over" (if visible), then click the listed answers in order, then confirm the leaf card shows the expected name and code.

| # | Answer sequence (click order) | Expected leaf name | Expected code |
|---|---|---|---|
| 1 | Yes → Standard | Minifig-Only · Standard | MF-STD |
| 2 | Yes → Expedited | Minifig-Only · Expedited | MF-EXP |
| 3 | Yes → Extended | Minifig-Only · Extended | MF-EXT |
| 4 | No → LEGO → Standard → No minifigs | LEGO · Standard | LEGO-STD |
| 5 | No → LEGO → Standard → With minifigs | LEGO · Standard · w/ Minifigs | LEGO-STD-MF |
| 6 | No → LEGO → Expedited → No minifigs | LEGO · Expedited | LEGO-EXP |
| 7 | No → LEGO → Expedited → With minifigs | LEGO · Expedited · w/ Minifigs | LEGO-EXP-MF |
| 8 | No → LEGO → Extended → No minifigs | LEGO · Extended | LEGO-EXT |
| 9 | No → LEGO → Extended → With minifigs | LEGO · Extended · w/ Minifigs | LEGO-EXT-MF |
| 10 | No → Compatible → Standard → No minifigs | Compatible · Standard | CMP-STD |
| 11 | No → Compatible → Standard → With minifigs | Compatible · Standard · w/ Minifigs | CMP-STD-MF |
| 12 | No → Compatible → Expedited → No minifigs | Compatible · Expedited | CMP-EXP |
| 13 | No → Compatible → Expedited → With minifigs | Compatible · Expedited · w/ Minifigs | CMP-EXP-MF |
| 14 | No → Compatible → Extended → No minifigs | Compatible · Extended | CMP-EXT |
| 15 | No → Compatible → Extended → With minifigs | Compatible · Extended · w/ Minifigs | CMP-EXT-MF |

Expected: every path resolves to the matching leaf with the correct name and code. No console errors.

- [ ] **Step 3: Verify breadcrumb rewind**

While on row 5 (`LEGO · Standard · w/ Minifigs`):

1. In the breadcrumb under the header, click the second crumb (`LEGO`). Expected: wizard rewinds to Q3 (the timeframe question); the leaf card disappears; "With minifigs" and "Standard" answers are removed from the path.
2. Click "Expedited" → "With minifigs". Expected: leaf card now shows `LEGO · Expedited · w/ Minifigs` / `LEGO-EXP-MF`.

- [ ] **Step 4: Verify week-edit persistence**

On any leaf card:

1. Click the `X wks` button → input appears.
2. Type a different number (e.g., `99`) → press Enter.
3. Refresh the browser → the leaf still shows `99 wks`.
4. In devtools console, run `localStorage.removeItem('project-type-weeks-project-types'); location.reload();` → leaf reverts to the default week count from the catalog.

- [ ] **Step 5: Verify no regression on other tabs**

Switch to **Business Overview → Design → Production**. Expected: the Design → Production diagram loads as before, with its normal nodes, edges, and editor controls.

Switch to **Business Overview → Production**. Expected: Production tab loads normally.

Switch to **Technical Flow**. Expected: Technical Flow tab loads normally.

- [ ] **Step 6: Commit the verification record**

Nothing to commit at this step (no code changes), but it's the natural place to land the work. If any defects were found in Steps 1–5, return to the relevant task and fix them — DO NOT proceed past this step until all 15 paths verify, breadcrumb rewind works, week edits persist, and the other three tabs are unaffected.

---

## Out of scope (per spec)

- No cross-links from leaf cards to other tabs.
- No additional axes (size, custom printing, licensing review, etc.) — designed extensibly via `axes`, not surfaced.
- No backend or shared config — localStorage only.
- No workflow detail (steps, roles, approvals) on the leaf cards.
- No `src/App.jsx` split into per-view files. Flagged as future work in the spec.
