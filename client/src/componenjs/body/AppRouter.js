"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _reactRouter = require("react-router");
var _routes = require("../../utils/routes.ts");
var _News = _interopRequireDefault(require("../../pages/News"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var AppRouter = function AppRouter() {
  var isAuth = true;
  return /*#__PURE__*/React.createElement("div", {
    className: "router_container"
  }, /*#__PURE__*/React.createElement(_reactRouter.Routes, null, isAuth && _routes.authRoutes.map(function (_ref) {
    var path = _ref.path,
      Component = _ref.Component;
    return /*#__PURE__*/React.createElement(_reactRouter.Route, {
      key: path,
      path: path,
      element: /*#__PURE__*/React.createElement(Component, null)
    });
  }), _routes.publicRoutes.map(function (_ref2) {
    var path = _ref2.path,
      Component = _ref2.Component;
    return /*#__PURE__*/React.createElement(_reactRouter.Route, {
      key: path,
      path: path,
      element: /*#__PURE__*/React.createElement(Component, null)
    });
  }), /*#__PURE__*/React.createElement(_reactRouter.Route, {
    path: "*",
    element: /*#__PURE__*/React.createElement(_News.default, null)
  })));
};
var _default = exports.default = AppRouter;