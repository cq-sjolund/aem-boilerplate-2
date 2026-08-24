/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards (cards-article) variant — DNB promo card grid.
 * Base: cards. Source: https://www.dnb.no/
 * Detected structurally: a section containing >= 2 repeating "card" units, each
 * being a container with an image wrapper and a heading (h2.dnb-heading).
 *
 * Output structure (matches cards.js: one row per card):
 *   col1: <img>            (card image — EDS wraps bare img in <picture>)
 *   col2: heading + CTA    (link in body → cards.js makes whole card clickable)
 * Generated: 2026-08-19
 */

/**
 * Find the repeating card containers within a section.
 * A card is the nearest ancestor of a heading that also contains an image.
 */
function findCards(section) {
  const headings = [...section.querySelectorAll('h2.dnb-heading, h3.dnb-heading')];
  const cards = [];
  const seen = new Set();
  headings.forEach((h) => {
    let el = h.parentElement;
    while (el && el !== section) {
      if (el.querySelector('.gatsby-image-wrapper, picture, img')) {
        if (!seen.has(el)) { seen.add(el); cards.push(el); }
        break;
      }
      el = el.parentElement;
    }
  });
  return cards;
}

export default function parse(element, { document }) {
  const cards = findCards(element);
  const cells = [];

  cards.forEach((card) => {
    // Image column
    const imgs = [...card.querySelectorAll('img')];
    const img = imgs.find((i) => (i.getAttribute('alt') || '').trim().length > 0) || imgs[0];
    const col1 = document.createElement('div');
    if (img) {
      const clean = document.createElement('img');
      clean.setAttribute('src', img.getAttribute('src') || '');
      clean.setAttribute('alt', img.getAttribute('alt') || '');
      col1.appendChild(clean);
    }

    // Body column: heading + CTA link
    const col2 = document.createElement('div');
    const heading = card.querySelector('h2, h3, h4');
    const cta = card.querySelector('a[href]');
    const href = cta ? cta.getAttribute('href') || '' : '';

    if (heading) {
      const h3 = document.createElement('h3');
      h3.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
      col2.appendChild(h3);
    }
    if (cta) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = cta.textContent.replace(/\s+/g, ' ').trim();
      p.appendChild(a);
      col2.appendChild(p);
    }

    cells.push([col1, col2]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Cards (cards-article)',
    cells,
  });
  element.replaceWith(block);
}
