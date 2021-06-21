import * as THREE from 'three';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import {
  createMaterialByColor,
  generateBoxMesh,
  generatePlaneMesh,
} from './helpers';
import calculateEdges from './grid';
import nodes from './nodes.json';
import { defaultTemplate, generateTemplate } from './nodesHelpers';
import { settings as def } from './defaults';

const TWEEN = require('@tweenjs/tween.js');
// import GreySeal from './assets/greySealSkull.jpg';

let camera;
let scene;
let controls;
let raycaster;
let renderer;
let listener;
let edges;
let INTERSECTED;
let selectedObject;
let isAudioHighlighted = false;
let infoPanel;

const sounds = [];
let eventClickedObject = false;
let lastTouchObject = Date.now();

const mouse = new THREE.Vector2();
const clock = new THREE.Clock();

function init() {
  // Camera
  camera = new THREE.PerspectiveCamera(
    def.camera.fov,
    (window.innerWidth / window.innerHeight),
    def.camera.near, def.camera.far,
  );
  camera.position.set(def.camera.startX, def.camera.startY, def.camera.startZ);

  // Audio listener
  listener = new THREE.AudioListener();
  camera.add(listener);

  const audioLoader = new THREE.AudioLoader();

  // Init scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(def.scene.backgroundColor);

  if (def.debug.axesHelper) {
    const axesHelper = new THREE.AxesHelper(20);
    axesHelper.position.set(-80, 0, 0);
    scene.add(axesHelper);
  }

  // Main grid
  const gridSize = 30;
  let grid = new Array(gridSize).fill(new Array(gridSize).fill(0));

  const lights = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const el of def.light) {
    if (el.type === 'directional') {
      const light = new THREE.DirectionalLight(el.color, el.intensity);
      light.position.set(el.x, el.y, el.z);
      scene.add(light);
      lights.push(light);
    }

    if (el.type === 'ambient') {
      const light = new THREE.AmbientLight(el.color); // soft white light
      // light.position.set(el.x, el.y, el.z);
      scene.add(light);
      lights.push(light);
    }
  }

  // Object & material creation
  const objects = []; // Array of objects
  // Could do with adding an array of edges as well

  function addObject(x, y, obj) {
    // eslint-disable-next-line no-param-reassign
    obj.position.x = x * def.grid.spread;
    // eslint-disable-next-line no-param-reassign
    obj.position.y = -(y * def.grid.spread);

    scene.add(obj);
    objects.push(obj);
  }

  function addBoxGeometry(x, y, material, name, soundName) {
    const boxMesh = generateBoxMesh(material, def.node.height, def.node.width, def.node.depth);
    boxMesh.name = name;
    addObject(x, y, boxMesh);

    if (soundName) {
      // Generate the sound here and assign to boxMesh
      const sound = new THREE.PositionalAudio(listener);
      audioLoader.load(`./assets/sounds/${soundName}.mp3`, (buffer) => {
        sound.setBuffer(buffer);
        sound.setRefDistance(5);
        sound.setLoop(true);
        sound.play();
        sound.name = soundName;
      });
      boxMesh.add(sound);
      sounds.push(sound);
    }

    // switch (soundName) {
    //   case 'waterlappingfarneislands':
    //     boxMesh.add(sound1);
    //     break;
    //   case 'sealsvocalising':
    //     boxMesh.add(sound2);
    //     break;
    //   case 'familiesatbeach':
    //     boxMesh.add(sound3);
    //     break;
    //   default:
    //     break;
    // }
  }



  // const sound1 = new THREE.PositionalAudio(listener);
  // audioLoader.load('./assets/sounds/waterlappingfarneislands.mp3', (buffer) => {
  //   sound1.setBuffer(buffer);
  //   sound1.setRefDistance(5);
  //   sound1.setLoop(true);
  //   sound1.play();
  // });

  // const sound2 = new THREE.PositionalAudio(listener);
  // audioLoader.load('./assets/sounds/sealsvocalising.mp3', (buffer) => {
  //   sound2.setBuffer(buffer);
  //   sound2.setRefDistance(5);
  //   sound2.setLoop(true);
  //   sound2.play();
  // });

  // const sound3 = new THREE.PositionalAudio(listener);
  // audioLoader.load('./assets/sounds/familiesatbeach.mp3', (buffer) => {
  //   sound3.setBuffer(buffer);
  //   sound3.setRefDistance(5);
  //   sound3.setLoop(true);
  //   sound3.play();
  // });

  // Iterate through grid, when we find an object, add it to the geometry
  // TODO
  function initGrid() {
    nodes.forEach((node) => {
      // Position is subtracted 15 to get back to origin
      addBoxGeometry(
        (node.position[0]) - 15,
        (node.position[1]) - 15,
        node.thumb, node.id, node.sound,
      );
    });
  }

  initGrid();

  function findVectorsTwoObjects(object1Name, object2Name) {
    // TODO Needs error checking if not found
    const firstObj = scene.getObjectByName(object1Name);
    const secondObj = scene.getObjectByName(object2Name);
    const { x: x1, y: y1, z: z1 } = firstObj.position;
    const { x: x2, y: y2, z: z2 } = secondObj.position;
    const vectors = [
      new THREE.Vector3(x1, y1, z1),
      new THREE.Vector3(x2, y2, z2),
    ];
    return vectors;
  }

  function drawEdge(object1Name, object2Name) {
    const vectors = findVectorsTwoObjects(object1Name, object2Name);
    const path = [
      vectors[0],
      vectors[1],
    ];

    const pathBase = new THREE.CatmullRomCurve3(path);
    // const path = new CustomSinCurve(4);
    const tubularSegments = 20;
    const radius = 1;
    const radialSegments = 8;
    const closed = false;
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(pathBase, tubularSegments, radius, radialSegments, closed),
      createMaterialByColor(def.edge.hue, def.edge.sat, def.edge.lum),
    );
    addObject(0, 0, mesh);
  }

  // Generate edges
  edges = calculateEdges();
  // console.log(edges);
  for (let i = 0; i < edges.length; i += 1) {
    const { id0, id1 } = edges[i];
    drawEdge(id0, id1);
  }

  // Add background plane
  const backgroundMesh = generatePlaneMesh('./assets/background.png', def.background.width, def.background.height);
  backgroundMesh.position.z = -100;
  scene.add(backgroundMesh);
  objects.push(backgroundMesh);

  raycaster = new THREE.Raycaster();

  // Setup renderer
  const canvas = document.querySelector('#c');
  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  console.log(`Set renderer width to: ${canvas.clientWidth}, ${canvas.clientHeight}`);
  // renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // Controls
  if (def.debug.godMode) {
    controls = new FlyControls(camera, renderer.domElement);

    controls.movementSpeed = def.control.movSpeed;
    controls.domElement = renderer.domElement;
    controls.rollSpeed = def.control.rollSpeed;
    controls.autoForward = def.control.autoForward;
    controls.dragToLook = def.control.dragToLook;
  }

  // Event listener for mouse
  document.addEventListener('mouseup', onDocumentMouseUp, false);

  // Event listener for resize
  window.addEventListener('resize', onWindowResize);

  // Info panel
  infoPanel = document.querySelector('#info-template');
  infoPanel.innerHTML = defaultTemplate();
}

