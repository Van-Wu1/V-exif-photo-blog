'use client';

import { CSSProperties, useEffect, useState } from 'react';
import { Photo } from '.';
import PhotoMedium from './PhotoMedium';

const FEATURED_CARD_INDEX = 3;

const CARD_PLACEMENTS = [
  {
    left: '27%', top: '37%', width: '12.4%', rotate: '-8deg', layer: 1,
    mobileLeft: '25%', mobileTop: '30%', mobileWidth: '23%',
  },
  {
    left: '64%', top: '38%', width: '12.2%', rotate: '9deg', layer: 2,
    mobileLeft: '74%', mobileTop: '31%', mobileWidth: '23%',
  },
  {
    left: '39%', top: '51%', width: '13.6%', rotate: '10deg', layer: 3,
    mobileLeft: '30%', mobileTop: '49%', mobileWidth: '27%',
  },
  {
    left: '52%', top: '49%', width: '15.2%', rotate: '4deg', layer: 8,
    mobileLeft: '51%', mobileTop: '47%', mobileWidth: '31%',
  },
  {
    left: '65%', top: '55%', width: '13.3%', rotate: '-8deg', layer: 4,
    mobileLeft: '72%', mobileTop: '55%', mobileWidth: '27%',
  },
  {
    left: '29%', top: '66%', width: '14%', rotate: '-10deg', layer: 5,
    mobileLeft: '27%', mobileTop: '68%', mobileWidth: '29%',
  },
  {
    left: '43%', top: '64%', width: '14.2%', rotate: '-7deg', layer: 6,
    mobileLeft: '49%', mobileTop: '70%', mobileWidth: '30%',
  },
  {
    left: '59%', top: '68%', width: '14.2%', rotate: '7deg', layer: 7,
    mobileLeft: '72%', mobileTop: '75%', mobileWidth: '30%',
  },
] as const;

export default function DarkroomHomeStage({ photos }: { photos: Photo[] }) {
  const [visiblePhotos, setVisiblePhotos] = useState<Photo[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(FEATURED_CARD_INDEX);

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

  const activePlacement = CARD_PLACEMENTS[activeCardIndex];
  const tableLightStyle: CSSProperties & Record<string, string | number> = {
    left: activePlacement.left,
    top: activePlacement.top,
    width: activePlacement.width,
    '--darkroom-light-rotation': activePlacement.rotate,
    '--darkroom-light-mobile-left': activePlacement.mobileLeft,
    '--darkroom-light-mobile-top': activePlacement.mobileTop,
    '--darkroom-light-mobile-width': activePlacement.mobileWidth,
  };

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
            <span
              className="darkroom-home-table-light"
              style={tableLightStyle}
            />
            {visiblePhotos.map((photo, index) => {
              const placement = CARD_PLACEMENTS[index];
              const depth = Math.max(
                0,
                Math.min(1, (Number.parseFloat(placement.top) - 25) / 62),
              );
              const style: CSSProperties & Record<string, string | number> = {
                left: placement.left,
                top: placement.top,
                width: placement.width,
                zIndex: placement.layer,
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
                  data-lit={activeCardIndex === index}
                  style={style}
                  onPointerEnter={() => setActiveCardIndex(index)}
                  onPointerLeave={() => setActiveCardIndex(FEATURED_CARD_INDEX)}
                  onFocus={() => setActiveCardIndex(index)}
                  onBlur={() => setActiveCardIndex(FEATURED_CARD_INDEX)}
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
