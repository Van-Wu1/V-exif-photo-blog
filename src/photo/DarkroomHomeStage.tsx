'use client';

import { CSSProperties, useEffect, useState } from 'react';
import { Photo } from '.';
import PhotoMedium from './PhotoMedium';

const CARD_PLACEMENTS = [
  { left: '50%', top: '52%', width: '14.5%', rotate: '5deg' },
  { left: '15%', top: '27%', width: '11.5%', rotate: '-10deg' },
  { left: '31%', top: '43%', width: '12%', rotate: '9deg' },
  { left: '68%', top: '28%', width: '11.5%', rotate: '11deg' },
  { left: '84%', top: '49%', width: '11.5%', rotate: '-9deg' },
  { left: '10%', top: '66%', width: '11.5%', rotate: '-12deg' },
  { left: '40%', top: '76%', width: '12%', rotate: '-8deg' },
  { left: '61%', top: '74%', width: '11.5%', rotate: '7deg' },
  { left: '86%', top: '79%', width: '10.8%', rotate: '12deg' },
  { left: '24%', top: '81%', width: '10.8%', rotate: '6deg' },
  { left: '43%', top: '28%', width: '10.8%', rotate: '-7deg' },
  { left: '57%', top: '38%', width: '10.5%', rotate: '8deg' },
  { left: '74%', top: '61%', width: '11%', rotate: '-5deg' },
  { left: '19%', top: '51%', width: '10.5%', rotate: '5deg' },
  { left: '94%', top: '27%', width: '10.5%', rotate: '-11deg' },
] as const;

export default function DarkroomHomeStage({ photos }: { photos: Photo[] }) {
  const [visiblePhotos, setVisiblePhotos] = useState<Photo[]>([]);

  useEffect(() => {
    const shuffledPhotos = [...photos];

    for (let index = shuffledPhotos.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffledPhotos[index], shuffledPhotos[randomIndex]] = [
        shuffledPhotos[randomIndex],
        shuffledPhotos[index],
      ];
    }

    const frame = window.requestAnimationFrame(() => {
      setVisiblePhotos(shuffledPhotos.slice(0, CARD_PLACEMENTS.length));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [photos]);

  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/darkroom/home-background-16x9-v1.webp"
      />
      <link
        rel="preload"
        as="image"
        href="/darkroom/slide-mount-landscape-v2.webp"
      />
      <link
        rel="preload"
        as="image"
        href="/darkroom/slide-mount-portrait-v1.webp"
      />
      <section
        className="darkroom-stage darkroom-home-stage"
        aria-label="Photographs"
      >
        <div className="darkroom-home-heading">PHOTOGRAPHS</div>
        <div
          className="darkroom-home-cards"
          aria-busy={visiblePhotos.length === 0}
        >
          {visiblePhotos.map((photo, index) => {
            const placement = CARD_PLACEMENTS[index];
            const orientation = photo.aspectRatio < 1
              ? 'portrait'
              : 'landscape';
            const style: CSSProperties = {
              left: placement.left,
              top: placement.top,
              width: placement.width,
              transform: `translate(-50%, -50%) rotate(${placement.rotate})`,
              zIndex: index + 1,
            };

            return (
              <article
                key={photo.id}
                className="darkroom-home-card"
                data-orientation={orientation}
                style={style}
              >
                <div className="darkroom-home-card-surface">
                  <span className="darkroom-home-card-index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="darkroom-home-card-image">
                    <PhotoMedium
                      photo={photo}
                      priority={index < 3}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
