"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _HeaderLogo = _interopRequireDefault(require("./content/HeaderLogo"));
var _UserPanel = _interopRequireDefault(require("./userPanel/UserPanel"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var Header = function Header() {
  return /*#__PURE__*/React.createElement("header", {
    className: "w-full bg-slate-900 border-b border-gray-800"
  }, /*#__PURE__*/React.createElement("nav", {
    className: "max-w-7xl mx-auto px-4 h-16 flex justify-between items-center"
  }, /*#__PURE__*/React.createElement(_HeaderLogo.default, null), /*#__PURE__*/React.createElement(_UserPanel.default, null)));
};
var _default = exports.default = Header;