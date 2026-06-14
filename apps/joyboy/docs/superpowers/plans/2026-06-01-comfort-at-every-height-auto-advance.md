# Comfort at Every Height — Auto-Advancing Video Playback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the PDP "Comfort at Every Height" section auto-play the next spec video when the current one ends, cycling continuously, with the highlighted label following the active video — no UI changes.

**Architecture:** Single-file business-component change in `sofa-comfort-video-list.tsx`. Drive playback off `FortressVideo`'s existing `onEnded` callback and `loop` prop; make the radio `SelectList` controlled so the highlight follows `playingIndex`. The shared `FortressVideo` component is NOT modified.

**Tech Stack:** React 18 client component, `@castlery/fortress` (RadioButton/RadioGroup/Stack), `@castlery/shared-components` `FortressVideo` (react-player wrapper), Jest + `@testing-library/react`.

**Spec:** `docs/superpowers/specs/2026-06-01-comfort-at-every-height-auto-advance-design.md`

---

## Hard Constraint

`libs/shared/components/src/lib/fortress-video/fortress-video.tsx` is a shared component and MUST NOT be changed. Use only its existing public props (`onEnded`, `loop`).

## File Structure

- **Modify:** `libs/modules/product/components/src/lib/sofa-comfort-video-list/sofa-comfort-video-list.tsx`
  - Make `SelectList` controlled (highlight from a `selectedPersona` prop; drop internal `selected` state and `onAutoSelect`).
  - In `SofaComfortVideoList`: derive `selectedPersona` from `playingIndex`; reset `playingIndex` to `0` when `videoList` changes; add `handleVideoEnded`; set `loop` conditionally and wire `onEnded` on `FortressVideo`; remove the now-unused `handleAutoSelectIndex`.
- **Create:** `libs/modules/product/components/src/lib/sofa-comfort-video-list/sofa-comfort-video-list.spec.tsx`
  - Unit tests for auto-advance, wraparound, single-video loop, label sync, and tracking.

**Test command (used throughout):**

```bash
pnpm nx test modules-product-components --testFile=libs/modules/product/components/src/lib/sofa-comfort-video-list/sofa-comfort-video-list.spec.tsx
```

---

## Task 1: Write the failing tests

**Files:**

- Create: `libs/modules/product/components/src/lib/sofa-comfort-video-list/sofa-comfort-video-list.spec.tsx`

- [ ] **Step 1: Write the test file**

Create the file with the full content below. The mocks expose: each `FortressVideo` as a `<div data-loop data-autoplay>` plus an "end" button that invokes its `onEnded` prop; each `RadioButton` as a radio `<input data-checked>`. `IntersectionObserver` is stubbed as a no-op so the component does not crash in jsdom (impression tracking stays inert, which is fine — the highlight is derived from `playingIndex`, not from impression state).

```tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SofaComfortVideoList } from './sofa-comfort-video-list';
import { EVENT_HOW_IT_SITS } from '@castlery/modules-tracking-services';

// ── shared-redux-store: dispatch is a no-op resolving promise ────────────────
const mockDispatch = jest.fn(() => Promise.resolve());
jest.mock('@castlery/shared-redux-store', () => ({
  useAppDispatch: () => mockDispatch,
}));

// ── tracking: EVENT_HOW_IT_SITS returns a plain action we can assert on ───────
jest.mock('@castlery/modules-tracking-services', () => ({
  EVENT_HOW_IT_SITS: jest.fn((payload: any) => ({ type: 'how_it_sits', payload })),
}));

// ── fortress: radios expose checked state; layout primitives are passthroughs ─
jest.mock('@castlery/fortress', () => {
  const React = require('react');
  return {
    __esModule: true,
    Stack: ({ children }: any) => <div>{children}</div>,
    Typography: ({ children }: any) => <div>{children}</div>,
    RadioGroup: ({ children }: any) => <div role="radiogroup">{children}</div>,
    RadioButton: ({ value, label, checked, onChange }: any) => (
      <label>
        <input
          type="radio"
          data-testid={`radio-${value}`}
          data-checked={String(!!checked)}
          value={value}
          checked={!!checked}
          onChange={() => onChange?.({ target: { value } })}
        />
        {label}
      </label>
    ),
    useBreakpoints: () => ({ desktop: true, mobile: false }),
  };
});

// ── shared-components: FortressVideo mock exposing onEnded + ref handle ────────
jest.mock('@castlery/shared-components', () => {
  const React = require('react');
  return {
    __esModule: true,
    FortressVideo: React.forwardRef((props: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        play: jest.fn(),
        pause: jest.fn(),
        replay: jest.fn(),
      }));
      return (
        <div
          data-testid={`video-${props.src}`}
          data-src={props.src}
          data-loop={String(!!props.loop)}
          data-autoplay={String(!!props.autoPlay)}
        >
          <button
            type="button"
            data-testid={`video-ended-${props.src}`}
            onClick={() => props.onEnded?.({ type: 'ended' })}
          >
            end {props.src}
          </button>
        </div>
      );
    }),
  };
});

const makeVideo = (persona: string) => ({
  media: { filename: `video-${persona}.mp4` },
  persona,
});

const checked = (persona: string) => screen.getByTestId(`radio-${persona}`).getAttribute('data-checked');

const endVideo = (persona: string) => fireEvent.click(screen.getByTestId(`video-ended-video-${persona}.mp4`));

beforeAll(() => {
  (global as any).IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SofaComfortVideoList — auto-advance', () => {
  it('renders one radio per video and highlights the first on mount', () => {
    render(<SofaComfortVideoList videoList={[makeVideo('A'), makeVideo('B'), makeVideo('C')]} listTitle="Comfort" />);

    expect(screen.getByTestId('radio-A')).toBeTruthy();
    expect(screen.getByTestId('radio-B')).toBeTruthy();
    expect(screen.getByTestId('radio-C')).toBeTruthy();
    expect(checked('A')).toBe('true');
    expect(checked('B')).toBe('false');
  });

  it('advances to the next video and moves the highlight when the active video ends', () => {
    render(<SofaComfortVideoList videoList={[makeVideo('A'), makeVideo('B'), makeVideo('C')]} listTitle="Comfort" />);

    endVideo('A');

    expect(checked('A')).toBe('false');
    expect(checked('B')).toBe('true');
  });

  it('wraps back to the first video after the last one ends', () => {
    render(<SofaComfortVideoList videoList={[makeVideo('A'), makeVideo('B'), makeVideo('C')]} listTitle="Comfort" />);

    endVideo('A'); // -> B
    endVideo('B'); // -> C
    expect(checked('C')).toBe('true');

    endVideo('C'); // wraps -> A
    expect(checked('A')).toBe('true');
  });

  it('does not fire a click-tracking event on auto-advance', () => {
    render(<SofaComfortVideoList videoList={[makeVideo('A'), makeVideo('B')]} listTitle="Comfort" />);

    endVideo('A');

    const clickCall = (EVENT_HOW_IT_SITS as jest.Mock).mock.calls.find(
      ([payload]) => payload?.category === 'how_it_sits_click'
    );
    expect(clickCall).toBeUndefined();
  });

  it('manual label click switches the active video and fires click tracking; later end advances from there', async () => {
    render(<SofaComfortVideoList videoList={[makeVideo('A'), makeVideo('B'), makeVideo('C')]} listTitle="Comfort" />);

    fireEvent.click(screen.getByTestId('radio-C'));
    expect(checked('C')).toBe('true');

    await waitFor(() =>
      expect(EVENT_HOW_IT_SITS).toHaveBeenCalledWith(expect.objectContaining({ category: 'how_it_sits_click' }))
    );

    endVideo('C'); // wraps to A
    expect(checked('A')).toBe('true');
  });

  it('keeps a single video looping and does not advance on end', () => {
    render(<SofaComfortVideoList videoList={[makeVideo('A')]} listTitle="Comfort" />);

    expect(screen.getByTestId('video-video-A.mp4').getAttribute('data-loop')).toBe('true');

    endVideo('A');
    expect(checked('A')).toBe('true');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
pnpm nx test modules-product-components --testFile=libs/modules/product/components/src/lib/sofa-comfort-video-list/sofa-comfort-video-list.spec.tsx
```

