"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _LeftSideBar = _interopRequireDefault(require("../leftSidebar/LeftSideBar"));
var _RightSideBar = _interopRequireDefault(require("../rightSidebar/RightSideBar"));
var _AppRouter = _interopRequireDefault(require("./AppRouter"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var Body = function Body() {
  return /*#__PURE__*/React.createElement("div", {
    className: "body"
  }, /*#__PURE__*/React.createElement(_LeftSideBar.default, null), /*#__PURE__*/React.createElement(_AppRouter.default, null), /*#__PURE__*/React.createElement(_RightSideBar.default, null));
};
var _default = exports.default = Body;