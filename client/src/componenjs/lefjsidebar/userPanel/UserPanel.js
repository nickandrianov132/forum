"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _LogoutButton = _interopRequireDefault(require("./LogoutButton"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var UserPanel = function UserPanel() {
  return /*#__PURE__*/React.createElement("div", {
    className: "user_panel"
  }, /*#__PURE__*/React.createElement(_LogoutButton.default, null));
};
var _default = exports.default = UserPanel;