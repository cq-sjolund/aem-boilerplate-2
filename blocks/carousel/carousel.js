
function getCarouselSlides(rows) {
  const carouselSlides = document.createElement('div');
  carouselSlides.className = 'carousel-slides';
  carouselSlides.setAttribute('aria-live', 'polite');
  rows.forEach(row => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    row.querySelectorAll('picture').forEach(picture => {
      slide.append(picture);
    });

    
    const body = row.children[1];
    const textContent = body.textContent;
    if(textContent) {
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
  button.className = className;
  button.setAttribute('aria-label', label);
  return button;
}

export default function decorate(block) {
  const rows = [...block.children].filter((row) => row.children[0]?.querySelector('img'));

  // If no configured rows, remove the block
  if(rows.length === 0) {
    block.remove();
    return;
  }

  const children = [];
  children.push(getCarouselSlides(rows));
  children.push(getCarouselButton('carousel-prev', 'Previous'));
  children.push(getCarouselButton('carousel-next', 'Next'));
  console.log(children);
  block.replaceChildren(...children);
}