'use client';

import { CSSProperties, useEffect, useState } from 'react';
import { Photo } from '.';
import PhotoMedium from './PhotoMedium';

const CARD_PLACEMENTS = [
  {
    left: '18%', top: '27%', width: '10.5%', rotate: '-9deg',
    mobileLeft: '14%', mobileTop: '24%', mobileWidth: '27%',
  },
  {
    left: '48%', top: '29%', width: '10.2%', rotate: '7deg',
    mobileLeft: '50%', mobileTop: '21%', mobileWidth: '25%',
  },
  {
    left: '80%', top: '28%', width: '10.6%', rotate: '-6deg',
    mobileLeft: '86%', mobileTop: '26%', mobileWidth: '28%',
  },
  {
    left: '23%', top: '52%', width: '13.2%', rotate: '8deg',
    mobileLeft: '12%', mobileTop: '49%', mobileWidth: '34%',
  },
  {
    left: '52%', top: '50%', width: '15.4%', rotate: '-4deg',
    mobileLeft: '52%', mobileTop: '47%', mobileWidth: '38%',
  },
  {
    left: '79%', top: '55%', width: '13.5%', rotate: '9deg',
    mobileLeft: '91%', mobileTop: '53%', mobileWidth: '35%',
  },
  {
    left: '6%', top: '86%', width: '17.5%', rotate: '-11deg',
    mobileLeft: '0%', mobileTop: '83%', mobileWidth: '46%',
  },
  {
    left: '43%', top: '81%', width: '16.2%', rotate: '6deg',
    mobileLeft: '49%', mobileTop: '77%', mobileWidth: '43%',
  },
  {
    left: '85%', top: '87%', width: '18%', rotate: '-8deg',
    mobileLeft: '101%', mobileTop: '86%', mobileWidth: '48%',
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
