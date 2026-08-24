export const VISUAL_EXPERIENCES = ['classic', 'darkroom'] as const;

export type VisualExperience = typeof VISUAL_EXPERIENCES[number];

export const VISUAL_EXPERIENCE_QUERY_KEY = 'experience';
export const VISUAL_EXPERIENCE_STORAGE_KEY =
  'photo-blog:visual-experience';

export const DEFAULT_VISUAL_EXPERIENCE: VisualExperience =
  process.env.NEXT_PUBLIC_VISUAL_EXPERIENCE === 'darkroom'
    ? 'darkroom'
    : 'classic';

export const parseVisualExperience = (
  value: string | null | undefined,
): VisualExperience | undefined =>
  VISUAL_EXPERIENCES.find(experience => experience === value);

