import { Compass } from 'lucide-react';
import { useState } from 'react';

interface TravelImageProps {
  src: string;
  alt: string;
  fallbackTitle?: string;
  className?: string;
  priority?: boolean;
}

export function TravelImage({
  src,
  alt,
  fallbackTitle,
  className = '',
  priority = false,
}: TravelImageProps) {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (hasError || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-[#E7E1D5] text-[#1B4332] p-6 text-center ${className}`}
      >
        <Compass className="w-8 h-8 opacity-60 mb-2" aria-hidden="true" />
        <span className="font-serif text-base font-medium text-[#1E201D]">
          {fallbackTitle || 'Destination Preview'}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#E7E1D5] ${className}`}>
      {!loaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#E7E1D5] animate-pulse"
        />
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
