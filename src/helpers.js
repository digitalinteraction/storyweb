// Not entirely sure having this helper file is any use, as have to pass in THREE each time
export function createMaterialByColor(hue, sat, lum, THREE2) {
  const material = new THREE2.MeshPhongMaterial({
    side: THREE2.DoubleSide,
  });

  material.color.setHSL(hue, sat, lum);

  return material;
}

export function generatePlaneMesh(material, sizeX, sizeY, THREE2) {
  const loader = new THREE2.TextureLoader();
  const planeMaterial = new THREE2.MeshBasicMaterial({
    map: loader.load(material),
  });
  const planeGeometry = new THREE2.PlaneGeometry(sizeX, sizeY);
  return new THREE2.Mesh(planeGeometry, planeMaterial);
}

export function generateBoxMesh(material, sizeX, sizeY, sizeZ, THREE2) {
  const loader = new THREE2.TextureLoader();
  const boxMaterial = new THREE2.MeshLambertMaterial({
    map: loader.load(material),
  });
  const boxGeometry = new THREE2.BoxGeometry(sizeX, sizeY, sizeZ);
  return new THREE2.Mesh(boxGeometry, boxMaterial);
}

// export function generateEdgeMesh(THREE2) {
//   // Test cylinder (edge)
//   return new THREE2.Mesh(
//     new THREE2.CylinderGeometry(
//       def.edge.radiusTop,
//       def.edge.radiusBottom,
//       def.edge.height,
//       def.edge.radialSegments,
//     ),
//     createMaterial(),
//   );
// }

// export function createPhongMaterial() {
//   const material = new THREE.MeshPhongMaterial({
//     side: THREE.DoubleSide,
//   });

//   const hue = Math.random();
//   const saturation = 1;
//   const luminance = 0.5;
//   material.color.setHSL(hue, saturation, luminance);

//   return material;
// }

// export function generateSolidMesh(geometry) {
//   return new THREE.Mesh(geometry, createMaterial());
// }

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

// const extLoader = new THREE.TextureLoader();

// export const audioOnMaterial = new THREE.MeshBasicMaterial({
//   map: extLoader.load(audioOn),
// });
// export const audioOffMaterial = new THREE.MeshBasicMaterial({
//   map: extLoader.load(audioOff),
// });

// export function createMaterial() {
//   const material = new THREE.MeshPhongMaterial({
//     side: THREE.DoubleSide,
//   });

//   const hue = Math.random();
//   const saturation = 1;
//   const luminance = 0.5;
//   material.color.setHSL(hue, saturation, luminance);

//   return material;
// }
