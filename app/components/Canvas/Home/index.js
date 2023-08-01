import { Plane, Transform } from 'ogl';
import GSAP from 'gsap';
import map from 'lodash/map';
import { CSSPlugin } from 'gsap';
import Media from './Media';
import Header from './Header';
import * as THREE from 'three';
import Worknav from './worknav.js'
import { initNavMenu } from './NavMenu.js';

GSAP.registerPlugin(CSSPlugin);



export default class {
  constructor({ gl, scene, sizes }) {
    this.gl = gl;
    this.scene = scene;
    this.sizes = sizes;
    this.group = new Transform();

    this.header = new Header({ gl: this.gl, scene: this.scene, sizes: this.sizes });

    this.galleryElement = document.querySelector('.home__gallery');
    this.mediasElements = document.querySelectorAll('.home__gallery__media__image');
    this.headerElements = document.querySelectorAll('.header__wrapper');

    this.bgElement = document.getElementsByClassName('bg')[0]

    // --------------------SOCIAL LINKS----------------------------------
    this.openInstagram = this.openInstagram.bind(this);
    this.openLinkedIn = this.openLinkedIn.bind(this);
    this.openMailto = this.openMailto.bind(this);

    this.instagramLink = document.querySelector('#external-link1');
    this.instagramLink.addEventListener('click', this.openInstagram);

    this.linkedInLink = document.querySelector('#external-link2');
    this.linkedInLink.addEventListener('click', this.openLinkedIn);

    this.mailtoLink = document.querySelector('#external-link3');
    this.mailtoLink.addEventListener('click', this.openMailto);



    this.x = {
      current: 0,
      target: 0,
      lerp: 0.1,
    };

    this.y = {
      current: 0,
      target: 0,
      lerp: 0.1,
    };

    this.scrollCurrent = {
      x: 0,
      y: 0,
    };

    this.scroll = {
      x: 0,
      y: 0,
    };

    this.speed = {
      current: 0,
      target: 0,
      lerp: 0.1,
    };


    // create a new canvas element

    // Set the WebGLRenderer to use the created canvas

    this.createGeometry();
    this.createGallery();

    this.bgElement.addEventListener('mousedown', () => this.onTouchDown());
    this.bgElement.addEventListener('mouseup', () => this.onTouchUp());



    this.onResize({
      sizes: this.sizes,
    });

    this.group.setParent(this.scene);
  }



  openInstagram(event) {
    event.preventDefault();
    const url = 'https://www.instagram.com/mariensingbo';
    window.open(url, '_blank');
  }

  openLinkedIn(event) {
    event.preventDefault();
    const url = 'https://www.linkedin.com/in/marien-singbo-165a3a188/';
    window.open(url, '_blank');
  }

  openMailto(event) {
    event.preventDefault();
    const url = 'mailto:hello@mariensingbo.com';
    window.open(url, '_blank');
  }


  createGeometry() {
    this.geometry = new Plane(this.gl, {
      heightSegments: 20,
      widthSegments: 20,
    });
  }

  createGallery() {
    this.medias = map(this.mediasElements, (element, index) => {
      return new Media({
        element,
        geometry: this.geometry,
        index,
        gl: this.gl,
        scene: this.group,
        sizes: this.sizes,
      });
    });
  }

  onResize(e) {
    this.galleryBounds = this.galleryElement.getBoundingClientRect();
    this.sizes = e.sizes;
    // this.faceMan
    this.gallerySizes = {
      width: (this.galleryBounds.width / window.innerWidth) * this.sizes.width,
      height: (this.galleryBounds.height / window.innerHeight) * this.sizes.height,
    };

    this.scroll.x = this.x.target = 0;
    this.scroll.y = this.y.target = 0;

    map(this.medias, (media) => media.onResize(e, this.scroll));

    this.header.onResize(e);
  }

  onTouchDown({ x, y }) {
    this.speed.target = 1;

    this.scrollCurrent.x = this.scroll.x;
    this.scrollCurrent.y = this.scroll.y;

    GSAP.to(this.bgElement, {
      opacity: 0,
      duration: 0.5
    });

  }



  onTouchMove({ x, y }) {
    const xDistance = x.start - x.end;
    const yDistance = y.start - y.end;

    this.x.target = this.scrollCurrent.x - xDistance;
    this.y.target = this.scrollCurrent.y - yDistance;

  }

