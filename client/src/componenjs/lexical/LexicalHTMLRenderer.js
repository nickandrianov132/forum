"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.LexicalHTMLRenderer = void 0;
var _lexical = require("lexical");
var _html = require("@lexical/html");
var _react = require("react");
var _sharedNodes = require("./sharedNodes");
var _initialStateHelper = _interopRequireDefault(require("./utils/initialStateHelper"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
// Конфиг должен включать те же узлы, что и редактор
var editorConfig = {
  nodes: _sharedNodes.EDITOR_NODES,
  onError: function onError(e) {
    return console.error(e);
  }
};
var LexicalHTMLRenderer = exports.LexicalHTMLRenderer = function LexicalHTMLRenderer(_ref) {
  var jsonString = _ref.jsonString;
  var _useState = (0, _react.useState)(''),
    _useState2 = _slicedToArray(_useState, 2),
    html = _useState2[0],
    setHtml = _useState2[1];
  (0, _react.useEffect)(function () {
    var editor = (0, _lexical.createEditor)(editorConfig);
    var safeContent = (0, _initialStateHelper.default)(jsonString); // Тоже используем хелпер
    // Загружаем JSON в виртуальный редактор и генерируем HTML
    editor.setEditorState(editor.parseEditorState(safeContent));
    editor.update(function () {
      var htmlString = (0, _html.$generateHtmlFromNodes)(editor);
      setHtml(htmlString);
    });
  }, [jsonString]);

  // Выводим результат как безопасный HTML
  return /*#__PURE__*/React.createElement("div", {
    className: "lexical-render-output",
    dangerouslySetInnerHTML: {
      __html: html
    }
  });
};
var _default = exports.default = LexicalHTMLRenderer;