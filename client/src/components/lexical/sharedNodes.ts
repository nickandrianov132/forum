// sharedNodes.ts или прямо в файле Editor.tsx
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';

export const EDITOR_NODES = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
];
// Теперь используй EDITOR_NODES и в Editor, и в LexicalHTMLRenderer