Expected: FAIL. The "advances…", "wraps…", and single-video `data-loop` tests fail because today the active `FortressVideo` is rendered with `loop` (always `true`) and there is no `onEnded` advance, so the highlight never moves and `data-loop` is `"true"` for multi-video lists too.

---

## Task 2: Make `SelectList` controlled

**Files:**

- Modify: `libs/modules/product/components/src/lib/sofa-comfort-video-list/sofa-comfort-video-list.tsx:10-62`

- [ ] **Step 1: Replace the `SelectList` component**

Replace the entire current `SelectList` definition (lines 10–62) with this controlled version. It receives `selectedPersona` and drops the internal `selected` state, the `onAutoSelect` prop, and the `useEffect`:

```tsx
const SelectList = ({
  data,
  selectedPersona,
  onSelect,
}: {
  data: DecoratedSofaComfortVideoItemType[];
  selectedPersona: string;
  onSelect: (index: number, persona: string) => void;
}) => {
  return (
    <Stack>
      <RadioGroup
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          span: {
            marginTop: '0 !important',
          },
          gap: theme.spacing(3),
        })}
      >
        {data.map((item, index) => (
          <RadioButton
            key={item.persona}
            value={item.persona}
            label={item.persona}
            checked={selectedPersona === item.persona}
            onChange={(event) => onSelect(index, event.target.value)}
          />
        ))}
      </RadioGroup>
    </Stack>
  );
};
```

- [ ] **Step 2: Remove the now-unused `useState`/`useEffect` import usage check**

No import changes are required: `useState`, `useEffect`, `useRef`, `useCallback` are all still used by `SofaComfortVideoList`. Leave the import line (line 8) as-is.

---

## Task 3: Wire auto-advance into `SofaComfortVideoList`

**Files:**

- Modify: `libs/modules/product/components/src/lib/sofa-comfort-video-list/sofa-comfort-video-list.tsx` (the `SofaComfortVideoList` body and JSX)

- [ ] **Step 1: Derive the active persona**

Immediately after the existing `switchPlayingIndex` `useCallback` (ends at line 117), the component already has `handleSelectIndex` (lines 118–130). Leave `handleSelectIndex` as-is. **Delete** `handleAutoSelectIndex` entirely (current lines 131–136):

```tsx
// DELETE this block:
const handleAutoSelectIndex = useCallback(
  (index: number, _persona: string) => {
    switchPlayingIndex(index);
  },
  [switchPlayingIndex]
);
```

- [ ] **Step 2: Add the `handleVideoEnded` handler**

Add this `useCallback` right after `handleSelectIndex` (where `handleAutoSelectIndex` used to be):

```tsx
const handleVideoEnded = useCallback(
  (index: number) => {
    if (index !== playingIndex) return;
    const total = decoratedVideoList.length;
    if (total <= 1) return;
    switchPlayingIndex((index + 1) % total);
  },
  [playingIndex, decoratedVideoList.length, switchPlayingIndex]
);
```

- [ ] **Step 3: Reset `playingIndex` when the video list changes**

In the decoration effect (current lines 204–211), add `setPlayingIndex(0)` so the controlled highlight stays in range when the product/list changes. Replace the effect with:

```tsx
useEffect(() => {
  const tempList = videoList.map((item) => ({
    videoUrl: item.media.filename,
    persona: item.persona,
  }));
  visibleDurationRef.current = 0;
  setPlayingIndex(0);
  setDecoratedVideoList(tempList);
}, [videoList]);
```

- [ ] **Step 4: Pass `selectedPersona` to `SelectList`**

Replace the `SelectList` usage (current line 257) with the controlled props (note `onAutoSelect` is removed):

