import { slice } from 'lodash';
import Sketch from './module2.js'
import gsap from 'src/gsap-core.js'
import * as THREE from 'three';
//import { Vector2 } from 'three';


export default class ProcessGallery {
  constructor(options) {
    // Add event listeners for mouse events
    this.mouse = null;
    this.pairedMeshes = [];
    this.mesh = [];
    this.sketch = [];
    this.meshes = [];
    this.elems = []
    this.intersectedMesh = []
    this.hoveredMesh = null;
    this.raycaster = new THREE.Raycaster();
    this.debounce = null;
    this.intersect = null;
    this.indicators = [];
    this.screenCategory = [];
    this.animationFrameId = null;  // Add this line

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    // Added active mesh index to keep track of current active mesh
    this.lastURL = window.location.pathname;
    // Start the URL polling loop
    this.pollURLChange();
    this.activeMeshIndex = 0;
    let lastActiveMeshIndex = null;

    // Add event listeners
    let sketch = new Sketch({
      dom: document.getElementById("container2"),
    });

    this.sketch = sketch;
    let attractMode = false
    let attractTo = 0

    let speed = 0
    let scale = 1
    let position = 0
    let rounded = 0
    let block = document.getElementById('block')
    let wrap = document.getElementById('negrospaceprogram__wrap')
    let elems = [...document.querySelectorAll('.o')]

    let element = document.querySelector('.o');

    window.addEventListener('wheel', (e) => {
      speed += e.deltaY * 0.0003
    })

    let objs = Array(5).fill({ dist: 0 })

    window.addEventListener("wheel", (e) => {
      if (window.innerWidth > 1024) {
        // For desktop
        speed += e.deltaY * 0.0003;
      } 

      if (window.innerWidth <= 1024) {
        // Duplicate the code inside the block for "768" here
        speed += e.deltaX * 0.0003;
      }
    
      
      else {
        // For mobile
        speed += e.deltaX * 0.0003;
      }
    });

    wrap.addEventListener('touchstart', onTouchStart, false),
    wrap.addEventListener('touchmove', onTouchMove, false);
    wrap.addEventListener('touchend', onTouchEnd, false);
    element.addEventListener('mousemove', onMouseMove.bind(this));

    const debouncedMouseMove = debounce(onMouseMove, 200); // 100ms debounce time

    wrap.addEventListener('mousemove', debouncedMouseMove.bind(this));

    // Initialize a variable to keep track of the last position
    let lastPosition = 0;
    this.raf = null;
    let raf = function(){
      position += speed;
      speed *= 0.8;

      let lowerLimit = 0;
      let upperLimit = elems.length - 1;

      position = Math.max(lowerLimit, Math.min(upperLimit, position));

      objs.forEach((o, i) => {
        o.dist = Math.min(Math.abs(position - i), 1);
        o.dist = 1 - o.dist ** 2;
        let opacity = o.dist;
        elems[i].style.opacity = opacity;

        // Updated target position setting code
        let targetY, targetX;
        if (window.innerWidth <= 1024) { // Mobile
          targetX = (i * 1.5 - position * 1.5) * 100;
          targetY = 0;

          // Multiply by the same value used for mobile elems[i] spacing
        } else { // Desktop
          targetY = (i * 1.2 - position * 1.2) * 100;
          targetX = 0;
        }

        if (window.innerWidth <= 1024) {
          // For mobile
          gsap.to(elems[i], {
            duration: 0.5,
            onUpdate: () => {
              elems[i].style.transform = `translate(${targetX}px, ${targetY}px) scale(4)`;
            },
            ease: "power4.easeIn ",
          });
          sketch.meshes[i].position.x = i * 1.5 - position * 1.5;
        } else {
          // For desktop
          gsap.to(elems[i], {
            duration: 0.5,
            onUpdate: () => {
              elems[i].style.transform = `translateY(${targetY}px) scale(4)`;
            },
            ease: "power4.easeIn ",
          });
          sketch.meshes[i].position.y = i * 1.2 - position * 1.2;
        }

        if (sketch.meshes[i]?.material?.uniforms?.distanceFromCenter) {
          sketch.meshes[i].material.uniforms.distanceFromCenter.value = o.dist;
        }
      });

      rounded = Math.round(position);
      let diff = rounded - position;

      if (attractMode) {
        position += -(position - attractTo) * 0.04;
      } else {
        position += Math.sign(diff) * Math.pow(Math.abs(diff), 0.7) * 0.035;
        if (window.innerWidth > 1024) {
          // For desktop
          wrap.style.transform = `translate(0, ${-position * 100 + 50}px)`;
        } else {
          // For mobile
          wrap.style.transform = `translate(${-position * 100 + 50}px, 0)`;
        }
      }

        this.activeMeshIndex = rounded;  // Update the active mesh index

        // If the active mesh index has changed and there was an active mesh previously
        if (lastActiveMeshIndex !== null && lastActiveMeshIndex !== this.activeMeshIndex) {
          let lastActiveMesh = this.sketch.meshes[lastActiveMeshIndex];

          // If the last active mesh has a video that is playing
          if (lastActiveMesh.userData.playing) {
            lastActiveMesh.userData.video.pause();  // Pause the video
            lastActiveMesh.userData.playing = false;  // Update the playing status

            gsap.to(lastActiveMesh.userData.material.uniforms.uBlendFactor, {
              duration: 0.5,
              value: 0,
              onComplete: () => {
                lastActiveMesh.userData.video.currentTime = 0;
                lastActiveMesh.userData.material.uniforms.uUseVideo.value = false;
                lastActiveMesh.userData.material.uniforms.uBlendFactor.value = 0;
              },
            });
          }
        }

        lastActiveMeshIndex = this.activeMeshIndex;  // Update the last active mesh index

        this.indicators.forEach((indicator, i) => {
          if (i === this.activeMeshIndex) {
              indicator.style.backgroundColor = '#FFFFFF'; // Fill the circle if it's the active mesh
          } else {
              indicator.style.backgroundColor = 'transparent'; // Otherwise, make it transparent
          }
      });
        this.rafId = window.requestAnimationFrame(raf);
  }.bind(this);


  let touchStartX = 0;
  let touchEndX = 0;

  function onTouchStart(event) {
    touchStartX = event.touches[0].clientX;
  }

  function onTouchMove(event) {
    touchEndX = event.touches[0].clientX;
    let touchDeltaX = touchStartX - touchEndX;
    speed += touchDeltaX * 0.005; // Adjust this value to control the sensitivity of touch scrolling
    touchStartX = touchEndX;
  }

  function onTouchEnd(event) {
    if (window.innerWidth <= 1024) {
      // For mobile
      attractTo = Math.round(position * 1.5); // Multiply by the same value used for mobile elems[i] spacing
    } else {
      // For desktop
      attractTo = Math.round(position);
    }

  }


  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }



