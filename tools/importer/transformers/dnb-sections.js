/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: DNB sections.
 * Inserts <hr> section breaks between the top-level content sections of a DNB
 * page. DNB wraps each section as `main > div > section`; this transformer
 * unwraps those <section> elements to the top level and separates them with
 * <hr> so EDS renders each as its own section.
 *
 * DNB's homepage sections are all on the default (light) background, so no
 * Section Metadata is emitted. Section styles are detected purely from the DOM;
 * if a future page introduces a themed section, extend STYLE_DETECTORS below.
 *
 * Runs in beforeTransform, AFTER cleanup (nav/footer already removed).
 */

// Structural/style detectors keyed to EDS section styles. DNB uses obfuscated
// class names, so styles are detected from DOM shape, not semantic class names.
const STYLE_DETECTORS = [
  {
    // Product link bar: a single paragraph/row containing 3-6 links and nothing
    // else (e.g. Lån · Forsikring · Sparing · Kort). Large underlined links.
    style: 'productbar',
    test: (s) => {
      const links = [...s.querySelectorAll('a[href]')];
      if (links.length < 3 || links.length > 6) return false;
      if (s.querySelector('h1,h2,h3,h4,img,ul,picture')) return false;
      // Every link is short (a product label, not a sentence).
      return links.every((a) => a.textContent.trim().length < 20);
    },
  },
  {
    // Quick-links grid: >= 5 short action links, no heading and no images,
    // laid out as a multi-column grid of arrow links.
    style: 'linkgrid',
    test: (s) => {
      const links = [...s.querySelectorAll('a[href]')];
      if (links.length < 5) return false;
      if (s.querySelector('h1,h2,h3,h4,img,picture')) return false;
      return true;
    },
  },
];

function detectSectionStyle(sectionEl) {
  for (const detector of STYLE_DETECTORS) {
    if (detector.test(sectionEl)) return detector.style;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;

  const { document } = payload;

  // Collect the top-level content sections in document order.
  const sections = [...element.querySelectorAll('section')].filter(
    (s) => !s.closest('section:not(:scope)') || s.parentElement.closest('section') === null,
  );

  // Fall back to all <section> if the filter yields nothing.
  const topSections = sections.length ? sections : [...element.querySelectorAll('section')];
  if (topSections.length === 0) return;

  // Process in reverse to avoid position shifts when inserting nodes.
  for (let i = topSections.length - 1; i >= 0; i--) {
    const sectionEl = topSections[i];
    const style = detectSectionStyle(sectionEl);

    if (style) {
      const metaBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style },
      });
      sectionEl.after(metaBlock);
    }

    if (i > 0) {
      const hr = document.createElement('hr');
      sectionEl.before(hr);
    }
  }
}
