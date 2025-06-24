import React from 'react';

interface YouTubeEmbedProps {
  videoId?: string;
  title?: string;
  className?: string;
}

export default function YouTubeEmbed({ 
  videoId = '0vLp7Ri_33M', 
  title = 'Product Demo Video',
  className = ''
}: YouTubeEmbedProps) {
  return (
    <div 
      className={`youtube-embed-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '720px',
        margin: '0 auto',
        aspectRatio: '16 / 9',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)',
      }}
    >
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=0&controls=1`}
        title={title}
        frameBorder='0'
        loading='lazy'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        allowFullScreen
        aria-label={`YouTube video: ${title}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
} 