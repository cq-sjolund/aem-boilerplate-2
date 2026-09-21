# Carousel block

Shows one image at a time from an authored list, with prev/next navigation.
Manual navigation only (no autoplay) — see `.claude/CONTEXT.md` for why that
was chosen. First block in this project that handles authored images
directly (via `createOptimizedPicture`, the same helper `cards.js` already
uses).

## Content contract

One row per slide. Each row has:

1. **Image** (required) — the slide's picture.
2. **Caption** (optional) — text shown with the slide. A slide can have no
   caption.

A row missing an image is skipped, same principle as `accordion`/`tabs`
filtering out malformed rows.

## Authoring in DA (or Google Docs/Word)

| Carousel |  |
| --- | --- |
| (image) | First slide caption |
| (image) | Second slide caption |
| (image) |  |

## Expected markup before decoration

```html
<div class="carousel">
  <div>
    <div><picture><img src="..." alt=""></picture></div>
    <div>First slide caption</div>
  </div>
  <div>
    <div><picture><img src="..." alt=""></picture></div>
    <div>Second slide caption</div>
  </div>
  <div>
    <div><picture><img src="..." alt=""></picture></div>
    <div></div>
  </div>
</div>
```

## Expected markup after decoration

```html
<div class="carousel block" data-block-name="carousel" data-block-status="loaded">
  <div class="carousel-slides" aria-live="polite">
    <div class="carousel-slide">
      <picture>
        <source type="image/webp" srcset="...&width=750&format=webply&optimize=medium">
        <img src="...&width=750&format=jpg&optimize=medium" alt="" loading="eager">
      </picture>
      <p class="carousel-caption">First slide caption</p>
    </div>
    <div class="carousel-slide" hidden>
      <picture>
        <source type="image/webp" srcset="...&width=750&format=webply&optimize=medium">
        <img src="...&width=750&format=jpg&optimize=medium" alt="" loading="lazy">
      </picture>
      <p class="carousel-caption">Second slide caption</p>
    </div>
    <div class="carousel-slide" hidden>
      <picture>
        <source type="image/webp" srcset="...&width=750&format=webply&optimize=medium">
        <img src="...&width=750&format=jpg&optimize=medium" alt="" loading="lazy">
      </picture>
    </div>
  </div>
  <button type="button" class="carousel-prev" aria-label="Previous slide"></button>
  <button type="button" class="carousel-next" aria-label="Next slide"></button>
</div>
```

Only one `.carousel-slide` is visible at a time (`hidden` on the rest) — same
single-visible-item idea as `tabs`' panels, but navigated by prev/next rather
than clicking a specific tab. The nav buttons have no visible text content —
the `‹`/`›` arrows are drawn entirely in CSS via a `::before` pseudo-element
(same "corner + rotate" technique as `accordion`'s chevron), so `aria-label`
is what actually gives them an accessible name.

If there's only **one** valid slide, the prev/next buttons aren't rendered
at all — there's nothing to navigate to.

## New concepts this block introduces

- **Handling authored images**: replace the raw `<img>` inside each authored
  `<picture>` with `createOptimizedPicture(img.src, img.alt, eager, [{ width: '750' }])`
  (imported from `scripts/aem.js`), the same helper `cards.js` uses — don't
  hand-roll responsive image markup. Only the **first** slide is marked
  `eager` (`index === 0`); the rest are `lazy`, since only the first slide is
  visible without any interaction and is the one that can affect LCP.
- **`aria-live="polite"` on `.carousel-slides`** announces the caption/slide
  change to assistive tech when navigating, similar in spirit to `cat-fact`'s
  live region but triggered by user action instead of a fetch.
- **Keyboard support**: Arrow Left/Right move to the previous/next slide,
  same wraparound pattern as `tabs`.

## Resilience

A row with no image is skipped entirely rather than rendering a broken/empty
slide.

## Accessibility

- Nav buttons get their accessible name from `aria-label` (`"Previous slide"`/
  `"Next slide"`), since the `‹`/`›` arrows are CSS-only and have no text
  content of their own.
- `aria-live="polite"` on `.carousel-slides` is intended to announce the
  slide change when navigating. **Not yet manually verified with a real
  screen reader** (VoiceOver/NVDA) — automated tests only confirm the
  `hidden` attribute toggles correctly, not that assistive tech actually
  announces the change. Worth spot-checking before relying on this for a
  production page with real content.
