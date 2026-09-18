# Quote block

A styled quotation with an optional attribution, using semantic
`<blockquote>`/`<footer>`/`<cite>` elements. Uses `readBlockConfig()` (from
`scripts/aem.js`) rather than positional rows, since this block has a fixed
set of named fields rather than a repeating list — see `accordion`/`tabs` for
the positional-row alternative.

## Content contract

Two labeled rows:

1. **Quote Text** (required) — the quotation itself. Reduced to plain text by
   `readBlockConfig`; rich formatting (links, bold) inside this cell is not
   preserved.
2. **Quote Attribution** (optional) — who said it. If omitted, no `<footer>`
   is rendered at all.

If "Quote Text" is missing or empty, the block logs a console warning and
skips decoration entirely (see "Resilience" below) rather than rendering
anything broken.

## Authoring in DA (or Google Docs/Word)

Insert a table where the first row is the block name, and each following row
is a `label | value` pair:

| Quote |  |
| --- | --- |
| Quote Text | The best way to predict the future is to invent it. |
| Quote Attribution | Alan Kay |

The label text (`Quote Text`, `Quote Attribution`) is turned into a
kebab-case key (`quote-text`, `quote-attribution`) by `readBlockConfig` — the
exact label wording doesn't matter to the code as long as it produces those
keys, but keep it matching so the content stays self-documenting for authors.

## Expected markup before decoration

Visible via `curl http://localhost:3000/<path>.plain.html`:

```html
<div class="quote">
  <div>
    <div>quote-text</div>
    <div>The best way to predict the future is to invent it.</div>
  </div>
  <div>
    <div>quote-attribution</div>
    <div>Alan Kay</div>
  </div>
</div>
```

## Expected markup after decoration

```html
<div class="quote-wrapper">
  <div class="quote block" data-block-name="quote" data-block-status="loaded">
    <blockquote>The best way to predict the future is to invent it.</blockquote>
    <footer><cite>Alan Kay</cite></footer>
  </div>
</div>
```

Note there's no `<p>` wrapping here (unlike `accordion`/`tabs`): `quote.js`
reads values through `readBlockConfig`, which extracts plain text/attribute
values rather than moving DOM nodes, so whatever paragraph wrapping
`wrapTextNodes` added to the source cells is discarded along with the rest of
the cell's DOM structure.

## Resilience

- Missing/empty "Quote Text" — `decorate()` logs a warning
  (`quote block is missing required "Quote Text" row; skipping decoration`)
  and removes the block from the page (`block.remove()`), rather than
  rendering the literal string `"undefined"` (a real bug found in review:
  assigning `undefined` to `.textContent` coerces it to that string) or
  leaving the raw, unstyled authored table visible to real visitors.
- Missing "Quote Attribution" — handled gracefully; the `<footer>` is simply
  not rendered.
