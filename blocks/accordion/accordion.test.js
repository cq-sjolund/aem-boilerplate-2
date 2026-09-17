import { expect } from '@esm-bundle/chai';
import decorate from './accordion.js';

describe('accordion block', () => {
  it('should decorate the block correctly', () => {
    const block = document.createElement('div');
    const row = document.createElement('div');
    const summary = document.createElement('div');
    const body = document.createElement('div');
    summary.textContent = 'Summary';
    body.textContent = 'Body';
    row.append(summary, body);
    block.append(row);
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
    const row1 = document.createElement('div');
    const summary1 = document.createElement('div');
    const body1 = document.createElement('div');
    summary1.textContent = 'Summary 1';
    body1.textContent = 'Body 1';
    row1.append(summary1, body1);
    const row2 = document.createElement('div');
    const summary2 = document.createElement('div');
    const body2 = document.createElement('div');
    summary2.textContent = 'Summary 2';
    body2.textContent = 'Body 2';
    row2.append(summary2, body2);
    block.append(row1, row2);
    decorate(block);
    const details = block.querySelectorAll('details');
    expect(details).to.have.lengthOf(2);
    expect(details[0].querySelector('summary').textContent).to.equal('Summary 1');
    expect(details[0].querySelector('.accordion-item-body').textContent).to.equal('Body 1');
    expect(details[1].querySelector('summary').textContent).to.equal('Summary 2');
    expect(details[1].querySelector('.accordion-item-body').textContent).to.equal('Body 2');
  });

  it('should handle a block with a single row', () => {
    const block = document.createElement('div');
    const row = document.createElement('div');
    const summary = document.createElement('div');
    const body = document.createElement('div');
    summary.textContent = 'Summary';
    body.textContent = 'Body';
    row.append(summary, body);
    block.append(row);
    decorate(block);
    const details = block.querySelector('details');
    expect(details).to.exist;
    expect(details.querySelector('summary').textContent).to.equal('Summary');
    expect(details.querySelector('.accordion-item-body').textContent).to.equal('Body');
  });

});