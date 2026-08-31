/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero (hero-promo) variant — Company homepage banner.
 * Base: hero. Source: https://www.company.example/
 * Detected structurally: a section with a single large heading (h2.company-h--large),
 * one CTA button (a.company-button) and an image, that is NOT a repeating card grid.
 *
 * Output structure (matches hero.js: image row, then content row):
 *   Row 1: <picture>/<img>  (image)
 *   Row 2: heading + CTA link
 * Generated: 2026-08-19
 */
export default function parse(element, { document }) {
  // Heading — the large hero title
  const heading = element.querySelector('h2.company-h--large, h1, h2');

  // CTA — the primary button link
  const cta = element.querySelector('a.company-button, a[href]');

  // Image — pick the largest / first real content image (skip empty-alt spacers)
  const imgs = [...element.querySelectorAll('img')];
  const img = imgs.find((i) => (i.getAttribute('alt') || '').trim().length > 0) || imgs[0];

  // Row 1: image
  const imgCell = document.createElement('div');
  if (img) {
    const clean = document.createElement('img');
    clean.setAttribute('src', img.getAttribute('src') || '');
    clean.setAttribute('alt', img.getAttribute('alt') || '');
    imgCell.appendChild(clean);
  }

  // Row 2: content (heading + CTA button, wrapped in <strong> so EDS makes it a button)
  const contentCell = document.createElement('div');
  if (heading) {
    const h1 = document.createElement('h1');
    h1.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
    contentCell.appendChild(h1);
  }
  if (cta) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    const a = document.createElement('a');
    a.href = cta.getAttribute('href') || '';
    a.textContent = cta.textContent.replace(/\s+/g, ' ').trim();
    strong.appendChild(a);
    p.appendChild(strong);
    contentCell.appendChild(p);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Hero (hero-promo)',
    cells: [[imgCell], [contentCell]],
  });
  element.replaceWith(block);
}
