

// keep the imports and global constants outside the class, they can be reused
//import { OrbitControls } from 'three-addons/node_modules/three/a/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

import { GUI } from 'three-addons/node_modules/three/examples/js/libs/dat.gui.min';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module';
import * as dat from 'dat.gui';
import vision from '@mediapipe/tasks-vision';
const { FaceLandmarker, FilesetResolver } = vision;

const blendshapesMap = {
'browDownRight': '00__browDownRight',
'browDownLeft': '01__browDownLeft',
'browInnerUp': '02__browInnerUp',
'browOuterUpRight': '03__browOuterUpRight',
'browOuterUpLeft': '04__browOuterUpLeft',
'cheekPuff': '05__cheekPuff',
'cheekSquintLeft': '06__cheekSquintLeft',
'cheekSquintRight': '07__cheekSquintRight',
'eyeBlinkLeft': '08__eyeBlinkLeft',
'eyeBlinkRight': '09__eyeBlinkRight',
'eyeLookDownLeft': '10__eyeLookdownLeft',
'eyeLookDownRight': '11__eyeLookdownRight',
'eyeLookInLeft': '12__eyeLookInLeft',
'eyeLookInRight': '13__eyeLookInRight',
'eyeLookOutLeft': '14__eyeLookOutLeft',
'eyeLookOutRight': '15__eyeLookOutRight',
'eyeLookUpLeft': '16__eyeLookUpLeft',
'eyeLookUpRight': '17__eyeLookUpRight',
'eyeSquintLeft': '18__eyeSquintLeft',
'eyeSquintRight': '19__eyeSquintRight',
'eyeWideLeft': '20__eyeWideLeft',
'eyeWideRight': '21__eyeWideRight',
'jawForward': '22__jawForward',
'jawLeft': '23__jawLeft',
'jawOpen': '24__mouthOpen',
'jawRight': '25__jawRight',
'mouthClose': '26__mouthClosed',
'mouthDimpleRight': '27__mouthDimpleRight',
'mouthDimpleLeft': '28__mouthDimpleLeft',
'mouthFrownLeft': '29__mouthFrownLeft',
'mouthFrownRight': '30__mouthFrownRight',
'mouthFunnel': '31__mouthFunnel',
'mouthLeft': '32__mouthLeft',
'mouthLowerDownLeft': '33__mouthLowerDownLeft',
'mouthLowerDownRight': '34__mouthLowerDownRight',
'mouthPressLeft': '35__mouthPressLeft',
'mouthPressRight': '36__mouthPressRight',
'mouthPucker': '37__mouthPucker',
'mouthRight': '38__mouthRight',
'mouthRollLower': '39__mouthRollLower',
'mouthRollUpper': '40__mouthRollUpper',
'mouthShrugLower': '41__mouthShrugLower',
'mouthShrugUpper': '42__mouthShrugUpper',
'mouthSmileLeft': '43__mouthSmileLeft',
'mouthSmileRight': '44__mouthSmileRight',
'mouthStretchLeft': '45__mouthStretchLeft',
'mouthStretchRight': '46__mouthStretchRight',
'mouthUpperUpLeft': '47__mouthUpperLeft',
'mouthUpperUpRight': '48__mouthUpperRight',
'noseSneerLeft': '49__noseSneerLeft',
'noseSneerRight': '50__noseSneerRight',
}


export class CharacterMorphTarget {
  constructor({gl, scene, sizes}) {
    this.gl = gl;
    this.scene = scene;
    this.sizes = sizes;

    this.guide = null;

    this.webcamCharacterCanvas = document.createElement('canvas');
    this.webcamCharacterCanvas.id = 'characterWebcam'
    const webcamCharacterWrapper = document.querySelector('.character__canvas');

    this.dpr = window.devicePixelRatio || 1;

    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.webcamCharacterCanvas,
      antialias: true,
      alpha: true,
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    webcamCharacterWrapper.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 100);
    this.camera.position.z = 30;

    this.scene = new THREE.Scene(); // Ensure the scene is initialized before the lights
    this.initLights();

    this.scene.scale.x = 1;

    this.animation = this.animation.bind(this);

