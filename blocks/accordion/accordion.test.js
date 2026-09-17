import { expect } from '@esm-bundle/chai';
import decorate from './accordion.js';

function buildRow(summaryText, bodyText) {
  const row = document.createElement('div');
  const summary = document.createElement('div');
  const body = document.createElement('div');
  summary.textContent = summaryText;
  body.textContent = bodyText;
  row.append(summary, body);
  return row;
}

describe('accordion block', () => {
  it('should decorate the block correctly', () => {
    const block = document.createElement('div');
    block.append(buildRow('Summary', 'Body'));
    decorate(block);
    const details = block.querySelector('details');
    expect(details).to.exist;
    expect(details.querySelector('summary').textContent).to.equal('Summary');
    expect(details.querySelector('.accordion-item-body').textContent).to.equal('Body');
  });

  it('should handle an empty block', () => {
    const block = document.createElement('div');
    decorate(block);
    const details = block.querySelector('details');
    expect(details).to.not.exist;
  });

  it('should handle a block with multiple rows', () => {
    const block = document.createElement('div');
    block.append(buildRow('Summary 1', 'Body 1'), buildRow('Summary 2', 'Body 2'));
    decorate(block);
    const details = block.querySelectorAll('details');
    expect(details).to.have.lengthOf(2);
    expect(details[0].querySelector('summary').textContent).to.equal('Summary 1');
    expect(details[0].querySelector('.accordion-item-body').textContent).to.equal('Body 1');
    expect(details[1].querySelector('summary').textContent).to.equal('Summary 2');
    expect(details[1].querySelector('.accordion-item-body').textContent).to.equal('Body 2');
  });

  it('preserves rich content like links inside the answer', () => {
    const block = document.createElement('div');
    const row = buildRow('Summary', '');
    row.children[1].innerHTML = 'Body with a <a href="/more">link</a>';
    block.append(row);
    decorate(block);
    expect(block.querySelector('.accordion-item-body a')).to.exist;
  });

  it('does not throw when a row is missing the answer cell', () => {
    const block = document.createElement('div');
    const row = document.createElement('div');
    row.append(document.createElement('div'));
    block.append(row);
    expect(() => decorate(block)).to.not.throw();
  });
});
