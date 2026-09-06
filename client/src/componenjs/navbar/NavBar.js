"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _NavItem = _interopRequireDefault(require("./NavItem"));
var _UserPanel = _interopRequireDefault(require("./userPanel/UserPanel"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var NavBar = function NavBar() {
  return /*#__PURE__*/React.createElement("header", {
    className: "navbar"
  }, /*#__PURE__*/React.createElement(_NavItem.default, null), /*#__PURE__*/React.createElement(_UserPanel.default, null));
};
var _default = exports.default = NavBar;