  onTouchUp({ x, y }) {
    this.speed.target = 0;

    GSAP.to(this.bgElement, {
      opacity: 1,
      duration: 0.5
    });
  }

  onWheel({ pixelX, pixelY }) {
    this.x.target += pixelX;
    this.y.target += pixelY;
  }

  update() {
    this.speed.current = GSAP.utils.interpolate(this.speed.current, this.speed.target, this.speed.lerp);

    this.x.current = GSAP.utils.interpolate(this.x.current, this.x.target, this.x.lerp);
    this.y.current = GSAP.utils.interpolate(this.y.current, this.y.target, this.y.lerp);

    if (this.scroll.x < this.x.current) {
      this.x.direction = 'right';
    } else if (this.scroll.x > this.x.current) {
      this.x.direction = 'left';
    }

    if (this.scroll.y < this.y.current) {
      this.y.direction = 'top';
    } else if (this.scroll.y > this.y.current) {
      this.y.direction = 'bottom';
    }

    this.scroll.x = this.x.current;
    this.scroll.y = this.y.current;

    map(this.medias, (media, index) => {
      const offsetX = this.sizes.width * 0.6;
      const scaleX = media.mesh.scale.x / 2;
      if (this.x.direction === 'left') {
        const x = media.mesh.position.x + scaleX;

        if (x < -offsetX) {
          media.extra.x += this.gallerySizes.width;

          media.mesh.rotation.z = GSAP.utils.random(-Math.PI * 0.03, Math.PI * 0.03);
        }
      } else if (this.x.direction === 'right') {
        const x = media.mesh.position.x - scaleX;

        if (x > offsetX) {
          media.extra.x -= this.gallerySizes.width;

          media.mesh.rotation.z = GSAP.utils.random(-Math.PI * 0.03, Math.PI * 0.03);
        }
      }

      const offsetY = this.sizes.height * 0.6;
      const scaleY = media.mesh.scale.y / 2;

      if (this.y.direction === 'top') {
        const y = media.mesh.position.y + scaleY;

        if (y < -offsetY) {
          media.extra.y += this.gallerySizes.height;

          media.mesh.rotation.z = GSAP.utils.random(-Math.PI * 0.03, Math.PI * 0.03);
        }
      } else if (this.y.direction === 'bottom') {
        const y = media.mesh.position.y - scaleY;

        if (y > offsetY) {
          media.extra.y -= this.gallerySizes.height;

          media.mesh.rotation.z = GSAP.utils.random(-Math.PI * 0.03, Math.PI * 0.03);
        }
      }

      media.update(this.scroll, this.speed.current);
    });

    this.header.update();
  }




  hide() {
    map(this.galleries, (gallery) => gallery.hide());


    const verticalLine = document.querySelector('.vertical__line');

    // Apply the reverse animation
    verticalLine.style.animation = 'animateHeightReverse 2s';

    // Wait for the animation to finish before changing the page


  }

  destroy() {


    // Dispose WebGL resources
    this.scene.removeChild(this.group);


    // Dispose Header instance
    this.header.destroy();
    this.header = null;
    this.headerElements = null;

    // Dispose bgElement event listeners
    this.bgElement.removeEventListener('mousedown', this.onTouchDown);
    this.bgElement.removeEventListener('mouseup', this.onTouchUp);

    this.instagramLink.removeEventListener('click', this.openInstagram);
    this.linkedInLink.removeEventListener('click', this.openLinkedIn);
    this.mailtoLink.removeEventListener('click', this.openMailto);

    // Remove all properties

  }

}

// Homepage WORK menu functionality

let worknavInstance;
function initWorknav() {
  if (!worknavInstance) {
    worknavInstance = new Worknav({
      dom: document.getElementById("container"),
    });
  }
}
function destroyWorknav() {
  if (worknavInstance) {
    worknavInstance.dispose();
    worknavInstance = null;
  }
};
export const WorkNavInit = {
  initWorknav: initWorknav,
  destroyWorknav: destroyWorknav,
};

;
// Homepage menu funcitionality

function initHomePage() {
  // Your other home page specific code here
  initNavMenu();
}
export { initHomePage };

