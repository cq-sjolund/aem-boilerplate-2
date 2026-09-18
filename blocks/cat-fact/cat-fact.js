const CAT_FACT_API_URL = 'https://catfact.ninja/fact';
const REQUEST_TIMEOUT_MS = 10000;

export default function decorate(block) {
  const text = document.createElement('p');
  text.className = 'cat-fact-text';
  text.setAttribute('aria-live', 'polite');

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'cat-fact-button';
  button.textContent = 'New fact';

  block.replaceChildren(text, button);

  const loadFact = async () => {
    text.textContent = 'Loading…';
    button.disabled = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(CAT_FACT_API_URL, { signal: controller.signal });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      const data = await response.json();
      text.textContent = data.fact;
    } catch (error) {
      text.textContent = "Couldn't load a cat fact. Try again.";
      // eslint-disable-next-line no-console
      console.error('Failed to fetch cat fact', error);
    } finally {
      clearTimeout(timeout);
      button.disabled = false;
    }
  };

  button.addEventListener('click', loadFact);
  // Fire-and-forget: decorate() must not block on the network, otherwise a
  // slow/hanging response would delay this section's eager-load completion.
  loadFact();
}
