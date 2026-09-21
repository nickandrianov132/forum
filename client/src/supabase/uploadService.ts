// src/services/uploadService.ts
import { supabase } from './supabase'

// Строгий тип для папок, чтобы защититься от опечаток
export type MediaType = 'avatars' | 'video_previews'

/**
 * Загружает файл в Supabase Storage и возвращает прямую публичную ссылку.
 */
export async function uploadMediaFile(
  file: File, 
  type: MediaType, 
  entityId: string
): Promise<string | null> {
  try {
    const fileExtension = file.name.split('.').pop() || 'jpg';
    // Путь внутри бакета: "avatars/user123.png" или "video_previews/video456.jpg"
    const filePath = `${type}/${entityId}.${fileExtension}`;

    // 1. Загружаем файл в бакет 'forum-media'
    const { error } = await supabase.storage
      .from('forum-media')
      .upload(filePath, file, {
        upsert: true // Перезапишет старый файл, если у пользователя изменился аватар
      });

    if (error) throw error;

    // 2. Получаем готовую публичную ссылку
    const { data: publicUrlData } = supabase.storage
      .from('forum-media')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;

} catch (error) {
  console.error('ERROR SUPABASE:', error);
  
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  alert('Не удалось загрузить изображение: ' + errorMessage);
  return null;
}
}
