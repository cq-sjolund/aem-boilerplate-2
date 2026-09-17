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

describe('cat-fact block', () => {
  let fetchMock;

  afterEach(() => {
    fetchMock?.restore();
  });

  it('should decorate the block with a cat fact text and button', async () => {
    fetchMock = mockFetch();
    const block = document.createElement('div');
    block.className = 'cat-fact';
    const decoratePromise = decorate(block);
    fetchMock.resolveWith({ ok: true, json: async () => ({ fact: 'Test fact' }) });
    await decoratePromise;
    const text = block.querySelector('.cat-fact-text');
    const button = block.querySelector('.cat-fact-button');
    expect(text).to.exist;
    expect(button).to.exist;
  });

  it('should display a loading message initially', async () => {
    fetchMock = mockFetch();
    const block = document.createElement('div');
    block.className = 'cat-fact';
    const decoratePromise = decorate(block);
    const text = block.querySelector('.cat-fact-text');
    expect(text.textContent).to.equal('Loading…');
    fetchMock.resolveWith({ ok: true, json: async () => ({ fact: 'Test fact' }) });
    await decoratePromise;
  });

  it('should enable the button after loading a fact', async () => {
    fetchMock = mockFetch();
    const block = document.createElement('div');
    block.className = 'cat-fact';
    const decoratePromise = decorate(block);
    fetchMock.resolveWith({ ok: true, json: async () => ({ fact: 'Test fact' }) });
    await decoratePromise;
    const button = block.querySelector('.cat-fact-button');
    expect(button.disabled).to.be.false;
  });

  it('should display an error message if the fact fails to load', async () => {
    fetchMock = mockFetch();
    const block = document.createElement('div');
    block.className = 'cat-fact';
    const decoratePromise = decorate(block);
    fetchMock.resolveWith({ ok: false, status: 500 });
    await decoratePromise;
    const text = block.querySelector('.cat-fact-text');
    expect(text.textContent).to.equal("Couldn't load a cat fact. Try again.");
  });

  it('should fetch a new cat fact when the button is clicked', async () => {
    fetchMock = mockFetch();
    const block = document.createElement('div');
    block.className = 'cat-fact';
    const initialLoad = decorate(block);
    fetchMock.resolveWith({ ok: true, json: async () => ({ fact: 'First fact' }) });
    await initialLoad;

    const text = block.querySelector('.cat-fact-text');
    const button = block.querySelector('.cat-fact-button');

    fetchMock.armNext();
    button.click();
    expect(text.textContent).to.equal('Loading…');
    fetchMock.resolveWith({ ok: true, json: async () => ({ fact: 'Second fact' }) });
    await new Promise((resolve) => { setTimeout(resolve, 0); });
    expect(text.textContent).to.equal('Second fact');
  });

  it('should disable the button while loading a new fact, then re-enable it', async () => {
    fetchMock = mockFetch();
    const block = document.createElement('div');
    block.className = 'cat-fact';
    const initialLoad = decorate(block);
    fetchMock.resolveWith({ ok: true, json: async () => ({ fact: 'First fact' }) });
    await initialLoad;

    const button = block.querySelector('.cat-fact-button');

    fetchMock.armNext();
    button.click();
    expect(button.disabled).to.be.true;
    fetchMock.resolveWith({ ok: true, json: async () => ({ fact: 'Second fact' }) });
    await new Promise((resolve) => { setTimeout(resolve, 0); });
    expect(button.disabled).to.be.false;
  });
});