    this.init();
  }




  async init() {


    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('src/three/loaders/draco/'); // adjust this path accordingly

    // Initialize loading text
    document.getElementById('loading-text').innerHTML = "Loading Face-rig: 0%";

    new GLTFLoader()
    .setMeshoptDecoder(MeshoptDecoder)
    .load(
      'model/finalcharacterNoTangents.gltf',
      (gltf) => {
        const mesh = gltf.scene.children[0];
        mesh.rotation.set(Math.PI, 0, Math.PI);

        const scale = getScaleByDevice();
        mesh.scale.set(scale, scale, scale);

        this.scene.add(mesh);

        const head = mesh.getObjectByName('Man');
        const radianAngle = Math.PI; // 90 degrees in radians

        this.guide = new GUI();
        this.guide.close();

        const influences = head.morphTargetInfluences;
        for (const [key, value] of Object.entries(head.morphTargetDictionary)) {
          this.guide.add(influences, value, 0, 1, 0.01)
            .name(key.replace('blendShape1.', ''))
            .listen(influences);
        }

        const caseElement = document.querySelector('.case');
        caseElement.appendChild(this.guide.domElement);

        this.renderer.setAnimationLoop(() => this.animation());

        // fade out loading text
        const loadingText = document.getElementById('loading-text');
        loadingText.style.transition = 'opacity 1.0s linear';
        loadingText.style.opacity = '0';


      },
      (xhr) => {
        const percentage = (xhr.loaded / xhr.total) * 100;
        document.getElementById('loading-text').innerHTML = `Loading Face-rig: ${percentage.toFixed(2)}%`;
      }
    );

  function getScaleByDevice() {
    const width = window.innerWidth;

    if (width > 1024) {
      // Desktop
      return 7;
    } else if (width <= 1024 && width > 768) {
      // Tablet
      return 4;
    } else {
      // Phone
      return 4;
    }
  }

      this.video = document.createElement('video');
      this.texture = new THREE.VideoTexture(this.video);
      this.texture.colorSpace = THREE.SRGBColorSpace;

      this.roundedRectShape = new THREE.Shape();

      this.video = document.createElement('video');

      const texture = new THREE.VideoTexture(this.video);
      texture.colorSpace = THREE.SRGBColorSpace;
      const geometry = new THREE.PlaneGeometry(0.5, 0.5);
      const material = new THREE.MeshBasicMaterial({ map: texture, depthWrite: false, depthTest: false });
      this.videomesh = new THREE.Mesh(geometry, material);

      this.scene.add(this.videomesh);



    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
    );

    this.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU'
      },
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
      runningMode: 'VIDEO',
      numFaces: 1
    });

    const startButton = document.createElement('button');
    startButton.innerText = 'Start Webcam';
    startButton.className = 'startWebcamButton';

    // Append the button to the '.character__canvas' element
    const parentElement = document.querySelector('.case');
    parentElement.appendChild(startButton);

    let isWebcamOn = false;  // Initial state is off
    let stream;


    this.transform = new THREE.Object3D();
    let isWebcamManuallyStopped = false
    startButton.addEventListener('click', async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          if (!isWebcamOn) {
            // Start the webcam
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            this.video.srcObject = stream;
            this.video.play();
            // Change the button text to 'Stop Webcam'
            startButton.innerText = 'Stop Webcam';
            // Change the webcam state to on
            isWebcamOn = true;
            isWebcamManuallyStopped = false;
            // Dispatch a custom event to notify that the webcam has started
            window.dispatchEvent(new CustomEvent('webcamStateChange', { detail: { isWebcamOn: true } }));
          } else {
            // Stop the webcam
            this.video.srcObject.getTracks().forEach(track => track.stop());
            this.video.srcObject = null;
            // Change the button text to 'Start Webcam'
            startButton.innerText = 'Start Webcam';
            // Change the webcam state to off
            isWebcamOn = false;
            isWebcamManuallyStopped = true;  // Webcam is manually stopped

            // Dispatch a custom event to notify that the webcam has stopped
            window.dispatchEvent(new CustomEvent('webcamStateChange', { detail: { isWebcamOn: false } }));
          }
        } catch (error) {
          console.error('Unable to access the camera/webcam.', error);
        }
      }
    });


    window.addEventListener('stopWebcam', () => {
      if (isWebcamOn) {
        // Stop the webcam
        this.video.srcObject.getTracks().forEach(track => track.stop());
        this.video.srcObject = null;
        // Change the button text to 'Start Webcam'
        startButton.innerText = 'Start Webcam';
        // Change the webcam state to off
        isWebcamOn = false;
        isWebcamManuallyStopped = true;  // Webcam is not manually stopped

        // Dispatch a custom event to notify that the webcam has stopped
        window.dispatchEvent(new CustomEvent('webcamStateChange', { detail: { isWebcamOn: false } }));
      }
    });


    window.addEventListener('resize', () => this.onWindowResize());


  }

  setDeviceSpecificSettings() {
    let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    let isTablet = (isMobile && (window.innerWidth > 800 || window.innerHeight > 800)) ? true : false;
    let isDesktop = !(isMobile || isTablet);

    if(isMobile) {
        // Mobile settings
        this.videomesh.scale.set(this.video.videoWidth / 150, this.video.videoHeight / 150);
        this.videomesh.position.set(-4.5, 3, -20);
    } else if(isTablet) {
        // Tablet settings
        this.videomesh.scale.set(this.video.videoWidth / 120, this.video.videoHeight / 120);
        this.videomesh.position.set(-17, 1.5, -20);
    } else if(isDesktop) {
        // Desktop settings
        this.videomesh.scale.set(this.video.videoWidth / 100, this.video.videoHeight / 100);
        this.videomesh.position.set(-6, 2, 0);
    }
}





  initLights() {
    this.spotLights = {
      light1: new THREE.SpotLight(0xffffff, 3, 600, Math.PI / 6, 0.1, 2),
      light2: new THREE.SpotLight(0xffffff, 3, 600, Math.PI / 6, 0.1, 2),
      light3: new THREE.SpotLight(0xffffff, 0.84, 600, Math.PI / 6, 0.1, 2),
    };

    this.spotLights.light1.position.set(-35,  15, -25);
    this.spotLights.light2.position.set(0, -6, 10);
    this.spotLights.light3.position.set(25, 50, 30);

    this.scene.add(this.spotLights.light1);
    this.scene.add(this.spotLights.light2);
    this.scene.add(this.spotLights.light3);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.84);
    this.scene.add(this.ambientLight);

    // Add light positions and intensities to GUI
     /*

    const guiFolder = this.gui.addFolder('Spot Lights');
    guiFolder.add(this.spotLights.light1.position, 'x', -50, 50).name('Light 1 X');
    guiFolder.add(this.spotLights.light1.position, 'y', -50, 50).name('Light 1 Y');
    guiFolder.add(this.spotLights.light1.position, 'z', -50, 50).name('Light 1 Z');
    guiFolder.add(this.spotLights.light1, 'intensity', 0, 6).name('Light 1 Intensity');

    guiFolder.add(this.spotLights.light2.position, 'x', -50, 50).name('Light 2 X');
    guiFolder.add(this.spotLights.light2.position, 'y', -50, 50).name('Light 2 Y');
    guiFolder.add(this.spotLights.light2.position, 'z', -50, 50).name('Light 2 Z');
    guiFolder.add(this.spotLights.light2, 'intensity', 0, 6).name('Light 2 Intensity');

    guiFolder.add(this.spotLights.light3.position, 'x', -50, 50).name('Light 3 X');
    guiFolder.add(this.spotLights.light3.position, 'y', -50, 50).name('Light 3 Y');
    guiFolder.add(this.spotLights.light3.position, 'z', -50, 50).name('Light 3 Z');
    guiFolder.add(this.spotLights.light3, 'intensity', 0, 6).name('Light 3 Intensity');

    guiFolder.add(this.ambientLight, 'intensity', 0, 2).name('Ambient Light Intensity');


    guiFolder.close();
     */
}


