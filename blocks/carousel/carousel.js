import { createOptimizedPicture } from '../../scripts/aem.js';

function getCarouselSlides(rows) {
  const carouselSlides = document.createElement('div');
  carouselSlides.className = 'carousel-slides';
  carouselSlides.setAttribute('aria-live', 'polite');
  rows.forEach((row, index) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.setAttribute('hidden', '');

    const img = row.querySelector('picture img');
    slide.append(createOptimizedPicture(img.src, img.alt, index === 0, [{ width: '750' }]));

    const body = row.children[1];
    const textContent = body?.textContent;
    if (textContent) {
      const caption = document.createElement('p');
      caption.className = 'carousel-caption';
      caption.textContent = textContent;
      slide.append(caption);
    }
    carouselSlides.append(slide);
  });

  return carouselSlides;
}

function getCarouselButton(className, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);
  return button;
}

function addEventListenersButtons(previousButton, nextButton, slides) {
  let currentIndex = 0;

  function showSlide(newIndex) {
    slides.children[currentIndex].setAttribute('hidden', '');
    currentIndex = newIndex;
    slides.children[currentIndex].removeAttribute('hidden');
  }

  function showPrevious() {
    showSlide((currentIndex - 1 + slides.children.length) % slides.children.length);
  }

  function showNext() {
    showSlide((currentIndex + 1) % slides.children.length);
  }

  previousButton.addEventListener('click', showPrevious);
  nextButton.addEventListener('click', showNext);

  [previousButton, nextButton].forEach((button) => {
    button.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showPrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        showNext();
      }
    });
  });
}

export default function decorate(block) {
  const rows = [...block.children].filter((row) => row.children[0]?.querySelector('img'));

  // If no configured rows, remove the block
  if (rows.length === 0) {
    block.remove();
    return;
  }

  const children = [];
  const slides = getCarouselSlides(rows);
  children.push(slides);

  if (rows.length > 1) {
    const previousButton = getCarouselButton('carousel-prev', 'Previous slide');
    const nextButton = getCarouselButton('carousel-next', 'Next slide');
    children.push(previousButton);
    children.push(nextButton);
    addEventListenersButtons(previousButton, nextButton, slides);
  }

  // Unhide the first slide by removing the 'hidden' attribute
  slides.children[0].removeAttribute('hidden');

  block.replaceChildren(...children);
}
