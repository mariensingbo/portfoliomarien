import { slice } from 'lodash';
import Sketch from './module.js'
import gsap from 'src/gsap-core.js'
import * as THREE from 'three';
import { Vector2 } from 'three';


export default class Worknav {
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
      dom: document.getElementById("container"),
    });

    this.sketch = sketch;
    let attractMode = false
    let attractTo = 0

    let speed = 0
    let scale = 1
    let position = 4
    let rounded = 0
    let block = document.getElementById('block')
    let wrap = document.getElementById('wrap')
    let elems = [...document.querySelectorAll('.n')]

    let element = document.querySelector('.n');

    window.addEventListener('wheel', (e) => {
      speed += e.deltaY * 0.0003
    })

    let objs = Array(5).fill({ dist: 0 })

    window.addEventListener("wheel", (e) => {
      if (window.innerWidth > 768) {
        // For desktop
        speed += e.deltaY * 0.0003;
      } else {
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
    let rafId = null
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
        if (window.innerWidth <= 768) { // Mobile
          targetX = (i * 1.5 - position * 1.5) * 100;
          targetY = 0;

          // Multiply by the same value used for mobile elems[i] spacing
        } else { // Desktop
          targetY = (i * 1.2 - position * 1.2) * 100;
          targetX = 0;
        }

        if (window.innerWidth <= 768) {
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
        if (window.innerWidth > 768) {
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

        rafId = window.requestAnimationFrame(raf);
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
    if (window.innerWidth <= 768) {
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
  let nav = document.querySelector('.nav')

  let rots = sketch.groups.map((e) => e.rotation)
//  console.log(rots) // here
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
      attractTo = Number(e.target.getAttribute('data-nav'))
      //console.log('attractTo ', attractTo)
    })
  })
}

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



dispose() {
  // Stop the animation loop if it's running

  // Remove event listeners
  // Assuming you have an 'onResize' method
  let wrap = document.getElementById('wrap');
  if (wrap) {
    wrap.removeEventListener('touchstart', this.onTouchStart);  // Assuming you have an 'onTouchStart' method
    wrap.removeEventListener('touchmove', this.onTouchMove);  // Assuming you have an 'onTouchMove' method
    wrap.removeEventListener('touchend', this.onTouchEnd);  // Assuming you have an 'onTouchEnd' method
  }

  // Dispose of THREE.js objects
  this.raycaster = null;
  this.camera = null;

  // Assuming sketch.meshes is an array of THREE.Mesh objects
  this.sketch.meshes.forEach((mesh) => {
    mesh.geometry.dispose();  // Dispose of the mesh's geometry
    mesh.material.dispose();  // Dispose of the mesh's material
  });

  // Force context loss on WebGL renderer if one exists in sketch


  // Dispose of other resources
  this.sketch.dispose();  // Assuming there is a dispose method in sketch class
  gsap.killTweensOf('*');  // Stop all GSAP animations
}

}

