export const settings = {
  scene: {
    backgroundColor: 0x202020,
  },
  camera: {
    fov: 90,
    near: 1,
    far: 1000,
    startX: -40,
    startY: 10,
    startZ: 50,
  },
  light: [
    {
      id: 0,
      color: 0xFFFFFF,
      intensity: 0.9,
      x: -1,
      y: 2,
      z: 100,
    },
  ],
  grid: {
    size: 30,
    spread: 40,
  },
  sphere: {
    radius: 5,
    detail: 4,
  },
  node: {
    height: 12,
    width: 12,
    depth: 3.5,
  },
  edge: {
    radiusTop: 0.5,
    radiusBottom: 0.5,
    height: 70,
    radialSegments: 12,
  },
  background: {
    height: 800,
    width: 1600,
  },
  control: {
    movSpeed: 30,
    rollSpeed: Math.PI / 12,
    autoForward: false,
    dragToLook: true,
  },
  debug: {
    godMode: false,
    clickEvent: false,
    objectSelection: false,
    goToObject: false,
    highlightSelection: false,
    edgeCalculation: false,
    axesHelper: true,
  },
  sound: {
    refDistance: 5,
  },
};

export const grid = {
  empty: new Array(settings.grid.size).fill(new Array(settings.grid.size).fill(0)),
};

// // Lighting
// export const lightSettings = [
//   {
//     id: 0,
//     color: 0xFFFFFF,
//     intensity: 0.75,
//     x: -1,
//     y: 2,
//     z: 100,
//   }
// ]

// // Grid & Spheres
// export const gridSettings = {
//   size: 30,
//   spread: 40,
// }

// export const sphereSettings = {
//   radius: 5,
//   detail: 4,
// }

// // Controls
// export const controlSettings = {
//   movSpeed: 30,
//   rollSpeed: Math.PI / 24,
//   autoForward: false,
//   dragToLook: true,
// }

// export const debug = {
//   objectSelection: false,
// }

// export const soundSettings = {
//   refDistance: 5,
// }