  function onMouseMove(event) {
    this.mouse = new THREE.Vector2();
    this.mouse.x = (event.clientX / this.sketch.width) * 2 - 1;
    this.mouse.y = -(event.clientY / this.sketch.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.sketch.meshes);

    if (intersects.length > 0 && intersects[0].object === this.sketch.meshes[rounded]) {
     // console.log(this.sketch.meshes[rounded])
      this.intersectedMesh = intersects[0].object;
      this.hoveredMesh = intersects[0].object;

      if (!this.intersectedMesh.userData.playing || this.hoveredMesh.userData.playing === false || this.intersectedMesh.userData.video.ended || this.intersectedMesh.userData.video.paused)  {
        this.intersectedMesh.userData.video.currentTime = 0;  // Reset video to the beginning
        this.intersectedMesh.userData.video.play();
        this.intersectedMesh.userData.playing = true;
        this.intersectedMesh.userData.material.uniforms.uUseVideo.value = true;

        gsap.to(this.intersectedMesh.userData.video, {
          duration: 3,
          volume: 1
        });

        gsap.to(this.intersectedMesh.userData.material.uniforms.uBlendFactor, {
          duration: 0.5,
          value: 1
        });
      }

      this.sketch.hoveredMesh = this.intersectedMesh;

      if (this.gsapFadeOut) {
        this.gsapFadeOut.kill();
      }

    } else {
      if (this.hoveredMesh && this.hoveredMesh.userData && this.hoveredMesh.userData.playing && this.hoveredMesh === this.sketch.meshes[rounded]) {

        this.hoveredMesh.userData.video.pause();  // Pause the video
        this.hoveredMesh.userData.playing = false;  // Update the playing status

        this.gsapFadeOut = gsap.to(this.hoveredMesh.userData.material.uniforms.uBlendFactor, {
          duration: 0.5,
          value: 0,
          onComplete: () => {
            this.hoveredMesh.userData.video.currentTime = 0;
            this.hoveredMesh.userData.material.uniforms.uUseVideo.value = false;
            this.hoveredMesh.userData.material.uniforms.uBlendFactor.value = 0;
          },
        });
      }

      this.hoveredMesh = null;
    }
  }




