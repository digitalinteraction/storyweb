import * as THREE from 'three';
import { settings as def } from './defaults';

const extLoader = new THREE.TextureLoader();

export const audioOnMaterial = new THREE.MeshBasicMaterial({
  map: extLoader.load(def.sound.iconTextureOn),
});
export const audioOffMaterial = new THREE.MeshBasicMaterial({
  map: extLoader.load(def.sound.iconTextureOff),
});

export function createMaterial() {
  const material = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
  });

  const hue = Math.random();
  const saturation = 1;
  const luminance = 0.5;
  material.color.setHSL(hue, saturation, luminance);

  return material;
}

export function createMaterialByColor(hue, sat, lum) {
  const material = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
  });

  material.color.setHSL(hue, sat, lum);

  return material;
}

export function createPhongMaterial() {
  const material = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
  });

  const hue = Math.random();
  const saturation = 1;
  const luminance = 0.5;
  material.color.setHSL(hue, saturation, luminance);

  return material;
}

export function generateSolidMesh(geometry) {
  return new THREE.Mesh(geometry, createMaterial());
}

export function generatePlaneMesh(material, sizeX, sizeY) {
  const loader = new THREE.TextureLoader();
  const planeMaterial = new THREE.MeshBasicMaterial({
    // These are loaded from the dist folder
    // TODO not sure how to set up with webpack better?
    map: loader.load(material),
  });
  const planeGeometry = new THREE.PlaneGeometry(sizeX, sizeY);
  return new THREE.Mesh(planeGeometry, planeMaterial);
}

export function generateBoxMesh(material, sizeX, sizeY, sizeZ) {
  const loader = new THREE.TextureLoader();
  const boxMaterial = new THREE.MeshLambertMaterial({
    map: loader.load(material),
  });
  // const boxMaterial = new THREE.MeshBasicMaterial({
  //   // These are loaded from the dist folder
  //   // TODO not sure how to set up with webpack better?
  //   map: loader.load(material),
  // });
  const boxGeometry = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);
  return new THREE.Mesh(boxGeometry, boxMaterial);
}

export function generateEdgeMesh() {
  // Test cylinder (edge)
  return new THREE.Mesh(
    new THREE.CylinderGeometry(
      def.edge.radiusTop,
      def.edge.radiusBottom,
      def.edge.height,
      def.edge.radialSegments,
    ),
    createMaterial(),
  );
}

// function createMaterial() {
//   const material = new THREE.MeshPhongMaterial({
//     side: THREE.DoubleSide,
//   });

//   const hue = Math.random();
//   const saturation = 1;
//   const luminance = .5;
//   material.color.setHSL(hue, saturation, luminance);

//   return material;
// }

