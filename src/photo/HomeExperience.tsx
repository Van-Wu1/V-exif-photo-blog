'use client';

import { ReactNode } from 'react';
import { Photo } from '.';
import { useVisualExperience } from '@/app/VisualExperienceProvider';
import DarkroomHomeStage from './DarkroomHomeStage';
import dynamic from 'next/dynamic';

const DarkroomTable = dynamic(() => import('./darkroom3d/DarkroomTable'), {
  ssr: false,
});

export default function HomeExperience({
  photos,
  children,
}: {
  photos: Photo[]
  children: ReactNode
}) {
  const { experience, isDarkroomExperience } = useVisualExperience();

  if (experience === 'darkroom3d') return <DarkroomTable />;

  return isDarkroomExperience
    ? <DarkroomHomeStage photos={photos} />
    : children;
}
