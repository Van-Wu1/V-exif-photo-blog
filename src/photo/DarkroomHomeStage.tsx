'use client';

import { CSSProperties } from 'react';
import { Photo } from '.';
import PhotoMedium from './PhotoMedium';

const CARD_PLACEMENTS = [
  { left: '49%', top: '52%', width: '18%', rotate: '5deg', featured: true },
  { left: '17%', top: '35%', width: '15%', rotate: '-10deg', featured: false },
  { left: '34%', top: '54%', width: '15.5%', rotate: '9deg', featured: false },
  { left: '67%', top: '34%', width: '15%', rotate: '11deg', featured: false },
  { left: '79%', top: '59%', width: '15%', rotate: '-9deg', featured: false },
  { left: '11%', top: '68%', width: '15%', rotate: '-12deg', featured: false },
  { left: '44%', top: '78%', width: '15.5%', rotate: '-8deg', featured: false },
] as const;

export default function DarkroomHomeStage({ photos }: { photos: Photo[] }) {
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
        <div className="darkroom-home-cards">
          {photos.slice(0, CARD_PLACEMENTS.length).map((photo, index) => {
            const placement = CARD_PLACEMENTS[index];
            const orientation = photo.aspectRatio < 1
              ? 'portrait'
              : 'landscape';
            const style: CSSProperties = {
              left: placement.left,
              top: placement.top,
              width: placement.width,
              transform: `translate(-50%, -50%) rotate(${placement.rotate})`,
              zIndex: placement.featured ? 8 : index + 1,
            };

            return (
              <article
                key={photo.id}
                className="darkroom-home-card"
                data-featured={placement.featured || undefined}
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
