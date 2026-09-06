const getInitialState = (content: string) => {
  try {
    // Пробуем распарсить. Если это валидный JSON Lexical — возвращаем его
    JSON.parse(content);
    return content;
  } catch (e) {
    // Если это обычная строка (ошибка парсинга), 
    // Lexical не примет её как editorState напрямую.
    // Возвращаем null, чтобы редактор открылся пустым, 
    // ИЛИ создаем минимальную JSON-структуру:
    return JSON.stringify({
      root: {
        children: [
          {
            children: [{ detail: 0, format: 0, mode: 'normal', text: content, type: 'text', version: 1 }],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    });
  }
};

export default getInitialState