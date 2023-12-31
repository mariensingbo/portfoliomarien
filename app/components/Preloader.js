/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { Texture } from 'ogl';

import GSAP from 'gsap';

import Component from 'classes/Component';

import each from 'lodash/each';

import { split } from 'utils/text';

export default class Preloader extends Component {
  constructor({ canvas }) {
    super({
      element: '.preloader',
      elements: {
        title: '.preloader__text',
        number: '.preloader__number',
        numberText: '.preloader__number__text',
      },
    });

    this.canvas = canvas;

    window.TEXTURES = {};
    this.elements.title.style.opacity = 0;


    split({
      element: this.elements.title,
      expression: '<br>',
    });

    split({
      element: this.elements.title,
      expression: '<br>',
    });

    this.elements.titleSpans =
      this.elements.title.querySelectorAll('span span');




      this.length = 0;

    this.length = 0;

    this.createLoader();
  }

  createLoader() {
    each(window.ASSETS, (image) => {
      const texture = new Texture(this.canvas.gl, {
        generateMipmaps: false,
      });

      const media = new window.Image();

      media.crossOrigin = 'anonymous';
      media.src = image;

      media.onload = (_) => {
        texture.image = media;

        this.onAssetLoaded();
      };

      window.TEXTURES[image] = texture;
    });
  }

  onAssetLoaded(image) {
    this.length++;

    const percent = this.length / window.ASSETS.length;

    this.elements.numberText.innerHTML = `${Math.round(percent * 100)}%`;

    if (percent === 1) {
      this.onLoaded();
    }
  }

  onLoaded() {
    return new Promise((resolve) => {
      this.emit('completed');

      this.animateOut = GSAP.timeline({
        delay: 6,
      });

      this.animateIn = GSAP.timeline({
        delay: 2,
      })

      this.elements.title.style.opacity = 1;

      this.animateIn.from(this.elements.titleSpans, {
        duration: 0.5,
        ease: 'expo.out',
        stagger: 0.04,
        y: '100%',
        opacity: 0,
        scale: 0.5,
      });

      this.animateOut.to(this.elements.titleSpans, {
        duration: 1.5,
        ease: 'expo.out',
        stagger: 0.01,
        y: '-100%',
        opacity: 0,
        scale: 0.5,
      });

      this.animateOut.to(
        this.elements.numberText,
        {
          duration: 1.5,
          ease: 'expo.out',
          stagger: 0.1,
          y: '100%',
        },
        '-=1.4'
      );

      this.animateOut.to(this.element, {
        autoAlpha: 0,
        duration: 1.5,
      });

      this.animateOut.call((_) => {
        this.destroy();
      });
    });
  }

  destroy() {
    this.element.parentNode.removeChild(this.element);
  }
}
