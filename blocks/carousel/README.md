# Carousel block

Shows one image at a time from an authored list, with prev/next navigation.
Manual navigation only (no autoplay) — see `.claude/CONTEXT.md` for why that
was chosen. First block in this project that handles authored images
directly (via `createOptimizedPicture`, the same helper `cards.js` already
uses).

> **Status: spec only.** This document is the agreed content contract and
> target markup, written before `carousel.js`/`carousel.css` exist. Update the
> before/after decoration examples once the block is built and verified
> against real `curl`/browser output — don't leave this doc describing an
> aspirational design once the real implementation exists.

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

## Expected markup before decoration (draft — verify once built)

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

## Expected markup after decoration (draft — verify once built)

```html
<div class="carousel block" data-block-name="carousel" data-block-status="loaded">
  <div class="carousel-slides" aria-live="polite">
    <div class="carousel-slide">
      <picture>...</picture>
      <p class="carousel-caption">First slide caption</p>
    </div>
    <div class="carousel-slide" hidden>
      <picture>...</picture>
      <p class="carousel-caption">Second slide caption</p>
    </div>
    <div class="carousel-slide" hidden>
      <picture>...</picture>
    </div>
  </div>
  <button type="button" class="carousel-prev" aria-label="Previous slide">‹</button>
  <button type="button" class="carousel-next" aria-label="Next slide">›</button>
</div>
```

Only one `.carousel-slide` is visible at a time (`hidden` on the rest) — same
single-visible-item idea as `tabs`' panels, but navigated by prev/next rather
than clicking a specific tab.

## New concepts this block introduces

- **Handling authored images**: replace the raw `<img>` inside each authored
  `<picture>` with `createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])`
  (imported from `scripts/aem.js`), the same helper `cards.js` uses — don't
  hand-roll responsive image markup.
- **`aria-live="polite"` on `.carousel-slides`** announces the caption/slide
  change to assistive tech when navigating, similar in spirit to `cat-fact`'s
  live region but triggered by user action instead of a fetch.
- **Keyboard support**: Arrow Left/Right move to the previous/next slide,
  same wraparound pattern as `tabs`.

## Resilience

A row with no image is skipped entirely rather than rendering a broken/empty
slide.
