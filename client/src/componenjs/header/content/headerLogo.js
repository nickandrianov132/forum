"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Images = _interopRequireDefault(require("../../../assets/Images"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var HeaderLogo = function HeaderLogo() {
  return /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-center w-auto"
  }, /*#__PURE__*/React.createElement("img", {
    className: "w-20",
    src: _Images.default.title_logo1
  }), /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-blue-50 text-3xl"
  }, "MU VOID", /*#__PURE__*/React.createElement("span", {
    className: "ml-2.5 font-marker"
  }, "Forum")));
};
var _default = exports.default = HeaderLogo;