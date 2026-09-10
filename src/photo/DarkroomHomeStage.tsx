'use client';

import {
  CSSProperties,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Photo } from '.';
import PhotoMedium from './PhotoMedium';

const FEATURED_CARD_INDEX = 3;
const SCATTERED_CARD_COUNT = 10;
const GRID_COLUMNS = 6;
const TRANSITION_DURATION = 3050;

type TransitionDirection = 'forward' | 'reverse';
type TransitionState = 'idle' | TransitionDirection | 'settled';

const CARD_PLACEMENTS = [
  { x: 23, y: 37, width: 13.2, rotate: -14, layer: 1, warpX: 0.7, warpY: -0.5 },
  { x: 67, y: 35, width: 13.1, rotate: 16, layer: 2, warpX: -0.5, warpY: 0.7 },
  { x: 38, y: 51, width: 14.2, rotate: 11, layer: 3, warpX: 0.9, warpY: 0.4 },
  { x: 52, y: 49, width: 15.4, rotate: 5, layer: 10, warpX: -0.6, warpY: -0.4 },
  { x: 72, y: 56, width: 13.4, rotate: -12, layer: 4, warpX: 0.5, warpY: -0.8 },
  { x: 25, y: 68, width: 14.1, rotate: -17, layer: 5, warpX: -0.8, warpY: 0.5 },
  { x: 42, y: 68, width: 14.5, rotate: -8, layer: 6, warpX: 0.6, warpY: 0.8 },
  { x: 58, y: 70, width: 14.4, rotate: 9, layer: 7, warpX: -0.7, warpY: -0.3 },
  { x: 72, y: 72, width: 13.2, rotate: 18, layer: 8, warpX: 0.8, warpY: 0.6 },
  { x: 48, y: 36, width: 12.1, rotate: -6, layer: 0, warpX: -0.4, warpY: -0.6 },
  { x: 50, y: 48, width: 10.8, rotate: -10, layer: 0, warpX: 0.5, warpY: 0.5 },
  { x: 50, y: 48, width: 10.8, rotate: 8, layer: 0, warpX: -0.5, warpY: 0.4 },
  { x: 50, y: 48, width: 10.8, rotate: -5, layer: 0, warpX: 0.4, warpY: -0.5 },
  { x: 50, y: 48, width: 10.8, rotate: 7, layer: 0, warpX: -0.6, warpY: -0.4 },
  { x: 50, y: 48, width: 10.8, rotate: 3, layer: 0, warpX: 0.5, warpY: 0.6 },
] as const;

const MOBILE_SCATTER_PLACEMENTS = [
  { x: 24, y: 31, width: 25 },
  { x: 76, y: 31, width: 25 },
  { x: 31, y: 49, width: 28 },
  { x: 52, y: 47, width: 31 },
  { x: 74, y: 53, width: 27 },
  { x: 25, y: 67, width: 28 },
  { x: 48, y: 65, width: 29 },
  { x: 71, y: 68, width: 28 },
  { x: 34, y: 82, width: 27 },
  { x: 65, y: 82, width: 26 },
  { x: 50, y: 48, width: 24 },
  { x: 50, y: 48, width: 24 },
  { x: 50, y: 48, width: 24 },
  { x: 50, y: 48, width: 24 },
  { x: 50, y: 48, width: 24 },
] as const;

