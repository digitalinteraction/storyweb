export const sceneSettings = {
  backgroundColor: 0xA0A0A0
}

export const cameraSettings = {
  fov: 90,
  near: 0.1,
  far: 1000,
  startZ: 20,
  startY: 10,
  startX: -40,
}

// Lighting
export const lightSettings = [
  {
    id: 0,
    color: 0xFFFFFF,
    intensity: 0.75,
    x: -1,
    y: 2,
    z: 100, 
  }
]

// Grid & Spheres
export const gridSettings = {
  size: 30,
  spread: 40,
}
export const grid = {
  empty: new Array(gridSettings.size).fill(new Array(gridSettings.size).fill(0)),
}

export const sphereSettings = {
  radius: 5,
  detail: 4,
}

// Controls
export const controlSettings = {
  movSpeed: 30,
  rollSpeed: Math.PI / 24,
  autoForward: false,
  dragToLook: true,
}