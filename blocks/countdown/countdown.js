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

function formatValue(value) {
  return String(value).padStart(2, '0');
}

function getCountdownLabel(config) {
  if (!config.label) return null;
  const countdownLabel = document.createElement('p');
  countdownLabel.className = 'countdown-label';
  countdownLabel.textContent = config.label;
  return countdownLabel;
}

function getCountdownSegment(value, label) {
  const segment = document.createElement('div');
  segment.className = 'countdown-segment';
  const valueElement = document.createElement('span');
  valueElement.className = 'countdown-value';
  valueElement.textContent = formatValue(value);
  const labelElement = document.createElement('span');
  labelElement.className = 'countdown-unit';
  labelElement.textContent = label;
  segment.appendChild(valueElement);
  segment.appendChild(labelElement);
  return segment;
}

// Values here are placeholders only — decorate() always calls renderCountdown()
// synchronously right after this, which immediately overwrites them with the
// real, current time remaining. Computing real values here would be redundant.
function getCountdownTimer() {
  const countdownTimer = document.createElement('div');
  countdownTimer.className = 'countdown-timer';
  countdownTimer.setAttribute('aria-live', 'polite');

  countdownTimer.appendChild(getCountdownSegment(0, 'days'));
  countdownTimer.appendChild(getCountdownSegment(0, 'hours'));
  countdownTimer.appendChild(getCountdownSegment(0, 'minutes'));
  countdownTimer.appendChild(getCountdownSegment(0, 'seconds'));

  return countdownTimer;
}

// Computes the current state and paints it. Does not check whether `block`
// is still on the page — that's only relevant for the *recurring* interval
// tick (see decorate()), not for this function's first, synchronous call.
function renderCountdown(targetTime, block) {
  const countdownTimer = block.querySelector('.countdown-timer');
  if (!countdownTimer) return false;

  if (Date.now() >= targetTime) {
    countdownTimer.textContent = 'Offer has ended';
    countdownTimer.className = 'countdown-ended';
    return false;
  }

  const {
    days, hours, minutes, seconds,
  } = getTimeRemaining(targetTime);

  const valueElements = countdownTimer.querySelectorAll('.countdown-value');
  [days, hours, minutes, seconds].map(formatValue).forEach((value, i) => {
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
    block.remove();
    return;
  }

  const children = [];
  const label = getCountdownLabel(config);
  if (label) children.push(label);
  children.push(getCountdownTimer());

  block.replaceChildren(...children);

  if (!renderCountdown(targetTime, block)) {
    return;
  }

  const intervalId = setInterval(() => {
    if (!block.isConnected || !renderCountdown(targetTime, block)) {
      clearInterval(intervalId);
    }
  }, 1000);
}
