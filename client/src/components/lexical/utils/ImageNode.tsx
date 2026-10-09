import { DecoratorNode, type NodeKey, type EditorConfig, type LexicalNode, type SerializedLexicalNode, type Spread, type DOMExportOutput } from 'lexical';
import React from 'react';

export type SerializedImageNode = Spread<
  {
    src: string;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<React.JSX.Element> {
  __src: string;

  static getType(): string { return 'image'; }
  static clone(node: ImageNode): ImageNode { return new ImageNode(node.__src, node.__key); }

  constructor(src: string, key?: NodeKey) {
    super(key);
    this.__src = src;
  }

  exportJSON(): SerializedImageNode {
    return { type: 'image', version: 1, src: this.__src };
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return new ImageNode(serializedNode.src || (serializedNode as any).__src || '');
  }

  // ================= ВАЖНОЕ ДОБАВЛЕНИЕ ДЛЯ LEXICAL_HTML_RENDERER =================
  // Этот метод вызывается конвертером JSON -> HTML на бэкенде или фронтенде.
  // Именно он создаст правильный тег <img> для вашего компонента отображения!
  exportDOM(): DOMExportOutput {
    const div = document.createElement('div');
    div.className = 'lexical-image-container';

    const img = document.createElement('img');
    img.src = this.__src;
    img.alt = 'Uploaded content';
    img.className = 'lexical-image';
    img.style.display = 'block';
    img.setAttribute('loading', 'lazy');

    div.appendChild(img);
    
    return { element: div };
  }
  // ==============================================================================

  // Этот метод нужен только для отображения ВНУТРИ редактора при создании
  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.className = 'lexical-image-container';
    return div;
  }

  updateDOM(): false { return false; }

  // Этот метод отвечает за отрисовку ВНУТРИ редактора при создании
  decorate(): React.JSX.Element {
    return (
      <img 
        src={this.__src} 
        alt="Uploaded content" 
        className="lexical-image"
        style={{ display: 'block' }}
        loading="lazy"
      />
    );
  }
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}