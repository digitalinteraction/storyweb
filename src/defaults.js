export const settings = {
  scene: {
    backgroundColor: 0xA0A0A0
  },
  camera: {
    fov: 90,
    near: 1,
    far: 1000,
    startZ: 20,
    startY: 10,
    startX: -40,
  },
  light: [
    {
      id: 0,
      color: 0xFFFFFF,
      intensity: 0.75,
      x: -1,
      y: 2,
      z: 100, 
    }
  ],
  grid: {
    size: 30,
    spread: 40,
  },
  sphere: {
    radius: 5,
    detail: 4,
  },
  control: {
    movSpeed: 30,
    rollSpeed: Math.PI / 24,
    autoForward: false,
    dragToLook: true,
  },
  debug: {
    objectSelection: false,
  },
  sound: {
    refDistance: 5,
  },
}

export const grid = {
  empty: new Array(settings.grid.size).fill(new Array(settings.grid.size).fill(0)),
}

// export const sceneSettings = {
  
// }

// export const cameraSettings = {
  
// }

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