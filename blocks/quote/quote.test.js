import { expect } from '@esm-bundle/chai';
import decorate from './quote.js';

describe('quote block', () => {
  it('renders the quote text in a blockquote and attribution in a footer/cite', async () => {
    document.body.innerHTML = `
      <div class="quote">
        <div><div>quote-text</div><div>The best way to predict the future is to invent it.</div></div>
        <div><div>quote-attribution</div><div>Alan Kay</div></div>
      </div>
    `;
    const block = document.querySelector('.quote');
    await decorate(block);

    expect(block.querySelector('blockquote').textContent).to.equal('The best way to predict the future is to invent it.');
    expect(block.querySelector('footer cite').textContent).to.equal('Alan Kay');
  });

  it('omits the footer when the attribution row is missing', async () => {
    document.body.innerHTML = `
      <div class="quote">
        <div><div>quote-text</div><div>The best way to predict the future is to invent it.</div></div>
      </div>
    `;
    const block = document.querySelector('.quote');
    await decorate(block);

    expect(block.querySelector('footer')).to.equal(null);
  });

  it('does not render "undefined" when the quote text row is missing', async () => {
    document.body.innerHTML = `
      <div class="quote">
        <div><div>quote-attribution</div><div>Alan Kay</div></div>
      </div>
    `;
    const block = document.querySelector('.quote');
    await decorate(block);

    expect(block.querySelector('blockquote')).to.equal(null);
    expect(block.textContent).to.not.include('undefined');
  });
});
