'use client';

import {
  CSSProperties,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Photo } from '.';
import PhotoMedium from './PhotoMedium';

const FEATURED_CARD_INDEX = 3;
const SCATTERED_CARD_COUNT = 10;
const GRID_COLUMNS = 5;

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

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const lerp = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;
const smoothstep = (value: number) => {
  const boundedValue = clamp(value);
  return boundedValue * boundedValue * (3 - 2 * boundedValue);
};

export default function DarkroomHomeStage({ photos }: { photos: Photo[] }) {
  const [visiblePhotos, setVisiblePhotos] = useState<Photo[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(FEATURED_CARD_INDEX);
  const scrollRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);

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
    let animationFrame = 0;
    let wasGridLocked = false;

    const updateScrollProgress = () => {
      animationFrame = 0;
      const scrollElement = scrollRef.current;
      const stageElement = stageRef.current;
      if (!scrollElement || !stageElement) return;

      const scrollDistance = scrollElement.offsetHeight - window.innerHeight;
      const rawProgress = scrollDistance > 0
        ? clamp(-scrollElement.getBoundingClientRect().top / scrollDistance)
        : 0;
      const tensionProgress = smoothstep(rawProgress / 0.15);
      const liftProgress = smoothstep((rawProgress - 0.15) / 0.3);
      const orbitProgress = smoothstep((rawProgress - 0.45) / 0.35);
      const lockProgress = smoothstep((rawProgress - 0.8) / 0.2);
      const gridReveal = smoothstep((rawProgress - 0.52) / 0.28);
      const gridLocked = rawProgress >= 0.985;
      const setStageProperty = stageElement.style.setProperty.bind(
        stageElement.style,
      );

      setStageProperty('--darkroom-scroll-progress', rawProgress.toFixed(4));
      setStageProperty(
        '--darkroom-tension-progress',
        tensionProgress.toFixed(4),
      );
      setStageProperty('--darkroom-lift-progress', liftProgress.toFixed(4));
      setStageProperty('--darkroom-orbit-progress', orbitProgress.toFixed(4));
      setStageProperty('--darkroom-lock-progress', lockProgress.toFixed(4));
      setStageProperty('--darkroom-grid-reveal', gridReveal.toFixed(4));
      setStageProperty(
        '--darkroom-plane-angle',
        `${lerp(5, 0, orbitProgress)}deg`,
      );
      setStageProperty('--darkroom-light-opacity', `${1 - orbitProgress}`);
      setStageProperty(
        '--darkroom-heading-opacity',
        `${1 - smoothstep(rawProgress / 0.28)}`,
      );
      setStageProperty(
        '--darkroom-clip-offset',
        `${(1 - tensionProgress) * -18}vh`,
      );
      stageElement.dataset.scrollPhase = rawProgress < 0.15
        ? 'tension'
        : rawProgress < 0.45
          ? 'lift'
          : rawProgress < 0.8
            ? 'orbit'
            : 'lock';

      cardRefs.current.forEach((cardElement, index) => {
        const placement = CARD_PLACEMENTS[index];
        if (!cardElement || !placement) return;

        const isMobile = window.innerWidth < 768;
        const scatterPlacement = isMobile
          ? MOBILE_SCATTER_PLACEMENTS[index]
          : placement;
        const gridColumns = isMobile ? 3 : GRID_COLUMNS;
        const gridColumn = index % gridColumns;
        const gridRow = Math.floor(index / gridColumns);
        const gridX = isMobile
          ? 20 + gridColumn * 30
          : 18 + gridColumn * 16;
        const gridY = isMobile
          ? 17 + gridRow * 17
          : 27 + gridRow * 24;
        const gridWidth = isMobile ? 23 : 10.8;
        const dragDirection = index % 2 === 0 ? -1 : 1;
        const liftedX = scatterPlacement.x + dragDirection * liftProgress * 1.1;
        const liftedY = scatterPlacement.y - liftProgress * (5 + (index % 3));
        const cardX = lerp(liftedX, gridX, orbitProgress);
        const cardY = lerp(liftedY, gridY, orbitProgress);
        const cardWidth = lerp(
          scatterPlacement.width,
          gridWidth,
          orbitProgress,
        );
        const cardRotation = lerp(placement.rotate, 0, orbitProgress);
        const cardPitch = lerp(
          placement.warpX - liftProgress * 4.5,
          0,
          orbitProgress,
        );
        const cardYaw = lerp(placement.warpY, 0, orbitProgress);
        const liftDepth = liftProgress * (1 - orbitProgress) * 3.4;
        const isScattered = index < SCATTERED_CARD_COUNT;

        cardElement.style.left = `${cardX}%`;
        cardElement.style.top = `${cardY}%`;
        cardElement.style.width = `${cardWidth}%`;
        cardElement.style.opacity = isScattered ? '1' : gridReveal.toFixed(4);
        cardElement.style.pointerEvents = isScattered || gridReveal > 0.65
          ? 'auto'
          : 'none';
        cardElement.style.zIndex = orbitProgress > 0.75
          ? String(index + 1)
          : String(placement.layer);
        cardElement.style.setProperty(
          '--darkroom-current-rotation',
          `${cardRotation}deg`,
        );
        cardElement.style.transform = [
          `translate3d(-50%, -50%, ${liftDepth}rem)`,
          `rotateX(${cardPitch}deg)`,
          `rotateY(${cardYaw}deg)`,
          `rotateZ(${cardRotation}deg)`,
        ].join(' ');
      });

      if (gridLocked !== wasGridLocked) {
        wasGridLocked = gridLocked;
        stageElement.dataset.gridLocked = String(gridLocked);
      }
    };

    const scheduleUpdate = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(updateScrollProgress);
      }
    };

    updateScrollProgress();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [visiblePhotos.length]);

  const activePlacement = CARD_PLACEMENTS[activeCardIndex];
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
        ref={scrollRef}
        className="darkroom-home-scroll"
        aria-label="Photographs"
      >
        <div
          ref={stageRef}
          className="darkroom-stage darkroom-home-stage"
        >
          <div className="darkroom-home-heading">PHOTOGRAPHS</div>
          <span className="darkroom-home-scroll-cue" aria-hidden="true">
            SCROLL TO LIFT
          </span>
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
                const isScattered = index < SCATTERED_CARD_COUNT;
                const depth = clamp((placement.y - 25) / 50);
                const style: CSSProperties & Record<string, string | number> = {
                  zIndex: placement.layer,
                  left: `${placement.x}%`,
                  top: `${placement.y}%`,
                  width: `${placement.width}%`,
                  opacity: isScattered ? 1 : 0,
                  '--darkroom-card-rotation': `${placement.rotate}deg`,
                  '--darkroom-current-rotation': `${placement.rotate}deg`,
                  '--darkroom-card-warp-x': `${placement.warpX}deg`,
                  '--darkroom-card-warp-y': `${placement.warpY}deg`,
                  '--darkroom-card-depth': depth.toFixed(3),
                  '--darkroom-card-brightness': (
                    0.38 + depth * 0.13
                  ).toFixed(3),
                  '--darkroom-card-visible': isScattered ? 1 : 0,
                  '--darkroom-grid-delay': `${index * 34}ms`,
                  '--darkroom-light-x': `${42 + ((index * 7) % 17)}%`,
                  '--darkroom-light-y': `${43 + ((index * 5) % 13)}%`,
                };

                return (
                  <article
                    key={photo.id}
                    ref={element => {
                      cardRefs.current[index] = element;
                    }}
                    className="darkroom-home-card"
                    data-lit={activeCardIndex === index}
                    data-scattered={isScattered}
                    style={style}
                    onPointerEnter={() => setActiveCardIndex(index)}
                    onPointerLeave={() => {
                      setActiveCardIndex(FEATURED_CARD_INDEX);
                    }}
                    onFocus={() => setActiveCardIndex(index)}
                    onBlur={() => setActiveCardIndex(FEATURED_CARD_INDEX)}
                  >
                    <span
                      className="darkroom-home-wire"
                      aria-hidden="true"
                    />
                    <span className="darkroom-home-clip" aria-hidden="true">
                      <i />
                    </span>
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
