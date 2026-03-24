"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.publicRoutes = exports.authRoutes = void 0;
var _AccountInfo = _interopRequireDefault(require("../pages/AccountInfo.tsx"));
var _News = _interopRequireDefault(require("../pages/News.tsx"));
var _Posts = _interopRequireDefault(require("../pages/Posts.tsx"));
var _constants = require("./constants");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var authRoutes = exports.authRoutes = [{
  path: _constants.ACCOUNT_INFO_ROUTE,
  Component: _AccountInfo.default
}];
var publicRoutes = exports.publicRoutes = [{
  path: _constants.NEWS_ROUTE,
  Component: _News.default
}, {
  path: _constants.GUIDES_ROUTE,
  Component: _News.default
}, {
  path: _constants.POSTS_ROUTE,
  Component: _Posts.default
}];