# Peer Review Findings: `carousel` block

Tests: 11/11 passing. ESLint/Stylelint: clean.

## Bugs / correctness
- **A row with an image but no second (caption) cell will crash `decorate()`.**
  `getCarouselSlides` does `const body = row.children[1]; const { textContent } = body;`
  unconditionally. The row filter in `decorate()` only checks
  `row.children[0]?.querySelector('img')` — it never verifies `row.children[1]` exists.
  If an authored table ever has a row with just one cell (or a merged/short row),
  destructuring `textContent` off `undefined` throws a `TypeError`. Per this project's
  own convention (`aem.js`'s `loadBlock()` swallows the error and logs it), the practical
  effect is the whole carousel silently fails to decorate — not just that one slide.
  Guard with `const body = row.children[1]; const textContent = body?.textContent;` (or
  filter out such rows up front, same principle as `accordion`'s missing-second-cell
  check).

## Security
- No issues found. Captions are set via `textContent`; images are moved as existing
  `<picture>` DOM nodes rather than parsed from strings — no `innerHTML`/XSS surface.
  No network calls, no secrets.

## Performance
- **Images are never optimized, despite the block's own README documenting this as a
  required concept.** The README's "New concepts this block introduces" section states:
  "replace the raw `<img>` inside each authored `<picture>` with
  `createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])` ... don't
  hand-roll responsive image markup" — the same helper `cards.js` actually uses
  (`cards.js:15`). `carousel.js`, however, just does
  `row.querySelectorAll('picture').forEach((picture) => slide.append(picture))`,
  moving the original authored `<picture>` unchanged. This means: no responsive
  `srcset`/width breakpoints, and no eager/lazy control — every slide's full-size image
  is requested regardless of viewport or whether that slide is currently visible. For a
  block whose primary content is images (often used near the top of a page,
  carousel/hero-like), this is the most impactful finding in this review — it directly
  works against the project's "keeping it 100" performance goals. Recommend
  implementing exactly what the README already specifies, marking the first slide's
  image `eager` and the rest lazy (mirroring `cards.js`'s pattern but with the eager
  flag set per-slide-index).
- No debounce/throttle concerns; click/keydown handlers are cheap. `setInterval`/RAF
  are correctly not used since this is a manual-only carousel (no autoplay, matches the
  README's stated design choice).

## Best practices / maintainability
- **The README is out of sync with the implementation**, the same drift previously
  caught (and fixed) in the `countdown` block:
  - It still carries the banner "> **Status: spec only.** ... Update the before/after
    decoration examples once the block is built and verified ... don't leave this doc
    describing an aspirational design once the real implementation exists" — but
    `carousel.js`/`.css`/`.test.js` are already fully implemented. This banner should
    have been removed/updated once the block was built, same lesson already learned on
    `countdown`.
  - Its documented output markup shows `<button type="button" class="carousel-prev"
    aria-label="Previous slide">` — but the real `getCarouselButton()` never sets
    `button.type`, and the actual `aria-label` values are `'Previous'`/`'Next'`, not
    `'Previous slide'`/`'Next slide'`. Two concrete spec-vs-implementation mismatches.
- **Missing `button.type = 'button'`** on both nav buttons. Every other interactive
  block in this repo that creates a `<button>` (`cat-fact`, `tabs`) explicitly sets
  `type = 'button'` to prevent an unintended form submission if the block is ever
  rendered inside a `<form>`; `carousel`'s `getCarouselButton` omits this, which is both
  a regression against the README's own documented markup and an inconsistency with the
  rest of the codebase's established pattern.
- `.carousel-slide { transition: transform 0.5s ease-in-out; }` in the CSS is dead code
  — nothing in `carousel.js` ever animates `transform`; slides are switched abruptly via
  the `hidden` attribute (which can't be transitioned). This implies a sliding animation
  that doesn't actually happen. Either implement a real transform-based slide transition
  (and respect `prefers-reduced-motion` if so) or remove the misleading rule.
- Good use of the `[hidden]` CSS override (`.carousel-slide[hidden] { display: none; }`)
  to make the hide/show behavior robust against selector specificity/order — a
  deliberate, correct choice, not an issue.

## Reusability
- `getCarouselButton(className, label)` is a clean, small reusable helper for the two
  nav buttons rather than duplicating button-creation code — good.
- The wraparound arrow-key/index math in `addEventListenersButtons`
  (`(currentIndex - 1 + length) % length`, `(currentIndex + 1) % length`) duplicates the
  same pattern already used in `tabs.js`. Not worth extracting for two call sites (as
  previously noted in the `tabs` review), but if a third block needs wraparound index
  cycling, a small shared helper (e.g. `scripts/scripts.js`) would reduce duplication.

## Simplicity
- The core show/hide logic (`showSlide`/`showPrevious`/`showNext`) is simple and easy to
  follow. No unnecessary abstraction. Appropriately simpler than `tabs` since there's no
  ARIA roving-tabindex/tablist state to manage here — correct scope for a manual
  prev/next carousel.

## Test coverage quality
- Strong coverage of navigation behavior: initial state, next/prev, both-direction
  wraparound, keyboard Arrow Left/Right (including on either button), ignoring
  unrelated keys, and the all-rows-invalid removal case.
- **Gaps:**
  - No test for a row with an image but a missing/absent second cell — would have
    caught the crash described under Bugs above.
  - No test asserting `button.type === 'button'` or the exact `aria-label` text — would
    have caught both README/implementation mismatches.
  - No test verifying image optimization (e.g. asserting `createOptimizedPicture` was
    used, or that the resulting `<img>` has expected `srcset`/width attributes) — would
    have caught the missing optimization the README calls out as a required concept.
  - No test for a single-slide carousel (only one authored row) — worth confirming the
    wraparound math and button visibility behave sensibly when there's nothing to
    navigate to.

## Error / empty-state UX
- Handled well: when no row has an image, `decorate()` calls `block.remove()`, so a real
  visitor sees nothing rather than a broken/empty carousel — consistent with the
  now-established pattern in `quote`/`countdown`/`tabs` for "nothing sensible to render."
- **Minor polish gap**: when there's only a single valid slide, the prev/next buttons
  are still rendered even though there's nothing to navigate to (clicking either just
  redisplays the same slide). Consider hiding/omitting the nav buttons when
  `rows.length === 1` for a cleaner single-slide experience.

## Accessibility
- `aria-live="polite"` on `.carousel-slides` is a reasonable choice, matching the
  README's intent to announce slide changes without interrupting the user — same
  spirit as `cat-fact`'s live region.
- Worth verifying with a real screen reader (not just unit tests) that toggling the
  `hidden` attribute on slide `<div>`s inside an `aria-live` region is reliably announced
  across browsers/AT combinations — attribute-driven visibility changes are less
  consistently picked up by `aria-live` than actual text-content mutations. Flagged as a
  design decision worth confirming, not a defect.
- The nav buttons have accessible names via `aria-label`, and click doesn't steal focus
  — good, consistent with not disrupting the user's focus position on interaction.
- Not implemented, optional enhancement: the WAI-ARIA APG Carousel pattern recommends
  `aria-roledescription="carousel"` on the container and `role="group"` +
  `aria-roledescription="slide"` (plus a "slide N of M" accessible label) on each slide,
  for a more complete carousel semantics story. This block's current approach (plain
  `<div>`s + `aria-live`) is simpler and functional but a step below the full APG
  pattern — worth considering if this carousel becomes a heavily-used, production-facing
  component, not necessarily a blocker for a learning-project iteration.

## Consistency across blocks (included — directly relevant given repo history)
This project has already hit the "README documents a spec the implementation doesn't
match" issue once before, on `countdown`, and the fix pattern (reconcile README vs.
code, don't leave stale spec-only banners) is established. `carousel` reintroduces
the same class of issue (stale "spec only" banner, mismatched button markup) — worth
applying the same fix here for consistency with how `countdown` was resolved.
