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
      type: 'directional',
      color: 0xFFFFFF,
      intensity: 0.9,
      x: -1,
      y: 2,
      z: 100,
    },
    {
      id: 1,
      type: 'ambient',
      color: 0x303030,
      intensity: 0.3,
      x: 100,
      y: 0,
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
    hue: 0.54,
    sat: 0.50,
    lum: 0.60,
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
    axesHelper: false,
  },
  sound: {
    refDistance: 5,
  },
  timeout: {
    // time: 900000, // 15 mins
    time: 180000, // 3 min
    // time: 60000, // 1 min
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