
// Imports from NPM
import * as THREE from 'three';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js'

// // import getClasses from './getClasses'

// // console.log("ran from index.js");
// // getClasses();

// // const obj = { a: 'alpha', b: 'bravo' }
// // const newObj = { ...obj, c: 'charlie' }
// // console.log(newObj)
// import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/build/three.module.js';
// import { FlyControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/FlyControls.js';
// // import { FlyControls } from '../jsm/FlyControls.js';

function main() {
  // Setup renderer
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});

  // Camera
  const fov = 90;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 60;
  camera.position.y = 20;

  let controls;

  // Init scene
  const scene = new THREE.Scene();

  // Main grid
  const gridSize = 30;
  let grid = new Array(gridSize).fill(new Array(gridSize).fill(0));

  // Lighting
  {
    const color = 0xFFFFFF;
    const intensity = 0.75;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
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
    obj.position.x = x * spread;
    obj.position.z = y * spread;

    scene.add(obj);
    objects.push(obj);
  }

  function addSolidGeometry(x, y, geometry) {
    const mesh = new THREE.Mesh(geometry, createMaterial());
    addObject(x, y, mesh);
  }

  // Sphere props
  const radius = 5;  
  const detail = 4;

  // This can be made much neater
  addSolidGeometry(-4, 0, new THREE.DodecahedronGeometry(radius, detail));
  addSolidGeometry(-2, 0, new THREE.DodecahedronGeometry(radius, detail));
  addSolidGeometry(0, 0, new THREE.DodecahedronGeometry(radius, detail));
  addSolidGeometry(2, 0, new THREE.DodecahedronGeometry(radius, detail));
  addSolidGeometry(4, 0, new THREE.DodecahedronGeometry(radius, detail));

  addSolidGeometry(-4, 2, new THREE.DodecahedronGeometry(radius, detail));
  addSolidGeometry(-2, 2, new THREE.DodecahedronGeometry(radius, detail));
  addSolidGeometry(0, 2, new THREE.DodecahedronGeometry(radius, detail));
  addSolidGeometry(2, 2, new THREE.DodecahedronGeometry(radius, detail));
  addSolidGeometry(4, 2, new THREE.DodecahedronGeometry(radius, detail));

  addSolidGeometry(-4, -2, new THREE.DodecahedronGeometry(radius, detail));
  addSolidGeometry(-2, -2, new THREE.DodecahedronGeometry(radius, detail));
  addSolidGeometry(0, -2, new THREE.DodecahedronGeometry(radius, detail));
  addSolidGeometry(2, -2, new THREE.DodecahedronGeometry(radius, detail));
  addSolidGeometry(4, -2, new THREE.DodecahedronGeometry(radius, detail));

  addSolidGeometry(-4, -4, new THREE.DodecahedronGeometry(radius, detail));
  addSolidGeometry(-2, -4, new THREE.DodecahedronGeometry(radius, detail));
  addSolidGeometry(0, -4, new THREE.DodecahedronGeometry(radius, detail));
  addSolidGeometry(2, -4, new THREE.DodecahedronGeometry(radius, detail));
  addSolidGeometry(4, -4, new THREE.DodecahedronGeometry(radius, detail));

  // Controls
  controls = new FlyControls( camera, renderer.domElement );

  controls.movementSpeed = 10;
  controls.domElement = renderer.domElement;
  controls.rollSpeed = Math.PI / 48;
  controls.autoForward = false;
  controls.dragToLook = true;

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
    time *= 0.001;  // convert time to seconds

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    // Adds rotation to cubes
    // cubes.forEach((cube, ndx) => {
    //   const speed = 1 + ndx * .1;
    //   const rot = time * speed;
    //   cube.rotation.x = rot;
    //   cube.rotation.y = rot;
    // });

    // controls.movementSpeed = 0.33 * d;
    controls.update( time/50 );

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

// Run main function loop
main();