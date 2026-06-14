# Comfort at Every Height — Auto-Advancing Video Playback

**Date:** 2026-06-01
**Branch:** `chris-han/comfort-at-every-height-video-carousel`
**Component:** `libs/modules/product/components/src/lib/sofa-comfort-video-list/sofa-comfort-video-list.tsx`

## Summary

The PDP "Comfort at Every Height" section shows one spec video at a time, switched
by a radio-button group (one label per persona/spec). Today each video loops
infinitely and only changes when the user clicks a label.

Upgrade it to **auto-advance**: when the active video finishes, automatically play
the next spec video, wrapping from the last back to the first — a continuous cycle.
The labels and the overall UI stay exactly as they are; the highlighted label follows
whichever video is currently playing.

This is **not** a visual sliding carousel. No layout, styling, Storyblok schema, or
dependency changes.

## Hard Constraint

`FortressVideo` (`libs/shared/components`) is a shared/common component used across the
app. **It must NOT be modified.** All changes live in the business component
`sofa-comfort-video-list.tsx`, relying only on `FortressVideo`'s existing public props
(`onEnded`, `loop`). If a requirement ever seems to need a `FortressVideo` change, stop
and re-discuss rather than editing the shared component.

## Current Behaviour (baseline)

- `videoList: { media: { filename }, persona }[]` and `listTitle` come from Storyblok
  (`sofaComfortVideos`, `sofaComfortVideoSectionTitle`) via the server wrapper.
- `SofaComfortVideoList` (client) renders a `SelectList` (radio group) + a stack of
  `FortressVideo`s. All videos are mounted; only the one at `playingIndex` is
  `display: block`, the rest `display: none`.
- Each `FortressVideo` is rendered with `loop` (infinite), `autoPlay` when active,
  `muted`, no controls, thumbnail disabled.
- `SelectList` owns its own `selected` state. User clicks → `onSelect` →
  `handleSelectIndex` → `switchPlayingIndex` (pauses all, sets `playingIndex`) +
  fires `how_it_sits_click` tracking. An effect calls `replay()` on the active video
  when `playingIndex` / `isImpressionTracked` changes.
- Tracking: impression via `IntersectionObserver`; a 70%-visible duration timer
  firing `how_it_sits_video_view` every 5s; per-video watch-percentage via
  `FortressVideo`'s `enableProgressTracking` / `trackVideo`.

## Target Behaviour

1. The active video plays once and, on end, the section advances to
   `(playingIndex + 1) % videoList.length` and plays that video.
2. After the last video it wraps to the first and continues indefinitely.
3. The highlighted radio label always reflects the currently-playing video, whether
   the switch was automatic or a manual click.
4. Manual label clicks keep working; auto-advance continues from the clicked video.
5. Single-video products are unchanged (that one video keeps looping).

## Design

`FortressVideo` already exposes everything required:

- `onEnded?: (event) => void` — fires when the video finishes.
- `loop?: boolean` — when `true`, react-player never ends (so `onEnded` never fires).

### Change 1 — End the active video instead of looping it

Set `loop` conditionally:

```tsx
loop={decoratedVideoList.length <= 1}
```

- `length <= 1` → `loop = true` → single video loops forever (today's behaviour, no
  `onEnded` advance needed).
- `length > 1` → `loop = false` → the active video ends and fires `onEnded`.

### Change 2 — Auto-advance on end

Add an `onEnded` handler on each `FortressVideo`, guarded so only the active video
advances (defensive — non-active videos are paused and shouldn't end):

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

`switchPlayingIndex(next)` (existing) pauses all videos and sets `playingIndex`;
the existing `replay()` effect then restarts and plays the newly-active video.
Because `length > 1`, `next !== index` always holds, so `switchPlayingIndex` returns
`true` and the advance is never skipped.

Auto-advance deliberately does **not** fire `how_it_sits_click` — that event stays
exclusive to genuine user clicks (`handleSelectIndex`). All other tracking is
untouched.

### Change 3 — Make the label highlight follow `playingIndex`

`SelectList` becomes controlled. The parent derives the active persona from
`playingIndex` and passes it down; `SelectList` highlights based on that prop rather
than (only) internal state:

```tsx
const selectedPersona = decoratedVideoList[playingIndex]?.persona ?? '';
// <SelectList selectedPersona={selectedPersona} ... />
```

Within `SelectList`, `checked` is driven by `selectedPersona === item.persona`.
The existing "auto-select index 0 when the list changes / selection no longer
matches" safeguard is preserved by resetting `playingIndex` to `0` in the parent when
`videoList` changes (the decoration effect already runs on `videoList`), keeping the
controlled value in range.

### Unchanged

Layout, spacing, colours, `FortressVideo` config (aspect ratio, resolution, crop,
muted, controls off, thumbnail disabled), impression / duration / percentage tracking,
and the server wrapper all stay as-is.

## Edge Cases

- **Empty list** → component returns `null` (unchanged).
- **One video** → `loop = true`, no advance; behaves exactly as today.
- **Manual click mid-playback** → pauses current, jumps to clicked video, auto-advance
  resumes from there.
- **`videoList` prop changes** (e.g. SPA navigation to another product) → `playingIndex`
  resets to `0`; highlight and playback start from the first video.
- **Non-active video firing `onEnded`** → ignored by the `index !== playingIndex` guard.

## Testing

Add `sofa-comfort-video-list.spec.tsx` (none exists today). Mock `FortressVideo` to
expose its `onEnded`/`ref` so tests can drive playback. Cover:

1. Renders one label per video; first video active on mount.
2. Firing `onEnded` on the active video advances to the next and highlights its label.
3. Firing `onEnded` on the last video wraps back to the first.
4. Single-video list: `loop` is set and `onEnded` does not advance.
5. Manual label click switches the active video and fires `how_it_sits_click`;
   a subsequent `onEnded` advances from the clicked index.
6. Auto-advance does **not** fire `how_it_sits_click`.

## Out of Scope

- Visual sliding/swipe carousel.
- Storyblok schema changes.
- Changes to `FortressVideo` itself.
- Layout/styling changes.
