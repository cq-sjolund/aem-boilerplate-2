# Cat Fact block

Fetches a random fact from the public [catfact.ninja](https://catfact.ninja/fact)
API and displays it, with a button to fetch another. Unlike `quote`,
`accordion`, and `tabs` (all of which transform author-provided content),
this block has **no authored content at all** — everything in it is built and
populated by JavaScript at render time.

## Content contract

None. The DA table is just the block name, with no rows.

## Authoring in DA (or Google Docs/Word)

Insert a table with only the block name:

| Cat Fact |
| --- |

## Expected markup before decoration

```html
<div class="cat-fact"></div>
```

## Expected markup, across all three states

Since there's no authored content to transform, all markup here comes from
`decorate()` itself. The DOM shape is identical across all three states —
only the paragraph's text and the button's `disabled` attribute change.

**Loading** (synchronous, immediately after `decorate()` runs, before the
fetch resolves):

```html
<div class="cat-fact block" data-block-name="cat-fact" data-block-status="loaded">
  <p class="cat-fact-text" aria-live="polite">Loading…</p>
  <button type="button" class="cat-fact-button" disabled>New fact</button>
</div>
```

**Loaded** (after a successful fetch):

```html
<div class="cat-fact block" data-block-name="cat-fact" data-block-status="loaded">
  <p class="cat-fact-text" aria-live="polite">Cats have 30 teeth...</p>
  <button type="button" class="cat-fact-button">New fact</button>
</div>
```

**Error** (fetch failed, timed out, or returned a non-2xx status — the button
is re-enabled so the user can retry rather than getting stuck):

```html
<div class="cat-fact block" data-block-name="cat-fact" data-block-status="loaded">
  <p class="cat-fact-text" aria-live="polite">Couldn't load a cat fact. Try again.</p>
  <button type="button" class="cat-fact-button">New fact</button>
</div>
```

Note `data-block-status="loaded"` is present in all three states, including
the loading one: `decorate()` is intentionally **fire-and-forget** (see
"Network behavior" below), so `aem.js` considers decoration "complete" as
soon as the initial DOM is built, not once the fact has actually loaded.

## Interactivity

- **Click** "New fact" to fetch and display a new fact. The button is
  `disabled` while a request is in flight, and the fact text carries
  `aria-live="polite"` so screen readers announce the change without needing
  focus to move.
- The same `loadFact()` function handles both the initial load and every
  subsequent click — no duplicated fetch logic between the two paths.

## Network behavior

- **`decorate()` does not await the fetch.** It builds the initial "Loading…"
  DOM synchronously and calls `loadFact()` without awaiting it. This matters
  because `aem.js`'s block loader awaits `decorate()` before marking a
  section ready — if this block were ever eager-loaded (a page's first
  section), blocking on a slow/hanging API response would delay perceived
  page load. The fact instead "streams in" once the request settles.
- **10-second timeout via `AbortController`.** Without it, a hung request
  would leave "Loading…" showing and the button disabled indefinitely, with
  no way for the user to recover. A timed-out request is treated like any
  other fetch failure (same `catch` block, same error message).
- **No API key.** `CAT_FACT_API_URL` is a public, unauthenticated endpoint by
  design — this block's code runs entirely client-side and is visible to
  anyone viewing page source, so it must never hold a secret. Only use
  no-auth-key public APIs (or ones where an exposed key is an acceptable
  risk) for this kind of block.

## Resilience

Any failure in `loadFact()` — network error, non-2xx response, or a timed-out
request — is caught, shown to the user as a plain-language error message, and
logged to the console (`console.error('Failed to fetch cat fact', error)`)
for debugging. `decorate()` itself never throws, regardless of what the
network does.
