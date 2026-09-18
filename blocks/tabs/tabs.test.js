import { expect } from '@esm-bundle/chai';
import decorate from './tabs.js';

function buildRow(labelHtml, panelHtml) {
  const row = document.createElement('div');
  const label = document.createElement('div');
  const panel = document.createElement('div');
  label.innerHTML = labelHtml;
  panel.innerHTML = panelHtml;
  row.append(label, panel);
  return row;
}

function pressKey(target, key) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('tabs block', () => {
  it('renders a tablist with one tab/panel per row', () => {
    const block = document.createElement('div');
    block.append(buildRow('Tab One', 'Panel one'), buildRow('Tab Two', 'Panel two'));
    decorate(block);

    expect(block.querySelector('[role="tablist"]')).to.exist;
    expect(block.querySelectorAll('[role="tab"]')).to.have.lengthOf(2);
    expect(block.querySelectorAll('[role="tabpanel"]')).to.have.lengthOf(2);
  });

  it('activates the first tab by default and hides the rest', () => {
    const block = document.createElement('div');
    block.append(buildRow('Tab One', 'Panel one'), buildRow('Tab Two', 'Panel two'));
    decorate(block);

    const tabs = block.querySelectorAll('[role="tab"]');
    const panels = block.querySelectorAll('[role="tabpanel"]');
    expect(tabs[0].getAttribute('aria-selected')).to.equal('true');
    expect(tabs[1].getAttribute('aria-selected')).to.equal('false');
    expect(panels[0].hidden).to.be.false;
    expect(panels[1].hidden).to.be.true;
  });

  it('preserves rich content in the tab label and panel', () => {
    const block = document.createElement('div');
    block.append(buildRow('<strong>Tab One</strong>', 'Panel with a <a href="/more">link</a>'));
    decorate(block);

    expect(block.querySelector('[role="tab"] strong')).to.exist;
    expect(block.querySelector('[role="tabpanel"] a')).to.exist;
  });

  it('activates a tab on click', () => {
    const block = document.createElement('div');
    block.append(buildRow('Tab One', 'Panel one'), buildRow('Tab Two', 'Panel two'));
    decorate(block);

    const tabs = block.querySelectorAll('[role="tab"]');
    const panels = block.querySelectorAll('[role="tabpanel"]');
    tabs[1].click();

    expect(tabs[0].getAttribute('aria-selected')).to.equal('false');
    expect(tabs[1].getAttribute('aria-selected')).to.equal('true');
    expect(panels[0].hidden).to.be.true;
    expect(panels[1].hidden).to.be.false;
  });

  it('moves to the next/previous tab with arrow keys, wrapping around', () => {
    const block = document.createElement('div');
    block.append(buildRow('Tab One', 'Panel one'), buildRow('Tab Two', 'Panel two'));
    decorate(block);

    const tabs = block.querySelectorAll('[role="tab"]');
    pressKey(tabs[0], 'ArrowRight');
    expect(tabs[1].getAttribute('aria-selected')).to.equal('true');

    pressKey(tabs[1], 'ArrowRight');
    expect(tabs[0].getAttribute('aria-selected')).to.equal('true');

    pressKey(tabs[0], 'ArrowLeft');
    expect(tabs[1].getAttribute('aria-selected')).to.equal('true');
  });

  it('jumps to the first/last tab with Home/End', () => {
    const block = document.createElement('div');
    block.append(
      buildRow('Tab One', 'Panel one'),
      buildRow('Tab Two', 'Panel two'),
      buildRow('Tab Three', 'Panel three'),
    );
    decorate(block);

    const tabs = block.querySelectorAll('[role="tab"]');
    pressKey(tabs[0], 'End');
    expect(tabs[2].getAttribute('aria-selected')).to.equal('true');

    pressKey(tabs[2], 'Home');
    expect(tabs[0].getAttribute('aria-selected')).to.equal('true');
  });

  it('ignores keys other than the arrow/Home/End keys', () => {
    const block = document.createElement('div');
    block.append(buildRow('Tab One', 'Panel one'), buildRow('Tab Two', 'Panel two'));
    decorate(block);

    const tabs = block.querySelectorAll('[role="tab"]');
    pressKey(tabs[0], 'a');
    expect(tabs[0].getAttribute('aria-selected')).to.equal('true');
    expect(tabs[1].getAttribute('aria-selected')).to.equal('false');
  });

  it('only inactive tabs are removed from the default tab order', () => {
    const block = document.createElement('div');
    block.append(buildRow('Tab One', 'Panel one'), buildRow('Tab Two', 'Panel two'));
    decorate(block);

    const tabs = block.querySelectorAll('[role="tab"]');
    expect(tabs[0].tabIndex).to.equal(0);
    expect(tabs[1].tabIndex).to.equal(-1);
  });

  it('skips a row missing its panel cell without throwing', () => {
    const block = document.createElement('div');
    const malformedRow = document.createElement('div');
    malformedRow.append(document.createElement('div'));
    block.append(buildRow('Tab One', 'Panel one'), malformedRow);

    expect(() => decorate(block)).to.not.throw();
    expect(block.querySelectorAll('[role="tab"]')).to.have.lengthOf(1);
  });

  it('skips a row with an empty label so it does not produce a nameless tab', () => {
    const block = document.createElement('div');
    block.append(buildRow('Tab One', 'Panel one'), buildRow('', 'Panel two'));
    decorate(block);

    expect(block.querySelectorAll('[role="tab"]')).to.have.lengthOf(1);
    expect(block.querySelector('[role="tab"]').textContent.trim()).to.equal('Tab One');
  });
});
