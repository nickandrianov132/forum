import React, {useEffect, useState, type ImgHTMLAttributes } from 'react';
import avatarPlaceholder from '../assets/avatar_placeholder.svg';

// const OFFLINE_FALLBACK_IMG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

export interface SafeImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    /** Основной URL изображения (из Supabase) */
    src?: string | null;
      /** Запасное изображение при ошибке загрузки или в оффлайне */
    fallback?: string;
    /** Дополнительные классы непосредственно для тега <img> */
    imgClassName?: string;
    /** Кастомные классы для скелетона при загрузке (цвет, анимация, бордер) */
    skeletonClassName?: string;
}

export const SafeImage = ({
    src,
    fallback = avatarPlaceholder,
    alt = '',
    imgClassName = '',
    skeletonClassName = 'bg-slate-700',
    onLoad,
    onError,
    ...props
}: SafeImageProps) => {
    const [imgSrc, setImgSrc] = useState<string>(src || fallback);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setImgSrc(src || fallback);
        setHasError(false);
        setIsLoading(Boolean(src));
    }, [src, fallback]);

    useEffect(() => {
        const handleOnline = () => {
            if (hasError && src) {
                setHasError(false);
                setIsLoading(true);
                const separator = src?.includes('?') ? '&' : '?';
                setImgSrc(`${src}${separator}retry=${Date.now()}`);
            }
        };
        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [hasError, src]);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setIsLoading(false);
        if (onLoad) {
            onLoad(e);
        }
    };

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        if (!hasError) {
            setHasError(true);
            setImgSrc(fallback);
        }
        setIsLoading(false);
        if (onError) {
            onError(e);
        }
    };



    return (
        <>
        {isLoading && (
            <div className={`animate-pulse ${skeletonClassName}`} />
        )}
        <img
            src={imgSrc}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={`${isLoading ? 'hidden' : ''} ${imgClassName}`}
            {...props}
        />
        </>
    );
}

export default SafeImage;
