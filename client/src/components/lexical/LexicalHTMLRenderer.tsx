import { createEditor } from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import { useState, useEffect, useRef } from 'react';
import { EDITOR_NODES } from './sharedNodes';
import getInitialState from './utils/initialStateHelper';
import placeholder from '../../assets/placeholder.svg';
// Конфиг должен включать те же узлы, что и редактор
const editorConfig = {
  nodes: EDITOR_NODES,
  onError: (e: Error) => console.error(e),
};

export  const LexicalHTMLRenderer = ({ jsonString }: { jsonString: string }) => {
  const [html, setHtml] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

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
    // Перехватываем ошибку загрузки любой картинки внутри поста
    const handleImageError = (e: React.SyntheticEvent<HTMLDivElement, Event>) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        const img = target as HTMLImageElement;
        // Сохраняем оригинальный URL из Supabase, чтобы восстановить при появлении сети
        if (!img.dataset.originalSrc) {
          img.dataset.originalSrc = img.src;
          img.src = placeholder;
        }
      }
    };
    // Восстанавливаем картинки из Supabase, когда интернет снова появится
    useEffect(() => {
      const handleOnline = () => {
        if (!containerRef.current) return;
        const brokenImages = containerRef.current.querySelectorAll<HTMLImageElement>('img[data-original-src]');
        
        brokenImages.forEach((img) => {
          const originalSrc = img.dataset.originalSrc;
          if (originalSrc) {
            delete img.dataset.originalSrc;
            const separator = originalSrc.includes('?') ? '&' : '?';
            img.src = `${originalSrc}${separator}retry=${Date.now()}`;
          }
        });
      };

      window.addEventListener('online', handleOnline);
      return () => window.removeEventListener('online', handleOnline);
    }, []);
  // Выводим результат как безопасный HTML
  return (
    <div 
      ref={containerRef}
      onErrorCapture={handleImageError}
      className="lexical-render-output" 
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};

export default LexicalHTMLRenderer;