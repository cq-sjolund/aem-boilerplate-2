# Countdown block

Counts down to a target date/time, showing days/hours/minutes/seconds
remaining, and updating live via `setInterval`. First block in this project
that updates itself over time rather than only in response to user
interaction — see `.claude/CONTEXT.md` for why this one was picked to learn
from.

> **Status: spec only.** This document is the agreed content contract and
> target markup, written *before* `countdown.js`/`countdown.css` are
> implemented. Update the "before/after decoration" examples once the block
> is built and verified against real `curl`/browser output, same as the
> other three blocks' READMEs — don't leave this doc describing an aspirational
> design once the real implementation exists.

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

If "Target Date" is missing or isn't a parseable ISO date, the block should
warn (console) and skip decoration — same pattern as `quote`'s missing
"Quote Text" guard — rather than showing `NaN`/`Invalid Date` to the visitor.

## Authoring in DA (or Google Docs/Word)

| Countdown |  |
| --- | --- |
| Target Date | 2026-12-31T23:59:59 |
| Label | Sale ends in |

## Expected markup before decoration (draft — verify once built)

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

## Expected markup after decoration (draft — verify once built)

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

Once the target date/time has passed, the `.countdown-timer` segments are
replaced with a plain message (e.g. "Offer has ended") rather than showing
negative numbers or continuing to tick.

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
