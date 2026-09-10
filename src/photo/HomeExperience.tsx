'use client';

import { ReactNode } from 'react';
import { Photo } from '.';
import { useVisualExperience } from '@/app/VisualExperienceProvider';
import DarkroomHomeStage from './DarkroomHomeStage';

export default function HomeExperience({
  photos,
  gallery,
  children,
}: {
  photos: Photo[]
  gallery: ReactNode
  children: ReactNode
}) {
  const { isDarkroomExperience } = useVisualExperience();

  return isDarkroomExperience
    ? <DarkroomHomeStage photos={photos} gallery={gallery} />
    : children;
}
