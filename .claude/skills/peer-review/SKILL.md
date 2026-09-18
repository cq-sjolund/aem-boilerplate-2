---
name: peer-review
description: Perform a senior-developer peer review of one or more blocks/components in this AEM Edge Delivery Services project and write findings to a peer-review-findings.md file in each reviewed folder. Use when the user asks for a peer review, code review, or audit of specific block(s)/component(s), or says "review this block" / "peer review X".
---

# Peer Review Skill

Perform a structured peer review of the block(s) or component(s) the user specifies
(the target is always variable — could be one block, several, or "all blocks").

## How to run the review

1. **Identify the targets.** Confirm which block(s)/component(s) to review (folder(s)
   under `blocks/`, or other components explicitly named). If the user didn't name any
   and it's not obvious from context, ask.
2. **Read all relevant files per target** before writing anything: the block's `.js`,
   `.css`, `.test.js`, any `README.md`, and how it's invoked/decorated (check
   `scripts/scripts.js` for auto-blocking or config references if relevant).
3. **Act as a senior developer** doing a normal code review pass, covering the
   **core categories** below for every target.
4. **Separately, act as a technical security specialist** doing a dedicated security
   pass (see Security section below) — this is a distinct mindset from the general
   best-practices pass, not just a bullet in the same list.
5. Write findings to a `peer-review-findings.md` file **in each reviewed block's own
   folder** (not a single combined file), so findings live next to the code they
   describe. Use clear headings per category, cite specific lines/behaviors, and
   distinguish real bugs from stylistic suggestions.
6. Do not fix issues unless explicitly asked — this skill is for reporting findings,
   not implementing changes. If the user asks for fixes afterward, treat that as a
   separate follow-up task.

## Core review categories (always include)

For each target, cover:

- **Performance** — unnecessary reflows/DOM thrashing, blocking network calls in
  `decorate()`, missing lazy-loading of non-critical work, inefficient loops/selectors.
- **Best practices** — idiomatic use of the EDS/AEM boilerplate conventions (e.g.
  `readBlockConfig` vs. positional rows, `.js` extensions on imports, ESLint/Stylelint
  conformance), correct use of native HTML elements over hand-rolled JS where possible.
- **Code reusability** — duplicated logic across blocks that could be shared, overly
  bespoke code where a simpler/native/shared pattern would do, and (conversely) any
  premature abstraction.
- **Maintainability** — readability, naming, separation of concerns, presence/absence
  of documentation (e.g. a block `README.md` describing the content contract), whether
  the code would be easy for someone else to safely modify later.
- **Simplicity** — is the implementation as simple as the problem allows, without
  unnecessary complexity or, conversely, without cutting corners that create hidden bugs?
- **Test coverage quality** — do the existing tests (e.g. `*.test.js`) cover more than
  the happy path? Check for missing coverage of: error/network-failure paths, malformed
  or missing authored content (empty/short rows), keyboard interaction (for interactive
  widgets), and edge cases like "all rows filtered out." Flag untested branches
  specifically, not just "add more tests."
- **Error / empty-state UX** — what does the user actually see when: an API call fails,
  a required field is missing, all content is filtered out as invalid, or the block
  receives unexpected/malformed authored markup? Flag cases that fail silently, render
  literal `"undefined"`/blank output, or leave the UI stuck (e.g. permanently disabled
  button, infinite "Loading…") with no recovery path.

## Security review (run as a distinct pass)

Explicitly switch framing for this pass: **"Act as a technical security specialist"**
reviewing the same code with a security-first mindset, not just a best-practices lens.
Cover at minimum:

- **XSS / injection** — any use of `innerHTML`, `outerHTML`, `insertAdjacentHTML`,
  `document.write`, or template-string HTML construction with authored or
  API-sourced data, instead of `textContent`/DOM APIs. This is the single most
  important thing to check in every EDS block, since block input is either
  author-controlled or third-party API data.
- **Third-party data trust boundary** — for any `fetch()` call, is the response
  treated as untrusted? Is there a response schema/shape assumption that could break
  or be abused if the API changes or is compromised?
- **Client-side secrets** — any API keys, tokens, or credentials embedded in
  block JS/CSS (these are always publicly visible in shipped client code — flag
  immediately and treat as a finding requiring remediation, not just a note).
- **External endpoints** — hardcoded third-party URLs: confirm HTTPS is used, note
  any SLA/availability/licensing risk of depending on an unauthenticated public API.
- **Timeouts / resource exhaustion** — missing request timeouts or `AbortController`
  usage that could let a hung/malicious endpoint block the UI indefinitely.
- **DOM clobbering / prototype pollution** — only relevant if the block parses
  JSON or dynamically builds objects/keys from authored or API content; check if so.

Report security findings under their own `## Security` heading (as part of the same
`peer-review-findings.md`, unless the user asks for a separate security report), with
a severity indication (Critical/High/Medium/Low) per finding.

## Optional categories (only include if relevant to the task, or explicitly requested)

Do not include these by default — only add a section for one if it's clearly relevant
to the specific block/component being reviewed, or the user explicitly asks for it:

1. **Internationalization (i18n)** — hardcoded user-facing strings that would need
   translation if the site supports multiple locales.
2. **Content-author UX / editorial guidance** — whether the authored table/content
   shape is intuitive and forgiving for non-technical authors in DA/Word/Google Docs.
3. **Browser/device compatibility** — whether APIs used (e.g. `<details>`, `fetch`,
   newer CSS) fall outside the project's supported browser matrix.
4. **Analytics/RUM instrumentation** — whether meaningful interactions (clicks, tab
   switches, errors) are or should be reported via `sampleRUM` for product insight.
5. **Third-party dependency risk** — long-term availability/SLA/versioning risk of
   depending on an external API or library.
6. **Consistency across blocks** — naming conventions, CSS custom-property usage,
   and documentation presence compared against sibling blocks in the same repo.
7. **Licensing/attribution** — whether a third-party API or asset has usage terms
   requiring attribution or disclosure that the project should document.
8. **Versioning/backward compatibility** — migration path if the block's content
   contract needs to change after pages have already been authored against it.

## Output format

For each reviewed target, create/update `<block-folder>/peer-review-findings.md` with
this structure:

```markdown
# Peer Review Findings: `<block-name>` block

## Bugs / correctness
## Security
## Performance
## Best practices / maintainability
## Reusability
## Simplicity
## Test coverage quality
## Error / empty-state UX
## Accessibility
(any optional sections only if relevant/requested)
```

Keep findings specific and actionable — cite the exact behavior/line, explain the
impact, and (optionally) suggest a fix, without actually implementing it unless asked.
