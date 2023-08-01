import GSAP from 'gsap';
import Animation from 'classes/Animation';

export default class Paragraph extends Animation {
  constructor({ element, elements }) {
    super({ element, elements });
  }

  animateIn() {
    // Split the text content of the paragraph into words
    const words = this.element.textContent.trim().split(' ');

    // Replace the text content of the paragraph with spans wrapped around each word and any other HTML elements
    this.element.innerHTML = words.map((word) => `<span>${word}</span>`).join(' ');

    // Set the visibility of the paragraph to "visible" and the opacity to 0
    this.element.style.visibility = 'visible';
    this.element.style.opacity = 1;

    // Animate each span with a staggered delay
    GSAP.fromTo(
      this.element.querySelectorAll('span'),
      {
        opacity: 0,
        y: '100%', // animate from bottom to top
      },
      {
        opacity: 1,
        y: '0%', // animate to top
        duration: 1.25,
        stagger: 0.008,
        onComplete: () => {
          // Remove the spans and restore the original content
          this.element.innerHTML = this.element.innerHTML.replace(/<span>(.*?)<\/span>/g, '$1');

          // Reset the visibility and opacity of the paragraph to their original values
          this.element.style.visibility = null;
          this.element.style.opacity = null;
        },
      }
    );
  }
  animateOut() {
    GSAP.set(this.element, {
      autoAlpha: 0,
    });
  }
}
