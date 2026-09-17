import { expect } from '@esm-bundle/chai';
import decorate from './cat-fact.js';

describe('cat-fact block', () => {
  it('should decorate the block with a cat fact text and button', async () => {
    const block = document.createElement('div');
    block.className = 'cat-fact';
    await decorate(block);
    const text = block.querySelector('.cat-fact-text');
    const button = block.querySelector('.cat-fact-button');
    expect(text).to.exist;
    expect(button).to.exist;
  });
  
  it('should display a loading message initially', async () => {
    const block = document.createElement('div');
    block.className = 'cat-fact';
    await decorate(block);
    const text = block.querySelector('.cat-fact-text');
    expect(text.textContent).to.equal('Loading…');
  });

  it('should enable the button after loading a fact', async () => {
    const block = document.createElement('div');
    block.className = 'cat-fact';
    await decorate(block);
    const button = block.querySelector('.cat-fact-button');
    expect(button.disabled).to.be.false;
  });

  it('should display an error message if the fact fails to load', async () => {
    const block = document.createElement('div');
    block.className = 'cat-fact';
    // Simulate a failed fetch by mocking the global fetch function
    const originalFetch = global.fetch;
    global.fetch = async () => ({ ok: false, status: 500 });
    await decorate(block);
    const text = block.querySelector('.cat-fact-text');
    expect(text.textContent).to.equal("Couldn't load a cat fact. Try again.");
    // Restore the original fetch function
    global.fetch = originalFetch;
  });

  it('should fetch a new cat fact when the button is clicked', async () => {
    const block = document.createElement('div');
    block.className = 'cat-fact';
    await decorate(block);
    const text = block.querySelector('.cat-fact-text');
    const button = block.querySelector('.cat-fact-button');
    const initialFact = text.textContent;
    button.click();
    expect(text.textContent).to.equal('Loading…');
    // Wait for the new fact to load
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(text.textContent).to.not.equal(initialFact);
  });

  it('should disable the button while loading a new fact', async () => {
    const block = document.createElement('div');
    block.className = 'cat-fact';
    await decorate(block);
    const button = block.querySelector('.cat-fact-button');
    button.click();
    expect(button.disabled).to.be.true;
    // Wait for the new fact to load
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(button.disabled).to.be.false;
  });

});