const FLIGHT_DELAYS = [
  0, 110, 40, 190, 70, 230, 25, 150, 60, 210, 100, 250, 130, 35, 175,
] as const;
const FLIGHT_DURATIONS = [
  2260, 2380, 2320, 2210, 2420, 2290, 2390, 2240, 2440, 2340,
  2270, 2400, 2310, 2430, 2230,
] as const;

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export default function DarkroomHomeStage({
  photos,
  gallery,
}: {
  photos: Photo[]
  gallery: ReactNode
}) {
  const [visiblePhotos, setVisiblePhotos] = useState<Photo[]>(() =>
    photos.slice(0, CARD_PLACEMENTS.length),
  );
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(
    FEATURED_CARD_INDEX,
  );
  const [transitionState, setTransitionState] =
    useState<TransitionState>('idle');
  const stageRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const transitionStateRef = useRef<TransitionState>('idle');

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

  useEffect(() => {
    const stageElement = stageRef.current;
    if (!stageElement) return;

    let settleTimer = 0;
    let touchStartY: number | undefined;

    const beginTransition = (direction: TransitionDirection) => {
      const currentState = transitionStateRef.current;
      const canTransition = direction === 'forward'
        ? currentState === 'idle'
        : currentState === 'settled';
      if (!canTransition) return;

      window.clearTimeout(settleTimer);
      transitionStateRef.current = direction;
      setTransitionState(direction);
      setActiveCardIndex(null);

      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      settleTimer = window.setTimeout(() => {
        const nextState = direction === 'forward' ? 'settled' : 'idle';
        transitionStateRef.current = nextState;
        setTransitionState(nextState);
        setActiveCardIndex(
          nextState === 'idle' ? FEATURED_CARD_INDEX : null,
        );
      }, reduceMotion ? 50 : TRANSITION_DURATION);
    };

    const handleWheel = (event: WheelEvent) => {
      const currentState = transitionStateRef.current;
      if (currentState === 'forward' || currentState === 'reverse') {
        event.preventDefault();
        return;
      }

      if (currentState === 'idle' && event.deltaY > 8) {
        event.preventDefault();
        beginTransition('forward');
      } else if (
        currentState === 'settled'
        && event.deltaY < -8
        && (galleryRef.current?.scrollTop ?? 0) <= 1
      ) {
        event.preventDefault();
        beginTransition('reverse');
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const currentState = transitionStateRef.current;
      if (
        currentState === 'idle'
        && ['ArrowDown', 'PageDown', ' '].includes(event.key)
      ) {
        event.preventDefault();
        beginTransition('forward');
      } else if (
        currentState === 'settled'
        && ['ArrowUp', 'PageUp'].includes(event.key)
        && (galleryRef.current?.scrollTop ?? 0) <= 1
      ) {
        event.preventDefault();
        beginTransition('reverse');
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const touchEndY = event.changedTouches[0]?.clientY;
      const touchDistance = touchStartY !== undefined && touchEndY !== undefined
        ? touchStartY - touchEndY
        : 0;
      if (
        transitionStateRef.current === 'idle'
        && touchDistance > 24
      ) {
        beginTransition('forward');
      } else if (
        transitionStateRef.current === 'settled'
        && touchDistance < -24
        && (galleryRef.current?.scrollTop ?? 0) <= 1
      ) {
        beginTransition('reverse');
      }
      touchStartY = undefined;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    stageElement.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    stageElement.addEventListener('touchend', handleTouchEnd, {
      passive: true,
    });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener('wheel', handleWheel);
      stageElement.removeEventListener('touchstart', handleTouchStart);
      stageElement.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const activePlacement = CARD_PLACEMENTS[
    activeCardIndex ?? FEATURED_CARD_INDEX
  ];
  const tableLightStyle: CSSProperties & Record<string, string | number> = {
    left: `${activePlacement.x}%`,
    top: `${activePlacement.y}%`,
    width: `${activePlacement.width}%`,
    '--darkroom-light-rotation': `${activePlacement.rotate}deg`,
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
        ref={stageRef}
        className="darkroom-stage darkroom-home-stage"
        data-transition-state={transitionState}
        aria-label="Photographs"
      >
        <div className="darkroom-home-camera">
          <div className="darkroom-home-desk" aria-hidden="true">
            <span
              className="darkroom-home-table-light"
              style={tableLightStyle}
            />
          </div>
          <div className="darkroom-home-heading">PHOTOGRAPHS</div>
          <span className="darkroom-home-scroll-cue" aria-hidden="true">
            SCROLL TO RELEASE
          </span>
          <div
            ref={galleryRef}
            className="darkroom-home-gallery"
            aria-hidden={transitionState !== 'settled'}
            inert={transitionState !== 'settled'}
          >
            <div className="darkroom-home-gallery-inner">
              {gallery}
            </div>
          </div>
          <div
            className="darkroom-home-cards"
            aria-busy={visiblePhotos.length === 0}
          >
            <div className="darkroom-home-plane">
              {visiblePhotos.map((photo, index) => {
                const placement = CARD_PLACEMENTS[index];
                const mobilePlacement = MOBILE_SCATTER_PLACEMENTS[index];
                const isScattered = index < SCATTERED_CARD_COUNT;
                const depth = clamp((placement.y - 25) / 50);
                const gridColumn = index % GRID_COLUMNS;
                const gridRow = Math.floor(index / GRID_COLUMNS);
                const mobileColumn = index % 3;
                const mobileRow = Math.floor(index / 3);
                const swingDirection = index % 2 === 0 ? -1 : 1;
                const style: CSSProperties & Record<string, string | number> = {
                  zIndex: placement.layer,
                  '--darkroom-start-x': `${placement.x}%`,
                  '--darkroom-start-y': `${placement.y}%`,
                  '--darkroom-start-width': `${placement.width}%`,
                  '--darkroom-card-rotation': `${placement.rotate}deg`,
                  '--darkroom-card-warp-x': `${placement.warpX}deg`,
                  '--darkroom-card-warp-y': `${placement.warpY}deg`,
                  '--darkroom-card-depth': depth.toFixed(3),
                  '--darkroom-card-brightness': (
                    0.38 + depth * 0.13
                  ).toFixed(3),
                  '--darkroom-card-visible': isScattered ? 1 : 0,
                  '--darkroom-mobile-x': `${mobilePlacement.x}%`,
                  '--darkroom-mobile-y': `${mobilePlacement.y}%`,
                  '--darkroom-mobile-width': `${mobilePlacement.width}%`,
                  '--darkroom-grid-x': `${7.2 + gridColumn * 12.25}%`,
                  '--darkroom-grid-y': `${24 + gridRow * 26}%`,
                  '--darkroom-grid-width': '11.8%',
                  '--darkroom-mobile-grid-x': `${20 + mobileColumn * 30}%`,
                  '--darkroom-mobile-grid-y': `${17 + mobileRow * 17}%`,
                  '--darkroom-mobile-grid-width': '23%',
                  '--darkroom-flight-delay': `${FLIGHT_DELAYS[index]}ms`,
                  '--darkroom-flight-duration': `${FLIGHT_DURATIONS[index]}ms`,
                  '--darkroom-flight-layer': index + 10,
                  '--darkroom-lift-drift': `${swingDirection * (0.7 + (index % 3) * 0.35)}rem`,
                  '--darkroom-lift-angle': `${swingDirection * (3.8 + (index % 4) * 0.9)}deg`,
                  '--darkroom-light-x': `${42 + ((index * 7) % 17)}%`,
                  '--darkroom-light-y': `${43 + ((index * 5) % 13)}%`,
                };

                return (
                  <article
                    key={photo.id}
                    className="darkroom-home-card"
                    data-lit={activeCardIndex === index}
                    data-scattered={isScattered}
                    style={style}
                    onPointerEnter={() => {
                      if (
                        transitionState !== 'forward'
                        && transitionState !== 'reverse'
                      ) {
                        setActiveCardIndex(index);
                      }
                    }}
                    onPointerLeave={() => {
                      setActiveCardIndex(
                        transitionState === 'idle'
                          ? FEATURED_CARD_INDEX
                          : null,
                      );
                    }}
                    onFocus={() => {
                      if (
                        transitionState !== 'forward'
                        && transitionState !== 'reverse'
                      ) {
                        setActiveCardIndex(index);
                      }
                    }}
                    onBlur={() => {
                      setActiveCardIndex(
                        transitionState === 'idle'
                          ? FEATURED_CARD_INDEX
                          : null,
                      );
                    }}
                  >
                    <div className="darkroom-home-card-body">
                      <div className="darkroom-home-card-surface">
                        <span className="darkroom-home-card-index">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="darkroom-home-card-image">
                          <PhotoMedium
                            photo={photo}
                            priority={index < 3}
                            prefetch={false}
                            className="w-full h-full"
                          />
                        </div>
                        <span className="darkroom-home-card-illumination" />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