function restartAudio() {
  // Iterate all sounds and do sound.play
  // eslint-disable-next-line no-restricted-syntax
  for (const el of sounds) {
    if (!el.isPlaying) {
      el.play();
    }
  }
}

function stopAudio(soundName) {
  // Iterate all sounds and do sound.stop
  // eslint-disable-next-line no-restricted-syntax
  for (const el of sounds) {
    if (el.name === soundName) {
      console.log(`${el.name}, ${soundName}`);
    } else {
      el.stop();
    }
  }
  // Leave the passed in name running
}

function setTouchTime() {
  lastTouchObject = Date.now();
}

function checkTouchTime() {
  // Check if timeOut should be triggered
  const futureTime = lastTouchObject + def.timeout.time;
  if (Date.now() >= futureTime) return true;
  return false;
}

function resetInfoPanel() {
  infoPanel.innerHTML = defaultTemplate();
}

function deselectObject(timeout) {
  selectedObject.material.emissive.setHex(0x000000);
  if (timeout) resetInfoPanel();
}

function timeoutScene() {
  console.log('triggering timeout of scene');
  const firstObj = scene.getObjectByName(0);
  // camera.position.x = firstObj.position.x;
  // camera.position.y = firstObj.position.y;
  const { x, y } = firstObj.position;

  new TWEEN.Tween(camera.position)
    .to({
      x,
      y,
      // z: z + 20,
    }, 1000)
    .start();
  setTouchTime();

  // Needs to deselect the node/edge and change the colouring
  deselectObject(true);
}

