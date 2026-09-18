# Accordion block

Expand/collapse FAQ-style content, built entirely on the native
`<details>`/`<summary>` elements. Unlike `tabs` (which has no native browser
equivalent and needs hand-rolled ARIA/keyboard behavior), this block gets
expand/collapse, keyboard toggling (Enter/Space), and correct semantics for
free from the browser — `accordion.js` only needs to reshape the DOM into
`<details>`/`<summary>`, no event listeners or ARIA attributes required.

## Content contract

One row per accordion item. Each row has exactly two cells:

1. **Question/label** — the always-visible clickable header text. Can contain
   simple inline formatting; rich content is preserved (see "Rich content"
   below).
2. **Answer/body** — the content revealed when the item is expanded. Can
   contain rich formatting (links, lists, bold text, etc.).

A row missing its second cell, or with an empty first cell, is skipped
entirely rather than breaking the rest of the accordion; see "Resilience"
below.

## Authoring in DA (or Google Docs/Word)

Insert a table where the first row is the block name, and each following row
is one question/answer pair:

| Accordion |  |
| --- | --- |
| What is Edge Delivery Services? | A fast, build-free way to run AEM Sites, serving content straight from a CDN. |
| How do I create a new block? | Add a `blockname.js` and `blockname.css` file under `/blocks`, then author a table with that name in the document. |

## Expected markup before decoration

Visible via `curl http://localhost:3000/<path>.plain.html`:

```html
<div class="accordion">
  <div>
    <div>What is Edge Delivery Services?</div>
    <div>A fast, build-free way to run AEM Sites, serving content straight from a CDN.</div>
  </div>
  <div>
    <div>How do I create a new block?</div>
    <div>Add a <code>blockname.js</code> and <code>blockname.css</code> file under /blocks, then author a table with that name in the document.</div>
  </div>
</div>
```

## Expected markup after decoration

```html
<div class="accordion-wrapper">
  <div class="accordion block" data-block-name="accordion" data-block-status="loaded">
    <details class="accordion-item">
      <summary class="accordion-item-label"><p>What is Edge Delivery Services?</p></summary>
      <div class="accordion-item-body"><p>A fast, build-free way to run AEM Sites, serving content straight from a CDN.</p></div>
    </details>
    <details class="accordion-item">
      <summary class="accordion-item-label"><p>How do I create a new block?</p></summary>
      <div class="accordion-item-body"><p>Add a <code>blockname.js</code> and <code>blockname.css</code> file under /blocks, then author a table with that name in the document.</p></div>
    </details>
  </div>
</div>
```

The `<p>` wrapping comes from `aem.js`'s `wrapTextNodes()`, which runs on
every block before its own `decorate()` — `accordion.js` doesn't add these
`<p>` tags itself, it moves the label cell's existing child nodes into the
`<summary>` (`summary.append(...row.children[0].childNodes)`) and reuses the
answer cell directly as `.accordion-item-body`, which is why rich formatting
(links, lists) inside either cell survives decoration untouched.

## Keyboard behavior

Entirely native — no JavaScript event listeners needed. Clicking a
`<summary>`, or focusing it and pressing Enter/Space, toggles that item's
`open` state. Multiple items can be open simultaneously (there's no
"only one open at a time" behavior); see the project's `.claude/CONTEXT.md`
"Ideas for future blocks" if you want to compare against `tabs`' single-panel
model.

## Resilience

- A row missing its second cell (answer) is filtered out before rendering,
  same as `tabs`' handling of a missing panel cell.
- A row with an empty first cell (question) is also filtered out — otherwise
  it would produce a `<summary>` with no accessible name, the same class of
  issue `tabs` guards against for its tab labels.
