'use client';

import { BiGridAlt, BiImageAlt } from 'react-icons/bi';
import Switcher from '@/components/switcher/Switcher';
import SwitcherItem from '@/components/switcher/SwitcherItem';
import { useVisualExperience } from './VisualExperienceProvider';

export default function VisualExperienceSwitcher() {
  const { experience, setExperience } = useVisualExperience();

  return (
    <Switcher className="visual-experience-switcher translate-x-[-1px]">
      <SwitcherItem
        icon={<BiGridAlt size={16} />}
        onClick={() => setExperience('classic')}
        active={experience === 'classic'}
        tooltip={{ content: 'Classic layout' }}
      />
      <SwitcherItem
        icon={<BiImageAlt size={17} />}
        onClick={() => setExperience('darkroom')}
        active={experience === 'darkroom'}
        tooltip={{ content: 'Darkroom layout' }}
      />
    </Switcher>
  );
}
