/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS — DNB block variants
import dnbHeroPromoParser from './parsers/dnb-hero-promo.js';
import dnbCardsArticleParser from './parsers/dnb-cards-article.js';
import dnbCardsOverlayParser from './parsers/dnb-cards-overlay.js';

// TRANSFORMER IMPORTS
import dnbCleanupTransformer from './transformers/dnb-cleanup.js';
import dnbSectionsTransformer from './transformers/dnb-sections.js';

/**
 * Content-driven block detection for DNB pages.
 *
 * DNB (Gatsby) emits obfuscated, per-build CSS class names, so blocks CANNOT be
 * detected by class name. Each entry uses a structural `match(section)` predicate
 * that inspects the DOM shape only. Detection is per top-level <section>.
 *
 * Order matters: most specific first. A section matches at most one block.
 */
const BLOCK_REGISTRY = [
  {
    name: 'cards-overlay',
    // A <ul> of >= 2 <li>, each a single link containing both an image and a heading
    // (heading is overlaid on the image; the whole card is clickable).
    match: (section) => {
      const ul = section.querySelector('ul');
      if (!ul) return false;
      const items = [...ul.querySelectorAll(':scope > li')];
      if (items.length < 2) return false;
      return items.every((li) => {
        const a = li.querySelector(':scope > a') || li.querySelector('a[href]');
        return a && a.querySelector('img') && a.querySelector('h1,h2,h3,h4');
      });
    },
    parser: dnbCardsOverlayParser,
  },
  {
    name: 'cards-article',
    // >= 2 repeating card units, each an image wrapper + heading (text below image).
    match: (section) => countCardUnits(section) >= 2,
    parser: dnbCardsArticleParser,
  },
  {
    name: 'hero-promo',
    // Single large heading + one CTA button + an image; not a repeating card grid.
    match: (section) => (
      section.querySelectorAll('h2.dnb-h--large, h1').length === 1
      && !!section.querySelector('a.dnb-button, a[href]')
      && !!section.querySelector('.gatsby-image-wrapper, picture, img')
      && countCardUnits(section) < 2
    ),
    parser: dnbHeroPromoParser,
  },
];

/**
 * Count repeating "card" units in a section: distinct nearest-ancestors of a
 * heading that also contain an image.
 */
function countCardUnits(section) {
  const headings = [...section.querySelectorAll('h2.dnb-heading, h3.dnb-heading')];
  const cards = new Set();
  headings.forEach((h) => {
    let el = h.parentElement;
    while (el && el !== section) {
      if (el.querySelector('.gatsby-image-wrapper, picture, img')) {
        cards.add(el);
        break;
      }
      el = el.parentElement;
    }
  });
  return cards.size;
}

/**
 * Find all blocks on the page by scanning each top-level <section> against the
 * registry. A section is parsed by the first registry entry that matches.
 */
function findBlocksOnPage(root) {
  const pageBlocks = [];
  const sections = [...root.querySelectorAll('section')];

  sections.forEach((section) => {
    // Skip sections nested inside another section (already covered by parent).
    if (section.parentElement && section.parentElement.closest('section')) return;
    for (const entry of BLOCK_REGISTRY) {
      try {
        if (entry.match(section)) {
          pageBlocks.push({ name: entry.name, element: section, parser: entry.parser });
          break;
        }
      } catch (e) {
        console.warn(`Matcher failed for ${entry.name}:`, e);
      }
    }
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

/**
 * Execute all page transformers for a specific hook.
 */
function executeTransformers(hookName, element, payload) {
  const transformers = [dnbCleanupTransformer, dnbSectionsTransformer];
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, payload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const originalURL = params.originalURL || url;

    // Scope to <main> — the DNB page body. Floating widgets (chat/contact),
    // header, and footer live outside <main> and must not leak into content.
    const main = document.querySelector('main') || document.body;

    // 1. Cleanup chrome (nav/footer/cookie) — must run before section splitting.
    executeTransformers('beforeTransform', main, payload);

    // 2. Content-driven block detection + parsing (scoped to main).
    const pageBlocks = findBlocksOnPage(main);
    pageBlocks.forEach((block) => {
      try {
        block.parser(block.element, { document, url, params });
      } catch (e) {
        console.error(`Failed to parse ${block.name}:`, e);
      }
    });

    // 3. afterTransform — resolve relative URLs.
    executeTransformers('afterTransform', main, payload);

    // 4. WebImporter built-in rules.
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url);

    // 5. Sanitized output path.
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index',
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
