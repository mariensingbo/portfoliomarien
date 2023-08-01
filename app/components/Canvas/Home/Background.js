export default class Background extends Animation {
  constructor(home__gallery__media__image) {
    this.element = document.querySelector(home__gallery__media__image);
  }

  onMouseDown() {
    this.element.style.opacity = 1;
  }

  onMouseUp() {
    this.element.style.opacity = 0;
  }
}




