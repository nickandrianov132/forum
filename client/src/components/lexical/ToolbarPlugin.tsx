import { useState, useEffect } from 'react';
import type { ReactElement, ChangeEvent } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  $getSelection, 
  $isRangeSelection, 
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND
} from 'lexical';
import { $patchStyleText } from '@lexical/selection';
import { $getNearestBlockElementAncestorOrThrow } from '@lexical/utils';
import { $isHeadingNode, $createHeadingNode } from '@lexical/rich-text';
import type { HeadingTagType } from '@lexical/rich-text';
import { 
  $isListNode, 
  INSERT_ORDERED_LIST_COMMAND, 
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode
} from '@lexical/list';
import { $setBlocksType } from '@lexical/selection';

const FONT_FAMILY_OPTIONS = ['Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana', 'Roboto', 'Inter', 'Poppins'];

export function ToolbarPlugin(): ReactElement {
  const [editor] = useLexicalComposerContext();
  
  // Состояния для инлайновых форматов
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  
  // Состояние для типов блоков (h1, h2, ul, ol, paragraph)
  const [blockType, setBlockType] = useState<string>('paragraph');

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // 1. Проверяем инлайновые стили
          setIsBold(selection.hasFormat('bold'));
          setIsItalic(selection.hasFormat('italic'));
          setIsUnderline(selection.hasFormat('underline'));

          // 2. Определяем тип блока (заголовок или список)
          const anchorNode = selection.anchor.getNode();
          const element = anchorNode.getKey() === 'root'
            ? anchorNode
            : $getNearestBlockElementAncestorOrThrow(anchorNode);

          if (element !== null) {
            if ($isHeadingNode(element)) {
              setBlockType(element.getTag()); // 'h1' или 'h2'
            } else if ($isListNode(element)) {
              setBlockType(element.getTag()); // 'ul' или 'ol'
            } else {
              // Проверка, не находимся ли мы внутри ListItem (li)
              const parent = element.getParent();
              if ($isListNode(parent)) {
                setBlockType((parent as ListNode).getTag());
              } else {
                setBlockType('paragraph');
              }
            }
          }
        }
      });
    });
  }, [editor]);

  // Хендлер для изменения шрифта
  const onFontChange = (e: ChangeEvent<HTMLSelectElement>) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { 'font-family': e.target.value });
      }
    });
  };

  // Хендлер для заголовков
  const formatHeading = (headingSize: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      }
    });
  };

