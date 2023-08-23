import { Plane, Transform } from 'ogl';
import GSAP from 'gsap';
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

import map from 'lodash/map';
//import Media from './Media';
import * as THREE from 'three';

GSAP.registerPlugin(ScrollToPlugin);


export default class {
  constructor({ gl, scene, sizes }) {
    this.gl = gl;
    this.scene = scene;
    this.sizes = sizes;
    this.group = new Transform();


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

    document.addEventListener('contextmenu', function(e) {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    });

    function setSketchOpacity(opacity) {
      document.querySelector('.newsBoxCurationSketch img').style.opacity = opacity;
    }
    
    function handleStart() {
      setSketchOpacity('1');
    }
    
    function handleEnd() {
      setSketchOpacity('0');
    }
    
    var sketchButton = document.querySelector('.sketchbutton1');
    
    // Mouse events
    sketchButton.addEventListener('mousedown', handleStart);
    sketchButton.addEventListener('mouseup', handleEnd);
    sketchButton.addEventListener('mouseleave', handleEnd);
    
    // Touch events
    sketchButton.addEventListener('touchstart', handleStart);
    sketchButton.addEventListener('touchend', handleEnd);
    


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

    //this.createGeometry();
    //this.createGallery();

    this.scrollContent = document.querySelector('.inlabschibsted__wrapper');


    this.inlabSchibstedConceptOverviewElement = document.querySelector('.inlabSchibstedConceptOverview');
    this.arrowSchibstedCaseElement = document.querySelector('#arrowToSchibstedCase');
    this.scrolledDown = false; // You may want to initialize this elsewhere based on your logic
    this.arrowSchibstedCaseElement.addEventListener('click', () => {
        this.onArrowSchibstedContainerClick();
    });

    this.newsBoxCurationElement = document.querySelector('.newsboxCuration');
    this.newsBoxCurationLink = document.querySelector('.newsBoxCurationLT');
    this.scrolledDown = false; // You may want to initialize this elsewhere based on your logic
    this.newsBoxCurationLink.addEventListener('click', () => {
        this.newsBoxCurationLinkClick();
    });



    this.pointOfViewElement = document.querySelector('.pointOfView');
    this.pointOfViewLink = document.querySelector('.pointOfViewsLT')
    this.scrolledDown = false;
    this.pointOfViewLink.addEventListener('click', () => {
      this.pointOfViewLinkClick();
  });


  this.aNewSoundElement = document.querySelector('.aNewSound')
  this.aNewSoundLink = document.querySelector('.aNewSoundLT')
  this.scrolledDown = false;
  this.aNewSoundLink.addEventListener('click', () => {
    this.aNewSoundLinkClick();
  });


  this.weAreHereElement = document.querySelector('.weAreHere');
  this.scrolledDown = false;
  this.weAreHereLink = document.querySelector('.weAreHereLT')
  this.weAreHereLink.addEventListener('click', () => {
    this.weAreHereLinkClick();
  })


  this.newsTherapyElement = document.querySelector('.newsTherapy');
  this.scrolledDown = false;

  this.newsTherapyLink = document.querySelector('.newsTherapyLT')
  this.newsTherapyLink.addEventListener('click', () => {
    this.newsTherapyLinkClick();
  })


  this.surpriseMeElement = document.querySelector('.surpriseMe');
  this.scrolledDown = false;
  this.surpriseMeLink = document.querySelector('.surpriseMeLT')
  this.surpriseMeLink.addEventListener('click', () => {
    this.surpriseMeLinkClick();
  })


  this.inlabSchibstedHeaderElement = document.querySelector('#schibstedHeader');
  this.inlabSchibstedHeaderLink = document.querySelector('#endTopButton');
  this.inlabSchibstedHeaderLink.addEventListener('click', () => { 
    this.inlabSchibstedHeaderLinkClick();
  })





    this.onResize({
      sizes: this.sizes,
    });

    this.group.setParent(this.scene);
  }
  /*

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
  }*/


