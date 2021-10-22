import * as THREE from 'three';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import {
  createMaterialByColor,
  generateBoxMesh,
  generatePlaneMesh,
  audioOnMaterial,
  audioOffMaterial,
} from './helpers';
import calculateEdges from './grid';
import nodes from './nodes.json';
import {
  defaultTemplate,
  generateTemplate,
  getSoundName,
  getIdbySoundName,
} from './nodesHelpers';
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
let highlightedAudioName;
let infoPanel;

const sounds = [];
const icons = [];
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
    axesHelper.position.set(0, 0, 0);
    scene.add(axesHelper);
  }

  // Background sound
  const bgSound = new THREE.Audio(listener);
  audioLoader.load(`./assets/sounds/${def.sound.backgroundAudio}.mp3`, (buffer) => {
    bgSound.setBuffer(buffer);
    bgSound.setLoop(true);
    bgSound.setVolume(def.sound.backgroundVol);
    bgSound.play();
    bgSound.name = 'backgroundSound';
  });
  sounds.push(bgSound);

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

  function addObject(x, y, z, obj) {
    // eslint-disable-next-line no-param-reassign
    obj.position.x = x * def.grid.spread;
    // eslint-disable-next-line no-param-reassign
    obj.position.y = -(y * def.grid.spread);
    // eslint-disable-next-line no-param-reassign
    obj.position.z = z;

    scene.add(obj);
    objects.push(obj);
  }

  function addIconObject(x, y, z, obj) {
    // eslint-disable-next-line no-param-reassign
    obj.position.x = (x * def.grid.spread) + def.sound.iconOffsetXY;
    // eslint-disable-next-line no-param-reassign
    obj.position.y = (-(y * def.grid.spread)) + def.sound.iconOffsetXY;
    // eslint-disable-next-line no-param-reassign
    obj.position.z = z;
    // eslint-disable-next-line no-param-reassign

    scene.add(obj);
    objects.push(obj);
    icons.push(obj);

    // console.log(`added icon to :${x}, y: ${y}, z: ${z}, name: ${obj.name}`);
  }

  function addBoxGeometry(x, y, z, material, name, soundName, volume) {
    const boxMesh = generateBoxMesh(material, def.node.height, def.node.width, def.node.depth);
    boxMesh.name = name;
    addObject(x, y, z, boxMesh);

    if (soundName) {
      // Generate the sound here and assign to boxMesh
      const sound = new THREE.PositionalAudio(listener);
      audioLoader.load(`./assets/sounds/${soundName}.mp3`, (buffer) => {
        sound.setBuffer(buffer);
        sound.setRefDistance(5);
        sound.setLoop(true);
        sound.setVolume(volume);
        sound.play();
        sound.name = soundName;
      });
      boxMesh.add(sound);
      sounds.push(sound);

      // Generate icon to denote sound
      const soundIconMesh = generatePlaneMesh(
        def.sound.iconTextureOff,
        def.sound.iconSize,
        def.sound.iconSize,
      );
      soundIconMesh.name = `${soundName}_icon`;
      addIconObject((x), (y), z + def.sound.iconOffsetZ, soundIconMesh);
    }
  }

  // Iterate through grid, when we find an object, add it to the geometry
  // TODO
  function initGrid() {
    nodes.forEach((node) => {
      // Position is subtracted 15 to get back to origin
      addBoxGeometry(
        (node.position[0]) - 15,
        (node.position[1]) - 15,
        def.node.defaultZ,
        node.thumb, node.id, node.sound, node.vol,
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
    addObject(0, 0, 0, mesh);
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
    if (el.name !== soundName) {
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
  // If timeout omitted, will only remove highlighting
  if (selectedObject) {
    selectedObject.material.emissive.setHex(0x000000);
  }
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
  restartAudio();
  audioIconOff('');
}

function audioIconOff(iconName) {
  // Sets all audio icons to off expect the one passed in
  // eslint-disable-next-line no-restricted-syntax
  for (const el of icons) {
    if (el.name !== iconName) {
      el.material = audioOffMaterial;
    } else {
      el.material = audioOnMaterial;
    }
  }
}

function toggleAudioIcon(iconName, setIcon) {
  // if (iconName === highlightedAudioName) {
  //   console.log('we are currently highlighting it, so it should toggle off');
  //   audioIconOff('');
  // } else {
  //   audioIconOff(iconName);
  // }
  audioIconOff(iconName);
  // const iconMesh = scene.getObjectByName(iconName);
  
  // if (setIcon) {
  //   iconMesh.material = audioOnMaterial;
  // } else {
  //   iconMesh.material = audioOffMaterial;
  // }
}

function toggleHighlightAudio(soundName) {
  // console.log(`toggling ${soundName}, currently highlight: ${isAudioHighlighted}`);
  if (isAudioHighlighted) {
    // Disable highlight
    console.log("disabling highlight");
    isAudioHighlighted = false;
    highlightedAudioName = '';
    restartAudio();
    // toggleAudioIcon(`${soundName}_icon`, false);
    audioIconOff();
  } else {
    // Enable highlight
    isAudioHighlighted = true;
    highlightedAudioName = soundName;
    stopAudio(soundName);
    toggleAudioIcon(`${soundName}_icon`, true);
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

function selectObject(intersectObj) {
  // Select the object
  INTERSECTED = intersectObj; // Store the last intersected thing
  selectedObject = intersectObj; // Store object for later reference
  // console.log(selectedObject);
  infoPanel.innerHTML = generateTemplate(selectedObject.name);

  if (def.debug.objectSelection) console.log(`intersected set to ${selectedObject}`);

  // Go to objects position
  const { x, y, z } = intersectObj.position;
  new TWEEN.Tween(camera.position)
    .to({
      x,
      y,
      // z: z + 20,
    }, 1000)
    .start()
    .onComplete(() => {
      // Remove blue highlight once moved
      deselectObject();
    });
  if (def.debug.goToObject) {
    console.log(`Going to object pos: ${intersectObj.position.x}, ${intersectObj.position.y}`);
  }
  // Set highlight colour
  selectedObject.material.emissive.setHex(0x0000dd);
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

          // If we have selectedObject stored (we clicked something previously)
          if (selectedObject) {
            if (def.debug.highlightSelection) console.log('Clicked different, removing old colouring');
            audioIconOff(''); // Switch off all icons
            // If it has a sound, toggle the icon off
            // const soundName = getSoundName(selectedObject.name);
            // if (soundName) {
            //   // toggleAudioIcon(`${soundName}_icon`, false);
            //   toggleAudioIcon('', false);
            // }
            // Removes highlighting
            deselectObject();

            // Switch all audio back on
            isAudioHighlighted = false;
            restartAudio();
          }

          // Trigger select obj
          selectObject(intersects[0].object);

          // if (def.debug.objectSelection) console.log(intersects[0]);
        } else if (intersects[0].object.geometry.type === 'PlaneGeometry') {
          // Audio icons are the only planeGeometry in the scene
          // Check name just to be sure
          const iconName = intersects[0].object.name;
          const iconPos = iconName.search('(_icon)'); // Store position as we use below
          if (iconName && iconPos !== -1) {
            console.log(`Clicked on icon named ${iconName}`);
            const soundName = iconName.slice(0, iconPos); // Stip _icon
            // Get ID this is attached to
            const selectId = getIdbySoundName(soundName);

            // We need to know whether audio is currently highlighted
            if (soundName === highlightedAudioName) {
              console.log('we are currently highlighting this, so need to toggle off');
            }

            if (selectedObject) {
              // We have an object selected already
              // Check we have found the object, then select it
              console.log(selectId, selectedObject.name);
              if (selectId !== false) {
                if (selectId === selectedObject.name) {
                  // All we need to do here is toggle the audio on/off
                  // Trigger audio highlight
                  toggleHighlightAudio(soundName);
                } else {
                  console.log(`now selecting object ${selectId}`);
                  selectObject(scene.getObjectByName(selectId));
                }
              } else {
                console.log('unable to find object icon attached to');
              }
            } else {
              // Select the object
              selectObject(scene.getObjectByName(selectId));
            }
          }
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
