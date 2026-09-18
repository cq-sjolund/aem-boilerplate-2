import { expect } from '@esm-bundle/chai';
import decorate from './cat-fact.js';

function mockFetch() {
  const originalFetch = globalThis.fetch;
  let resolveResponse;
  const armNext = () => {
    globalThis.fetch = () => new Promise((resolve) => {
      resolveResponse = resolve;
    });
  };
  armNext();
  return {
    armNext,
    resolveWith(response) {
      resolveResponse(response);
    },
    restore() {
      globalThis.fetch = originalFetch;
    },
  };
}

// decorate() no longer awaits the fetch (fire-and-forget), so tests wait a
// tick after resolving the mocked fetch for the resulting DOM update to land.
function settle() {
  return new Promise((resolve) => { setTimeout(resolve, 0); });
}

describe('cat-fact block', () => {
  let fetchMock;

  afterEach(() => {
    fetchMock?.restore();
  });

  it('should decorate the block with a cat fact text and button', () => {
    fetchMock = mockFetch();
    const block = document.createElement('div');
    block.className = 'cat-fact';
    decorate(block);
    const text = block.querySelector('.cat-fact-text');
    const button = block.querySelector('.cat-fact-button');
    expect(text).to.exist;
    expect(button).to.exist;
  });

  it('marks the fact text as an aria-live region so updates are announced', () => {
    fetchMock = mockFetch();
    const block = document.createElement('div');
    block.className = 'cat-fact';
    decorate(block);
    const text = block.querySelector('.cat-fact-text');
    expect(text.getAttribute('aria-live')).to.equal('polite');
  });

  it('should display a loading message initially', () => {
    fetchMock = mockFetch();
    const block = document.createElement('div');
    block.className = 'cat-fact';
    decorate(block);
    const text = block.querySelector('.cat-fact-text');
    expect(text.textContent).to.equal('Loading…');
  });

  it('should enable the button after loading a fact', async () => {
    fetchMock = mockFetch();
    const block = document.createElement('div');
    block.className = 'cat-fact';
    decorate(block);
    fetchMock.resolveWith({ ok: true, json: async () => ({ fact: 'Test fact' }) });
    await settle();
    const button = block.querySelector('.cat-fact-button');
    expect(button.disabled).to.be.false;
  });

  it('should display an error message if the fact fails to load', async () => {
    fetchMock = mockFetch();
    const block = document.createElement('div');
    block.className = 'cat-fact';
    decorate(block);
    fetchMock.resolveWith({ ok: false, status: 500 });
    await settle();
    const text = block.querySelector('.cat-fact-text');
    expect(text.textContent).to.equal("Couldn't load a cat fact. Try again.");
  });

  it('should fetch a new cat fact when the button is clicked', async () => {
    fetchMock = mockFetch();
    const block = document.createElement('div');
    block.className = 'cat-fact';
    decorate(block);
    fetchMock.resolveWith({ ok: true, json: async () => ({ fact: 'First fact' }) });
    await settle();

    const text = block.querySelector('.cat-fact-text');
    const button = block.querySelector('.cat-fact-button');

    fetchMock.armNext();
    button.click();
    expect(text.textContent).to.equal('Loading…');
    fetchMock.resolveWith({ ok: true, json: async () => ({ fact: 'Second fact' }) });
    await settle();
    expect(text.textContent).to.equal('Second fact');
  });

  it('should disable the button while loading a new fact, then re-enable it', async () => {
    fetchMock = mockFetch();
    const block = document.createElement('div');
    block.className = 'cat-fact';
    decorate(block);
    fetchMock.resolveWith({ ok: true, json: async () => ({ fact: 'First fact' }) });
    await settle();

    const button = block.querySelector('.cat-fact-button');

    fetchMock.armNext();
    button.click();
    expect(button.disabled).to.be.true;
    fetchMock.resolveWith({ ok: true, json: async () => ({ fact: 'Second fact' }) });
    await settle();
    expect(button.disabled).to.be.false;
  });
});