  onArrowSchibstedContainerClick() {
    const overviewRect = this.inlabSchibstedConceptOverviewElement.getBoundingClientRect();
    
    const scrollToEndOfOverview = this.scrollContent.scrollTop + overviewRect.bottom - window.innerHeight;

    if (!this.scrolledDown) {
        this.scrolledDown = true;
        GSAP.to(this.scrollContent, {
            scrollTop: scrollToEndOfOverview, // Using scrollTop instead of y
            duration: 0.5,
            ease: "expo.inOut",
            onComplete: () => {
                this.scrolledDown = false;
                // Additional behavior here if needed
            },
        });
    }
}
newsBoxCurationLinkClick() {
  const newsBoxRect = this.newsBoxCurationElement.getBoundingClientRect();
  const offsetPercentage = 10; 
  const offsetPixels = (offsetPercentage / 100) * window.innerHeight;
  const scrollToEndOfNewsBoxCuration = this.scrollContent.scrollTop + newsBoxRect.top + offsetPixels; // Subtracting the offset

  if (!this.scrolledDown) {
      this.scrolledDown = true;
      GSAP.to(this.scrollContent, {
          scrollTop: scrollToEndOfNewsBoxCuration,
          duration: 0,
          ease: "expo.inOut",
          onComplete: () => {
              this.scrolledDown = false;
              // Additional behavior here if needed
          },
      });
  }
}



pointOfViewLinkClick () {
  const pointOfViewRect = this.pointOfViewElement.getBoundingClientRect();
  const offsetPercentage = 10; 
  const offsetPixels = (offsetPercentage / 100) * window.innerHeight;
  const scrollToEndOfPointOfView = this.scrollContent.scrollTop + pointOfViewRect.top + offsetPixels;

  if (!this.scrolledDown) {
    this.scrolledDown = true;
    GSAP.to(this.scrollContent, {
        scrollTop: scrollToEndOfPointOfView, // Using scrollTop instead of y
        duration: 0,
        ease: "expo.inOut",
        onComplete: () => {
            this.scrolledDown = false;
            // Additional behavior here if needed
        },
    });
}


}

aNewSoundLinkClick() {
  const aNewSoundRect = this.aNewSoundElement.getBoundingClientRect();
  const offsetPercentage = 10;
  const offsetPixels = (offsetPercentage / 100) * window.innerHeight;
  const scrollToEndOfaNewSound = this.scrollContent.scrollTop + aNewSoundRect.top + offsetPixels; 

  if (!this.scrolledDown) {
    this.scrolledDown = true;
    GSAP.to(this.scrollContent, {
        scrollTop: scrollToEndOfaNewSound, // Using scrollTop instead of y
        duration: 0,
        ease: "expo.inOut",
        onComplete: () => {
            this.scrolledDown = false;
            // Additional behavior here if needed
        },
    });
  }
}


weAreHereLinkClick() { 
  const weAreHereRect = this.weAreHereElement.getBoundingClientRect();
  const offsetPercentage = 10;
  const offsetPixels = (offsetPercentage / 100) * window.innerHeight;
  const scrollToEndOfweAreHere = this.scrollContent.scrollTop + weAreHereRect.top + offsetPixels;

  if (!this.scrolledDown) {
    this.scrolledDown = true;
    GSAP.to(this.scrollContent, {
        scrollTop: scrollToEndOfweAreHere, // Using scrollTop instead of y
        duration: 0,
        ease: "expo.inOut",
        onComplete: () => {
            this.scrolledDown = false;
            // Additional behavior here if needed
        },
    });
  
  }
}


newsTherapyLinkClick() { 
  const newsTherapyRect = this.newsTherapyElement.getBoundingClientRect();
  const offsetPercentage = 10;
  const offsetPixels = (offsetPercentage / 100) * window.innerHeight;
  const scrollToEndOfNewsTherapy = this.scrollContent.scrollTop + newsTherapyRect.top + offsetPixels; 

  if (!this.scrolledDown) {
    this.scrolledDown = true;
    GSAP.to(this.scrollContent, {
        scrollTop: scrollToEndOfNewsTherapy, // Using scrollTop instead of y
        duration: 0,
        ease: "expo.inOut",
        onComplete: () => {
            this.scrolledDown = false;
            // Additional behavior here if needed
        },
    });
  }
}


surpriseMeLinkClick() {
  const surpriseMeRect = this.surpriseMeElement.getBoundingClientRect();
  const offsetPercentage = 10; 
  const offsetPixels = (offsetPercentage / 100) * window.innerHeight;
  const scrollToEndOfSurpriseMe = this.scrollContent.scrollTop + surpriseMeRect.top + offsetPixels; 

  if (!this.scrolledDown) {
    this.scrolledDown = true;
    GSAP.to(this.scrollContent, {
        scrollTop: scrollToEndOfSurpriseMe, // Using scrollTop instead of y
        duration: 0,
        ease: "expo.inOut",
        onComplete: () => {
            this.scrolledDown = false;
            // Additional behavior here if needed
        },
    });
  }
}

inlabSchibstedHeaderLinkClick () {

  const inlabSchibstedHeaderRect = this.inlabSchibstedHeaderElement.getBoundingClientRect();

  const scrollToEndOfinlabSchibstedHeader = this.scrollContent.scrollTop + inlabSchibstedHeaderRect.top;
  
  if (!this.scrolledDown) {
    this.scrolledDown = true;
    GSAP.to(this.scrollContent, {
      scrollTop: scrollToEndOfinlabSchibstedHeader,
      duration: 0,
      ease: "expo.inOut",
      onComplete: () => {
        this.scrolledDown = false;
        // Additional behavior here if needed
        },
    });
  }
}


  onResize(e) {
    // this.galleryBounds = this.galleryElement.getBoundingClientRect();
    this.sizes = e.sizes;
    // this.faceMan
    /* this.gallerySizes = {
       width: (this.galleryBounds.width / window.innerWidth) * this.sizes.width,
       height: (this.galleryBounds.height / window.innerHeight) * this.sizes.height,
     };
 */
    this.scroll.x = this.x.target = 0;
    this.scroll.y = this.y.target = 0;

    //  map(this.medias, (media) => media.onResize(e, this.scroll));

  }

  onTouchDown({ x, y }) {
    this.speed.target = 1;

    this.scrollCurrent.x = this.scroll.x;
    this.scrollCurrent.y = this.scroll.y;
  }

  onTouchMove({ x, y }) {
    const xDistance = x.start - x.end;
    const yDistance = y.start - y.end;

    this.x.target = this.scrollCurrent.x - xDistance;
    this.y.target = this.scrollCurrent.y - yDistance;
  }

  onWheel({ pixelX, pixelY }) {
    this.x.target += pixelX;
    this.y.target += pixelY;
  }

  onTouchUp({ x, y }) {
    this.speed.target = 0;
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

    /* map(this.medias, (media, index) => {
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
 */
  }

  hide() {
    //map(this.galleries, (gallery) => gallery.hide());
  }

  destroy() {
    this.scene.removeChild(this.group);

  }
}

