'use client';

import { ReactNode } from 'react';
import { Photo } from '.';
import { useVisualExperience } from '@/app/VisualExperienceProvider';
import DarkroomPhotoStage from './DarkroomPhotoStage';

export default function PhotoDetailExperience({
  photo,
  children,
}: {
  photo: Photo
  children: ReactNode
}) {
  const { isDarkroomExperience } = useVisualExperience();

  return isDarkroomExperience
    ? <DarkroomPhotoStage photo={photo} />
    : children;
}
