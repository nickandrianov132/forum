import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { createCommand, COMMAND_PRIORITY_EDITOR, type LexicalCommand, $getSelection, $createParagraphNode, $isRangeSelection, $getRoot } from 'lexical';
import { useEffect } from 'react';
import { ImageNode } from './ImageNode';

export const INSERT_IMAGE_COMMAND: LexicalCommand<string> = createCommand();

export function ImagePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload: string) => {
        editor.update(() => {
          const selection = $getSelection();
          
          if ($isRangeSelection(selection)) {
            // 1. Получаем узел, на котором сейчас стоит курсор
            const anchorNode = selection.anchor.getNode();
            
            // 2. Ищем его самого верхнего родителя, который лежит прямо в root (обычно это текущий ParagraphNode)
            let topLevelBlock = anchorNode;
            while (topLevelBlock.getParent() !== null && topLevelBlock.getParent()?.getType() !== 'root') {
              topLevelBlock = topLevelBlock.getParentOrThrow();
            }

            // 3. Создаем узел картинки
            const imageNode = new ImageNode(payload);

            // 4. Вставляем картинку строго ПОСЛЕ текущего абзаца, на корневой уровень root
            topLevelBlock.insertAfter(imageNode);

            // 5. Создаем новый пустой параграф под картинкой, чтобы пользователь мог писать дальше
            const nextParagraph = $createParagraphNode();
            imageNode.insertAfter(nextParagraph);
            
            // Переносим курсор в этот новый параграф
            nextParagraph.select();
          } else {
            // Фолбек: если выделения нет вообще, просто пушим в конец документа root
            const root = $getRoot();
            const imageNode = new ImageNode(payload);
            root.append(imageNode);
            root.append($createParagraphNode());
          }
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}
