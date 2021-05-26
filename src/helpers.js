import * as THREE from 'three';

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
