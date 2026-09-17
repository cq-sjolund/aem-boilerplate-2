# Tabs block

Accessible tabbed content, implemented with the
[WAI-ARIA APG Tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).
Unlike `accordion` (which relies on the native `<details>`/`<summary>`
elements for its behavior), this block has no built-in browser behavior —
all tab switching, ARIA state, and keyboard navigation is implemented in
`tabs.js`.

## Content contract

One row per tab. Each row has exactly two cells:

1. **Tab label** — the always-visible clickable text/heading for the tab.
2. **Tab panel content** — the content shown when that tab is active. Can
   contain rich formatting (links, bold text, lists, etc.) — it is not
   reduced to plain text.

A row with only one cell (missing panel content) is skipped entirely rather
than breaking the block; see "Resilience" below.

## Authoring in DA (or Google Docs/Word)

Insert a table where the first row is the block name, and each following row
is one tab:

| Tabs |  |
| --- | --- |
| Overview | Edge Delivery Services serves content straight from a CDN, with no build step. |
| Getting started | Clone the boilerplate, run `npm install`, then `aem up` to start the local dev server. |
| FAQ | See the [developer tutorial](https://www.aem.live/developer/tutorial) for common questions. |

The first tab (`Overview` above) is active by default when the page loads.

## Expected markup before decoration

This is what EDS produces from the table above (visible via
`curl http://localhost:3000/<path>.plain.html`), before `decorate()` runs:

```html
<div class="tabs">
  <div>
    <div>Overview</div>
    <div>Edge Delivery Services serves content straight from a CDN, with no build step.</div>
  </div>
  <div>
    <div>Getting started</div>
    <div>Clone the boilerplate, run <code>npm install</code>, then <code>aem up</code> to start the local dev server.</div>
  </div>
  <div>
    <div>FAQ</div>
    <div>See the <a href="https://www.aem.live/developer/tutorial">developer tutorial</a> for common questions.</div>
  </div>
</div>
```

## Expected markup after decoration

`decorate()` replaces the block's children with a tablist and the (reused,
not recreated) panel cells, wired up per the ARIA tabs pattern:

```html
<div class="tabs block" data-block-name="tabs" data-block-status="loaded">
  <div class="tabs-list" role="tablist">
    <button type="button" class="tabs-tab" id="tabs-1-0-tab" role="tab"
      aria-controls="tabs-1-0-panel" aria-selected="true" tabindex="0"><p>Overview</p></button>
    <button type="button" class="tabs-tab" id="tabs-1-1-tab" role="tab"
      aria-controls="tabs-1-1-panel" aria-selected="false" tabindex="-1"><p>Getting started</p></button>
    <button type="button" class="tabs-tab" id="tabs-1-2-tab" role="tab"
      aria-controls="tabs-1-2-panel" aria-selected="false" tabindex="-1"><p>FAQ</p></button>
  </div>
  <div id="tabs-1-0-panel" class="tabs-panel" role="tabpanel" aria-labelledby="tabs-1-0-tab">
    <p>Edge Delivery Services serves content straight from a CDN, with no build step.</p>
  </div>
  <div id="tabs-1-1-panel" class="tabs-panel" role="tabpanel" aria-labelledby="tabs-1-1-tab" hidden>
    <p>Clone the boilerplate, run <code>npm install</code>, then <code>aem up</code> to start the local dev server.</p>
  </div>
  <div id="tabs-1-2-panel" class="tabs-panel" role="tabpanel" aria-labelledby="tabs-1-2-tab" hidden>
    <p>See the <a href="https://www.aem.live/developer/tutorial">developer tutorial</a> for common questions.</p>
  </div>
</div>
```

Notes:

- The `<p>` wrapping around each cell's content comes from `aem.js`'s
  `wrapTextNodes()`, which runs on every block *before* its own `decorate()`
  is called — it wraps any cell whose content isn't already a recognized
  block-level element (paragraph, list, heading, etc.). `tabs.js` doesn't add
  these `<p>` tags itself; it just moves/reuses whatever `wrapTextNodes`
  already produced.
- The `tabs-{instanceId}-{index}-*` ID prefix keeps IDs unique if more than
  one `tabs` block appears on the same page (`instanceId` increments per
  `decorate()` call at the module level).

## Keyboard behavior

- **Click** a tab to activate it.
- **Arrow Left / Arrow Right** move focus to the previous/next tab and
  activate it immediately, wrapping around at either end.
- **Home / End** jump to the first/last tab.
- Only the active tab is in the normal Tab key order (`tabindex="0"`);
  inactive tabs are `tabindex="-1"`, per the APG pattern — pressing Tab
  moves focus into and out of the tablist as a single stop, not through
  every individual tab.

## Resilience

A row missing its second cell (no panel content) is filtered out before
building the tablist, so one malformed row doesn't break the rest of the
tabs — same principle as `accordion`'s handling of a missing answer cell.
