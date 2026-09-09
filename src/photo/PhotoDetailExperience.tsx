'use client';

import { ReactNode } from 'react';
import { Photo } from '.';
import { PhotoSetCategory } from '@/category';
import { useVisualExperience } from '@/app/VisualExperienceProvider';
import DarkroomPhotoStage from './DarkroomPhotoStage';

export default function PhotoDetailExperience({
  photo,
  photos,
  children,
  ...categories
}: {
  photo: Photo
  photos: Photo[]
  children: ReactNode
} & PhotoSetCategory) {
  const { isDarkroomExperience } = useVisualExperience();

  return isDarkroomExperience
    ? <DarkroomPhotoStage
      key={photo.id}
      photo={photo}
      photos={photos}
      {...categories}
    />
    : children;
}
