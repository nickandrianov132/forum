"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _hooks = require("../../../store/hooks");
var _LoginForm = _interopRequireDefault(require("./LoginForm"));
var _LogoutButton = _interopRequireDefault(require("./LogoutButton"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var UserPanel = function UserPanel() {
  var _useAppSelector = (0, _hooks.useAppSelector)(function (state) {
      return state.user;
    }),
    accessToken = _useAppSelector.accessToken;
  console.log(accessToken);
  var isLoggedIn = !!accessToken;
  console.log(isLoggedIn);
  return /*#__PURE__*/React.createElement("div", {
    className: "user_panel"
  }, isLoggedIn ? /*#__PURE__*/React.createElement(_LogoutButton.default, null) : /*#__PURE__*/React.createElement(_LoginForm.default, null));
};
var _default = exports.default = UserPanel;