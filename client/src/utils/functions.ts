
export function convertDateFn(ms: number): String {
    const date = new Date(ms).toLocaleDateString('ru-RU', {
        day: '2-digit',   // Всегда 2 цифры для дня (например, 08)
        month: '2-digit', // Всегда 2 цифры для месяца (например, 09)
        year: 'numeric'   // 4 цифры для года (2026)
    })
    return date.replaceAll("/", ".")
}