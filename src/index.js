
import * as THREE from 'three';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';

import calculateGrid  from './grid';
import nodes from './nodes.json';
import { cameraSettings, sceneSettings, lightSettings, sphereSettings, gridSettings, controlSettings, debug } from './defaults';

// import GreySeal from './assets/greySealSkull.jpg';

let camera, scene, controls, raycaster, renderer;
let INTERSECTED;

let mouse = new THREE.Vector2(); 

const clock = new THREE.Clock();

init();
animate();

function init() {
  

  // Camera
  const fov = cameraSettings.fov;
  const aspect = window.innerWidth / window.innerHeight;
  const near = cameraSettings.near;
  const far = cameraSettings.far;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.x = cameraSettings.startX;
  camera.position.z = cameraSettings.startZ;
  camera.position.y = cameraSettings.startY;

  // Init scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(sceneSettings.backgroundColor);

  // Not currently in use
  calculateGrid();

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

  // Add objects to scene
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

  function addBoxGeometry(x, y, material, name) {
    const loader = new THREE.TextureLoader();
    const boxMaterial = new THREE.MeshBasicMaterial({
      // These are loaded from the dist folder
      // TODO not sure how to set up with webpack better?
      map: loader.load(material),
      // map: loader.load('https://threejsfundamentals.org/threejs/resources/images/wall.jpg'),
      // color: 0xFF8844,
    })
    const boxGeometry = new THREE.BoxGeometry(9, 9, 9);
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.name = name;
    addObject(x, y, boxMesh);
  }

  // Could also use TubeGeometry to make this, could be a bit more organic

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
      addBoxGeometry((node.position[0])-15, (node.position[1])-15, node.image, node.name);
    })

  }

  initGrid();

  // Test shape
  // addSolidGeometry(-4, 0, new THREE.DodecahedronGeometry(radius, detail));
    // Test object
  // addPlaneGeometry(0, 0, './assets/greysealskull.jpg');

  addEdgeGeometry(-1.6, -0.69);

  raycaster = new THREE.Raycaster();

  // Setup renderer
  const canvas = document.querySelector('#c');
  renderer = new THREE.WebGLRenderer({canvas});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Controls
  controls = new FlyControls( camera, renderer.domElement );

  controls.movementSpeed = controlSettings.movSpeed;
  controls.domElement = renderer.domElement;
  controls.rollSpeed = controlSettings.rollSpeed;
  controls.autoForward = controlSettings.autoForward;
  controls.dragToLook = controlSettings.dragToLook;

  // Event listener for mouse
  document.addEventListener( 'mousedown', onDocumentMouseDown, false );

  // Event listener for resize
  window.addEventListener( 'resize', onWindowResize );

  // Info panel - TODO
  const infoPanel = document.querySelector('#info');
}

function onWindowResize() {
  const canvas = renderer.domElement;
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}

function onDocumentMouseDown(event) {
  const et = event.target
  const de = renderer.domElement;
  // Appears to work better without offsets
  // const trueX = (event.clientX - et.offsetLeft);
  // const trueY = (event.clientY - et.offsetTop);
  const trueX = event.clientX;
  const trueY = event.clientY;
  mouse.x = ( (trueX / de.clientWidth) * 2 - 1);
  mouse.y = - (trueY / de.clientHeight) * 2 + 1;
  console.log(de.clientWidth, de.clientHeight);
  console.log(`${event.clientX}, ${et.offsetLeft}, position ${event.clientX - et.offsetLeft}, ${event.pageX}`);

  // OG
  // mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  // mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  if(debug.objectSelection) console.log(`event click: ${event.clientX}, ${event.clientY}. mouse: ${mouse.x}, ${mouse.y}`);
}

function animate() {
  requestAnimationFrame( animate );

  render();
}

// Main render loop
function render() {
  // Time elapsed since last render
  const delta = clock.getDelta();

  // controls.movementSpeed = 0.33 * d;
  controls.update( delta );
  camera.updateMatrixWorld();

  // Raycasting (from https://threejs.org/examples/#webgl_interactive_cubes)
  raycaster.setFromCamera( mouse, camera );
  const intersects = raycaster.intersectObjects( scene.children );
  // If we have intersected things
  if ( intersects.length > 0 ) {
    // If we have intersected a new thing (closest)
    if ( INTERSECTED != intersects[ 0 ].object ) {
      // Store the last intersected thing
      INTERSECTED = intersects[ 0 ].object;
      if(debug.objectSelection) {
        intersects[0].object.material.color.setHex(0x000000);
      console.log(intersects[0]);
      }
    }
  }
  // We intersected nothing, clear our store
  else {
    INTERSECTED = null;
  }
  renderer.render(scene, camera);

  // requestAnimationFrame(render);
}


// function main() {

//   // Dynamic resizing/rendering
//   function resizeRendererToDisplaySize(renderer) {
//     const canvas = renderer.domElement;
//     const width = canvas.clientWidth;
//     const height = canvas.clientHeight;
//     const needResize = canvas.width !== width || canvas.height !== height;
//     if (needResize) {
//       renderer.setSize(width, height, false);
//     }
//     return needResize;
//   }

  
  
  
  

//   // function onDocumentMouseDown( event ) 
//   // {
//   //   // the following line would stop any other event handler from firing
//   //   // (such as the mouse's TrackballControls)
//   //   // event.preventDefault();
    
//   //   // console.log(`Click.`);
    
//   //   // update the mouse variable
//   //   // mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//   //   // mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
//   //   // console.log(`Click. W:${mouse.x}, H:${mouse.y}`);

//   //   // Calculates the offset of the window
//   //   let et = event.target, de = renderer.domElement;
//   //   let trueX = (event.pageX - et.offsetLeft);
//   //   let trueY = (event.pageY - et.offsetTop);
//   //   mouse.x = (((trueX / de.width) * 2) -1);
//   //   mouse.y = (((trueY / de.height) * -2) +1);
//   //   console.log(`Click. W:${mouse.x}, H:${mouse.y}`);
    
//   //   // Raycasting
//   //   raycaster.setFromCamera( mouse, camera );

//   //   // const intersects = raycaster.intersectObjects( objects, recursiveFlag );
//   //   const intersects = raycaster.intersectObjects( scene.children );
    
//   //   // find intersections

//   //   // create a Ray with origin at the mouse position
//   //   //   and direction into the scene (camera direction)
//   //   // var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
//   //   // projector.unprojectVector( vector, camera );
//   //   // var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

//   //   // // create an array containing all objects in the scene with which the ray intersects
//   //   // var intersects = ray.intersectObjects( targetList );
    
//   //   // if there is one (or more) intersections
//   //   if ( intersects.length > 0 )
//   //   {
//   //     console.log(intersects);
//   //     console.log("Hit @ " + toString( intersects[0].point ) );
//   //     intersects[0].object.material.color.setHex(0x000000);
//   //   }

//   // }


  
//   window.requestAnimationFrame(render);
//   // console.log("Outputting all objects in scene");
//   // console.log(objects);
// }

// // Run main function loop
// main();