import { createEditor } from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import { useState, useEffect } from 'react';
import { EDITOR_NODES } from './sharedNodes';
import getInitialState from './utils/initialStateHelper';

// Конфиг должен включать те же узлы, что и редактор
const editorConfig = {
  nodes: EDITOR_NODES,
  onError: (e: Error) => console.error(e),
};

export  const LexicalHTMLRenderer = ({ jsonString }: { jsonString: string }) => {
  const [html, setHtml] = useState('');

  useEffect(() => {
    const editor = createEditor(editorConfig);
    const safeContent = getInitialState(jsonString); // Тоже используем хелпер
    // Загружаем JSON в виртуальный редактор и генерируем HTML
    editor.setEditorState(editor.parseEditorState(safeContent));
    editor.update(() => {
      const htmlString = $generateHtmlFromNodes(editor);
      setHtml(htmlString);
    });
  }, [jsonString]);

  // Выводим результат как безопасный HTML
  return (
    <div 
      className="lexical-render-output" 
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};

export default LexicalHTMLRenderer;