import * as THREE from 'three';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import {
  createMaterialByColor,
  generateBoxMesh,
  generatePlaneMesh,
} from './helpers';
import calculateEdges from './grid';
import nodes from './nodes.json';
import {
  defaultTemplate,
  generateTemplate,
  getName,
  getIdbySoundName,
  getSoundName,
} from './nodesHelpers';
import { settings as def } from './defaults';
import './style.css';

// Misc assets
import backgroundImg from './assets/background.png';
import audioOff from './assets/audioOff.png';
import audioOn from './assets/audioOn.png';
import overlayLogo from './assets/overlay-logo.png';

import './favicons/favicons';

// Import all files
function importAll(r) {
  const files = {};
  r.keys().map((item) => { files[item.replace('./', '')] = r(item); });
  return files;
}
// Images & sounds
const images = importAll(require.context('./assets/images', false, /\.(png|jpe?g|svg)$/));
const soundFiles = importAll(require.context('./assets/sounds', false, /\.(mp3)$/));

// Set image on overlay logo (quick hack as not using html-loader for index.html)
const overlayEl = document.querySelector('#overlay-el');
overlayEl.src = overlayLogo;

function startScene() {
  const startModalOverlay = document.querySelector('#startModalOverlay');
  startModalOverlay.style.display = 'none';
  const startModal = document.querySelector('#startModal');
  startModal.style.display = 'none';
  startModalVisible = false;
  playAudio();
  // setClickCooldown();
}

// Get DOM elements
const welcomeButton = document.querySelector('#welcomeModalButton');
const closeModalButton = document.querySelector('#closeModalButton');
const prevModal = document.querySelector('#mob-prev-modal');
const prevModalTitle = document.querySelector('#prevModalTitle');
const prevModalButton = document.querySelector('#prevMoreButton');
const mainModal = document.querySelector('#mob-main-modal');
const mainModalClose = document.querySelector('#mainModalClose');
const mainModalListenIn = document.querySelector('#mainModalListenIn');
const mainModalButtonContainer = document.querySelector('#mainModalButtonContainer');

// Controls to know what is on screen
let startModalVisible = true;
let prevModalVisible = false;
let mainModalVisible = false;
let clickCooldown = false;
let cooldownTimer = 0;

// Bing methods to DOM objects
welcomeButton.onclick = startScene;
closeModalButton.onclick = startScene;
prevModalButton.onclick = displayMainModal;
mainModalClose.onclick = hideMainModal;
mainModalListenIn.onclick = actionListenInButton;

function actionListenInButton() {
  // 'selectedObject.name' is the ID of the node we've selected
  toggleHighlightAudio(getSoundName(lastSelectedObject.name));
}

function toggleListenButtonStyle(value) {
  if (value) {
    mainModalListenIn.classList.remove('btn-secondary');
    mainModalListenIn.classList.add('btn-danger');
  } else {
    mainModalListenIn.classList.add('btn-secondary');
    mainModalListenIn.classList.remove('btn-danger');
  }
}

const TWEEN = require('@tweenjs/tween.js');

let camera;
let scene;
let controls;
let raycaster;
let renderer;
let listener;
let edges;
let INTERSECTED;
let lastSelectedObject;
let isAudioHighlighted = false;
let highlightedIconName = '';
let infoPanel;

const sounds = [];
const icons = [];
let eventClickedObject = false;
let lastTouchObject = Date.now();
let timedOut = false;

const mouse = new THREE.Vector2();
const clock = new THREE.Clock();

const extLoader = new THREE.TextureLoader();

// Control display of modals & control clicks
function setClickCooldown() {
  clickCooldown = true;
  cooldownTimer = def.timeout.cooldown;
}

function serviceCooldown() {
  if (clickCooldown) {
    if (eventClickedObject) {
      eventClickedObject = false;
    }
    if (cooldownTimer - 1 === 0) {
      clickCooldown = false;
      cooldownTimer = 0;
    } else {
      cooldownTimer -= 1;
    }
  }
}

