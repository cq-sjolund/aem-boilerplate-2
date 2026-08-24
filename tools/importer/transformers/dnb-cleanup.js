/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: DNB cleanup.
 * Removes non-authorable site chrome from the DNB source pages so only the
 * main content sections remain before section splitting + block parsing.
 * Source: https://www.dnb.no/ (captured DOM: migration-work/cleaned.html).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove non-authorable chrome. Header/nav and footer are migrated separately
    // as fragments, so they are stripped from the page body here.
    WebImporter.DOMUtils.remove(element, [
      'header',
      'nav',
      '[role="navigation"]',
      '[role="banner"]',
      'footer',
      '[role="contentinfo"]',
      '.dnb-sr-only',
      '[class*="skip"]',
      '[class*="cookie"]',
      '[class*="Cookie"]',
      '[id*="cookie"]',
      '[aria-label*="informasjonskapsler"]',
      'noscript',
      'style',
      'script',
      'link',
      'iframe',
      'svg',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Resolve relative image/link URLs to absolute using the source page URL.
    const sourceUrl = payload.params && payload.params.originalURL;
    if (sourceUrl) {
      element.querySelectorAll('img').forEach((img) => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('blob:')) {
          try {
            img.setAttribute('src', new URL(src, sourceUrl).href);
          } catch (e) {
            // skip malformed URLs
          }
        }
      });
      element.querySelectorAll('a').forEach((a) => {
        const href = a.getAttribute('href');
        if (href && href.startsWith('/')) {
          try {
            a.setAttribute('href', new URL(href, sourceUrl).href);
          } catch (e) {
            // skip malformed URLs
          }
        }
      });
    }
  }
}
