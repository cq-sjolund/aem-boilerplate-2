import { readBlockConfig } from '../../scripts/aem.js';

function getTimeRemaining(targetTime) {
  const totalSeconds = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    days, hours, minutes, seconds,
  };
}

function getCountDownLabel(config) {
  const countDownLabel = document.createElement('p');
  countDownLabel.className = 'countdown-label';
  countDownLabel.textContent = config.label;
  return countDownLabel;
}

function getCountDownSegment(value, label) {
  const segment = document.createElement('div');
  segment.className = 'countdown-segment';
  const valueElement = document.createElement('span');
  valueElement.className = 'countdown-value';
  valueElement.textContent = value;
  const labelElement = document.createElement('span');
  labelElement.className = 'countdown-unit';
  labelElement.textContent = label;
  segment.appendChild(valueElement);
  segment.appendChild(labelElement);
  return segment;
}

function getCountDownTimer(targetTime) {
  const countDownTimer = document.createElement('div');
  countDownTimer.className = 'countdown-timer';
  countDownTimer.hidden = true;
  const {
    days, hours, minutes, seconds,
  } = getTimeRemaining(targetTime);

  countDownTimer.appendChild(getCountDownSegment(days, 'days'));
  countDownTimer.appendChild(getCountDownSegment(hours, 'hours'));
  countDownTimer.appendChild(getCountDownSegment(minutes, 'minutes'));
  countDownTimer.appendChild(getCountDownSegment(seconds, 'seconds'));

  return countDownTimer;
}

// Computes the current state and paints it. Does not check whether `block`
// is still on the page — that's only relevant for the *recurring* interval
// tick (see decorate()), not for this function's first, synchronous call.
function renderCountDown(targetTime, block) {
  const countDownTimer = block.querySelector('.countdown-timer');
  if (!countDownTimer) return false;

  countDownTimer.hidden = false;

  if (Date.now() >= targetTime) {
    countDownTimer.textContent = 'Offer has ended';
    countDownTimer.className = 'countdown-ended';
    return false;
  }

  const {
    days, hours, minutes, seconds,
  } = getTimeRemaining(targetTime);

  const valueElements = countDownTimer.querySelectorAll('.countdown-value');
  [days, hours, minutes, seconds].forEach((value, i) => {
    if (valueElements[i].textContent !== value) {
      valueElements[i].textContent = value;
    }
  });

  return true;
}

function isValidConfig(targetDate, targetTime) {
  if (!targetDate || Number.isNaN(targetTime)) {
    // eslint-disable-next-line no-console
    console.warn('countdown block has a missing or invalid "Target Date" row; skipping decoration');
    return false;
  }
  return true;
}

export default function decorate(block) {
  const config = readBlockConfig(block);
  const targetDate = config['target-date'];
  const targetTime = new Date(targetDate).getTime();
  if (!isValidConfig(targetDate, targetTime)) {
    return;
  }

  const children = [];
  children.push(getCountDownLabel(config));
  children.push(getCountDownTimer(targetTime));

  block.replaceChildren(...children);

  if (!renderCountDown(targetTime, block)) {
    return;
  }

  const intervalId = setInterval(() => {
    if (!block.isConnected || !renderCountDown(targetTime, block)) {
      clearInterval(intervalId);
    }
  }, 1000);
}
