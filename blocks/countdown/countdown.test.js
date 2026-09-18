import { expect } from '@esm-bundle/chai';
import decorate from './countdown.js';

describe('countdown block', () => {
  let attachedBlock;

  afterEach(() => {
    attachedBlock?.remove();
    attachedBlock = undefined;
  });

  it('should decorate the countdown block correctly', () => {
    const block = document.createElement('div');
    block.innerHTML = `
      <div>
        <div>target-date</div>
        <div>2099-12-31T23:59:59</div>
      </div>
      <div>
        <div>label</div>
        <div>Sale ends in</div>
      </div>
    `;
    decorate(block);
    expect(block.querySelector('.countdown-label')).to.exist;
    expect(block.querySelector('.countdown-timer')).to.exist;
    expect(block.querySelectorAll('.countdown-segment').length).to.equal(4);
  });

  it('should display the countdown ended message when the target time has passed', () => {
    const block = document.createElement('div');
    block.innerHTML = `
      <div>
        <div>target-date</div>
        <div>2020-01-01T00:00:00</div>
      </div>
      <div>
        <div>label</div>
        <div>Sale ends in</div>
      </div>
    `;
    decorate(block);
    const countDownEnded = block.querySelector('.countdown-ended');
    expect(countDownEnded).to.exist;
    expect(countDownEnded.textContent).to.equal('Offer has ended');
    expect(block.querySelector('.countdown-timer')).to.not.exist;
  });

  it('should update the countdown timer correctly', () => {
    const block = document.createElement('div');
    block.innerHTML = `
      <div>
        <div>target-date</div>
        <div>2099-12-31T23:59:59</div>
      </div>
      <div>
        <div>label</div>
        <div>Sale ends in</div>
      </div>
    `;
    decorate(block);
    const valueElements = block.querySelectorAll('.countdown-value');
    expect(valueElements).to.have.lengthOf(4);
  });

  it('should not decorate when the target date is missing or invalid', () => {
    const block = document.createElement('div');
    block.innerHTML = `
      <div>
        <div>target-date</div>
        <div>not-a-real-date</div>
      </div>
      <div>
        <div>label</div>
        <div>Sale ends in</div>
      </div>
    `;
    decorate(block);
    expect(block.querySelector('.countdown-label')).to.not.exist;
    expect(block.querySelector('.countdown-timer')).to.not.exist;
  });

  it('should keep ticking via the interval, then stop and show the ended message once the target time passes', async () => {
    const block = document.createElement('div');
    block.innerHTML = `
      <div>
        <div>target-date</div>
        <div>${new Date(Date.now() + 500).toISOString()}</div>
      </div>
      <div>
        <div>label</div>
        <div>Sale ends in</div>
      </div>
    `;
    document.body.append(block);
    attachedBlock = block;

    decorate(block);
    expect(block.querySelector('.countdown-timer')).to.exist;

    await new Promise((resolve) => { setTimeout(resolve, 1200); });

    expect(block.querySelector('.countdown-ended')).to.exist;
    expect(block.querySelector('.countdown-timer')).to.not.exist;
  });

  it('should omit the label when it is not provided, without rendering "undefined"', () => {
    const block = document.createElement('div');
    block.innerHTML = `
      <div>
        <div>target-date</div>
        <div>2099-12-31T23:59:59</div>
      </div>
    `;
    decorate(block);
    expect(block.querySelector('.countdown-label')).to.not.exist;
    expect(block.querySelector('.countdown-timer')).to.exist;
    expect(block.textContent).to.not.include('undefined');
  });

  it('should zero-pad single-digit values', () => {
    const block = document.createElement('div');
    block.innerHTML = `
      <div>
        <div>target-date</div>
        <div>${new Date(Date.now() + 5000).toISOString()}</div>
      </div>
      <div>
        <div>label</div>
        <div>Sale ends in</div>
      </div>
    `;
    decorate(block);
    const [daysValue] = block.querySelectorAll('.countdown-value');
    expect(daysValue.textContent).to.equal('00');
  });

  it('should mark the timer as an aria-live region', () => {
    const block = document.createElement('div');
    block.innerHTML = `
      <div>
        <div>target-date</div>
        <div>2099-12-31T23:59:59</div>
      </div>
      <div>
        <div>label</div>
        <div>Sale ends in</div>
      </div>
    `;
    decorate(block);
    expect(block.querySelector('.countdown-timer').getAttribute('aria-live')).to.equal('polite');
  });

  it('should stop ticking once the block is removed from the page', async () => {
    const block = document.createElement('div');
    block.innerHTML = `
      <div>
        <div>target-date</div>
        <div>${new Date(Date.now() + 60000).toISOString()}</div>
      </div>
      <div>
        <div>label</div>
        <div>Sale ends in</div>
      </div>
    `;
    document.body.append(block);
    decorate(block);
    block.remove();

    const secondsBefore = block.querySelectorAll('.countdown-value')[3].textContent;
    await new Promise((resolve) => { setTimeout(resolve, 1200); });
    const secondsAfter = block.querySelectorAll('.countdown-value')[3].textContent;

    expect(secondsAfter).to.equal(secondsBefore);
  });
});
