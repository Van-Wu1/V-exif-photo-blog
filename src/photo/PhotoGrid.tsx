'use client';

import { Photo } from '.';
import { PhotoSetCategory } from '../category';
import PhotoMedium from './PhotoMedium';
import { clsx } from 'clsx/lite';
import AnimateItems from '@/components/AnimateItems';
import { GRID_ASPECT_RATIO } from '@/app/config';
import { useAppState } from '@/app/AppState';
import SelectTileOverlay from '@/components/SelectTileOverlay';
import { ReactNode } from 'react';
import { GRID_GAP_CLASSNAME } from '@/components';
import { useSelectPhotosState } from '@/admin/select/SelectPhotosState';
import { DATA_KEY_PHOTO_GRID } from '@/admin/select/SelectPhotosProvider';

export default function PhotoGrid({
  photos,
  selectedPhoto,
  prioritizeInitialPhotos,
  className,
  classNamePhoto,
  animate = true,
  canStart,
  animateOnFirstLoadOnly,
  staggerOnFirstLoadOnly = true,
  additionalTile,
  small,
  selectable = true,
  onLastPhotoVisible,
  onAnimationComplete,
  ...categories
}: {
  photos: Photo[]
  selectedPhoto?: Photo
  prioritizeInitialPhotos?: boolean
  className?: string
  classNamePhoto?: string
  animate?: boolean
  canStart?: boolean
  animateOnFirstLoadOnly?: boolean
  staggerOnFirstLoadOnly?: boolean
  additionalTile?: ReactNode
  small?: boolean
  selectable?: boolean
  onLastPhotoVisible?: () => void
  onAnimationComplete?: () => void
} & PhotoSetCategory) {
  const {
    isGridHighDensity,
  } = useAppState();

  const {
    isSelectingPhotos,
    selectedPhotoIds,
    setSelectedPhotoIds,
  } = useSelectPhotosState();

  // Use adaptive layout when aspect ratio is 0 (keep original photo aspect ratios)
  const useAdaptiveLayout = GRID_ASPECT_RATIO === 0;

  return (
    <div
      {...{ [DATA_KEY_PHOTO_GRID]: selectable, className }}
    >
      <AnimateItems
        className={clsx(
          useAdaptiveLayout
            ? clsx(
                'grid',
                'grid-flow-row-dense',
                GRID_GAP_CLASSNAME,
                small
                  ? 'grid-cols-2 xs:grid-cols-4'
                  : isGridHighDensity
                    ? 'grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6'
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
                'auto-rows-max',
              )
            : clsx(
                'grid',
                GRID_GAP_CLASSNAME,
                small
                  ? 'grid-cols-3 xs:grid-cols-6'
                  : isGridHighDensity
                    ? 'grid-cols-2 xs:grid-cols-4 lg:grid-cols-6'
                    : 'grid-cols-2 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4',
                'items-center',
              ),
        )}
        type={animate === false ? 'none' : undefined}
        canStart={canStart}
        duration={0.7}
        staggerDelay={0.04}
        distanceOffset={40}
        animateOnFirstLoadOnly={animateOnFirstLoadOnly}
        staggerOnFirstLoadOnly={staggerOnFirstLoadOnly}
        onAnimationComplete={onAnimationComplete}
        items={photos.map((photo, index) => {
          const isSelected = selectedPhotoIds?.includes(photo.id) ?? false;
          // Ensure aspectRatio is valid (greater than 0 and not NaN)
          const validAspectRatio = useAdaptiveLayout && photo.aspectRatio > 0 && !isNaN(photo.aspectRatio)
            ? photo.aspectRatio
            : undefined;
          return <div
            key={photo.id}
            className={clsx(
              'flex relative overflow-hidden',
              'group',
            )}
            style={{
              ...!useAdaptiveLayout && GRID_ASPECT_RATIO !== 0 && {
                aspectRatio: GRID_ASPECT_RATIO,
              },
              ...useAdaptiveLayout && validAspectRatio && {
                aspectRatio: validAspectRatio,
                width: '100%',
              },
            }}
          >
            <PhotoMedium
              className={clsx(
                'flex w-full h-full',
                // Prevent photo navigation when selecting
                isSelectingPhotos && 'pointer-events-none',
                classNamePhoto,
              )}
              {...{
                photo,
                ...categories,
                selected: photo.id === selectedPhoto?.id,
                priority: prioritizeInitialPhotos ? index < 6 : undefined,
                onVisible: index === photos.length - 1
                  ? onLastPhotoVisible
                  : undefined,
              }}
            />
            {isSelectingPhotos &&
              <SelectTileOverlay
                isSelected={isSelected}
                onSelectChange={() => setSelectedPhotoIds?.(isSelected
                  ? (selectedPhotoIds ?? []).filter(id => id !== photo.id)
                  : (selectedPhotoIds ?? []).concat(photo.id),
                )}
              />}
          </div>;
        }).concat(additionalTile ? <>{additionalTile}</> : [])}
        itemKeys={photos.map(photo => photo.id)
          .concat(additionalTile ? ['more'] : [])}
      />
    </div>
  );
};
