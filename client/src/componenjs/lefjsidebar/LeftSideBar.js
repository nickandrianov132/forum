"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _LoginForm = _interopRequireDefault(require("./LoginForm"));
var _hooks = require("../../store/hooks");
var _UserPanel = _interopRequireDefault(require("./userPanel/UserPanel"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var LeftSideBar = function LeftSideBar() {
  var _useAppSelector = (0, _hooks.useAppSelector)(function (state) {
      return state.user;
    }),
    accessToken = _useAppSelector.accessToken;
  console.log(accessToken);
  return /*#__PURE__*/React.createElement("div", {
    className: "left_sidebar"
  }, accessToken.length !== 0 ? /*#__PURE__*/React.createElement(_UserPanel.default, null) : /*#__PURE__*/React.createElement(_LoginForm.default, null));
};
var _default = exports.default = LeftSideBar;