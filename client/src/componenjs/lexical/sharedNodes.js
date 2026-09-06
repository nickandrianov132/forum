"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EDITOR_NODES = void 0;
var _richText = require("@lexical/rich-text");
var _list = require("@lexical/list");
// sharedNodes.ts или прямо в файле Editor.tsx

var EDITOR_NODES = exports.EDITOR_NODES = [_richText.HeadingNode, _richText.QuoteNode, _list.ListNode, _list.ListItemNode];
// Теперь используй EDITOR_NODES и в Editor, и в LexicalHTMLRenderer