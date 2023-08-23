
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
      context: this.gl,
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

    this.currentPlayingIndex = null;

    let navs = document.querySelectorAll('.processContainer');
    navs.forEach((nav, index) => {
      nav.addEventListener('click', () => this.handleNavsClick(index));
    });

    // Listen to scroll events
    window.addEventListener('scroll', this.handleScroll.bind(this));
    this.rafId = null;
  }

handleImages() {
  const loader = new THREE.TextureLoader();

  const elems = [];
  const imageTextures = [];
  const videoElements = [];
  const videoTextures = [];

  for (let i = 0; i < 5; i++) {
    imageTextures.push(loader.load(`../img/Process/${i}.jpg`));

    const video = document.createElement('video');
    video.src = `../img/Process/${i}.mp4`;
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
  }
}


updateLayout() {
  this.width = this.container.offsetWidth;
  this.height = this.container.offsetHeight;
  this.renderer.setSize(this.width, this.height);
  this.camera.aspect = this.width / this.height;
  this.camera.updateProjectionMatrix();

  const width = window.innerWidth;

  if (width <= 768) {
    // Mobile devices
    this.camera.position.set(0, -0.7, 2.32); // Adjust the camera distance and position for better visibility
    this.groups.forEach((group, i) => {
      this.meshes[i].position.x = i * 0;
      this.meshes[i].position.y = 0;
      group.rotation.y = 0;
      group.rotation.x = 0;
      group.rotation.z = 0;
    });


    
  } else if (width <= 1024) {
    // Mobile devices
    this.camera.position.set(0, -0.7, 2.32); // Adjust the camera distance and position for better visibility
    this.groups.forEach((group, i) => {
      this.meshes[i].position.x = i * 0;
      this.meshes[i].position.y = 0;
      group.rotation.y = 0;
      group.rotation.x = 0;
      group.rotation.z = 0;
    });

  } else {
    // Desktop devices
    this.camera.position.set(0, -0.1, 1.5); // Default camera distance
    this.groups.forEach((group, i) => {
      this.meshes[i].position.y = i * 1.2;
      group.rotation.y = -0.5;
      group.rotation.x = -0.3;
      group.rotation.z = -0.1;
    });
  }
}

setupResize() {
  window.addEventListener("resize", this.updateLayout.bind(this));
}

  resize() {
    this.updateLayout();
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

  handleNavsClick(index) {
    if (this.currentPlayingIndex !== null) {
      if (this.currentPlayingIndex === index) {
        // same index was clicked again, so stop and reset the video and fade back to image
        this.stopAndResetVideo(this.currentPlayingIndex);
      } else {
        // a different index was clicked, so stop and reset the previous video and fade back to image
        this.stopAndResetVideo(this.currentPlayingIndex);
        // then start playing the new video and fade to it
        this.startAndFadeInVideo(index);
      }
    } else {
      // nothing was playing, so start playing the new video and fade to it
      this.startAndFadeInVideo(index);
    }
  }

  startAndFadeInVideo(index) {
    // start playing the video
    this.meshes[index].userData.video.play();

    // fade in the video texture over the image texture
    gsap.to(this.materials[index].uniforms.uBlendFactor, {
      value: 1,
      duration: 1,
      onComplete: () => {
        // set the uUseVideo uniform value to true after the video texture is fully visible
        this.materials[index].uniforms.uUseVideo.value = true;
      }
    });

    // update the currentPlayingIndex to the new index
    this.currentPlayingIndex = index;
  }

  stopAndResetVideo(index) {
    // stop the video
    this.meshes[index].userData.video.pause();
    // reset the video time
    this.meshes[index].userData.video.currentTime = 0;

    // fade back to the image texture
    gsap.to(this.materials[index].uniforms.uBlendFactor, {
      value: 0,
      duration: 1,
      onComplete: () => {
        // set the uUseVideo uniform value to false after the image texture is fully visible
        this.materials[index].uniforms.uUseVideo.value = false;
      }
    });

    // set the currentPlayingIndex to null
    this.currentPlayingIndex = null;
  }

  handleScroll() {
    // when scrolling, stop and reset the currently playing video if any
    if (this.currentPlayingIndex !== null) {
      this.stopAndResetVideo(this.currentPlayingIndex);
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
      this.camera.position.set(0, -0.7, 2.32); // Adjust the camera distance and position for better visibility
    } else {
      // Desktop devices
      this.camera.position.set(0, -0.1, 1.5); // Default camera distance
    }
  }

  dispose() {

    // Dispose materials and geometries
    this.materials.forEach((mat) => mat.dispose());
    this.meshes.forEach((mesh) => {
      mesh.geometry.dispose();
      if (mesh.userData.video) {
        mesh.userData.video.pause();
        // If there are any event listeners on video, remove them here.
      }
    });

    // Dispose textures
    this.materials.forEach(material => {
      if (material.map) material.map.dispose();
      if (material.lightMap) material.lightMap.dispose();
      if (material.bumpMap) material.bumpMap.dispose();
      if (material.normalMap) material.normalMap.dispose();
      if (material.specularMap) material.specularMap.dispose();
      if (material.envMap) material.envMap.dispose();
    });

    // Dispose controls
    if (this.controls && this.controls.dispose) {
      this.controls.dispose();
    }

    // Remove event listeners
    window.removeEventListener('resize', this.resize.bind(this));
    window.removeEventListener('scroll', this.handleScroll.bind(this));

    let navs = document.querySelectorAll('.processContainer');
    navs.forEach((nav, index) => {
      nav.removeEventListener('click', () => this.handleNavsClick(index));
    });

    // Clean up scene
    while(this.scene.children.length > 0){
      this.scene.remove(this.scene.children[0]);
    }
    this.meshes = [];
    // Dispose renderer and remove the canvas
    this.renderer.forceContextLoss()
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Nullify camera and scene
    this.camera = null;
    this.scene = null;
  }

}

export default Sketch;
