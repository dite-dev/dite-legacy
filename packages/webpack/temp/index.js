import * as __WEBPACK_EXTERNAL_MODULE_express__ from "express";
/******/ var __webpack_modules__ = ({

/***/ "./node_modules/@fs-dite/routes/index.js":
/*!***********************************************!*\
  !*** ./node_modules/@fs-dite/routes/index.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });

  /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({ 
    routes: [],
    ssr: true,
    date: 1667562898016
  });
  

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var x = y => { var x = {}; __webpack_require__.d(x, y); return x; }
var y = x => () => x
module.exports = x({ ["default"]: () => __WEBPACK_EXTERNAL_MODULE_express__["default"] });

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**************************************************!*\
  !*** ./packages/webpack/test/fixtures/server.ts ***!
  \**************************************************/
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var _fs_dite_routes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @fs-dite/routes */ "./node_modules/@fs-dite/routes/index.js");



async function run() {
    const app = (0,express__WEBPACK_IMPORTED_MODULE_0__["default"])()

    console.log(__dirname)
    console.log(_fs_dite_routes__WEBPACK_IMPORTED_MODULE_1__["default"])
    app.get('/', (req, res) => {
        res.send('hello world');
    })

    return new Promise((resolve) => {
        app.listen(3000, () => {
            resolve(app)
        })
    })
}

run()
})();

