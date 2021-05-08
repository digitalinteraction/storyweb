
import * as THREE from 'three';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';

import calculateGrid  from './grid';
import { cameraSettings, lightSettings, controlSettings } from './defaults';


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
  camera.position.z = cameraSettings.startZ;
  camera.position.y = cameraSettings.startY;

  let controls;

  // Init scene
  const scene = new THREE.Scene();

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