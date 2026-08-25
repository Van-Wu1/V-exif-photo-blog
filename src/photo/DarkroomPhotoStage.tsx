'use client';

import {
  altTextForPhoto,
  doesPhotoNeedBlurCompatibility,
  Photo,
  titleForPhoto,
} from '.';
import ImageLarge from '@/components/image/ImageLarge';

const valueOrDash = (value?: string) => value || '—';

export default function DarkroomPhotoStage({ photo }: { photo: Photo }) {
  const isPortrait = photo.aspectRatio < 1;
  const camera = [photo.make, photo.model].filter(Boolean).join(' ');
  const lens = [photo.lensMake, photo.lensModel].filter(Boolean).join(' ');

  return (
    <section
      className="darkroom-stage darkroom-detail-stage"
      aria-label={`Darkroom view of ${titleForPhoto(photo)}`}
    >
      <div
        className="darkroom-detail-mount-slot"
        data-orientation={isPortrait ? 'portrait' : 'landscape'}
      >
        <div className="darkroom-detail-mount-surface">
          <span className="darkroom-detail-plate-number">
            {photo.id.slice(0, 2).toUpperCase()}
          </span>
          <div className="darkroom-detail-image-window">
            <ImageLarge
              src={photo.url}
              alt={altTextForPhoto(photo)}
              aspectRatio={photo.aspectRatio}
              blurDataURL={photo.blurData}
              blurCompatibilityMode={doesPhotoNeedBlurCompatibility(photo)}
              priority
              className="w-full h-full"
              classNameImage="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <aside className="darkroom-detail-copy" aria-label="Photo information">
        <header>
          <h1>{titleForPhoto(photo, false)}</h1>
          {photo.locationName && <p>{photo.locationName}</p>}
        </header>
        <dl>
          <div><dt>CAMERA</dt><dd>{valueOrDash(camera)}</dd></div>
          <div><dt>LENS</dt><dd>{valueOrDash(lens)}</dd></div>
          <div><dt>FILM</dt><dd>{valueOrDash(photo.film)}</dd></div>
          <div>
            <dt>EXPOSURE</dt>
            <dd>{[
              photo.exposureTimeFormatted,
              photo.fNumberFormatted,
            ].filter(Boolean).join('  ') || '—'}</dd>
          </div>
          <div><dt>DATE</dt><dd>{photo.takenAtNaiveFormatted}</dd></div>
        </dl>
        <footer>
          {photo.id.toUpperCase()}
        </footer>
      </aside>
    </section>
  );
}
