'use client';

import { CSSProperties } from 'react';
import { Photo } from '.';
import PhotoMedium from './PhotoMedium';

const CARD_PLACEMENTS = [
  { left: '48.5%', top: '35%', width: '22%', rotate: '5deg', featured: true },
  { left: '12%', top: '22%', width: '18%', rotate: '-10deg', featured: false },
  { left: '30%', top: '42%', width: '20%', rotate: '9deg', featured: false },
  { left: '64%', top: '20%', width: '18%', rotate: '11deg', featured: false },
  { left: '73%', top: '48%', width: '18%', rotate: '-9deg', featured: false },
  { left: '8%', top: '55%', width: '18%', rotate: '-12deg', featured: false },
  { left: '38%', top: '67%', width: '19%', rotate: '-8deg', featured: false },
] as const;

export default function DarkroomHomeStage({ photos }: { photos: Photo[] }) {
  return (
    <section className="darkroom-stage darkroom-home-stage" aria-label="Photographs">
      <div className="darkroom-home-heading">PHOTOGRAPHS</div>
      <div className="darkroom-home-cards">
        {photos.slice(0, CARD_PLACEMENTS.length).map((photo, index) => {
          const placement = CARD_PLACEMENTS[index];
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
  );
}
