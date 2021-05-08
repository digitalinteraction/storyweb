/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "https://threejsfundamentals.org/threejs/resources/threejs/r125/build/three.module.js":
false,

/***/ "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/FlyControls.js":
false

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! https://threejsfundamentals.org/threejs/resources/threejs/r125/build/three.module.js */ "https://threejsfundamentals.org/threejs/resources/threejs/r125/build/three.module.js");
/* harmony import */ var https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var https_threejsfundamentals_org_threejs_resources_threejs_r125_examples_jsm_controls_FlyControls_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/FlyControls.js */ "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/FlyControls.js");
/* harmony import */ var https_threejsfundamentals_org_threejs_resources_threejs_r125_examples_jsm_controls_FlyControls_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(https_threejsfundamentals_org_threejs_resources_threejs_r125_examples_jsm_controls_FlyControls_js__WEBPACK_IMPORTED_MODULE_1__);
// import getClasses from './getClasses'
// console.log("ran from index.js");
// getClasses();
// const obj = { a: 'alpha', b: 'bravo' }
// const newObj = { ...obj, c: 'charlie' }
// console.log(newObj)

 // import { FlyControls } from '../jsm/FlyControls.js';

function main() {
  // Setup renderer
  var canvas = document.querySelector('#c');
  var renderer = new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.WebGLRenderer({
    canvas: canvas
  }); // Camera

  var fov = 90;
  var aspect = window.innerWidth / window.innerHeight;
  var near = 0.1;
  var far = 1000;
  var camera = new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 60;
  camera.position.y = 20;
  var controls; // Init scene

  var scene = new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.Scene(); // Main grid

  var gridSize = 30;
  var grid = new Array(gridSize).fill(new Array(gridSize).fill(0)); // Lighting

  {
    var color = 0xFFFFFF;
    var intensity = 0.75;
    var light = new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  } // Box geometry

  var boxWidth = 1;
  var boxHeight = 1;
  var boxDepth = 1;
  var boxGeometry = new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.BoxGeometry(boxWidth, boxHeight, boxDepth); // const material = new THREE.MeshBasicMaterial({color: 0x44aa88});
  // Object & material creation

  var objects = []; // Array of objects

  var spread = 15;

  function createMaterial() {
    var material = new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.MeshPhongMaterial({
      side: https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.DoubleSide
    });
    var hue = Math.random();
    var saturation = 1;
    var luminance = .5;
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
    var mesh = new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.Mesh(geometry, createMaterial());
    addObject(x, y, mesh);
  } // Sphere props


  var radius = 5;
  var detail = 4; // This can be made much neater

  addSolidGeometry(-4, 0, new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.DodecahedronGeometry(radius, detail));
  addSolidGeometry(-2, 0, new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.DodecahedronGeometry(radius, detail));
  addSolidGeometry(0, 0, new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.DodecahedronGeometry(radius, detail));
  addSolidGeometry(2, 0, new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.DodecahedronGeometry(radius, detail));
  addSolidGeometry(4, 0, new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.DodecahedronGeometry(radius, detail));
  addSolidGeometry(-4, 2, new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.DodecahedronGeometry(radius, detail));
  addSolidGeometry(-2, 2, new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.DodecahedronGeometry(radius, detail));
  addSolidGeometry(0, 2, new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.DodecahedronGeometry(radius, detail));
  addSolidGeometry(2, 2, new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.DodecahedronGeometry(radius, detail));
  addSolidGeometry(4, 2, new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.DodecahedronGeometry(radius, detail));
  addSolidGeometry(-4, -2, new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.DodecahedronGeometry(radius, detail));
  addSolidGeometry(-2, -2, new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.DodecahedronGeometry(radius, detail));
  addSolidGeometry(0, -2, new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.DodecahedronGeometry(radius, detail));
  addSolidGeometry(2, -2, new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.DodecahedronGeometry(radius, detail));
  addSolidGeometry(4, -2, new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.DodecahedronGeometry(radius, detail));
  addSolidGeometry(-4, -4, new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.DodecahedronGeometry(radius, detail));
  addSolidGeometry(-2, -4, new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.DodecahedronGeometry(radius, detail));
  addSolidGeometry(0, -4, new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.DodecahedronGeometry(radius, detail));
  addSolidGeometry(2, -4, new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.DodecahedronGeometry(radius, detail));
  addSolidGeometry(4, -4, new https_threejsfundamentals_org_threejs_resources_threejs_r125_build_three_module_js__WEBPACK_IMPORTED_MODULE_0__.DodecahedronGeometry(radius, detail)); // Controls

  controls = new https_threejsfundamentals_org_threejs_resources_threejs_r125_examples_jsm_controls_FlyControls_js__WEBPACK_IMPORTED_MODULE_1__.FlyControls(camera, renderer.domElement);
  controls.movementSpeed = 10;
  controls.domElement = renderer.domElement;
  controls.rollSpeed = Math.PI / 48;
  controls.autoForward = false;
  controls.dragToLook = true; // Dynamic resizing/rendering

  function resizeRendererToDisplaySize(renderer) {
    var canvas = renderer.domElement;
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;
    var needResize = canvas.width !== width || canvas.height !== height;

    if (needResize) {
      renderer.setSize(width, height, false);
    }

    return needResize;
  } // Main render loop


  function render(time) {
    time *= 0.001; // convert time to seconds

    if (resizeRendererToDisplaySize(renderer)) {
      var _canvas = renderer.domElement;
      camera.aspect = _canvas.clientWidth / _canvas.clientHeight;
      camera.updateProjectionMatrix();
    } // Adds rotation to cubes
    // cubes.forEach((cube, ndx) => {
    //   const speed = 1 + ndx * .1;
    //   const rot = time * speed;
    //   cube.rotation.x = rot;
    //   cube.rotation.y = rot;
    // });
    // controls.movementSpeed = 0.33 * d;


    controls.update(time / 50);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
} // Run main function loop


main();
})();

/******/ })()
;
//# sourceMappingURL=main.js.map