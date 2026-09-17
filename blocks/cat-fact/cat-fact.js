const CAT_FACT_API_URL = 'https://catfact.ninja/fact';

export default async function decorate(block) {
  const text = document.createElement('p');
  text.className = 'cat-fact-text';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'cat-fact-button';
  button.textContent = 'New fact';

  block.replaceChildren(text, button);

  const loadFact = async () => {
    text.textContent = 'Loading…';
    button.disabled = true;
    try {
      const response = await fetch(CAT_FACT_API_URL);
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      const data = await response.json();
      text.textContent = data.fact;
    } catch (error) {
      text.textContent = "Couldn't load a cat fact. Try again.";
      // eslint-disable-next-line no-console
      console.error('Failed to fetch cat fact', error);
    } finally {
      button.disabled = false;
    }
  };

  button.addEventListener('click', loadFact);
  await loadFact();
}