  raf();


  let navs = [...document.querySelectorAll('li')]
  let nav = document.querySelector('.processGallery')

  let rots = sketch.groups.map((e) => e.rotation)
 // console.log(rots) // here
  nav.addEventListener('mouseenter', () => {
    attractMode = true
    gsap.to(rots, {
      duration: 0.3,
      x: -0.5,
      y: 0,
      z: 0,
    })
  })

  nav.addEventListener('mouseleave', () => {
    attractMode = false
    gsap.to(rots, {
      duration: 0.3,
      x: -0.3,
      y: -0.5,
      z: -0.1,
    })
  })

  navs.forEach((el) => {
    el.addEventListener('mouseover', (e) => {
      attractTo = Number(e.target.getAttribute('data-gallery'))
      //console.log('attractTo ', attractTo)
    })
  })

  this.indicators = [];

  const indicatorContainer = document.getElementById('indicator-container');

  for (let i = 0; i < this.sketch.meshes.length; i++) {
    let indicator = document.createElement('div');
    indicator.className = 'indicator';
    indicatorContainer.appendChild(indicator);
    this.indicators.push(indicator);
  
    // Add an event listener for the click event on the indicator
    indicator.addEventListener('click', () => {
      this.attractMesh(i); // Call your method to attract the mesh
    });
  }
}

attractMesh = function(index) {
  if (typeof index === 'number') {
    attractMode = true; // Enable the attraction mode
    attractTo = index; // Set the attractTo value based on the given index

    // Perform a gsap animation or other operations that you want to execute when attracting to a specific mesh
    gsap.to(rots, {
      duration: 0.3,
      x: -0.5,
      y: 0,
      z: 0,
    });

    // If you need to update other variables or trigger other actions, you can do it here
  } else {
    console.error('Invalid index provided to attractMesh method');
  }
};

pollURLChange() {
  const currentURL = window.location.pathname;

  // If the URL has changed from the home page
  if (this.lastURL === '/' && currentURL !== '/') {
    this.stopVideo();
  }

  // Update the lastURL variable
  this.lastURL = currentURL;

  // Continue polling with a 500ms interval
  setTimeout(() => this.pollURLChange(), 500);
}
stopVideo() {
  if (this.intersectedMesh && this.intersectedMesh.userData && this.intersectedMesh.userData.playing) {
    this.intersectedMesh.userData.video.pause();
    this.intersectedMesh.userData.playing = false;

    this.gsapFadeOut = gsap.to(this.intersectedMesh.userData.material.uniforms.uBlendFactor, {
      duration: 0.5,
      value: 0,
      onComplete: () => {
        this.intersectedMesh.userData.video.currentTime = 0;
        this.intersectedMesh.userData.material.uniforms.uUseVideo.value = false;
        this.intersectedMesh.userData.material.uniforms.uBlendFactor.value = 0;
      },
    });
  }
}

stop = () => {
  if (this.requestID) {
    window.cancelAnimationFrame(this.requestID);
    this.requestID = null;
  }
}

destroy() {
this.stop();
if (this.rafId) {
  window.cancelAnimationFrame(this.rafId);
  this.rafId = null;
}
// Remove event listeners
window.removeEventListener('wheel', this.onWheel);  // Assuming you have an 'onWheel' method
window.removeEventListener('resize', this.onResize);  // Assuming you have an 'onResize' method
let wrap = document.getElementById('wrap');
if (wrap) {
  wrap.removeEventListener('touchstart', this.onTouchStart);  // Assuming you have an 'onTouchStart' method
  wrap.removeEventListener('touchmove', this.onTouchMove);  // Assuming you have an 'onTouchMove' method
  wrap.removeEventListener('touchend', this.onTouchEnd);  // Assuming you have an 'onTouchEnd' method
}

// Dispose of THREE.js objects
this.raycaster = null;
this.camera = null;

this.raycaster = null;
if (this.camera) {
  this.camera = null; // Assuming you don't need to dispose of anything specific in the camera
}

if (this.sketch) {
  this.sketch.dispose(); // Assuming the Sketch class has a dispose method
}

if (this.meshes) {
  this.meshes.forEach(mesh => {
    if (mesh.material) {
      mesh.material.dispose();
    }
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
  });
}

this.meshes = [];
this.intersectedMesh = null;
this.hoveredMesh = null;
}







}



