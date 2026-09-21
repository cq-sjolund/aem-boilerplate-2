import { expect } from '@esm-bundle/chai';
import decorate from './carousel.js';

describe('carousel block', () => {
  it('renders the carousel with slides and navigation buttons', async () => {
    document.body.innerHTML = `
      <div class="carousel">
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>First slide caption</div>
        </div>
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>Second slide caption</div>
        </div>
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div></div>
        </div>
      </div>
    `;
    const block = document.querySelector('.carousel');
    await decorate(block);

    expect(block.querySelectorAll('.carousel-slide').length).to.equal(3);
    expect(block.querySelector('.carousel-prev')).to.exist;
    expect(block.querySelector('.carousel-next')).to.exist;
  });

  it('hides all slides except the first one initially', async () => {
    document.body.innerHTML = `
      <div class="carousel">
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>First slide caption</div>
        </div>
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>Second slide caption</div>
        </div>
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div></div>
        </div>
      </div>
    `;
    const block = document.querySelector('.carousel');
    await decorate(block);

    const slides = block.querySelectorAll('.carousel-slide');
    expect(slides[0].hasAttribute('hidden')).to.be.false;
    expect(slides[1].hasAttribute('hidden')).to.be.true;
    expect(slides[2].hasAttribute('hidden')).to.be.true;
  });

  it('shows the next slide when the next button is clicked', async () => {
    document.body.innerHTML = `
      <div class="carousel">
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>First slide caption</div>
        </div>
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>Second slide caption</div>
        </div>
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div></div>
        </div>
      </div>
    `;
    const block = document.querySelector('.carousel');
    await decorate(block);

    const slides = block.querySelectorAll('.carousel-slide');
    const nextButton = block.querySelector('.carousel-next');
    nextButton.click();
    expect(slides[0].hasAttribute('hidden')).to.be.true;
    expect(slides[1].hasAttribute('hidden')).to.be.false;
    expect(slides[2].hasAttribute('hidden')).to.be.true;
  });

  it('shows the previous slide when the previous button is clicked', async () => {
    document.body.innerHTML = `
      <div class="carousel">
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>First slide caption</div>
        </div>
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>Second slide caption</div>
        </div>
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div></div>
        </div>
      </div>
    `;
    const block = document.querySelector('.carousel');
    await decorate(block);

    const slides = block.querySelectorAll('.carousel-slide');
    const nextButton = block.querySelector('.carousel-next');
    const prevButton = block.querySelector('.carousel-prev');
    nextButton.click();
    prevButton.click();
    expect(slides[0].hasAttribute('hidden')).to.be.false;
    expect(slides[1].hasAttribute('hidden')).to.be.true;
    expect(slides[2].hasAttribute('hidden')).to.be.true;
  });

  it('loops to the first slide when the next button is clicked on the last slide', async () => {
    document.body.innerHTML = `
      <div class="carousel">
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>First slide caption</div>
        </div>
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>Second slide caption</div>
        </div>
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>Third slide caption</div>
        </div>
      </div>
    `;
    const block = document.querySelector('.carousel');
    await decorate(block);

    const slides = block.querySelectorAll('.carousel-slide');
    const nextButton = block.querySelector('.carousel-next');
    nextButton.click();
    nextButton.click();
    nextButton.click();
    expect(slides[0].hasAttribute('hidden')).to.be.false;
    expect(slides[1].hasAttribute('hidden')).to.be.true;
    expect(slides[2].hasAttribute('hidden')).to.be.true;
  });

  it('loops to the last slide when the previous button is clicked on the first slide', async () => {
    document.body.innerHTML = `
      <div class="carousel">
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>First slide caption</div>
        </div>
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>Second slide caption</div>
        </div>
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>Third slide caption</div>
        </div>
      </div>
    `;
    const block = document.querySelector('.carousel');
    await decorate(block);

    const slides = block.querySelectorAll('.carousel-slide');
    const prevButton = block.querySelector('.carousel-prev');
    prevButton.click();
    expect(slides[0].hasAttribute('hidden')).to.be.true;
    expect(slides[1].hasAttribute('hidden')).to.be.true;
    expect(slides[2].hasAttribute('hidden')).to.be.false;
  });

  it('shows the correct slide when navigating back and forth', async () => {
    document.body.innerHTML = `
      <div class="carousel">
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>First slide caption</div>
        </div>
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>Second slide caption</div>
        </div>
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>Third slide caption</div>
        </div>
      </div>
    `;
    const block = document.querySelector('.carousel');
    await decorate(block);

    const slides = block.querySelectorAll('.carousel-slide');
    const nextButton = block.querySelector('.carousel-next');
    const prevButton = block.querySelector('.carousel-prev');
    nextButton.click();
    expect(slides[0].hasAttribute('hidden')).to.be.true;
    expect(slides[1].hasAttribute('hidden')).to.be.false;
    expect(slides[2].hasAttribute('hidden')).to.be.true;
    prevButton.click();
    expect(slides[0].hasAttribute('hidden')).to.be.false;
    expect(slides[1].hasAttribute('hidden')).to.be.true;
    expect(slides[2].hasAttribute('hidden')).to.be.true;
  });

  it('shows the next slide when ArrowRight is pressed on a nav button', async () => {
    document.body.innerHTML = `
      <div class="carousel">
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>First slide caption</div>
        </div>
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>Second slide caption</div>
        </div>
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div></div>
        </div>
      </div>
    `;
    const block = document.querySelector('.carousel');
    await decorate(block);

    const slides = block.querySelectorAll('.carousel-slide');
    const nextButton = block.querySelector('.carousel-next');
    nextButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(slides[0].hasAttribute('hidden')).to.be.true;
    expect(slides[1].hasAttribute('hidden')).to.be.false;
    expect(slides[2].hasAttribute('hidden')).to.be.true;
  });

  it('shows the previous slide when ArrowLeft is pressed on a nav button, wrapping to the last slide', async () => {
    document.body.innerHTML = `
      <div class="carousel">
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>First slide caption</div>
        </div>
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>Second slide caption</div>
        </div>
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div></div>
        </div>
      </div>
    `;
    const block = document.querySelector('.carousel');
    await decorate(block);

    const slides = block.querySelectorAll('.carousel-slide');
    const prevButton = block.querySelector('.carousel-prev');
    prevButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(slides[0].hasAttribute('hidden')).to.be.true;
    expect(slides[1].hasAttribute('hidden')).to.be.true;
    expect(slides[2].hasAttribute('hidden')).to.be.false;
  });

  it('ignores keys other than ArrowLeft/ArrowRight', async () => {
    document.body.innerHTML = `
      <div class="carousel">
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>First slide caption</div>
        </div>
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>Second slide caption</div>
        </div>
      </div>
    `;
    const block = document.querySelector('.carousel');
    await decorate(block);

    const slides = block.querySelectorAll('.carousel-slide');
    const nextButton = block.querySelector('.carousel-next');
    nextButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    expect(slides[0].hasAttribute('hidden')).to.be.false;
    expect(slides[1].hasAttribute('hidden')).to.be.true;
  });

  it('removes the block when no row has an image', async () => {
    document.body.innerHTML = `
      <div class="carousel">
        <div>
            <div></div>
            <div>Caption with no image</div>
        </div>
      </div>
    `;
    const block = document.querySelector('.carousel');
    await decorate(block);

    expect(document.body.contains(block)).to.be.false;
  });

  it('does not throw when a row is missing the caption cell', () => {
    document.body.innerHTML = `
      <div class="carousel">
        <div>
            <div><picture><img src="..." alt=""></picture></div>
        </div>
      </div>
    `;
    const block = document.querySelector('.carousel');
    expect(() => decorate(block)).to.not.throw();
    expect(block.querySelector('.carousel-slide')).to.exist;
    expect(block.querySelector('.carousel-caption')).to.not.exist;
  });

  it('sets type="button" and descriptive aria-label text on the nav buttons', async () => {
    document.body.innerHTML = `
      <div class="carousel">
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>First slide caption</div>
        </div>
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>Second slide caption</div>
        </div>
      </div>
    `;
    const block = document.querySelector('.carousel');
    await decorate(block);

    const prevButton = block.querySelector('.carousel-prev');
    const nextButton = block.querySelector('.carousel-next');
    expect(prevButton.type).to.equal('button');
    expect(nextButton.type).to.equal('button');
    expect(prevButton.getAttribute('aria-label')).to.equal('Previous slide');
    expect(nextButton.getAttribute('aria-label')).to.equal('Next slide');
  });

  it('optimizes each slide image, marking only the first as eager', async () => {
    document.body.innerHTML = `
      <div class="carousel">
        <div>
            <div><picture><img src="/media/test-image.jpg" alt="First"></picture></div>
            <div>First slide caption</div>
        </div>
        <div>
            <div><picture><img src="/media/test-image-2.jpg" alt="Second"></picture></div>
            <div>Second slide caption</div>
        </div>
      </div>
    `;
    const block = document.querySelector('.carousel');
    await decorate(block);

    const slides = block.querySelectorAll('.carousel-slide');
    const firstImg = slides[0].querySelector('picture img');
    const secondImg = slides[1].querySelector('picture img');

    expect(slides[0].querySelectorAll('picture source').length).to.be.greaterThan(0);
    expect(firstImg.getAttribute('loading')).to.equal('eager');
    expect(secondImg.getAttribute('loading')).to.equal('lazy');
    expect(firstImg.getAttribute('alt')).to.equal('First');
  });

  it('does not render navigation buttons when there is only one slide', async () => {
    document.body.innerHTML = `
      <div class="carousel">
        <div>
            <div><picture><img src="..." alt=""></picture></div>
            <div>Only slide</div>
        </div>
      </div>
    `;
    const block = document.querySelector('.carousel');
    await decorate(block);

    expect(block.querySelector('.carousel-prev')).to.not.exist;
    expect(block.querySelector('.carousel-next')).to.not.exist;
    expect(block.querySelector('.carousel-slide').hasAttribute('hidden')).to.be.false;
  });
});
