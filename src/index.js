import * as THREE from 'three';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import { generateBoxMesh, generateEdgeMesh, generatePlaneMesh } from './helpers';
import calculateGrid from './grid';
import nodes from './nodes.json';
import { settings as def } from './defaults';

const TWEEN = require('@tweenjs/tween.js');
// import GreySeal from './assets/greySealSkull.jpg';

let camera;
let scene;
let controls;
let raycaster;
let renderer;
let listener;
let INTERSECTED;
let selectedObject;

let clickedObject = false;

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

  // Init scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(def.scene.backgroundColor);

  // Not currently in use
  calculateGrid();

  if (def.debug.axesHelper) {
    const axesHelper = new THREE.AxesHelper(20);
    axesHelper.position.set(-40, 0, -20);
    scene.add(axesHelper);
  }

  // Main grid
  const gridSize = 30;
  let grid = new Array(gridSize).fill(new Array(gridSize).fill(0));

  // Lighting - Todo: Add an iterator here for multiple lights (def.light is an array)
  // This is destructuring to get only member we want
  // const { color, intensity } = def.light[0];
  const light = new THREE.DirectionalLight(def.light[0].color, def.light[0].intensity);
  light.position.set(def.light[0].x, def.light[0].y, def.light[0].z);
  scene.add(light);

  // Object & material creation
  let objects = []; // Array of objects
  // Could do with adding an array of edges as well

  function addObject(x, y, obj) {
    // eslint-disable-next-line no-param-reassign
    obj.position.x = x * def.grid.spread;
    // eslint-disable-next-line no-param-reassign
    obj.position.z = y * def.grid.spread;

    scene.add(obj);
    objects.push(obj);
  }

  function addBoxGeometry(x, y, material, name, sound) {
    const boxMesh = generateBoxMesh(material, 9, 9, 9);
    boxMesh.name = name;
    addObject(x, y, boxMesh);

    switch (sound) {
      case 'waterlappingfarneislands':
        boxMesh.add(sound1);
        break;
      case 'sealsvocalising':
        boxMesh.add(sound2);
        break;
      case 'familiesatbeach':
        boxMesh.add(sound3);
        break;
      default:
        break;
    }
  }

  // Could also use TubeGeometry to make this, could be a bit more organic
  function addEdgeGeometry(x, y) {
    const mesh = generateEdgeMesh();
    mesh.rotation.x = 1.57; // In radians
    mesh.rotation.z = -0.7;

    addObject(x, y, mesh);
  }

  // Sphere props
  // const { radius, detail } = def.sphere;

  const audioLoader = new THREE.AudioLoader();

  const sound1 = new THREE.PositionalAudio(listener);
  audioLoader.load('./assets/sounds/waterlappingfarneislands.mp3', (buffer) => {
    sound1.setBuffer(buffer);
    sound1.setRefDistance(5);
    sound1.setLoop(true);
    sound1.play();
  });

  const sound2 = new THREE.PositionalAudio(listener);
  audioLoader.load('./assets/sounds/sealsvocalising.mp3', (buffer) => {
    sound2.setBuffer(buffer);
    sound2.setRefDistance(5);
    sound2.setLoop(true);
    sound2.play();
  });

  const sound3 = new THREE.PositionalAudio(listener);
  audioLoader.load('./assets/sounds/familiesatbeach.mp3', (buffer) => {
    sound3.setBuffer(buffer);
    sound3.setRefDistance(5);
    sound3.setLoop(true);
    sound3.play();
  });

  // Iterate through grid, when we find an object, add it to the geometry
  // TODO
  function initGrid() {
    nodes.forEach((node) => {
      // Position is subtracted 15 to get back to origin
      addBoxGeometry(
        (node.position[0]) - 15,
        (node.position[1]) - 15,
        node.image, node.name, node.sound,
      );
    });
  }

  initGrid();

  // Test shape
  // addSolidGeometry(-4, 0, new THREE.DodecahedronGeometry(radius, detail));
  // Test object
  // addPlaneGeometry(0, 0, './assets/greysealskull.jpg');

  addEdgeGeometry(-1.6, -0.69);

  // Add background plane
  const backgroundMesh = generatePlaneMesh('./assets/background.png', 800, 400);
  backgroundMesh.position.z = -100;
  scene.add(backgroundMesh);
  objects.push(backgroundMesh);

  raycaster = new THREE.Raycaster();

  // Setup renderer
  const canvas = document.querySelector('#c');
  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Controls
  controls = new FlyControls(camera, renderer.domElement);

  controls.movementSpeed = def.control.movSpeed;
  controls.domElement = renderer.domElement;
  controls.rollSpeed = def.control.rollSpeed;
  controls.autoForward = def.control.autoForward;
  controls.dragToLook = def.control.dragToLook;

  // Event listener for mouse
  document.addEventListener('mouseup', onDocumentMouseUp, false);

  // Event listener for resize
  window.addEventListener('resize', onWindowResize);

  // Info panel - TODO
  const infoPanel = document.querySelector('#info');
}

function onWindowResize() {
  const canvas = renderer.domElement;
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}

function onDocumentMouseUp(event) {
  console.log('clicked');
  clickedObject = true;
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
}

// Main render loop
function render() {
  // Time elapsed since last render
  const delta = clock.getDelta();

  // controls.movementSpeed = 0.33 * d;
  controls.update(delta);
  camera.updateMatrixWorld();

  TWEEN.update();

  // Raycasting (from https://threejs.org/examples/#webgl_interactive_cubes)
  if (clickedObject) {
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
          console.log('selected box');

          console.log(`checking intersected ${INTERSECTED}`);
          if (selectedObject && def.debug.highlightSelection) {
            console.log('removing old colouring');
            selectedObject.material.emissive.setHex(0x000000);
          }
          // Store the last intersected thing
          INTERSECTED = intersects[0].object;
          selectedObject = intersects[0].object;

          console.log(`intersected set to ${selectedObject}`);

          // Go to objects position
          if (def.debug.goToObject) {
            const { x, y, z } = intersects[0].object.position;
            new TWEEN.Tween(camera.position)
              .to({
                x,
                y: y + 10,
                z: z + 20,
              }, 1000)
              .start()
              .onComplete(() => {
                // TODO: Orient the camera towards the middle of the web
                // camera.lookAt(scene.position);
              });
            console.log(`Going to object pos: ${intersects[0].object.position.x}, ${intersects[0].object.position.y}`);
          }
          if (def.debug.highlightSelection) {
            selectedObject.material.emissive.setHex(0x0000dd);
          }

          if (def.debug.objectSelection) {
            // intersects[0].object.material.color.setHex(0x000000); // Set to black
            console.log(intersects[0]);
          }
        }
      }
    } else {
      // We intersected nothing, clear our store
      // This is causing the problem with object highlighting
      INTERSECTED = null;
    }
    clickedObject = false;
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