animation() {
  if (this.videomesh && this.video.readyState >= HTMLMediaElement.HAVE_METADATA) {
    this.videomesh.scale.x = this.video.videoWidth / 100;
    this.videomesh.scale.y = this.video.videoHeight / 100;
  }
  if (this.video.readyState >= HTMLMediaElement.HAVE_METADATA) {
    const results = this.faceLandmarker.detectForVideo(this.video, Date.now());
    if (results.facialTransformationMatrixes.length > 0) {
      const facialTransformationMatrixes = results.facialTransformationMatrixes[0].data;
      this.transform.matrix.fromArray(facialTransformationMatrixes);
      this.transform.matrix.decompose(this.transform.position, this.transform.quaternion, this.transform.scale);
      const euler = new THREE.Euler();
      euler.setFromQuaternion(this.transform.quaternion, 'XYZ');
      const headPitch = euler.x; // pitch represents rotation around Y-axis
      const headYaw = euler.y; // yaw represents rotation around X-axis
      const headRoll = euler.z; // roll represents rotation around Z-axis
      const face = this.scene.getObjectByName('Man');
      // map rotation angles to blendshape values
      // the mapping is linear for simplicity, you may want to map it differently based on your needs
      const angleToBlendValue = (angle) => Math.max(0, Math.min(1, angle / (Math.PI / 4)));
      face.morphTargetInfluences[face.morphTargetDictionary['55__headUp']] = angleToBlendValue(-headPitch);
      face.morphTargetInfluences[face.morphTargetDictionary['56__headDown']] = angleToBlendValue(headPitch);
      face.morphTargetInfluences[face.morphTargetDictionary['54__headLeft']] = angleToBlendValue(headYaw);
      face.morphTargetInfluences[face.morphTargetDictionary['51__headRight']] = angleToBlendValue(-headYaw);
      // assuming that tilting left and right corresponds to roll
      face.morphTargetInfluences[face.morphTargetDictionary['52__headTiltRight']] = angleToBlendValue(-headRoll);
      face.morphTargetInfluences[face.morphTargetDictionary['53__headTiltLeft']] = angleToBlendValue(headRoll);

      face.position.set(0, 0, 0);
    }
    if (results.faceBlendshapes.length > 0) {
      const face = this.scene.getObjectByName('Man');
      const faceBlendshapes = results.faceBlendshapes[0].categories;
      for (const blendshape of faceBlendshapes) {
        const categoryName = blendshape.categoryName;
        let score = blendshape.score;
        // If the blendshape is 'jawOpen', multiply the score by 2 to increase the strength.
        if (categoryName === 'jawOpen') {
          score *= 2;
          // Ensure the score does not exceed the maximum value of 1.
          if (score > 1) {
            score = 1;
          }
        }
        if (categoryName === 'eyeBlinkLeft') {
          score *= 1.5;
          // Ensure the score does not exceed the maximum value of 1.
          if (score > 1) {
            score = 1;
          }
        }
        if (categoryName === 'eyeBlinkRight') {
          score *= 1.5;
          // Ensure the score does not exceed the maximum value of 1.
          if (score > 1) {
            score = 1;
          }
        }
         if (categoryName === 'mouthPucker') {
          score *= 1.5;
          // Ensure the score does not exceed the maximum value of 1.
          if (score > 1) {
            score = 1;
          }
        }
        if (categoryName === 'mouthSmileLeft') {
          score *= 1.5;
          // Ensure the score does not exceed the maximum value of 1.
          if (score > 1) {
            score = 1;
          }
        }
        if (categoryName === 'mouthSmileRight') {
          score *= 1.5;
          // Ensure the score does not exceed the maximum value of 1.
          if (score > 1) {
            score = 1;
          }
        }

        if (categoryName === 'mouthShrugLower') {
          score *= 1.5;
          // Ensure the score does not exceed the maximum value of 1.
          if (score > 1) {
            score = 1;
          }
        }

        if (categoryName === 'mouthShrugUpper') {
          score *= 1.5;
          // Ensure the score does not exceed the maximum value of 1.
          if (score > 1) {
            score = 1;
          }
        }

        if (categoryName === 'mouthRollUpper') {
          score *= 1.5;
          // Ensure the score does not exceed the maximum value of 1.
          if (score > 1) {
            score = 1;
          }
        }
         if (categoryName === 'mouthRollLower') {
          score *= 1.5;
          // Ensure the score does not exceed the maximum value of 1.
          if (score > 1) {
            score = 1;
          }
        }

        if (categoryName === 'mouthFunnel') {
          score *= 1.5;
          // Ensure the score does not exceed the maximum value of 1.
          if (score > 1) {
            score = 1;
          }
        }




        const index = face.morphTargetDictionary[blendshapesMap[categoryName]];
        if (index !== undefined) {
        //  face.morphTargetInfluences[index] = score;
         face.morphTargetInfluences[index] = parseFloat(score.toFixed(2));

        }
      }
    }
  }
  this.setDeviceSpecificSettings();
  this.renderer.render(this.scene, this.camera);
  //this.controls.update();
}


  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.setDeviceSpecificSettings();


  }
  lightDispose() {
    // Dispose of material
    this.scene.traverse((object) => {
      if (object.material) {
        if (object.material.length) {
          for (let i = 0; i < object.material.length; ++i) {
            object.material[i].dispose();
          }
        } else {
          object.material.dispose();
        }
      }

      // Dispose of geometry
      if (object.geometry) {
        object.geometry.dispose();
      }

      // Dispose of textures
      if(object instanceof THREE.Mesh){
          if(object.material.map){
              object.material.map.dispose();
          }
          if(object.material.lightMap){
              object.material.lightMap.dispose();
          }
          if(object.material.bumpMap){
              object.material.bumpMap.dispose();
          }
          if(object.material.normalMap){
              object.material.normalMap.dispose();
          }
          if(object.material.specularMap){
              object.material.specularMap.dispose();
          }
          if(object.material.envMap){
              object.material.envMap.dispose();
          }
          object.material.dispose();
      }
    });

    // Dispose of lights
    Object.values(this.spotLights).forEach((light) => {
      this.scene.remove(light);
    });
    this.scene.remove(this.ambientLight);

    // Dispose of camera
    if(this.camera !== null) {
      this.camera = null;
    }

    // Dispose of video
    if(this.video && this.video.srcObject) {
      this.video.srcObject.getTracks().forEach(track => track.stop());
      this.video.srcObject = null;
    }
    //this.renderer.context = this.gl;
    this.renderer.domElement = null;
    this.faceLandmarker.close();
    // Stop the animation

    this.renderer.setAnimationLoop(null);
    this.renderer.forceContextLoss();
    this.renderer.dispose();
    this.renderer = null;

    // Remove listeners
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('stopWebcam',this.stopWebcam);
    window.onpopstate = null;

    const caseElement = document.querySelector('.case');

    // Ensure both the caseElement and guide.domElement exist before trying to remove the child
    if (caseElement && this.guide && this.guide.domElement) {
      caseElement.removeChild(this.guide.domElement);
    }

    // Clear HTML
// Clear HTML
const webcamCharacterWrapper = document.querySelector('.character__canvas');
if (webcamCharacterWrapper && this.webcamCharacterCanvas && webcamCharacterWrapper.contains(this.webcamCharacterCanvas)) {
  webcamCharacterWrapper.removeChild(this.webcamCharacterCanvas);
}

}
  dispose() {
    // Dispose of material
    this.scene.traverse((object) => {
      if (object.material) {
        if (object.material.length) {
          for (let i = 0; i < object.material.length; ++i) {
            object.material[i].dispose();
          }
        } else {
          object.material.dispose();
        }
      }

      // Dispose of geometry
      if (object.geometry) {
        object.geometry.dispose();
      }

      // Dispose of textures
      if(object instanceof THREE.Mesh){
          if(object.material.map){
              object.material.map.dispose();
          }
          if(object.material.lightMap){
              object.material.lightMap.dispose();
          }
          if(object.material.bumpMap){
              object.material.bumpMap.dispose();
          }
          if(object.material.normalMap){
              object.material.normalMap.dispose();
          }
          if(object.material.specularMap){
              object.material.specularMap.dispose();
          }
          if(object.material.envMap){
              object.material.envMap.dispose();
          }
          object.material.dispose();
      }
    });

    // Dispose of lights
    Object.values(this.spotLights).forEach((light) => {
      this.scene.remove(light);
    });
    this.scene.remove(this.ambientLight);

    // Dispose of camera
    if(this.camera !== null) {
      this.camera = null;
    }

    // Dispose of video
    if(this.video && this.video.srcObject) {
      this.video.srcObject.getTracks().forEach(track => track.stop());
      this.video.srcObject = null;
    }

    this.faceLandmarker.close();
    this.camera = null;

    //this.renderer.context = this.gl;
    this.renderer.domElement = null;

    // Stop the animation

    this.renderer.setAnimationLoop(null);
    this.renderer.forceContextLoss();
    this.renderer.dispose();

    const caseElement = document.querySelector('.case');

    // Ensure both the caseElement and guide.domElement exist before trying to remove the child
    if (caseElement && this.guide && this.guide.domElement) {
      caseElement.removeChild(this.guide.domElement);
    }
    this.guide = null;
    // Remove listeners
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('stopWebcam',this.stopWebcam);
    window.onpopstate = null;
    // Clear HTML
// Clear HTML
const webcamCharacterWrapper = document.querySelector('.character__canvas');
if (webcamCharacterWrapper && this.webcamCharacterCanvas && webcamCharacterWrapper.contains(this.webcamCharacterCanvas)) {
  webcamCharacterWrapper.removeChild(this.webcamCharacterCanvas);
}

}
}
