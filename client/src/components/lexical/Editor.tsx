import type { ReactElement } from 'react';
import { LexicalComposer, } from '@lexical/react/LexicalComposer';
import type {  InitialConfigType } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import type { EditorState } from 'lexical';

// Импортируем Toolbar
import { ToolbarPlugin } from './ToolbarPlugin.js';
import { EDITOR_NODES } from './sharedNodes.js';
import getInitialState from './utils/initialStateHelper.js';

interface EditorProps {
  initialContent: string;
  onChange: (jsonString: string) => void;
}

const theme = {
  list: {
    nested: { listitem: 'my-nested-listitem' },
    ol: 'my-ol-list',
    ul: 'my-ul-list',
    listitem: 'my-listitem',
  },
  heading: {
    h1: 'my-h1-style',
    h2: 'my-h2-style',
  },
  text: {
    bold: 'my-bold-text',
    italic: 'my-italic-text',
    underline: 'my-underline-text',
    strikethrough: 'my-strikethrough-text',
  },
};


export default function Editor({ initialContent, onChange }: EditorProps): ReactElement {

  const initialConfig: InitialConfigType = {
    namespace: 'MyEditor',
    nodes: EDITOR_NODES,
    editorState: getInitialState(initialContent),
    // Если в базе пусто, Lexical может упасть, поэтому проверяем на наличие данных
    // editorState: initialContent || undefined,
    theme,
    onError: (error: Error) => console.error(error),
  };

  const handleOnChange = (editorState: EditorState) => {
    const jsonString = JSON.stringify(editorState.toJSON());
    onChange(jsonString); // Отправляем строку в PostDetail
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container">
        <ToolbarPlugin />
        <div className='relative w-full h-fit'>
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<div className="placeholder">Write your text here...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <OnChangePlugin onChange={handleOnChange} />
      </div>
    </LexicalComposer>
  );
}