```tsx
<SelectList
  data={decoratedVideoList}
  selectedPersona={decoratedVideoList[playingIndex]?.persona ?? ''}
  onSelect={handleSelectIndex}
/>
```

- [ ] **Step 5: Set `loop` conditionally and wire `onEnded` on `FortressVideo`**

In the `FortressVideo` JSX (current lines 262–290), change the `loop` prop and add `onEnded`. Replace the `loop` line (current line 277) and add the `onEnded` prop next to it:

```tsx
loop={decoratedVideoList.length <= 1}
onEnded={() => handleVideoEnded(index)}
```

The surrounding `FortressVideo` props (`src`, `ref`, `enableProgressTracking`, `trackVideo`, `autoPlay`, `muted`, `controls`, `thumbnailConfig`, `videoConfig`, `resolution`, `containerConfig`) stay exactly as they are.

- [ ] **Step 6: Run the tests to verify they pass**

Run:

```bash
pnpm nx test modules-product-components --testFile=libs/modules/product/components/src/lib/sofa-comfort-video-list/sofa-comfort-video-list.spec.tsx
```

Expected: PASS (6 tests passing).

---

## Task 4: Verify quality gates and commit

**Files:**

- All changes above.

- [ ] **Step 1: Typecheck the project**

Run:

```bash
pnpm nx typecheck modules-product-components
```

Expected: no type errors. (If `typecheck` is not a configured target, run `pnpm nx lint modules-product-components` and rely on the test run's TS compilation.)

- [ ] **Step 2: Lint the changed files**

Run:

```bash
pnpm nx lint modules-product-components
```

Expected: PASS (no new lint errors in the two files).

- [ ] **Step 3: Commit**

```bash
git add libs/modules/product/components/src/lib/sofa-comfort-video-list/sofa-comfort-video-list.tsx \
        libs/modules/product/components/src/lib/sofa-comfort-video-list/sofa-comfort-video-list.spec.tsx
git commit -m "feat: auto-advance Comfort at Every Height spec videos

When the active video ends, automatically play the next spec video and
cycle back to the first after the last. The radio label follows the
active video. Single-video lists keep looping. No UI or FortressVideo
changes."
```

---

## Task 5 (optional): Manual verification in the running app

- [ ] **Step 1:** Ensure the dev server is running (`pnpm web:us`, port 7780).
- [ ] **Step 2:** Open a PDP whose Storyblok `sofaComfortVideos` has 2+ entries and scroll to the "Comfort at Every Height" section.
- [ ] **Step 3:** Confirm: the first video plays, then auto-advances to the next when it ends, the highlighted label follows, and it wraps from last back to first. Clicking a label still jumps and resumes auto-advance from there.

Note: if no local product has multiple comfort videos, rely on the unit tests; flag this to the reviewer rather than skipping silently.

---

## Self-Review

**Spec coverage:**

- Auto-advance on end → Task 3 Step 2 + Step 5 (`onEnded`). ✓
- Wraparound → `(index + 1) % total` (Task 3 Step 2); test in Task 1. ✓
- Highlight follows active video → controlled `SelectList` (Task 2) + `selectedPersona` (Task 3 Step 4). ✓
- Manual click still works + continues auto-advance → `handleSelectIndex` unchanged; test in Task 1. ✓
- Single-video unchanged (keeps looping) → `loop={length <= 1}` (Task 3 Step 5); test in Task 1. ✓
- `videoList` change resets to first → Task 3 Step 3. ✓
- Auto-advance is not a click event → no tracking added in `handleVideoEnded`; test in Task 1. ✓
- No UI / FortressVideo / schema changes → only the two listed files touched; FortressVideo untouched. ✓

**Placeholder scan:** No TBD/TODO; all code blocks complete. ✓

**Type consistency:** `handleVideoEnded(index: number)`, `selectedPersona: string`, `onSelect(index, persona)` match between `SelectList` props, its usage, and the `FortressVideo` `onEnded` wiring. `DecoratedSofaComfortVideoItemType` (existing) is reused unchanged. ✓
