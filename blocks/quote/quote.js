import { readBlockConfig } from '../../scripts/aem.js';

export default function decorate(block) {
  const config = readBlockConfig(block);

  const quoteText = config['quote-text'];
  if (!quoteText) {
    // eslint-disable-next-line no-console
    console.warn('quote block is missing required "Quote Text" row; skipping decoration');
    block.remove();
    return;
  }

  const blockquote = document.createElement('blockquote');
  blockquote.textContent = quoteText;
  const children = [blockquote];
  const attributionText = config['quote-attribution'];
  if (attributionText) {
    const footer = document.createElement('footer');
    const cite = document.createElement('cite');
    cite.textContent = attributionText;
    footer.append(cite);
    children.push(footer);
  }
  block.replaceChildren(...children);
}
