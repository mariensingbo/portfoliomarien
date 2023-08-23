import * as THREE from 'three';
import { Plane, Transform } from 'ogl';
import map from 'lodash/map';
// import HeaderVideo from './headerVideo.js'
import GSAP from 'gsap';
// import { ScrollTrigger, ScrollToPlugin } from "gsap/ScrollTrigger";
import ProcessGallery from './processGallery.js';
import { CharacterMorphTarget } from './Character_webcam/character_webcam.js';
// import  faceMan from './face__man.js';

// GSAP.registerPlugin(ScrollTrigger);

window.webcamState = {
  isOn: false
};

export default class {
  constructor({ gl, scene, sizes }) {
    this.gl = gl;
    this.scene= scene;
    this.sizes = sizes;
    this.height = sizes.height;

    this.group = new Transform();
    // this.faceMan = new faceMan ({ gl: this.gl, scene: this.scene, sizes: this.sizes });

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

    fetch('animations/qhOvqDR60b.json')
    .then(response => response.json())
    .then(data => {
        this.animation = lottie.loadAnimation({
            container: document.getElementById('lottie-animation'), // replace with your container ID
            renderer: 'svg',
            loop: false,
            autoplay: false,
            animationData: data
        });

        this.animation.addEventListener('DOMLoaded', () => {
          this.playAnimation();
      });

      // Replay the animation 3 seconds after it has completed
      this.animation.addEventListener('complete', () => {
          setTimeout(() => {
              this.playAnimation();
          }, 3000); // 3000 ms = 3 seconds
      });

        this.animation.setSpeed(0.75); // 0.5 for half speed
    })
    .catch(error => {
        console.error('Error:', error);
    });



      // create


    this.scrollIndex = 0;
    this.animating = false;  // new flag to track if an animation is currently running
    this.scrollContainer = document.querySelector('.scrollContainer');
    this.scrollContent = document.querySelector('.scrollContent');

   // this.faceManElements = document.querySelector('.theNegroSpaceProgram__wrapper')
    this.caseElement = document.querySelector('.case');
    this.conceptElement = document.querySelector('.concept');
    this.contextElement = document.querySelector('.context');
    this.processElement = document.querySelector('.process');
    this.resultsElement = document.querySelector('.results');
    this.creditsElement = document.querySelector('.credits');



    this.prefaceTitleElement = document.querySelector('.preface_Title');
    this.prefaceTitleElement2 = document.querySelector('.preface_Title2');

    this.manifestoTextElement = document.querySelector('.manifesto_text1');
    this.manifestoTextElement = document.querySelector('.manifesto_text2');
    this.manifestoTextElement = document.querySelector('.manifesto_text3');
    this.poemTextElement = document.querySelector('.poem')
    this.characterCanvasElement = document.querySelector('.character__canvas');


    this.animaticElement = document.querySelector('.storyboard__Title');
    this.animaticElement2 = document.querySelector('#arrow2Animatic');

    this.assetsElement = document.querySelector('.menu__ac');
    this.assetsElement2 = document.querySelector('#arrow2ToAssets')

    this.tryFaceRigElement = document.querySelector('.tryFaceRig');
    this.leaveFaceRigElement = document.querySelector('.leaveFaceRig');
    this.backtoContextElement = document.querySelector('#arrowBackToContext');
    this.backtoContextElement2 = document.querySelector('#arrow2BackToContext');

    this.arrowBackToProcessElement = document.querySelector('#arrowBackToProcess');
    this.arrowToNextSlideElement = document.querySelector('#arrowToNextSlide');

    this.arrowBackToGalleryElement = document.querySelector('#arrowBackToGallery');
    this.arrowToCreditsElement = document.querySelector('#arrowToCredits');

    this.arrowToResultsElement = document.querySelector('#arrowBackToResults') ;
    this.arrowToScreeningElement = document.querySelector('#arrowToResults');

    this.prefaceTitleElement.addEventListener('click', () => this.onPrefaceTitleClick());
    this.prefaceTitleElement2.addEventListener('click', () => this.onPrefaceTitleClick2());
    

    this.animaticElement.addEventListener('click', () => this.onAnimaticClick());
    this.animaticElement2.addEventListener('click', () => this.onAnimaticClick());


    this.assetsElement.addEventListener('click', () => this.onAssetsClick());
    this.assetsElement2.addEventListener('click', () => this.onAssetsClick());

    this.backtoContextElement.addEventListener('click', () => this.onBacktoContextClick());
    this.backtoContextElement2.addEventListener('click', () => this.onBacktoContextClick());

    this.arrowBackToProcessElement.addEventListener('click', () => this.onArrowBackToProcess());
    this.arrowToNextSlideElement.addEventListener('click', () => this.onArrowToNextSlide());
    this.tryFaceRigElement.addEventListener('click', () => this.onTryFaceRigClick());
    this.leaveFaceRigElement.addEventListener('click', () => this.onGoBackClick());
    this.creditsElement.addEventListener('click', () => this.onCreditsClick());
    this.arrowBackToGalleryElement.addEventListener('click', () => this.onBackToGalleryClick());
    this.arrowToCreditsElement.addEventListener ('click', () => this.onArrowToScreeningClick());
    this.scrollContainer.addEventListener('wheel', (e) => this.onScroll(e));

    window.addEventListener('webcamStateChange', (event) => {
      this.isWebcamOn = event.detail.isWebcamOn;
      this.isWebcamManuallyStopped = event.detail.isWebcamManuallyStopped;

    });


    this.scrolledDown = false;
    this.scrolledRight = false;  // Add this line

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

    this.scroll = {
      x: 0,
      y: 0,
    };

    this.speed = {
      current: 0,
      target: 0,
      lerp: 0.1,
    };


  this.canvas = document.createElement('canvas');
  // set canvas size
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
  // append the canvas to the DOM
  document.body.appendChild(this.canvas);

  // Set the WebGLRenderer to use the created canvas
  this.renderer = new THREE.WebGLRenderer({gl: this.gl, canvas: this.canvas });

    this.onResize({
      sizes: this.sizes,
    });
    this.group.setParent(this.scene);

    this.characterMorphTargetInstance = null;


    this.show();
  }
createGeometry() {
    this.geometry = new Plane(this.gl, {
      heightSegments: 20,
      widthSegments: 20,
    });
}
show() {
map(this.medias, (media) => media.show());
}
hide() {
map(this.medias, (media) => media.hide());
}
playAnimation() {
this.animation.goToAndPlay(0, true);
}
onResize(e) {

    this.sizes = e.sizes;
    // this.height = this.sizes.height;
    this.scroll.x = this.x.target = 0;
    this.scroll.y = this.y.target = 0;
   // `+ this.faceMan.onResize(e);

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
onTouchUp({ x, y }) {
    this.speed.target = 0;
}
onPrefaceTitleClick() {
    const caseRect = this.contextElement.getBoundingClientRect();
    const scrollToEndOfCase = caseRect.bottom - window.innerHeight;

    if (!this.scrolledDown) {
        this.animating = true;
        this.scrolledDown = true;
        GSAP.to(this.scrollContent, {
            y: -scrollToEndOfCase,
            duration: 1,
            ease: "expo.inOut",
            onComplete: () => {
                this.animating = false;
                this.prefaceTitleElement.classList.add('active', 'no-hover');
                

                // Added staggered animation

            },
        });
    } else {
        this.animating = true;
        this.scrolledDown = false;
        GSAP.to(this.scrollContent, {
          y: 0,
          duration: 1,
          ease: "expo.inOut",
          onComplete: () => {
              this.animating = false;
              this.prefaceTitleElement.classList.remove('active', 'no-hover');



                // Reverse staggered animation

            },
        });
    }
      // List all your manifesto text classes here
      let manifestoClasses = ['manifesto_text1', 'manifesto_text2', 'manifesto_text3'];

      // Iterate over each class
      manifestoClasses.forEach(function(manifestoClass) {
          // Get the manifesto text and split by <br>
          let manifestoText = $('.' + manifestoClass).html();
          let lines = manifestoText.split('<br>');

          // Clear the original content
          $('.' + manifestoClass).html('');

          // Iterate over lines and create a new div for each one
          $.each(lines, function(i, line) {
              $('.' + manifestoClass).append('<div style="display: none;">' + line + '</div>');
          });

          // Variables for delay and stagger
          let delay = 500;    // This is the delay for the first line, in milliseconds
          let stagger = 50;  // This is how much each subsequent line will be delayed more than the previous one

          // Sequentially animate each line with a stagger
          $('.' + manifestoClass + ' div').each(function(i) {
              $(this).delay(delay + stagger * i).fadeIn(1500);
          });
      });
}
onPrefaceTitleClick2() {
    const scrollToConcept = this.conceptElement.getBoundingClientRect().left;

    if (!this.scrolledDown) {  // it's already scrolled up, proceed with x-axis scrolling
        if (Math.abs(this.scroll.x) < 1) {
            this.animating = true;
            this.scrolledRight = true;
            GSAP.to(this.scrollContent, {
                x: -scrollToConcept,
                duration: 1,
                ease: "expo.inOut",
                onComplete: () => {
                    this.animating = false;
                },
            });
        } else {
            this.animating = true;
            this.scrolledRight = false;
            GSAP.to(this.scrollContent, {
                x: 0,
                duration: 1,
                ease: "expo.inOut",
                onComplete: () => {
                    this.animating = false;
                },
            });
        }
    } else {  // need to scroll up before proceeding with x-axis scrolling
        const caseRect = this.contextElement.getBoundingClientRect();
        const scrollToEndOfCase = caseRect.top - window.innerHeight;

        this.animating = true;
        this.scrolledDown = false;
        GSAP.to(this.scrollContent, {
            y: 0,
            duration: 1,
            ease: "expo.inOut",
            onComplete: () => {
                this.animating = false;
                this.prefaceTitleElement.classList.remove('active', 'no-hover');

                // Trigger x-axis scrolling after y-axis scrolling completes
                if (Math.abs(this.scroll.x) < 1) {
                    this.animating = true;
                    this.scrolledRight = true;
                    GSAP.to(this.scrollContent, {
                        x: -scrollToConcept,
                        duration: 1,
                        ease: "expo.inOut",
                        onComplete: () => {
                            this.animating = false;
                        },
                    });
                } else {
                    this.animating = true;
                    this.scrolledRight = false;
                    GSAP.to(this.scrollContent, {
                        x: 0,
                        duration: 1,
                        ease: "expo.inOut",
                        onComplete: () => {
                            this.animating = false;
                            GSAP.to(this.poemTextElement, {
                              autoAlpha: 0,
                              duration: 1,
                              stagger: 0.1, // This will create a 0.1 second delay between each line
                          });
                        },
                    });
                }
            },
        });
    }
    let poemText = $('.poem').html();
    let lines = poemText.split('<br>');

    // Clear the original content
    $('.poem').html('');

    // Iterate over lines and create a new div for each one
    $.each(lines, function(i, line) {
        $('.poem').append('<div style="display: none;">' + line + '</div>');
    });

    // Define the initial delay and the stagger increment
    let delay = 1000;    // This is the delay for the first line, in milliseconds
    let stagger =70;  // This is how much each subsequent line will be delayed more than the previous one

    // Sequentially animate each line with a stagger
    $('.poem div').each(function(i) {
        $(this).delay(delay + stagger * i).fadeIn(1500);
    });
}

onAnimaticClick() {
  // Identify the element or section you want to scroll to when animatic is clicked
  // Replace '.desiredElement' with the selector of your target element
  const caseRect = this.contextElement.getBoundingClientRect();
  const scrollToEndOfCase = caseRect.bottom - window.innerHeight;
  if (!this.scrolledDown) {
      this.animating = true;
      this.scrolledDown = true;
      GSAP.to(this.scrollContent, {
        y: -scrollToEndOfCase,
          duration: 1,
          ease: "expo.inOut",
          onComplete: () => {
              this.animating = false;
              this.animaticElement.classList.add('active', 'no-hover');
          },
      });
  } else {
      this.animating = true;
      this.scrolledDown = false;
      GSAP.to(this.scrollContent, {
          y: 0,
          duration: 1,
          ease: "expo.inOut",
          onComplete: () => {
              this.animating = false;
              this.animaticElement.classList.remove('active', 'no-hover');
          },
      });
  }
}

onAssetsClick() {
  const processRect = this.processElement.getBoundingClientRect();
  const scrollToEndOfProcess = processRect.right;

  if (!this.scrolledDown) {  // it's already scrolled up, proceed with x-axis scrolling
    if (Math.abs(this.scroll.x) < 1) {
        this.animating = true;
        this.scrolledRight = true;
        GSAP.to(this.scrollContent, {
            x: -scrollToEndOfProcess,
            duration: 1,
            ease: "expo.inOut",
            onComplete: () => {
                this.animating = false;
            },
        });
    } else {
        this.animating = true;
        this.scrolledRight = false;
        GSAP.to(this.scrollContent, {
            x: 0,
            duration: 1,
            ease: "expo.inOut",
            onComplete: () => {
                this.animating = false;
            },
        });
    }
  } else {  // need to scroll up before proceeding with x-axis scrolling
    const caseRect = this.contextElement.getBoundingClientRect();
    const scrollToEndOfCase = caseRect.bottom - window.innerHeight;

    this.animating = true;
    this.scrolledDown = false;
    GSAP.to(this.scrollContent, {
        y: 0,
        duration: 1,
        ease: "expo.inOut",
        onComplete: () => {
            this.animating = false;
            this.prefaceTitleElement.classList.remove('active', 'no-hover');

            // Trigger x-axis scrolling after y-axis scrolling completes
            if (Math.abs(this.scroll.x) < 1) {
                this.animating = true;
                this.scrolledRight = true;
                GSAP.to(this.scrollContent, {
                    x: -scrollToEndOfProcess,
                    duration: 1,
                    ease: "expo.inOut",
                    onComplete: () => {
                        this.animating = false;
                    },
                });
            } else {
                this.animating = true;
                this.scrolledRight = false;
                GSAP.to(this.scrollContent, {
                    x: 0,
                    duration: 1,
                    ease: "expo.inOut",
                    onComplete: () => {
                        this.animating = false;
                    },
                });
            }
        },
    });
  }
}

onBacktoContextClick() {
  const caseRect = this.contextElement.getBoundingClientRect();
  const scrollToRightOfCase = caseRect.right;

  if (this.scrolledDown) {
    // Scroll up first
    this.animating = true;
    this.scrolledDown = false;
    GSAP.to(this.scrollContent, {
      y: 0,
      duration: 1,
      ease: "expo.inOut",
      onComplete: () => {
        this.animating = false;
        this.prefaceTitleElement.classList.remove('active', 'no-hover');
        // Now scroll right
        this.animating = true;
        this.scrolledRight = true;
        GSAP.to(this.scrollContent, {
          x: -scrollToRightOfCase,
          duration: 1,
          ease: "expo.inOut",
          onComplete: () => {
            this.animating = false;
          },
        });
      },
    });
  } else if (Math.abs(this.scroll.x) < 1) { // If not scrolled down and also not scrolled right
    this.animating = true;
    this.scrolledRight = true;
    GSAP.to(this.scrollContent, {
      x: -scrollToRightOfCase,
      duration: 1,
      ease: "expo.inOut",
      onComplete: () => {
        this.animating = false;
      },
    });
  }
}

onArrowBackToProcess() {
  const conceptRect = this.processElement.getBoundingClientRect();
  const scrollToRightOfConcept = conceptRect.right;

  if (this.scrolledDown) {
    // Scroll up first
    this.animating = true;
    this.scrolledDown = false;
    GSAP.to(this.scrollContent, {
      y: 0,
      duration: 1,
      ease: "expo.inOut",
      onComplete: () => {
        this.animating = false;
        this.arrowBackToProcessElement.classList.remove('active', 'no-hover');
        // Now scroll right
        this.animating = true;
        this.scrolledRight = true;
        GSAP.to(this.scrollContent, {
          x: -scrollToRightOfConcept,
          duration: 1,
          ease: "expo.inOut",
          onComplete: () => {
            this.animating = false;
          },
        });
      },
    });
  } else if (Math.abs(this.scroll.x) < 1) { // If not scrolled down and also not scrolled right
    this.animating = true;
    this.scrolledRight = true;
    GSAP.to(this.scrollContent, {
      x: -scrollToRightOfConcept,
      duration: 1,
      ease: "expo.inOut",
      onComplete: () => {
        this.animating = false;
      },
    });
  }


}

onArrowToNextSlide() {
  const processRect = this.resultsElement.getBoundingClientRect();
  const scrollToEndOfProcess = processRect.right+ window.innerWidth;

  if (!this.scrolledDown) {  // it's already scrolled up, proceed with x-axis scrolling
    if (Math.abs(this.scroll.x) < 1) {
        this.animating = true;
        this.scrolledRight = true;
        GSAP.to(this.scrollContent, {
            x: -scrollToEndOfProcess,
            duration: 1,
            ease: "expo.inOut",
            onComplete: () => {
                this.animating = false;
            },
        });
    } else {
        this.animating = true;
        this.scrolledRight = false;
        GSAP.to(this.scrollContent, {
            x: 0,
            duration: 1,
            ease: "expo.inOut",
            onComplete: () => {
                this.animating = false;
            },
        });
    }
  } else {  // need to scroll up before proceeding with x-axis scrolling
    const caseRect = this.contextElement.getBoundingClientRect();
    const scrollToEndOfCase = caseRect.bottom - window.innerHeight;

    this.animating = true;
    this.scrolledDown = false;
    GSAP.to(this.scrollContent, {
        y: 0 ,
        duration: 1,
        ease: "expo.inOut",
        onComplete: () => {
            this.animating = false;
            this.prefaceTitleElement.classList.remove('active', 'no-hover');

            // Trigger x-axis scrolling after y-axis scrolling completes
            if (Math.abs(this.scroll.x) < 1) {
                this.animating = true;
                this.scrolledRight = true;
                GSAP.to(this.scrollContent, {
                    x: -scrollToEndOfProcess,
                    duration: 1,
                    ease: "expo.inOut",
                    onComplete: () => {
                        this.animating = false;
                    },
                });
            } else {
                this.animating = true;
                this.scrolledRight = false;
                GSAP.to(this.scrollContent, {
                    x: 0,
                    duration: 1,
                    ease: "expo.inOut",
                    onComplete: () => {
                        this.animating = false;
                    },
                });
            }
        },
    });
  }

}

onTryFaceRigClick() {
this.characterCanvas = document.createElement('canvas3');
this.characterCanvasElement.appendChild(this.characterCanvas);

// Start the CharacterMorphTarget instance
this.characterMorphTargetInstance = new CharacterMorphTarget({
  gl: this.gl,
  scene: this.scene,
  sizes: this.sizes,
  canvas: this.characterCanvas,
});



  this.renderer = new THREE.WebGLRenderer({
    gl: this.gl,
    canvas: this.webcamCharacterCanvas,
    antialias: true,
    alpha: true,
  });


  const canvasRect = this.characterCanvasElement.getBoundingClientRect();
  const scrollToEndOfCanvas = canvasRect.bottom - window.innerHeight;

  this.animating = true;
  this.scrolledDown = true;
  GSAP.to(this.scrollContent, {
    y: -scrollToEndOfCanvas,
    duration: 1,
    ease: "expo.inOut",
    onComplete: () => {
        this.animating = false;
    },
  });
}
onGoBackClick() {
  // Stop the CharacterMorphTarget instance
  if (this.characterMorphTargetInstance) {
    this.characterMorphTargetInstance.lightDispose();
    this.characterMorphTargetInstance = null;
  }

  this.animating = true;
  this.scrolledDown = false;

  GSAP.to(this.scrollContent, {
    y: 0,
    duration: 1,
    ease: "expo.inOut",
    onComplete: () => {
        this.animating = false;
        if (this.isWebcamOn) {
            window.dispatchEvent(new CustomEvent('stopWebcam'));
        }
        // Remove the canvas
        if (this.characterCanvas) {
          this.characterCanvasElement.removeChild(this.characterCanvas);
          this.characterCanvas = null;
        }
    },
  });
}


onBackToGalleryClick () {

const scrollBackToProcess = this.creditsElement.getBoundingClientRect();
const scrollBackToProcessRect = scrollBackToProcess.right;


if (Math.abs(this.scroll.x) < 1) { // If not scrolled right
  this.animating = true;
  this.scrolledRight = true;
  GSAP.to(this.scrollContent, {
    x: -scrollBackToProcessRect,
    duration: 1,
    ease: "expo.inOut",
    onComplete: () => {
      this.animating = false;
    },
  });
}



}

onArrowToScreeningClick () {
  const scrollBackToProcess = this.creditsElement.getBoundingClientRect();
  const scrollBackToProcessRect = scrollBackToProcess.right + 2 * window.innerWidth;


  if (Math.abs(this.scroll.x) < 1) { // If not scrolled right
    this.animating = true;
    this.scrolledRight = true;
    GSAP.to(this.scrollContent, {
      x: -scrollBackToProcessRect,
      duration: 1,
      ease: "expo.inOut",
      onComplete: () => {
        this.animating = false;
      },
    });
  }

}





onScroll(e) {
  /*
  e.preventDefault();
  if (this.animating) {
      return;
  }

  const caseRect = this.contextElement.getBoundingClientRect();
  const scrollToEndOfCase = caseRect.bottom - window.innerHeight;

  if (e.deltaY > 0) {
      this.scrollIndex++;
  } else if (e.deltaY < 0 && this.scrollIndex > 0) {
      this.scrollIndex--;
  }

  if (this.scrollIndex === 1 && !this.scrolledDown) {
      this.animating = true;
      this.scrolledDown = true;
      GSAP.to(this.scrollContent, {
          y: -scrollToEndOfCase,
          duration: 1,
          ease: "expo.inOut",
          onComplete: () => {
              this.animating = false;
              this.prefaceTitleElement.classList.add('active', 'no-hover');
              this.animaticElement.classList.add('active', 'no-hover');
          },
      });
  } else if (this.scrollIndex !== 1 && this.scrolledDown) {
      const targetScrollY = this.scrollIndex * this.height;
      this.animating = true;
      this.scrolledDown = false;
      GSAP.to(this.scrollContent, {
          y: -targetScrollY,
          duration: 1,
          ease: "expo.inOut",
          onComplete: () => {
              this.animating = false;
              this.prefaceTitleElement.classList.remove('active', 'no-hover');
              this.animaticElement.classList.remove('active', 'no-hover');
          },
      });
  }
*/
}





  onWheel({ pixelX, pixelY }) {
    this.scrollContainer.scrollLeft += pixelX;
    this.scrollContainer.scrollTop += pixelY;
  }


  // Update

  update() {
    this.speed.current = GSAP.utils.interpolate(this.speed.current, this.speed.target, this.speed.lerp); // prettier-ignore

    this.x.current = GSAP.utils.interpolate( this.x.current, this.x.target, this.x.lerp ); // prettier-ignore
    this.y.current = GSAP.utils.interpolate( this.y.current, this.y.target, this.y.lerp ); // prettier-ignore

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
    this.scroll.x = this.scrollContainer.scrollLeft;
    this.scroll.y = this.scrollContainer.scrollTop;
   // this.faceMan.update();


  }


  destroy() {
    this.prefaceTitleElement.removeEventListener('click', this.onPrefaceTitleClick);
    this.animaticElement.removeEventListener('click', this.onAnimaticClick);
    this.prefaceTitleElement.addEventListener('click', () => this.onPrefaceTitleClick());
    this.prefaceTitleElement2.addEventListener('click', () => this.onPrefaceTitleClick2());
    this.animaticElement.addEventListener('click', () => this.onAnimaticClick());
    this.animaticElement2.addEventListener('click', () => this.onAnimaticClick());
    this.assetsElement.addEventListener('click', () => this.onAssetsClick());
    this.assetsElement2.addEventListener('click', () => this.onAssetsClick());
    this.backtoContextElement.addEventListener('click', () => this.onBacktoContextClick());
    this.backtoContextElement2.addEventListener('click', () => this.onBacktoContextClick());
    this.arrowBackToProcessElement.addEventListener('click', () => this.onArrowBackToProcess());
    this.arrowToNextSlideElement.addEventListener('click', () => this.onArrowToNextSlide());
    this.tryFaceRigElement.addEventListener('click', () => this.onTryFaceRigClick());
    this.leaveFaceRigElement.addEventListener('click', () => this.onGoBackClick());
    this.creditsElement.addEventListener('click', () => this.onCreditsClick());
    this.arrowBackToGalleryElement.addEventListener('click', () => this.onBackToGalleryClick());
    this.arrowToCreditsElement.addEventListener ('click', () => this.onArrowToScreeningClick());


    window.removeEventListener('webcamStateChange', this.webcamStateChangeCallback);
    this.scene.removeChild(this.group);

    if (this.characterMorphTargetInstance) {
        this.characterMorphTargetInstance.dispose();
    }
    document.body.removeChild(this.canvas);

    if (this.characterCanvas) {
      document.body.removeChild(this.characterCanvas);
    }
    this.renderer.dispose();
    this.group = null;
    this.canvas = null;
    this.scene = null;


}

}

let character_webcamInstance;
function initCharacter_webcam() {
  if (!character_webcamInstance) {
    character_webcamInstance = new CharacterMorphTarget({
      dom: document.getElementById("canvasContainer"),
    });
  }
}

function destroyCharacterMorphTarget () {
  if (character_webcamInstance) {
    character_webcamInstance.dispose();
    character_webcamInstance = null;
  }
};

export const Character_webcamInit = {
  initCharacter_webcam: initCharacter_webcam,
  destroyCharacterMorphTarget : destroyCharacterMorphTarget,
};





let processGalleryInstance;
function initProcessGallery() {
  if (!processGalleryInstance) {
    processGalleryInstance = new ProcessGallery({
      dom: document.getElementById("container"),
    });
  }
}

function destroyProcessGallery() {
if (processGalleryInstance) {
    processGalleryInstance.destroy();
    processGalleryInstance = null;
  }};

export const ProcessGalleryInit = {
    initProcessGallery: initProcessGallery,
    destroyProcessGallery: destroyProcessGallery,
  };
;
// Homepage
