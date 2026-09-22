export default function decorate(block) {
  const rows = [...block.children].map((row) => row.textContent.trim());
  const [eyebrow, title, text, buttonText, buttonUrl] = rows;

  block.textContent = '';

  if (eyebrow) {
    const eyebrowElement = document.createElement('p');
    eyebrowElement.className = 'hero-eyebrow';
    eyebrowElement.textContent = eyebrow;
    block.append(eyebrowElement);
  }

  if (title) {
    const titleElement = document.createElement('h1');
    titleElement.textContent = title;
    block.append(titleElement);
  }

  if (text) {
    const textElement = document.createElement('p');
    textElement.textContent = text;
    block.append(textElement);
  }

  if (buttonText && buttonUrl) {
    const link = document.createElement('a');
    link.className = 'button primary';
    link.href = buttonUrl;
    link.textContent = buttonText;
    block.append(link);
  }
}
