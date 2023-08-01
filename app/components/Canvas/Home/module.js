import * as dat from '../../../../shared/src/three/dat.gui.module.js';
import { OrbitControls } from 'src/three/OrbitControls.js';
import * as THREE from 'three';
import { RGB, Scene, Vector2 } from 'three';
import gsap from 'src/gsap-core.js'
import { findIndex } from 'lodash';


const vertexShader = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vUv = uv;

    float displacementY = cos(position.y * 0.5 + uTime) * 0.05;
    float displacementZ = sin(position.y * 0.5 + uTime) * 0.05;

    vec3 newPosition = position + vec3(0.0, normal.y * displacementY, normal.z * displacementZ);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
uniform sampler2D uImageTexture;
uniform sampler2D uVideoTexture;
uniform bool uUseVideo;
uniform float uBlendFactor;
uniform float uOpacity;

varying vec2 vUv;

void main() {
  vec4 imageColor = texture2D(uImageTexture, vUv);
  vec4 videoColor = texture2D(uVideoTexture, vUv);
  vec4 finalColor = mix(imageColor, videoColor, uBlendFactor);
  gl_FragColor = vec4(finalColor.rgb, finalColor.a * uOpacity);
}
`;




class Sketch {
  constructor(options) {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.clock = new THREE.Clock();

    this.elems=[]
    this.scene = new THREE.Scene();
    this.container = options.dom;

    this.renderer = new THREE.WebGLRenderer({
       gl: this.gl,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.useLegacyLights = true;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );


    this.width = window.innerWidth;
    this.height = window.innerHeight
    this.camera.position.set(0, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.mouse= []
    this.userData = []
    this.time = 0;
    this.isPlaying = true;
    this.groups = [];
    this.materials = [];
    this.meshes = [];
    this.handleImages();
    this.handleResponsiveness();
    this.resize();
    this.render();
    this.setupResize();
    this.animationFrameId = null;





    this.soundOn = true;
    this.initLottieAnimation();
    this.initSoundEventListener();
  }

  initLottieAnimation() {
    this.lottieAnimation = lottie.loadAnimation({
      container: document.getElementById('sound'), // the dom element where the animation will take place
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: 'animations/AudioAnimation.json' // the path to the animation json
    });

    this.lottieAnimation.setSpeed(1); // set the animation speed
  }

  initSoundEventListener() {
    this.soundElement = document.getElementById('sound');
    this.soundElementClickListener = () => {
      if (this.soundOn) {
        this.lottieAnimation.playSegments([0, 60], true);
        this.soundOn = false;
      } else {
        this.lottieAnimation.playSegments([60, 90], true);
        this.soundOn = true;
      }

      // Mute or unmute sound for all video elements
      this.meshes.forEach((mesh) => {
        if (mesh.userData.video) {
          mesh.userData.video.muted = !this.soundOn;
        }
      });
    };

    this.soundElement.addEventListener('click', this.soundElementClickListener);
  }

handleImages() {
  const loader = new THREE.TextureLoader();

  const elems = [];
  const imageTextures = [];
  const videoElements = [];
  const videoTextures = [];

  for (let i = 0; i < 5; i++) {
    imageTextures.push(loader.load(`../img/${i}.jpg`));

    const video = document.createElement('video');
    video.src = `../img/${i}.mp4`;
    video.load();
    video.loop = true;
    video.muted = false;
    videoElements.push(video);

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    videoTextures.push(texture);
  }

  for (let i = 0; i < 5; i++) {
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uImageTexture: { value: imageTextures[i] },
        uVideoTexture: { value: videoTextures[i] },
        uOpacity: { value: 1 },
        uTime: { value: 1 },
        uUseVideo: { value: false },
        uBlendFactor: { value: 0 },

      },
    });

    //const elem = document.createElement('div');
    //lem.style.position = 'relative';
    //elem.style.width = '100%';
    //elem.style.height = '100%';

    //elems.push(material);
    this.materials.push(material);

    let geo = new THREE.PlaneGeometry(1.5, 1, 20, 20);
    let mesh = new THREE.Mesh(geo, material);
    let group = new THREE.Group();

    mesh.userData = {
      material: material,
      video: videoElements[i],
      playing: false
    };

    group.add(mesh);

    this.groups.push(group);
    this.meshes.push(mesh);
    this.scene.add(group);

    mesh.position.y = i * 1.2;

    group.rotation.y = -0.5;
    group.rotation.x = -0.3;
    group.rotation.z = - 0.1;

    if (window.innerWidth <= 768) {
      // For mobile
      mesh.position.x = i * 1.2;
      mesh.position.y = 0;
    }
   // console.log(this.meshes)
  }
}



  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.handleResponsiveness();
  }


  stop() {
    this.isPlaying = false;
  }

  play() {
    if (!this.isPlaying) {
      this.render();
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.01;


    this.materials.forEach(material => {
      material.uniforms.uTime.value = this.time;
    });




    this.rafId = requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }


  handleResponsiveness() {
    const width = window.innerWidth;

    if (width <= 768) {
      // Mobile devices
      this.camera.position.set(0, -0.7, 2.5); // Adjust the camera distance and position for better visibility

      // Adjust the positions of the meshes for mobile devices
      this.meshes.forEach((mesh, i) => {
        mesh.position.x = i * 1.2;
        mesh.position.y = 0;
      });
    } else if (width <= 1024) {
      // Tablets and small laptops
      this.camera.position.set(0, -0.7, 2); // Adjust the camera distance and position for better visibility

      // Adjust the positions of the meshes for tablets and small laptops
      this.meshes.forEach((mesh, i) => {
        mesh.position.x = i * 1.2;
        mesh.position.y = 0;
      });
    } else {
      // Desktop devices
      this.camera.position.set(0, 0, 2); // Default camera distance

      // Adjust the positions of the meshes for desktop devices
      this.meshes.forEach((mesh, i) => {
        mesh.position.y = i * 1.2;
        mesh.position.x = 0;
      });
    }
  }



  dispose() {
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    window.removeEventListener("resize", this.resize.bind(this));
    this.controls.dispose();

    // Remove event listener
    if (this.soundElement && this.soundElementClickListener) {
      this.soundElement.removeEventListener('click', this.soundElementClickListener);
      this.soundElementClickListener = null;
    }

    this.meshes.forEach((mesh) => {
      if (mesh.userData.video) {
        mesh.userData.video.pause(); // stop video playback
        mesh.userData.video.src = "";
        mesh.userData.video.load(); // reset video state
      }
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      if (mesh.material.map) {
        mesh.material.map.dispose();
      }
      mesh.material.dispose();
      this.scene.remove(mesh);
    });
    this.meshes = [];
    this.renderer.forceContextLoss();
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);

    // destroy lottie animation
    if (this.lottieAnimation) {
      this.lottieAnimation.destroy();
      this.lottieAnimation = null;
    }
  }


}

export default Sketch;