function togglePrevModal(enable) {
  if (enable) {
    prevModal.style.display = 'block';
    prevModalVisible = true;
  } else {
    prevModal.style.display = 'none';
    prevModalVisible = false;
  }
}

function displayMainModal() {
  console.log('setting main modal visible');
  togglePrevModal(false);
  mainModal.style.display = 'block';
  mainModalVisible = true;
}

function hideMainModal() {
  console.log('setting main modal hidden');
  mainModal.style.display = 'none';
  mainModalVisible = false;
  setClickCooldown();
}

function setCameraPosition(clientWidth) {
  // Set camera based on display width
  if (clientWidth > def.window.mobileMaxWidth) {
    camera.position.set(camera.position.x, camera.position.y, def.camera.startZ);
  } else {
    camera.position.set(camera.position.x, camera.position.y, def.camera.mobileStartZ);
  }
}

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
  audioLoader.load(soundFiles['background.mp3'].default, (buffer) => {
    bgSound.setBuffer(buffer);
    bgSound.setLoop(true);
    bgSound.setVolume(def.sound.backgroundVol);
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
    const boxMesh = generateBoxMesh(
      material,
      def.node.height,
      def.node.width,
      def.node.depth,
      THREE,
    );
    boxMesh.name = name;
    addObject(x, y, z, boxMesh);

    if (soundName) {
      // Generate the sound here and assign to boxMesh
      const sound = new THREE.PositionalAudio(listener);
      audioLoader.load(soundFiles[`${soundName}.mp3`].default, (buffer) => {
        sound.setBuffer(buffer);
        sound.setRefDistance(5);
        sound.setLoop(true);
        sound.setVolume(volume);
        sound.name = soundName;
      });
      boxMesh.add(sound);
      sounds.push(sound);

      // Generate icon to denote sound
      const soundIconMesh = generatePlaneMesh(
        audioOff,
        def.sound.iconSize,
        def.sound.iconSize,
        THREE,
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
        images[node.thumb], node.id, node.sound, node.vol,
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
      createMaterialByColor(def.edge.hue, def.edge.sat, def.edge.lum, THREE),
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
  const backgroundMesh = generatePlaneMesh(
    backgroundImg,
    def.background.width,
    def.background.height,
    THREE,
  );
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
  // console.log(`Set renderer width to: ${canvas.clientWidth}, ${canvas.clientHeight}, window is also ${window.innerWidth} x ${window.innerHeight}`);
  // renderer.setSize(window.innerWidth, window.innerHeight);

  // Set initial camera position based on mobile/desktop
  setCameraPosition(canvas.clientWidth);

  // Test comment this out
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

function playAudio() {
  // eslint-disable-next-line no-restricted-syntax
  for (const el of sounds) {
    // Only start audio that is not playing. This is just a fail safe.
    if (!el.isPlaying) {
      el.play();
    }
  }
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

function switchAudio(soundName) {
  // Iterate all sounds and do sound.stop
  // Specifically start the passed in name
  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const el of sounds) {
      if (el.name !== soundName) {
        if (el.isPlaying) el.stop();
      } else {
        el.play();
      }
    }
  } catch (e) {
    console.log('audioStop:', e);
  }
}

function stopAudio(soundName) {
  // Iterate all sounds and do sound.stop
  // Leave the passed in name running
  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const el of sounds) {
      if (el.name !== soundName) {
        if (el.isPlaying) el.stop();
      }
    }
  } catch (e) {
    console.log('audioStop:', e);
  }
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
  if (lastSelectedObject) {
    lastSelectedObject.material.emissive.setHex(0x000000);
  }
  if (timeout) {
    resetInfoPanel();
    lastSelectedObject = null;
    INTERSECTED = null;
  }
}

function audioIconOff(iconName) {
  // Sets all audio icons to off except the one passed in
  const newMatOff = new THREE.MeshBasicMaterial({
    map: extLoader.load(audioOff),
  });
  const newMatOn = new THREE.MeshBasicMaterial({
    map: extLoader.load(audioOn),
  });
  // eslint-disable-next-line no-restricted-syntax
  for (const el of icons) {
    if (el.name !== iconName) {
      el.material = newMatOff;
    } else {
      el.material = newMatOn;
    }
  }
}

function timeoutScene() {
  if (!timedOut) {
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
    togglePrevModal(false);
    hideMainModal();
    restartAudio();
    audioIconOff('');
    timedOut = true;
  }
}

function toggleListenInButton(objectName) {
  if (getSoundName(objectName)) {
    mainModalListenIn.style.display = 'inline-block';
  } else {
    mainModalListenIn.style.display = 'none';
  }
}

function toggleAudioIcon(iconName, setIcon) {
  audioIconOff(iconName);
}

function setIsAudioHighlighted(set) {
  isAudioHighlighted = set;
  console.log('setting isAudioHighlighted to', isAudioHighlighted, 'param:', set);
}

function switchHighlight(soundName) {
  setIsAudioHighlighted(true);
  highlightedIconName = `${soundName}_icon`;
  switchAudio(soundName);
  toggleAudioIcon(`${soundName}_icon`, true);
  console.log('switching highlight from one node to another');
}

function toggleHighlightAudio(soundName) {
  if (!soundName) {
    console.log('soundname not defined');
    return;
  }
  if (clickCooldown) {
    console.log('timed out');
    return;
  }

  if (isAudioHighlighted) {
    console.log('starting all audio');
    // console.log(`toggling ${soundName}, currently highlight: ${isAudioHighlighted}`);
    // Disable highlight audio
    setIsAudioHighlighted(false);
    highlightedIconName = '';
    restartAudio();
    // toggleAudioIcon(`${soundName}_icon`, false);
    audioIconOff();
    toggleListenButtonStyle(false);
  } else {
    // Enable highlight audio
    console.log('highlighting audio', soundName);
    setIsAudioHighlighted(true);
    highlightedIconName = `${soundName}_icon`;
    stopAudio(soundName);
    toggleAudioIcon(`${soundName}_icon`, true);
    toggleListenButtonStyle(true);
  }
}

function onWindowResize() {
  // const canvas = renderer.domElement;
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Old code used canvas, which doesn't change size
  // camera.aspect = canvas.clientWidth / canvas.clientHeight;
  // renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  camera.updateProjectionMatrix();

  // Check if camera needs to be moved
  setCameraPosition(window.innerWidth);
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
  lastSelectedObject = intersectObj; // Store object for later reference
  infoPanel.innerHTML = generateTemplate(lastSelectedObject.name);
  toggleListenInButton(lastSelectedObject.name);
  prevModalTitle.innerHTML = getName(lastSelectedObject.name);

  if (def.debug.objectSelection) console.log('intersected set to', lastSelectedObject);

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
      togglePrevModal(true);
    });
  if (def.debug.goToObject) {
    console.log(`Going to object pos: ${intersectObj.position.x}, ${intersectObj.position.y}`);
  }
  // Set highlight colour
  lastSelectedObject.material.emissive.setHex(0x0000dd);
}

