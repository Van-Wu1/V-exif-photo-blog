'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  altTextForPhoto,
  doesPhotoNeedBlurCompatibility,
  getNextPhoto,
  getPreviousPhoto,
  Photo,
  titleForPhoto,
} from '.';
import { PhotoSetCategory } from '@/category';
import { pathForPhoto } from '@/app/path';
import ImageLarge from '@/components/image/ImageLarge';

const valueOrDash = (value?: string) => value || '—';

type NavigationDirection = 'idle' | 'next' | 'previous';

export default function DarkroomPhotoStage({
  photo,
  photos,
  ...categories
}: {
  photo: Photo
  photos: Photo[]
} & PhotoSetCategory) {
  const router = useRouter();
  const stageRef = useRef<HTMLElement>(null);
  const navigationLockRef = useRef(false);
  const [navigationDirection, setNavigationDirection] =
    useState<NavigationDirection>('idle');
  const isPortrait = photo.aspectRatio < 1;
  const camera = [photo.make, photo.model].filter(Boolean).join(' ');
  const lens = [photo.lensMake, photo.lensModel].filter(Boolean).join(' ');
  const previousPhoto = getPreviousPhoto(photo, photos);
  const nextPhoto = getNextPhoto(photo, photos);
  const previousPath = previousPhoto
    ? pathForPhoto({ photo: previousPhoto, ...categories })
    : undefined;
  const nextPath = nextPhoto
    ? pathForPhoto({ photo: nextPhoto, ...categories })
    : undefined;

  const navigateByDepth = useCallback((direction: NavigationDirection) => {
    if (navigationLockRef.current || direction === 'idle') return;

    const path = direction === 'next' ? nextPath : previousPath;
    if (!path) return;

    navigationLockRef.current = true;
    setNavigationDirection(direction);
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    window.setTimeout(() => {
      router.push(path, { scroll: false });
    }, reduceMotion ? 0 : 430);
  }, [nextPath, previousPath, router, setNavigationDirection]);

  useEffect(() => {
    const stageElement = stageRef.current;
    if (!stageElement) return;

    let accumulatedDelta = 0;
    let resetTimer = 0;
    let acceptsWheelNavigation = false;
    const readyTimer = window.setTimeout(() => {
      acceptsWheelNavigation = true;
    }, 650);

    const handleWheel = (event: WheelEvent) => {
      if (!acceptsWheelNavigation) {
        event.preventDefault();
        return;
      }

      if (navigationLockRef.current) {
        event.preventDefault();
        return;
      }

      accumulatedDelta += event.deltaY;
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        accumulatedDelta = 0;
      }, 180);

      if (Math.abs(accumulatedDelta) < 34) return;

      event.preventDefault();
      navigateByDepth(accumulatedDelta > 0 ? 'next' : 'previous');
      accumulatedDelta = 0;
    };

    stageElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      stageElement.removeEventListener('wheel', handleWheel);
      window.clearTimeout(resetTimer);
      window.clearTimeout(readyTimer);
    };
  }, [navigateByDepth]);

  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/darkroom/detail-background-16x9-v2.webp"
      />
      <section
        ref={stageRef}
        className="darkroom-stage darkroom-detail-stage"
        data-navigation={navigationDirection}
        aria-label={`Darkroom view of ${titleForPhoto(photo)}`}
      >
        <div className="darkroom-detail-dust" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div
          className="darkroom-detail-mount-slot"
          data-orientation={isPortrait ? 'portrait' : 'landscape'}
        >
          <div className="darkroom-detail-mount-rig">
            <span className="darkroom-detail-wire" aria-hidden="true" />
            <span className="darkroom-detail-clip" aria-hidden="true">
              <i />
            </span>
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

        <span className="darkroom-detail-wheel-hint" aria-hidden="true">
          SCROLL · DEPTH NAVIGATION
        </span>
      </section>
    </>
  );
}
