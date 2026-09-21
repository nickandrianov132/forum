import React, { useState } from 'react';
import { uploadMediaFile } from '../../supabase/uploadService';

// 1. Описываем интерфейс пропсов так же, как и раньше
interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string;
  onUploadSuccess: (url: string) => void;
}

// 2. Пишем обычную функцию, типизируя деструктурированные пропсы напрямую
export const AvatarUpload = ({ 
  userId, 
  currentAvatarUrl, 
  onUploadSuccess 
}: AvatarUploadProps) => { // <-- Просто указываем интерфейс здесь
  
  const [avatarUrl, setAvatarUrl] = useState<string>(currentAvatarUrl || 'https://placeholder.com');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setIsUploading(true);
    
    const uploadedUrl = await uploadMediaFile(file, 'avatars', userId);
    setIsUploading(false);

    if (uploadedUrl) {
      setAvatarUrl(uploadedUrl);
      onUploadSuccess(uploadedUrl);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
      <img 
        src={avatarUrl} 
        alt="User Avatar" 
        style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ccc' }} 
      />
      
      <label style={{
        padding: '10px 20px',
        backgroundColor: isUploading ? '#aaa' : '#007bff',
        color: '#fff',
        borderRadius: '5px',
        cursor: isUploading ? 'not-allowed' : 'pointer'
      }}>
        {isUploading ? 'Загрузка...' : 'Выбрать новую аватарку'}
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          disabled={isUploading}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
};
