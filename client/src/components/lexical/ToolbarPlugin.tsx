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
import Images from '../../assets/Images';

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
      <select className='border rounded-l-sm' name='fonts' onChange={onFontChange}>
        {FONT_FAMILY_OPTIONS.map(font => (
          <option style={{fontFamily: font}} key={font} value={font}>{font}</option>
        ))}
      </select>

      {/* Инлайновые форматы */}
      <button 
        className={isBold ? "btn-active" : "btn"} 
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
      >
        <b>B</b>
      </button>
      <button 
        className={isItalic ? "btn-active" : "btn"} 
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
      >
        <i>I</i>
      </button>
      <button 
        className={isUnderline ? "btn-active" : "btn"} 
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
      >
        <u>U</u>
      </button>

      {/* Заголовки */}
      <button 
        className={blockType === 'h1' ? "btn-active" : "btn"} 
        onClick={() => formatHeading('h1')}
      >
        H1
      </button>
      <button 
        className={blockType === 'h2' ? "btn-active" : "btn"} 
        onClick={() => formatHeading('h2')}
      >
        H2
      </button>

      {/* Списки */}
      <button 
        className={blockType === 'ul' ? "btn-active" : "btn"} 
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
      >
        <img className='w-7' src={Images.ul_list} alt="unordered list" />
      </button>
      <button 
        className={blockType === 'ol' ? "btn-active" : "btn"} 
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
      >
        <img className='w-6' src={Images.ol_list1} alt="ordered list" />
      </button>
    </div>
  );
}
