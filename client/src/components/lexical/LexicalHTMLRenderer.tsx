// import { createEditor } from 'lexical';
// import { $generateHtmlFromNodes } from '@lexical/html';
// import { useState, useEffect, useRef } from 'react';
// import { EDITOR_NODES } from './sharedNodes';
// import getInitialState from './utils/initialStateHelper';
// import placeholder from '../../assets/placeholder.svg';
// // Конфиг должен включать те же узлы, что и редактор
// const editorConfig = {
//   nodes: EDITOR_NODES,
//   onError: (e: Error) => console.error(e),
// };

// export  const LexicalHTMLRenderer = ({ jsonString }: { jsonString: string }) => {
//   const [html, setHtml] = useState('');
//   const containerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const editor = createEditor(editorConfig);
//     const safeContent = getInitialState(jsonString); // Тоже используем хелпер
//     // Загружаем JSON в виртуальный редактор и генерируем HTML
//     editor.setEditorState(editor.parseEditorState(safeContent));
//     editor.update(() => {
//       let htmlString = $generateHtmlFromNodes(editor);
//       setHtml(htmlString);
//     });
//   }, [jsonString]);
//     // Перехватываем ошибку загрузки любой картинки внутри поста
//     const handleImageError = (e: React.SyntheticEvent<HTMLDivElement, Event>) => {
//       const target = e.target as HTMLElement;
//       if (target.tagName === 'IMG') {
//         const img = target as HTMLImageElement;
//         // Сохраняем оригинальный URL из Supabase, чтобы восстановить при появлении сети
//         if (!img.dataset.originalSrc) {
//           img.dataset.originalSrc = img.src;
//           img.src = placeholder;
//         }
//       }
//     };
//     // Восстанавливаем картинки из Supabase, когда интернет снова появится
//     useEffect(() => {
//       const handleOnline = () => {
//         if (!containerRef.current) return;
//         const brokenImages = containerRef.current.querySelectorAll<HTMLImageElement>('img[data-original-src]');
        
//         brokenImages.forEach((img) => {
//           const originalSrc = img.dataset.originalSrc;
//           if (originalSrc) {
//             delete img.dataset.originalSrc;
//             const separator = originalSrc.includes('?') ? '&' : '?';
//             img.src = `${originalSrc}${separator}retry=${Date.now()}`;
//           }
//         });
//       };

//       window.addEventListener('online', handleOnline);
//       return () => window.removeEventListener('online', handleOnline);
//     }, []);
//   // Выводим результат как безопасный HTML
//   return (
//     <div 
//       ref={containerRef}
//       onErrorCapture={handleImageError}
//       className="lexical-render-output" 
//       dangerouslySetInnerHTML={{ __html: html }} 
//     />
//   );
// };

// export default LexicalHTMLRenderer;

import { createEditor } from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import { useState, useEffect, useRef } from 'react';
import { EDITOR_NODES } from './sharedNodes';
import getInitialState from './utils/initialStateHelper';
import placeholder from '../../assets/placeholder.svg';

const editorConfig = {
  nodes: EDITOR_NODES,
  onError: (e: Error) => console.error(e),
};

export const LexicalHTMLRenderer = ({ jsonString }: { jsonString: string }) => {
  const [html, setHtml] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = createEditor(editorConfig);
    const safeContent = getInitialState(jsonString);
    editor.setEditorState(editor.parseEditorState(safeContent));
    
    editor.update(() => {
      const rawHtml = $generateHtmlFromNodes(editor);
      
      // Парсим HTML через DOMParser — работает при любом порядке атрибутов
      const doc = new DOMParser().parseFromString(rawHtml, 'text/html');
      const images = doc.querySelectorAll('img');
      
      images.forEach((img) => {
        const src = img.getAttribute('src');
        if (src) {
          img.setAttribute('data-src', src);
          img.removeAttribute('src'); // Удаляем src, чтобы не было браузерной иконки
          img.classList.add('is-loading');
        }
      });

      setHtml(doc.body.innerHTML);
    });
  }, [jsonString]);

  // Фоново скачиваем и декодируем все картинки в посте
  useEffect(() => {
    if (!containerRef.current || !html) return;

    const images = containerRef.current.querySelectorAll<HTMLImageElement>('img[data-src]');

    images.forEach((img) => {
      const targetSrc = img.dataset.src;
      if (!targetSrc) return;

      const loader = new Image();
      loader.src = targetSrc;

      loader
        .decode()
        .then(() => {
          img.src = targetSrc;
          img.classList.remove('is-loading');
          delete img.dataset.src;
        })
        .catch(() => {
          img.src = placeholder;
          img.classList.remove('is-loading');
          img.dataset.originalSrc = targetSrc;
          delete img.dataset.src;
        });
    });
  }, [html]);

  // Автовосстановление при появлении сети
  useEffect(() => {
    const handleOnline = () => {
      if (!containerRef.current) return;
      const brokenImages = containerRef.current.querySelectorAll<HTMLImageElement>('img[data-original-src]');

      brokenImages.forEach((img) => {
        const originalSrc = img.dataset.originalSrc;
        if (!originalSrc) return;

        img.classList.add('is-loading');
        img.removeAttribute('src');

        const separator = originalSrc.includes('?') ? '&' : '?';
        const retryUrl = `${originalSrc}${separator}retry=${Date.now()}`;

        const loader = new Image();
        loader.src = retryUrl;

        loader
          .decode()
          .then(() => {
            img.src = retryUrl;
            img.classList.remove('is-loading');
            delete img.dataset.originalSrc;
          })
          .catch(() => {
            img.src = placeholder;
            img.classList.remove('is-loading');
          });
      });
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <div
      ref={containerRef}
      className="lexical-render-output"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default LexicalHTMLRenderer;
