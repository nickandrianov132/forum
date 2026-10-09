// src/services/uploadService.ts
import { supabase } from './supabase';

// Строгий тип для папок, чтобы защититься от опечаток
export type MediaType = 'avatars' | 'posts-media'

/**
 * Загружает файл в Supabase Storage и возвращает прямую публичную ссылку.
 * @param file - Загружаемый файл
 * @param type - Папка в бакете ('avatars' | 'video_previews' | 'posts-media')
 * @param entityId - ID сущности (например, userId или postId)
 * @param currentMediaUrl - (Опционально) Текущая старая ссылка из БД для удаления старого файла
 */
export async function uploadMediaFile(
  file: File, 
  type: MediaType, 
  entityId: string,
  currentMediaUrl?: string | null
): Promise<string | null> {
  try {
    const fileExtension = file.name.split('.').pop() || 'jpg';
    
    // 1. Формируем УНИКАЛЬНЫЙ путь внутри нужной папки (type остаётся!)
    // Пример: "avatars/user123_1712345678.png" или "posts-media/post999_1712345678.jpg"
    const uniqueFileName = `${entityId}_${Date.now()}.${fileExtension}`;
    const newFilePath = `${type}/${uniqueFileName}`;

    // 2. Если передана старая ссылка, подчищаем за собой бакет
    if (currentMediaUrl) {
        const bucketSegment = '/forum-media/';
        const pathParts = currentMediaUrl.split(bucketSegment);
        
        if (pathParts.length > 1) {
          const oldFilePath = pathParts[1]; // Строго берем вторую часть после /forum-media/
          
          const { error } = await supabase.storage
            .from('forum-media')
            .remove([oldFilePath]);

          if (error) {
            console.error('Delete error from Supabase:', error);
          }
        }
    }


    // 3. Загружаем новый файл в выбранную папку
    const { error } = await supabase.storage
      .from('forum-media')
      .upload(newFilePath, file, {
        contentType: file.type
      });

    if (error) throw error;

    // 4. Получаем чистую публичную ссылку для сохранения в БД
    const { data: publicUrlData } = supabase.storage
      .from('forum-media')
      .getPublicUrl(newFilePath);

    return publicUrlData.publicUrl;

  } catch (error) {
    console.error('ERROR SUPABASE:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    alert('Failed to upload image : ' + errorMessage);
    return null;
  }
}