// Main render loop
function render() {
  // Time elapsed since last render
  const delta = clock.getDelta();

  if (checkTouchTime()) timeoutScene();
  if (def.debug.godMode) controls.update(delta);

  camera.updateMatrixWorld();

  TWEEN.update();

  // Raycasting (from https://threejs.org/examples/#webgl_interactive_cubes)
  if (eventClickedObject && !clickCooldown) {
    timedOut = false;
    console.log('audio highlight status:', isAudioHighlighted);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    // If we have intersected things
    if (intersects.length > 0) {
      // If closest object is not same as what we have selected
      if (INTERSECTED !== intersects[0].object) {
        // BoxGeometry = main boxes. Only process if modals are not displayed
        if (
          intersects[0].object.geometry.type === 'BoxGeometry'
          && !startModalVisible
          && !mainModalVisible
        ) {
          if (def.debug.objectSelection) console.log(`checking intersected ${INTERSECTED}`);

          // If we have selectedObject stored, deselect and stop all highlight features
          if (lastSelectedObject) {
            if (def.debug.highlightSelection) console.log('Clicked different, removing old colouring');
            deselectObject();
            togglePrevModal(false);
            // Switch all audio back on
            audioIconOff(''); // Toggle off all icons
            setIsAudioHighlighted(false);
            restartAudio();
            toggleListenButtonStyle(false);
          }

          // Trigger select obj
          selectObject(intersects[0].object);
        } else if (intersects[0].object.geometry.type === 'PlaneGeometry') {
          console.log('plane geo');
          // planeGeometry = audio icons + background.
          const iconName = intersects[0].object.name;
          const iconPos = iconName.search('(_icon)'); // Store character position as we use below

          // If selected planeGeo is an icon
          if (iconName && iconPos !== -1) {
            console.log('clicked directly on icon');
            if (def.debug.objectSelection) console.log(`Clicked on icon named ${iconName}`);
            const soundName = iconName.slice(0, iconPos); // Strip _icon
            const selectId = getIdbySoundName(soundName); // Get ID this is attached to
            if (selectId !== false) {
              // If selectId is valid, we know the cube it is attached to
              // Go to cube
              selectObject(scene.getObjectByName(selectId));
              // Highlight audio or switch audio if moving from one icon to another
              if (isAudioHighlighted) {
                if (iconName === highlightedIconName) {
                  // We have clicked the icon twice, so we want to disable highlight
                  toggleHighlightAudio(soundName);
                } else {
                  // We are clicking highlight icon directly on another node
                  switchHighlight(soundName);
                }
              } else {
                toggleHighlightAudio(soundName);
              }
            } else {
              console.log('error: icon not attached to node');
            }

            // console.log('select ID is', selectId);
            // if (selectedObject) {
            //   console.log('previously selected something', selectedObject, 'we have just selected', iconObj);
            //   // We have an object selected already
            //   // Check we have found the object, then select it
            //   // console.log(selectId, selectedObject.name);
            //   if (selectId !== false) {
            //     console.log('selectedObject.name:', selectedObject.name);
            //     if (selectId === iconObj.name) {
            //       console.log('going directly to highlight audio');
            //       // All we need to do here is toggle the audio on/off
            //       // Trigger audio highlight
            //       toggleHighlightAudio(soundName);
            //     } else {
            //       // console.log(`now selecting object ${selectId}`);
            //       selectObject(scene.getObjectByName(selectId));
            //     }
            //   } else {
            //     console.log('unable to find object icon attached to');
            //   }
            // } else {
            //   console.log('dont have anything selected');
            //   // Select the object
            //   selectObject(scene.getObjectByName(selectId));
            // }
          }
        }
      } else if (intersects[0].object === lastSelectedObject) {
        // We have clicked on the same item
        if (!prevModalVisible) {
          // Display the preview modal if not already visible
          togglePrevModal(true);
        }
        console.log('checking to play audio');
        // If there is an audio attached it will be a child, and we will play it
        // 18/01/22: Remove this feature to simplify interaction
        // if (selectedObject.children.length > 0) {
        //   // NOTE: We are assuming here the 1st child is the audio (we only have audio as children)
        //   const audioObj = selectedObject.children[0];
        //   if (audioObj.type === 'Audio') {
        //     // console.log(audioObj.name, audioObj.type);
        //     toggleHighlightAudio(audioObj.name);
        //   }
        // }
      }
    } else {
      // We intersected nothing, clear our store
      INTERSECTED = null;
    }
    eventClickedObject = false;
  }

  serviceCooldown();
  renderer.render(scene, camera);

  // requestAnimationFrame(render);
}

function animate() {
  requestAnimationFrame(animate);

  render();
}

init();
animate();
