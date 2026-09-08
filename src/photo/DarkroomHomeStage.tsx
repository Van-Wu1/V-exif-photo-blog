'use client';

import { CSSProperties, useEffect, useState } from 'react';
import { Photo } from '.';
import PhotoMedium from './PhotoMedium';

const CARD_PLACEMENTS = [
  {
    left: '32%', top: '34%', width: '7.8%', rotate: '-9deg',
    mobileLeft: '25%', mobileTop: '27%', mobileWidth: '22%',
  },
  {
    left: '49%', top: '31%', width: '7.5%', rotate: '7deg',
    mobileLeft: '50%', mobileTop: '24%', mobileWidth: '21%',
  },
  {
    left: '65%', top: '36%', width: '7.9%', rotate: '-6deg',
    mobileLeft: '75%', mobileTop: '29%', mobileWidth: '22%',
  },
  {
    left: '28%', top: '54%', width: '9.7%', rotate: '8deg',
    mobileLeft: '25%', mobileTop: '49%', mobileWidth: '27%',
  },
  {
    left: '49%', top: '51%', width: '10.8%', rotate: '-4deg',
    mobileLeft: '50%', mobileTop: '46%', mobileWidth: '30%',
  },
  {
    left: '69%', top: '57%', width: '9.8%', rotate: '9deg',
    mobileLeft: '75%', mobileTop: '52%', mobileWidth: '27%',
  },
  {
    left: '32%', top: '76%', width: '11.5%', rotate: '-11deg',
    mobileLeft: '25%', mobileTop: '73%', mobileWidth: '32%',
  },
  {
    left: '51%', top: '73%', width: '11.2%', rotate: '6deg',
    mobileLeft: '50%', mobileTop: '70%', mobileWidth: '31%',
  },
  {
    left: '68%', top: '80%', width: '12%', rotate: '-8deg',
    mobileLeft: '75%', mobileTop: '77%', mobileWidth: '33%',
  },
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
          <div className="darkroom-home-plane">
            {visiblePhotos.map((photo, index) => {
              const placement = CARD_PLACEMENTS[index];
              const depth = Math.max(
                0,
                Math.min(1, (Number.parseFloat(placement.top) - 25) / 62),
              );
              const orientation = photo.aspectRatio < 1
                ? 'portrait'
                : 'landscape';
              const style: CSSProperties & Record<string, string | number> = {
                left: placement.left,
                top: placement.top,
                width: placement.width,
                zIndex: index + 1,
                '--darkroom-card-rotation': placement.rotate,
                '--darkroom-card-mobile-left': placement.mobileLeft,
                '--darkroom-card-mobile-top': placement.mobileTop,
                '--darkroom-card-mobile-width': placement.mobileWidth,
                '--darkroom-card-depth': depth.toFixed(3),
                '--darkroom-card-brightness': (0.44 + depth * 0.16).toFixed(3),
                '--darkroom-light-x': `${42 + ((index * 7) % 17)}%`,
                '--darkroom-light-y': `${43 + ((index * 5) % 13)}%`,
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
                    <span className="darkroom-home-card-illumination" />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
