/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards (cards-overlay) variant — Company campaign card row.
 * Base: cards. Source: https://www.company.example/
 * Detected structurally: a section whose <ul> has >= 2 <li> items, each a single
 * <a> link containing both an image and a heading (heading overlaid on image).
 *
 * Output structure (matches cards.js: one row per card):
 *   col1: <img>        (full-bleed campaign image)
 *   col2: heading link (link in body → cards.js wraps whole card as a link)
 * Generated: 2026-08-19
 */
export default function parse(element, { document }) {
  const items = [...element.querySelectorAll('ul > li')];
  const cells = [];

  items.forEach((li) => {
    const anchor = li.querySelector(':scope > a') || li.querySelector('a[href]');
    const href = anchor ? anchor.getAttribute('href') || '' : '';

    // Image column
    const imgs = [...li.querySelectorAll('img')];
    const img = imgs.find((i) => (i.getAttribute('alt') || '').trim().length > 0) || imgs[0];
    const col1 = document.createElement('div');
    if (img) {
      const clean = document.createElement('img');
      clean.setAttribute('src', img.getAttribute('src') || '');
      clean.setAttribute('alt', img.getAttribute('alt') || '');
      col1.appendChild(clean);
    }

    // Body column: heading as a link (so cards.js makes the whole card clickable)
    const col2 = document.createElement('div');
    const heading = li.querySelector('h1, h2, h3, h4');
    if (heading) {
      const h3 = document.createElement('h3');
      const text = heading.textContent.replace(/\s+/g, ' ').trim();
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = text;
        h3.appendChild(a);
      } else {
        h3.textContent = text;
      }
      col2.appendChild(h3);
    }

    cells.push([col1, col2]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Cards (cards-overlay)',
    cells,
  });
  element.replaceWith(block);
}