function toggleHighlightAudio(soundName) {
  if (isAudioHighlighted) {
    isAudioHighlighted = false;
    restartAudio();
  } else {
    isAudioHighlighted = true;
    stopAudio(soundName);
  }
}

function onWindowResize() {
  const canvas = renderer.domElement;
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}

function onDocumentMouseUp(event) {
  if (def.debug.clickEvent) console.log('clicked');
  eventClickedObject = true;
  // const et = event.target;
  // const de = renderer.domElement;
  // // Appears to work better without offsets
  // // const trueX = (event.clientX - et.offsetLeft);
  // // const trueY = (event.clientY - et.offsetTop);
  // const trueX = event.clientX;
  // const trueY = event.clientY;
  // mouse.x = ((trueX / de.clientWidth) * 2 - 1);
  // mouse.y = -(trueY / de.clientHeight) * 2 + 1;
  // console.log(de.clientWidth, de.clientHeight);
  // console.log(`${event.clientX}, ${et.offsetLeft}, position ${event.clientX - et.offsetLeft}, ${event.pageX}`);

  // OG
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  if (def.debug.objectSelection) console.log(`event click: ${event.clientX}, ${event.clientY}. mouse: ${mouse.x}, ${mouse.y}`);

  setTouchTime();
}

// Main render loop
function render() {
  // Time elapsed since last render
  const delta = clock.getDelta();

  if (checkTouchTime()) timeoutScene();
  // controls.movementSpeed = 0.33 * d;
  if (def.debug.godMode) controls.update(delta);

  camera.updateMatrixWorld();

  TWEEN.update();

  // Raycasting (from https://threejs.org/examples/#webgl_interactive_cubes)
  if (eventClickedObject) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    // object.geometry.type === "BoxGeometry"

    // If we have intersected things
    if (intersects.length > 0) {
      // If we have intersected a new thing (closest)
      if (INTERSECTED !== intersects[0].object) {
        // console.log(INTERSECTED, intersects[0].object);

        // Only want to select boxGeometry (crude check for now)
        if (intersects[0].object.geometry.type === 'BoxGeometry') {
          if (def.debug.objectSelection) console.log(`checking intersected ${INTERSECTED}`);

          if (selectedObject) {
            if (def.debug.highlightSelection) console.log('removing old colouring');
            deselectObject();

            // Switch all audio back on
            isAudioHighlighted = false;
            restartAudio();
          }

          // Select the object
          INTERSECTED = intersects[0].object; // Store the last intersected thing
          selectedObject = intersects[0].object; // Store object for later reference
          // console.log(selectedObject);
          infoPanel.innerHTML = generateTemplate(selectedObject.name);

          if (def.debug.objectSelection) console.log(`intersected set to ${selectedObject}`);

          // Go to objects position
          const { x, y, z } = intersects[0].object.position;
          new TWEEN.Tween(camera.position)
            .to({
              x,
              y,
              // z: z + 20,
            }, 1000)
            .start()
            .onComplete(() => {
              // TODO: Orient the camera towards the middle of the web
              // camera.lookAt(scene.position);
            });
          if (def.debug.goToObject) {
            console.log(`Going to object pos: ${intersects[0].object.position.x}, ${intersects[0].object.position.y}`);
          }
          // Set highlight colour
          selectedObject.material.emissive.setHex(0x0000dd);

          // if (def.debug.objectSelection) console.log(intersects[0]);
        }
      } else if (intersects[0].object === selectedObject) {
        // We have clicked on the same item
        console.log('clicked on same item');
        // If there is an audio attached it will be a child
        if (selectedObject.children.length > 0) {
          // NOTE: We are assuming here the 1st child is the audio (we only have audio as children)
          const audioObj = selectedObject.children[0];
          if (audioObj.type === 'Audio') {
            console.log(audioObj.name, audioObj.type);
            toggleHighlightAudio(audioObj.name);
          }
        }
      }
    } else {
      // We intersected nothing, clear our store
      INTERSECTED = null;
    }
    eventClickedObject = false;
  }

  renderer.render(scene, camera);

  // requestAnimationFrame(render);
}

function animate() {
  requestAnimationFrame(animate);

  render();
}

init();
animate();