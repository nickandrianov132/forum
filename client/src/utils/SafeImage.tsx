// import React, {useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';
// import avatarPlaceholder from '../assets/avatar_placeholder.svg';

// // const OFFLINE_FALLBACK_IMG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

// export interface SafeImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
//     /** Основной URL изображения (из Supabase) */
//     src?: string | null;
//       /** Запасное изображение при ошибке загрузки или в оффлайне */
//     fallback?: string;
//     /** Дополнительные классы непосредственно для тега <img> */
//     imgClassName?: string;
//     /** Кастомные классы для скелетона при загрузке (цвет, анимация, бордер) */
//     skeletonClassName?: string;
// }

// export const SafeImage = ({
//     src,
//     fallback = avatarPlaceholder,
//     alt = '',
//     imgClassName = '',
//     skeletonClassName = 'bg-slate-700',
//     onLoad,
//     onError,
//     ...props
// }: SafeImageProps) => {
//     const targetSrc = src || fallback;
//     const [imgSrc, setImgSrc] = useState<string>(src || fallback);
//     const [hasError, setHasError] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);
//     const imgRef = useRef<HTMLImageElement>(null);

//     useEffect(() => {
//         // Обновляем состояние только если ссылка реально изменилась
//         if (imgSrc !== targetSrc) {
//         setImgSrc(targetSrc);
//         setHasError(false);
//         setIsLoading(Boolean(src));
//         }

//         // Если картинка уже в кэше браузера (complete === true), сразу выключаем скелетон
//         if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
//         setIsLoading(false);
//         }
//     }, [src, fallback, targetSrc, imgSrc]);

//     useEffect(() => {
//         const handleOnline = () => {
//             if (hasError && src) {
//                 setHasError(false);
//                 setIsLoading(true);
//                 const separator = src?.includes('?') ? '&' : '?';
//                 setImgSrc(`${src}${separator}retry=${Date.now()}`);
//             }
//         };
//         window.addEventListener('online', handleOnline);
//         return () => window.removeEventListener('online', handleOnline);
//     }, [hasError, src]);

//     const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
//         setIsLoading(false);
//         if (onLoad) {
//             onLoad(e);
//         }
//     };
//     const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
//         if (!hasError) {
//         setHasError(true);
//         setImgSrc(fallback);
//         // НЕ вызываем setIsLoading(false) здесь! 
//         // Скелетон скроется сам в handleLoad, когда отрисуется fallback SVG.
//         } else {
//         // Выключаем скелетон только если упал даже сам fallback
//         setIsLoading(false);
//         }

//         if (onError) onError(e);
//     };



//     return (
//         <>
//         {isLoading && (
//             <div className={`animate-pulse ${skeletonClassName}`} />
//         )}
//         <img
//             ref={imgRef}
//             src={imgSrc}
//             alt={alt}
//             onLoad={handleLoad}
//             onError={handleError}
//             className={`${isLoading ? 'hidden' : ''} ${imgClassName}`}
//             {...props}
//         />
//         </>
//     );
// }

// export default SafeImage;
import React, { useState, useEffect, type ImgHTMLAttributes } from 'react';
import defaultFallback from '../assets/placeholder.svg';

export interface SafeImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  fallback?: string;
  imgClassName?: string;
  skeletonClassName?: string;
}

export const SafeImage = ({
  src,
  fallback = defaultFallback,
  alt = '',
  imgClassName = '',
  skeletonClassName = 'bg-slate-700',
  onLoad,
  onError,
  ...props
}: SafeImageProps) => {
  const [displaySrc, setDisplaySrc] = useState<string>(src ? '' : fallback);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(src));
  const [hasError, setHasError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    // Если ссылки нет — сразу показываем заглушку без загрузки
    if (!src) {
      setDisplaySrc(fallback);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setHasError(false);

    // Создаем виртуальный объект Image для скачивания в фоне
    const loader = new Image();
    const targetUrl =
      retryCount > 0
        ? `${src}${src.includes('?') ? '&' : '?'}retry=${retryCount}`
        : src;

    loader.src = targetUrl;

    // Метод decode() ждет и полного скачивания, и распаковки пикселей в память
    loader
      .decode()
      .then(() => {
        if (!isCancelled) {
          setDisplaySrc(targetUrl);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setHasError(true);
          setDisplaySrc(fallback);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [src, fallback, retryCount]);

  // Автоперезагрузка при возвращении интернета
  useEffect(() => {
    const handleOnline = () => {
      if (hasError && src) {
        setRetryCount((prev) => prev + 1);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [hasError, src]);

  if (isLoading) {
    return <div className={`animate-pulse ${skeletonClassName}`} />;
  }

  return (
    <img
      src={displaySrc}
      alt={alt}
      onLoad={onLoad}
      onError={(e) => {
        if (displaySrc !== fallback) {
          setDisplaySrc(fallback);
        }
        if (onError) onError(e);
      }}
      className={imgClassName}
      {...props}
    />
  );
};

export default SafeImage;
