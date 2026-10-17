import { Play } from 'lucide-react';
import { useState } from 'react';
import { readImage } from '../../../core/smart';
import type { SmartImage } from '../../../core/types';
import { SmartImage as Img } from '../../../ui/SmartImage';
import { parseVideo } from './parseVideo';

/** Click-to-load player (design.md §13 rule 14): no third-party script until the shopper taps play. */
export function Player({ url, poster, title, className = 'aspect-video' }: { url: string; poster: SmartImage; title: string; className?: string }) {
  const [playing, setPlaying] = useState(false);
  const video = parseVideo(url);
  const posterSrc = readImage(poster);

  if (!video) {
    return (
      <div className={`sf-placeholder sf-img flex items-center justify-center text-sm sf-muted ${className}`}>
        {url ? 'This video link is not supported. Use a YouTube or Vimeo link.' : 'Add a YouTube or Vimeo link.'}
      </div>
    );
  }

  const src = video.provider === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`
    : `https://player.vimeo.com/video/${video.id}?autoplay=1&dnt=1`;

  if (playing) {
    return (
      <div className={`sf-img relative overflow-hidden bg-black ${className}`}>
        <iframe src={src} title={title || 'Video'} className="absolute inset-0 h-full w-full" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen loading="lazy" />
      </div>
    );
  }

  return (
    <button type="button" onClick={() => setPlaying(true)} className={`group relative block w-full overflow-hidden sf-img ${className}`} aria-label={`Play video${title ? `: ${title}` : ''}`}>
      {posterSrc ? (
        <Img value={poster} alt="" fill rounded={false} />
      ) : video.provider === 'youtube' ? (
        <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <span className="sf-placeholder absolute inset-0" aria-hidden />
      )}
      <span aria-hidden className="absolute inset-0 bg-black/25 transition-colors duration-(--sf-motion-base) group-hover:bg-black/35" />
      <span aria-hidden className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-lg transition-transform duration-(--sf-motion-base) group-hover:scale-110" style={{ background: 'var(--sf-button)', color: 'var(--sf-on-button)' }}>
        <Play className="ml-1 h-7 w-7 fill-current" />
      </span>
    </button>
  );
}
