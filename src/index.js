
import * as THREE from 'three';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';

import calculateGrid  from './grid';
import nodes from './nodes.json';
import { cameraSettings, sceneSettings, lightSettings, sphereSettings, gridSettings, controlSettings } from './defaults';

// import GreySeal from './assets/greySealSkull.jpg';


function main() {
  // Setup renderer
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});

  calculateGrid();

  // Camera
  const fov = cameraSettings.fov;
  const aspect = window.innerWidth / window.innerHeight;
  const near = cameraSettings.near;
  const far = cameraSettings.far;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.x = cameraSettings.startX;
  camera.position.z = cameraSettings.startZ;
  camera.position.y = cameraSettings.startY;

  const clock = new THREE.Clock();

  let controls;

  // Init scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(sceneSettings.backgroundColor);

  // Main grid
  const gridSize = 30;
  let grid = new Array(gridSize).fill(new Array(gridSize).fill(0));

  // Lighting
  // Add an iterator here for multiple lights (lightSettings is an array)
  {
    const color = lightSettings[0].color;
    const intensity = lightSettings[0].intensity;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(lightSettings[0].x, lightSettings[0].y, lightSettings[0].z);
    scene.add(light);
  }

  // Box geometry
  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
  // const material = new THREE.MeshBasicMaterial({color: 0x44aa88});

  // Object & material creation
  let objects = [];  // Array of objects
  // Could do with adding an array of edges as well
  const spread = 15;

  function createMaterial() {
    const material = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
    });

    const hue = Math.random();
    const saturation = 1;
    const luminance = .5;
    material.color.setHSL(hue, saturation, luminance);

    return material;
  }

  function addObject(x, y, obj) {
    obj.position.x = x * gridSettings.spread;
    obj.position.z = y * gridSettings.spread;

    scene.add(obj);
    objects.push(obj);
  }

  function addSolidGeometry(x, y, geometry) {
    const mesh = new THREE.Mesh(geometry, createMaterial());
    addObject(x, y, mesh);
  }

  function addPlaneGeometry(x, y, material) {
    const loader = new THREE.TextureLoader();
    const planeMaterial = new THREE.MeshBasicMaterial({
      // These are loaded from the dist folder
      // TODO not sure how to set up with webpack better?
      map: loader.load(material),
      // map: loader.load('https://threejsfundamentals.org/threejs/resources/images/wall.jpg'),
      // color: 0xFF8844,
    })
    const planeGeometry = new THREE.PlaneGeometry(9, 9);
    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    addObject(x, y, planeMesh);
  }

  function addEdgeGeometry(x, y) {
    // Test cylinder (edge)
    const radiusTop = 0.5;
    const radiusBottom = 0.5;
    const height = 70;
    const radialSegments = 12;
    // addSolidGeometry(1, 0, new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments));
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments), createMaterial());
    mesh.rotation.x = 1.57;  // In radians
    mesh.rotation.z = -0.7;

    addObject(x, y, mesh);
  }

  // Sphere props
  const radius = sphereSettings.radius;  
  const detail = sphereSettings.detail;

 

  // Iterate through grid, when we find an object, add it to the geometry
  // TODO
  function initGrid() {
    nodes.forEach(node => {
      // Position is subtracted 15 to get back to origin
      // addSolidGeometry((node.position[0])-15, (node.position[1])-15, new THREE.DodecahedronGeometry(sphereSettings.radius, sphereSettings.detail));
      addPlaneGeometry((node.position[0])-15, (node.position[1])-15, node.image);
    })

  }

  initGrid();

  // Test shape
  // addSolidGeometry(-4, 0, new THREE.DodecahedronGeometry(radius, detail));

  // Test cylinder (edge)
  // const radiusTop = 0.5;
  // const radiusBottom = 0.5;
  // const height = 8;
  // const radialSegments = 12;
  // addSolidGeometry(1, 0, new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments));
  addEdgeGeometry(-1.6, -0.69);

  // Test object
  // adadPlaneGeometry(0, 0, './assets/greysealskull.jpg');



  // Controls
  controls = new FlyControls( camera, renderer.domElement );

  controls.movementSpeed = controlSettings.movSpeed;
  controls.domElement = renderer.domElement;
  controls.rollSpeed = controlSettings.rollSpeed;
  controls.autoForward = controlSettings.autoForward;
  controls.dragToLook = controlSettings.dragToLook;

  // Dynamic resizing/rendering
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  // Main render loop
  function render(time) {
    // Time elapsed since last render
    const delta = clock.getDelta();


    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    // controls.movementSpeed = 0.33 * d;
    controls.update( delta );

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
  console.log("Outputting all objects in scene");
  console.log(objects);
}

// Run main function loop
main();