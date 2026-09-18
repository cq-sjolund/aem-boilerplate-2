# Project purpose: learning Edge Delivery Services block development

This repo is being used by Rickard as a hands-on learning project for building
custom blocks on Adobe Edge Delivery Services (EDS), on top of the
`aem-boilerplate` starter (see AGENTS.md for the technical project conventions).
The goal of working sessions here is understanding *how* and *why*, not just
shipping code, so prioritize teaching and verification over speed.

## Working approach established in this project

- **Define the content contract before writing any code.** Decide the
  author-facing table shape (what rows/cells mean) first, sketch the target
  decorated markup second, only then write `decorate()`. This is called out in
  AGENTS.md but is especially important to actually follow here.
- **Default teaching mode: the user writes the code, Claude guides one
  concept/line at a time** and reviews/debugs what comes back. Direct
  "just give me the code" or "apply this for me" requests are also fine and
  happen often once a concept has already been taught once — default to
  guided mode for genuinely new concepts, write code directly for
  established patterns or explicit requests.
- **Never assume the DOM shape — verify it.** Use `curl
  http://localhost:3000/<path>.plain.html` to see raw authored markup, and ask
  for the real browser-rendered DOM (via devtools) to see the decorated
  output, before writing or debugging `decorate()` logic. Several bugs in this
  project were only found this way (e.g. a DA table authored as label/value
  pairs instead of positional rows, a scoping bug that only showed up in the
  actual rendered HTML).
- **`aem.js`'s `loadBlock()` catches and silently logs any error thrown by a
  block's `decorate()`**, leaving the block undecorated with
  `data-block-status="loaded"` regardless of success. A block that renders raw/
  undecorated content with no visible error is a strong signal to check the
  browser console, not to assume the code never ran.
- **CSS**: scope all selectors under `.{blockname}` (never bare element/class
  selectors), use `px` units (project convention, not `rem`), and reuse the
  design tokens already defined in `styles/styles.css` (`--gap-xs/sm/md/lg/xl`,
  `--border-radius-sm`, `--brand-teal`, `--button-*`, etc.) instead of
  hardcoded magic numbers. Check whether a global element style already exists
  (e.g. `blockquote` has a full global treatment) before assuming a block's
  own CSS is the only thing affecting its rendering.
- **Git**: the user commits and pushes manually from their own terminal.
  Don't run `git commit`/`git push` on their behalf unless explicitly asked.
- **Every block has a `README.md`** documenting its content contract, a DA
  authoring example, expected markup before and after decoration (verified
  against real `curl .../*.plain.html` output and/or real browser DOM, not
  guessed), and any resilience/behavior notes specific to that block. Add one
  for any new block.
- **When external review findings show up** (e.g. a `peer-review-findings.md`
  dropped into a block folder), verify each claim against the actual current
  code before acting — don't apply fixes on trust. Findings can be stale,
  already fixed, or simply wrong. Apply well-contained, clearly-correct fixes
  directly; flag larger architectural tradeoffs (e.g. changing whether
  `decorate()` blocks on a network call, which changes test timing
  assumptions) before restructuring, since those ripple into other files.

## Testing setup (added deliberately, opt-in)

- Framework: `@web/test-runner` + `@esm-bundle/chai`, running real headless
  Chromium rather than jsdom — chosen because block `decorate()` functions
  manipulate real DOM/CSS/picture behavior that jsdom doesn't fully replicate.
- Run via `npm test` / `npm run test:coverage`. Intentionally **not** wired
  into `npm run lint` or `.github/workflows/main.yaml` — tests stay optional,
  not a merge gate, since the upstream `aem-boilerplate` and Adobe's own
  reference `aem-block-collection` ship no test framework at all.
- Coverage (`web-test-runner.config.mjs`) is scoped to `blocks/**/*.js` only,
  excluding `scripts/aem.js` (a large shared library) and `*.test.js` files
  themselves, so the reported percentage reflects the block's own code, not a
  blended average dragged down by unrelated shared code.
- `.eslintrc.js` has an `overrides` block for `**/*.test.js` enabling Mocha
  globals, `es2020` (for `globalThis`), and disabling `no-unused-expressions`
  (needed for Chai BDD assertions like `expect(x).to.exist`).
- To test code that calls `fetch`, mock `globalThis.fetch` with a
  manually-resolved `Promise` rather than hitting the real network — avoids
  flakiness and lets you deterministically test loading/error states. Always
  restore the original `fetch` in an `afterEach`, not manually at the end of
  each test, so a failing assertion can't leak a mock into later tests.
- Client-side blocks can't hold secrets: any API key embedded in block JS is
  publicly visible. Only use no-auth-key public APIs, or ones where an
  exposed key is an acceptable risk.

## Blocks built so far

- **`quote`** — first block. Covered: content contract design, `readBlockConfig`
  vs. positional rows, semantic HTML (`blockquote`/`footer`/`cite`).
- **`accordion`** — repeating rows (vs. quote's fixed fields), native
  `<details>`/`<summary>` for free expand/collapse, preserving rich content by
  moving DOM nodes instead of using `textContent`, resilience to a malformed
  row (missing cell) rather than letting one bad row break the whole block.
- **`cat-fact`** — first block with no authored content (fully API-driven),
  first `async decorate()`, loading/error UI states, first click handler in
  this series, `fetch` mocking in tests.
- **`tabs`** — first hand-rolled ARIA widget (no native browser behavior like
  `accordion`'s `<details>`): `role="tablist"`/`role="tab"`/`role="tabpanel"`,
  `aria-selected`, keyboard arrow-key navigation, single-active-panel state.
- **`countdown`** — first self-updating-over-time block (`setInterval`), the
  EDS-specific lifecycle question of cleanup if the block is removed from the
  DOM (`block.isConnected`) or once the countdown naturally expires, and a
  multi-round peer-review cycle that caught real bugs a first read missed
  (label rendering the literal string `"undefined"`, missing zero-padding,
  dead "skip if unchanged" comparison, a flash-of-wrong-content before the
  first render). Ended up as the most heavily-tested block (176 test lines vs.
  117 JS) — a good concrete example of what "well-tested" actually costs for
  stateful/async code vs. the simpler synchronous blocks.

## Ideas for future blocks

Not yet built, picked to each teach something genuinely new:

- **Image carousel/gallery** — multiple images per row, `createOptimizedPicture`
  (the responsive-image helper `cards.js` already uses), prev/next navigation,
  announcing slide changes to screen readers (`aria-live`).
- **Client-side search/filter over a spreadsheet-backed index**
  (`/query-index.json`) — an idiomatic EDS pattern (authored spreadsheet
  exposed as JSON), debounced text input, filtering/re-rendering a list
  client-side. Bridges `cat-fact`'s external API to EDS's own
  content-as-data model.
- **Modal/lightbox using the native `<dialog>` element** — another native
  element with built-in semantics, but a more involved contract than
  `<details>`: no auto-open-on-click, you call `.showModal()`/`.close()`
  yourself, plus focus trapping and Escape-to-close.
