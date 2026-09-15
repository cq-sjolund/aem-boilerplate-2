import { readBlockConfig } from '../../scripts/aem.js';

export default function decorate(block) {
  const config = readBlockConfig(block);

  const blockquote = document.createElement('blockquote');
  blockquote.textContent = config['quote-text'];
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
