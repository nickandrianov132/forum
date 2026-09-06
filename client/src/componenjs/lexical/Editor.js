"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Editor;
var _LexicalComposer = require("@lexical/react/LexicalComposer");
var _LexicalRichTextPlugin = require("@lexical/react/LexicalRichTextPlugin");
var _LexicalContentEditable = require("@lexical/react/LexicalContentEditable");
var _LexicalHistoryPlugin = require("@lexical/react/LexicalHistoryPlugin");
var _LexicalErrorBoundary = require("@lexical/react/LexicalErrorBoundary");
var _LexicalListPlugin = require("@lexical/react/LexicalListPlugin");
var _LexicalOnChangePlugin = require("@lexical/react/LexicalOnChangePlugin");
var _ToolbarPlugin = require("./ToolbarPlugin.js");
var _sharedNodes = require("./sharedNodes.js");
var _initialStateHelper = _interopRequireDefault(require("./utils/initialStateHelper.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Импортируем Toolbar

var theme = {
  list: {
    nested: {
      listitem: 'my-nested-listitem'
    },
    ol: 'my-ol-list',
    ul: 'my-ul-list',
    listitem: 'my-listitem'
  },
  heading: {
    h1: 'my-h1-style',
    h2: 'my-h2-style'
  },
  text: {
    bold: 'my-bold-text',
    italic: 'my-italic-text',
    underline: 'my-underline-text',
    strikethrough: 'my-strikethrough-text'
  }
};
function Editor(_ref) {
  var initialContent = _ref.initialContent,
    onChange = _ref.onChange;
  var initialConfig = {
    namespace: 'MyEditor',
    nodes: _sharedNodes.EDITOR_NODES,
    editorState: (0, _initialStateHelper.default)(initialContent),
    // Если в базе пусто, Lexical может упасть, поэтому проверяем на наличие данных
    // editorState: initialContent || undefined,
    theme: theme,
    onError: function onError(error) {
      return console.error(error);
    }
  };
  var handleOnChange = function handleOnChange(editorState) {
    var jsonString = JSON.stringify(editorState.toJSON());
    onChange(jsonString); // Отправляем строку в PostDetail
  };
  return /*#__PURE__*/React.createElement(_LexicalComposer.LexicalComposer, {
    initialConfig: initialConfig
  }, /*#__PURE__*/React.createElement("div", {
    className: "editor-container"
  }, /*#__PURE__*/React.createElement(_ToolbarPlugin.ToolbarPlugin, null), /*#__PURE__*/React.createElement(_LexicalRichTextPlugin.RichTextPlugin, {
    contentEditable: /*#__PURE__*/React.createElement(_LexicalContentEditable.ContentEditable, {
      className: "editor-input"
    }),
    placeholder: /*#__PURE__*/React.createElement("div", {
      className: "placeholder"
    }, "\u041D\u0430\u0447\u043D\u0438\u0442\u0435 \u043F\u0438\u0441\u0430\u0442\u044C \u043F\u043E\u0441\u0442..."),
    ErrorBoundary: _LexicalErrorBoundary.LexicalErrorBoundary
  }), /*#__PURE__*/React.createElement(_LexicalHistoryPlugin.HistoryPlugin, null), /*#__PURE__*/React.createElement(_LexicalListPlugin.ListPlugin, null), /*#__PURE__*/React.createElement(_LexicalOnChangePlugin.OnChangePlugin, {
    onChange: handleOnChange
  })));
}