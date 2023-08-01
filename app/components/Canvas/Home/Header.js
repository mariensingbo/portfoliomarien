import * as THREE from 'three';
import * as OrbitControls from '../../../../shared/src/three/OrbitControls.js';
import * as dat from '../../../../shared/src/three/dat.gui.module.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import gsap from 'src/gsap-core.js';
import { Elastic } from 'src/gsap-core.js';


class Header {
  constructor({ gl, scene, sizes}) {

    this.headerCanvas = document.createElement('canvas');
    this.gl = gl;
    this.scene = scene;
    this.sizes = sizes;
    this.headerCanvas.width = sizes.width;
    this.headerCanvas.height = sizes.height;
    this.headerCanvas.classList.add('header-canvas'); //
    const headerWrapper = document.querySelector('.header__wrapper');
    headerWrapper.appendChild(this.headerCanvas);
    this.gl = this.headerCanvas.getContext('webgl');

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onResize = this.onResize.bind(this);

    this.dpr = window.devicePixelRatio || 1;


    this.scene = new THREE.Scene();
    this.pointer = new THREE.Vector2();


    /*this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };*/

    this.init();
  }

  init() {
    this.getScaleFactor()
    this.setupModels();
    this.setupLights();
    this.setupCamera();
    this.setupRenderer();
    this.addEventListeners();
    this.loop();
  }

  setupModels() {
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('src/three/Loaders/draco/');
    this.gltfLoader = new GLTFLoader();
    this.mesh = null;

    this.gltfLoader.load(
      'https://prismic-io.s3.amazonaws.com/mariensingbo/e765e072-22c6-4c3b-a13a-ce04ff0ef1bf_MarienSingbo_0004.glb',
      (gltf) => {
        gltf.scene.traverse((node) => {
          if (node.isMesh) this.mesh = node;
        });

        this.mesh.morphTarget = true;
        this.scene.add(this.mesh);
        this.mesh.morphTargetInfluences[0] = 0;

        // Move model to top left corner
        this.mesh.position.set(0, 0, -75);

        // Adjust camera to frame model
        this.camera.position.set(0, 0, 2);
        this.camera.rotation.set(0, 0, 0);

        // Update model scale
        this.updateModelScale();
        this.animateModelScale();

      }
    );
  }

  getScaleFactor() {
    const width = this.sizes.width;

    // You can adjust these ranges as per your needs
    if (width <= 600) {
      // Phones (0-600px)
      return width / 1080;
    } else if (width <= 900) {
      // Tablets (601-900px)
      return width / 1440;
    } else {
      // Desktops (Above 900px)
      return width / 2160;
    }
  }

updateModelScale() {
  if (this.mesh) {
    let scaleFactor;

    if (window.innerWidth <= 768) {  // Assuming tablet width <= 768px
      scaleFactor = Math.min(
        this.sizes.width / 540,   // Change these values to suit your tablet's model scaling
        this.sizes.height / 960
      );
    } else {
      scaleFactor = Math.min(
        this.sizes.width / 1080,
        this.sizes.height / 1080
      );
    }

    this.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
  }
}


updateModelScale() {
  if (this.mesh) {
    const scaleFactor = this.getScaleFactor();
    this.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
  }
}

animateModelScale() {
  if (this.mesh) {
    const scaleFactor = this.getScaleFactor();
    gsap.fromTo(
      this.mesh.scale,
      { x: 0, y: 0, z: 0 },
      {
        duration: 1.5,
        x: scaleFactor,
        y: scaleFactor,
        z: scaleFactor,
        ease: Elastic.easeOut.config(0.6, 0.30, false),
      }
    );
  }
}

  setupLights() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0);
    this.scene.add(this.ambientLight);
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0 );
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.set(1024, 1024);
    this.directionalLight.shadow.camera.far = 5;
    this.directionalLight.shadow.camera.left = -7;
    this.directionalLight.shadow.camera.top = 7;
    this.directionalLight.shadow.camera.right = 7;
    this.directionalLight.shadow.camera.bottom = -7;
    this.directionalLight.position.set(-10, 1, -10);
    this.scene.add(this.directionalLight);
  }

  setupCamera() {
  this.camera = new THREE.PerspectiveCamera();
  this.camera.position.z = 5;
  this.camera.lookAt([0, 0, 0]);

    this.camera.position.set(0, 0, 3);
    this.scene.add(this.camera);

    // Raycaster
    this.raycaster = new THREE.Raycaster();
  }

  onMouseMove(event) {
    this.pointer.x = (event.clientX / this.sizes.width) * 2 - 1;
    this.pointer.y = -(event.clientY / this.sizes.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    const intersects = this.raycaster.intersectObject(this.mesh);

    if (intersects.length > 0) {
      gsap.to(this.mesh.morphTargetInfluences, {
        duration: 0.5,
        0: 1,
        ease: 'back.out',
      });
    } else {
      gsap.to(this.mesh.morphTargetInfluences, {
        duration: 0.5,
        0: 0,
        ease: 'bounce.out',
      });
    }
  }

  onTouchStart() {
    gsap.to(this.mesh.morphTargetInfluences, {
      duration: 0.5,
      0: 1,
      ease: 'back.out',
    });
  }

  onTouchEnd() {
    gsap.to(this.mesh.morphTargetInfluences, {
      duration: 0.5,
      0: 0,
      ease: 'bounce.out',
    });
  }

  onResize({sizes}) {
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;

    this.headerCanvas.width = window.innerWidth;
    this.headerCanvas.height = window.innerHeight;


    this.camera.aspect = sizes.width / sizes.height;
    this.camera.fov = 35; // Adjust the field of view as needed
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));

    this.updateModelScale();
  }




  addEventListeners() {
    window.addEventListener('mousemove', (event) => this.onMouseMove(event));
    window.addEventListener('touchstart', () => this.onTouchStart());
    window.addEventListener('touchend', () => this.onTouchEnd());
    window.addEventListener('resize', () => this.onResize());
  }

  setupRenderer() {


    this.renderer = new THREE.WebGLRenderer({
      canvas: this.headercanvas,
      context: this.gl,
      antialias: true,
      alpha: true,
    });

    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    this.renderer.setClearColor(0x0500a3, 0);
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  loop() {
    window.requestAnimationFrame(() => this.loop());

    this.renderer.render(this.scene, this.camera);
  }

   // ... (other methods)
   update() {
    // Add any update logic here if required
  }


  destroy() {
    // Remove the header canvas from its parent element
    this.renderer.forceContextLoss();
    this.renderer.dispose();

    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('resize', this.onResize);

    // Stop animations
    gsap.killTweensOf(this.mesh.scale);
    gsap.killTweensOf(this.mesh.morphTargetInfluences);

    // Remove objects from the scene
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }

    this.scene.remove(this.ambientLight);
    this.scene.remove(this.directionalLight);
    this.scene.remove(this.camera);

    const headerWrapper = document.querySelector('.header__wrapper');
    if (headerWrapper) {
      headerWrapper.removeChild(this.headerCanvas);
    } else {
      console.warn("The '.header__wrapper' element was not found.");
    }
  }

}

export default Header;
