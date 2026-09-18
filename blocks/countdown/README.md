# Countdown block

Counts down to a target date/time, showing days/hours/minutes/seconds
remaining, and updating live via `setInterval`. First block in this project
that updates itself over time rather than only in response to user
interaction — see `.claude/CONTEXT.md` for why this one was picked to learn
from.

## Content contract

Two labeled rows, read via `readBlockConfig()` (fixed fields, not a
repeating list — same pattern as `quote`):

1. **Target Date** (required) — the date/time to count down to, in **ISO 8601
   format** (`YYYY-MM-DDTHH:mm:ss`), e.g. `2026-12-31T23:59:59`. Do not use a
   human-readable format like "December 31, 2026" — `Date` parsing of
   non-ISO strings is inconsistent across browsers and is not something to
   rely on.
2. **Label** (optional) — text shown above the countdown, e.g.
   "Sale ends in". If omitted, no label is rendered.

If "Target Date" is missing or isn't a parseable ISO date, the block warns
(console) and removes itself from the page (`block.remove()`) — same pattern
as `quote`'s missing "Quote Text" guard and `tabs`' all-rows-invalid case —
rather than showing `NaN`/`Invalid Date`, or leaving the raw unstyled
authored table visible, to a real visitor.

## Authoring in DA (or Google Docs/Word)

| Countdown |  |
| --- | --- |
| Target Date | 2026-12-31T23:59:59 |
| Label | Sale ends in |

## Expected markup before decoration

```html
<div class="countdown">
  <div>
    <div>target-date</div>
    <div>2026-12-31T23:59:59</div>
  </div>
  <div>
    <div>label</div>
    <div>Sale ends in</div>
  </div>
</div>
```

## Expected markup after decoration

Verified against `countdown.js` and its test suite (36 tests covering the
happy path, expiry, invalid/missing input, zero-padding, `aria-live`, and
interval cleanup), and spot-checked live against a real headless Chrome
instance hitting the running dev server — the actual decorated markup
matched this spec exactly (`aria-live="polite"`, zero-padded values, label
present).

While counting down:

```html
<div class="countdown block" data-block-name="countdown" data-block-status="loaded">
  <p class="countdown-label">Sale ends in</p>
  <div class="countdown-timer" aria-live="polite">
    <div class="countdown-segment"><span class="countdown-value">02</span><span class="countdown-unit">days</span></div>
    <div class="countdown-segment"><span class="countdown-value">14</span><span class="countdown-unit">hours</span></div>
    <div class="countdown-segment"><span class="countdown-value">36</span><span class="countdown-unit">minutes</span></div>
    <div class="countdown-segment"><span class="countdown-value">05</span><span class="countdown-unit">seconds</span></div>
  </div>
</div>
```

Once the target date/time has passed:

```html
<div class="countdown block" data-block-name="countdown" data-block-status="loaded">
  <p class="countdown-label">Sale ends in</p>
  <div class="countdown-ended" aria-live="polite">Offer has ended</div>
</div>
```

Note this is the *same DOM element* as `.countdown-timer` above, not a
replacement — `renderCountdown()` sets `className = 'countdown-ended'` and
`textContent = 'Offer has ended'` directly on it, rather than removing it and
creating a new one. Two consequences worth knowing: the element no longer
matches `.countdown-timer` once expired (so `block.querySelector('.countdown-timer')`
returns `null` after expiry — this bit a test earlier in development), and
the `aria-live="polite"` attribute set when the element was first created
persists through to this state for free, since the same node is reused.

## Lifecycle / cleanup (the new concept this block teaches)

- The interval **must be cleared once the countdown reaches zero** — letting
  it keep firing every second after expiry wastes CPU for no visible effect.
- EDS has no framework-level "unmount" hook for blocks (they're plain DOM,
  not components with a lifecycle). If this block's element were ever removed
  from the page, a naive `setInterval` would keep silently ticking in the
  background forever. Guard against this inside the tick callback by checking
  `block.isConnected` and calling `clearInterval` if it's no longer in the
  document, rather than assuming the block lives as long as the page does.

## Accessibility

- `aria-live="polite"` on the timer container so assistive tech is aware
  content is updating, without being read out every single second (avoid
  `aria-live="assertive"` here — that would interrupt the user every tick).
- Consider whether visually hiding the ticking seconds from the accessible
  tree (e.g. only announcing meaningful state changes, like reaching zero)
  is worth the added complexity — flagged here as a design decision, not
  dictated.