return (
  <div className="toolbar">
    {/* Выпадающий список шрифтов */}
    <select className="toolbar-select" name="fonts" onChange={onFontChange}>
      {FONT_FAMILY_OPTIONS.map(font => (
        <option style={{ fontFamily: font, background: '#1e293b' }} key={font} value={font}>
          {font}
        </option>
      ))}
    </select>

    {/* Инлайновые форматы */}
    <button 
      type="button"
      className={isBold ? "btn-active" : "btn"} 
      onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
    >
      <b className="text-sm">B</b>
    </button>
    <button 
      type="button"
      className={isItalic ? "btn-active" : "btn"} 
      onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
    >
      <i className="text-sm font-serif">I</i>
    </button>
    <button 
      type="button"
      className={isUnderline ? "btn-active" : "btn"} 
      onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
    >
      <u className="text-sm">U</u>
    </button>

    {/* Разделитель */}
    <div className="w-px h-5 bg-white/5 my-auto mx-1" />

    {/* Заголовки */}
    <button 
      type="button"
      className={blockType === 'h1' ? "btn-active" : "btn"} 
      onClick={() => formatHeading('h1')}
    >
      <span className="font-bold text-[10px]">H1</span>
    </button>
    <button 
      type="button"
      className={blockType === 'h2' ? "btn-active" : "btn"} 
      onClick={() => formatHeading('h2')}
    >
      <span className="font-bold text-[10px]">H2</span>
    </button>

    {/* Разделитель */}
    <div className="w-px h-5 bg-white/5 my-auto mx-1" />

    {/* Списки */}
    <button 
      type="button"
      className={blockType === 'ul' ? "btn-active" : "btn"} 
      onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
    >
      <svg className="toolbar-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="9" y1="6" x2="20" y2="6"></line>
        <line x1="9" y1="12" x2="20" y2="12"></line>
        <line x1="9" y1="18" x2="20" y2="18"></line>
        <circle cx="4" cy="6" r="1"></circle>
        <circle cx="4" cy="12" r="1"></circle>
        <circle cx="4" cy="18" r="1"></circle>
      </svg>
    </button>
    
    <button 
      type="button"
      className={blockType === 'ol' ? "btn-active" : "btn"} 
      onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
    >
      <svg className="toolbar-svg" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.59 3.03h12.2v1.26H3.59zm0 4.29h12.2v1.26H3.59zm0 4.35h12.2v1.26H3.59zM.99 4.79h.49V2.52H.6v.45h.39v1.82zm.87 3.88H.91l.14-.11.3-.24c.35-.28.49-.5.49-.79A.74.74 0 0 0 1 6.8a.77.77 0 0 0-.81.84h.52A.34.34 0 0 1 1 7.25a.31.31 0 0 1 .31.31.6.6 0 0 1-.22.44l-.87.75v.39h1.64zm-.36 3.56a.52.52 0 0 0 .28-.48.67.67 0 0 0-.78-.62.71.71 0 0 0-.77.75h.5a.3.3 0 0 1 .27-.32.26.26 0 1 1 0 .51H.91v.38H1c.23 0 .37.11.37.29a.29.29 0 0 1-.33.29.35.35 0 0 1-.36-.35H.21a.76.76 0 0 0 .83.8.74.74 0 0 0 .83-.72.53.53 0 0 0-.37-.53z"/>
      </svg>
    </button>
  </div>
);  
  // return (
  //   <div className="toolbar">
  //     <select className='border rounded-l-sm bg-gray-200' name='fonts' onChange={onFontChange}>
  //       {FONT_FAMILY_OPTIONS.map(font => (
  //         <option style={{fontFamily: font}} key={font} value={font}>{font}</option>
  //       ))}
  //     </select>

  //     {/* Инлайновые форматы */}
  //     <button 
  //       type="button"
  //       className={isBold ? "btn-active" : "btn"} 
  //       onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
  //     >
  //       <b>B</b>
  //     </button>
  //     <button 
  //       type="button"
  //       className={isItalic ? "btn-active" : "btn"} 
  //       onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
  //     >
  //       <i>I</i>
  //     </button>
  //     <button 
  //       type="button"
  //       className={isUnderline ? "btn-active" : "btn"} 
  //       onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
  //     >
  //       <u>U</u>
  //     </button>

  //     {/* Заголовки */}
  //     <button 
  //       type="button"
  //       className={blockType === 'h1' ? "btn-active" : "btn"} 
  //       onClick={() => formatHeading('h1')}
  //     >
  //       H1
  //     </button>
  //     <button 
  //       type="button"
  //       className={blockType === 'h2' ? "btn-active" : "btn"} 
  //       onClick={() => formatHeading('h2')}
  //     >
  //       H2
  //     </button>

  //     {/* Списки */}
  //     <button 
  //       type="button"
  //       className={blockType === 'ul' ? "btn-active" : "btn"} 
  //       onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
  //     >
  //       <svg className='toolbar-svg' xmlns="http://w3.org" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  //         <line x1="9" y1="6" x2="20" y2="6"></line>
  //         <line x1="9" y1="12" x2="20" y2="12"></line>
  //         <line x1="9" y1="18" x2="20" y2="18"></line>
  //         <circle cx="4" cy="6" r="1"></circle>
  //         <circle cx="4" cy="12" r="1"></circle>
  //         <circle cx="4" cy="18" r="1"></circle>
  //       </svg>
  //     </button>
  //     <button 
  //       type="button"
  //       className={blockType === 'ol' ? "btn-active" : "btn"} 
  //       onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
  //     >
  //       <svg className='toolbar-svg' width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M3.59 3.03h12.2v1.26H3.59zm0 4.29h12.2v1.26H3.59zm0 4.35h12.2v1.26H3.59zM.99 4.79h.49V2.52H.6v.45h.39v1.82zm.87 3.88H.91l.14-.11.3-.24c.35-.28.49-.5.49-.79A.74.74 0 0 0 1 6.8a.77.77 0 0 0-.81.84h.52A.34.34 0 0 1 1 7.25a.31.31 0 0 1 .31.31.6.6 0 0 1-.22.44l-.87.75v.39h1.64zm-.36 3.56a.52.52 0 0 0 .28-.48.67.67 0 0 0-.78-.62.71.71 0 0 0-.77.75h.5a.3.3 0 0 1 .27-.32.26.26 0 1 1 0 .51H.91v.38H1c.23 0 .37.11.37.29a.29.29 0 0 1-.33.29.35.35 0 0 1-.36-.35H.21a.76.76 0 0 0 .83.8.74.74 0 0 0 .83-.72.53.53 0 0 0-.37-.53z"/></svg>
  //     </button>
  //   </div>
  // );
}
