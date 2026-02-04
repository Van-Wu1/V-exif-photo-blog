'use client';

import { clsx } from 'clsx/lite';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import AppGrid from '../components/AppGrid';
import AppViewSwitcher, { SwitcherSelection } from '@/app/AppViewSwitcher';
import ThemeSwitcher from '@/app/ThemeSwitcher';
import {
  PATH_ROOT,
  isPathAdmin,
  isPathFull,
  isPathGrid,
  isPathProtected,
  isPathSignIn,
} from '@/app/path';
import AnimateItems from '../components/AnimateItems';
import {
  GRID_HOMEPAGE_ENABLED,
  NAV_CAPTION,
} from './config';
import { useRef } from 'react';
import useStickyNav from './useStickyNav';
import { useAppState } from '@/app/AppState';
import { BiArrowBack } from 'react-icons/bi';

const NAV_HEIGHT_CLASS = NAV_CAPTION
  ? 'min-h-[4rem] sm:min-h-[5rem]'
  : 'min-h-[4rem]';

export default function NavClient({
  navTitle,
  navCaption,
  animate,
}: {
  navTitle: string
  navCaption?: string
  animate: boolean
}) {
  const ref = useRef<HTMLElement>(null);

  const pathname = usePathname();
  const showNav = !isPathSignIn(pathname);

  const {
    hasLoadedWithAnimations,
  } = useAppState();

  const {
    classNameStickyContainer,
    classNameStickyNav,
    isNavVisible,
  } = useStickyNav(ref, !isPathAdmin(pathname));

  const renderLink = (
    text: string,
    linkOrAction: string | (() => void),
  ) =>
    typeof linkOrAction === 'string'
      ? <Link href={linkOrAction}>{text}</Link>
      : <button onClick={linkOrAction} type="button">{text}</button>;

  const switcherSelectionForPath = (): SwitcherSelection | undefined => {
    if (pathname === PATH_ROOT) {
      return GRID_HOMEPAGE_ENABLED ? 'grid' : 'full';
    } else if (isPathGrid(pathname)) {
      return 'grid';
    } else if (isPathFull(pathname)) {
      return 'full';
    } else if (isPathProtected(pathname)) {
      return 'admin';
    }
  };

  return (
    <>
      <AppGrid
        className={classNameStickyContainer}
        classNameMain='pointer-events-auto'
        contentMain={
          <AnimateItems
            animateOnFirstLoadOnly
            type={animate && !isPathAdmin(pathname) ? 'bottom' : 'none'}
            distanceOffset={10}
            items={showNav
              ? [<nav
                key="nav"
                ref={ref}
                className={clsx(
                  'w-full flex items-center bg-main',
                  NAV_HEIGHT_CLASS,
                  // Enlarge nav to ensure it fully masks underlying content
                  'md:w-[calc(100%+8px)] md:translate-x-[-4px] md:px-[4px]',
                  'relative',
                  classNameStickyNav,
                )}>
                {/* Back Button */}
                <a
                  href="https://involv.studio/index.html"
                  className={clsx(
                    'hover-trigger flex items-center gap-2 group',
                    'mr-4',
                    'opacity-40 hover:opacity-100 transition-opacity',
                  )}
                >
                  <BiArrowBack size={12} className="transition-opacity" />
                  <span className={clsx(
                    'text-[9px] md:text-[10px]',
                    'tracking-[0.2em] uppercase font-light',
                    'transition-opacity',
                  )}>
                    Back
                  </span>
                </a>
                <div className="h-[10px] w-[1px] bg-gray-400 dark:bg-gray-600 mr-4" />
                <AppViewSwitcher
                  currentSelection={switcherSelectionForPath()}
                  className="translate-x-[-1px]"
                  animate={hasLoadedWithAnimations && isNavVisible}
                />
                <div className={clsx(
                  'grow text-right min-w-0',
                  'translate-y-[-1px]',
                  // Add padding-right to prevent overlap with theme switcher
                  // Theme switcher has 3 buttons × 42px = 126px
                  'pr-[130px]',
                )}>
                  <div className="truncate overflow-hidden select-none">
                    {renderLink(navTitle, PATH_ROOT)}
                  </div>
                  {navCaption &&
                    <div className={clsx(
                      'hidden sm:block truncate overflow-hidden',
                      'leading-tight text-dim',
                    )}>
                      {navCaption}
                    </div>}
                </div>
                {/* Theme switcher fixed within nav - positioned at screen right edge */}
                <div className={clsx(
                  'absolute top-0',
                  'flex items-center h-full',
                  // Use viewport calculation to position at screen right edge
                  // Account for layout margin: mx-3 lg:mx-6, plus extra spacing
                  'right-[calc(-100vw+100%+0.75rem+0.5rem)]',
                  'lg:right-[calc(-100vw+100%+1.5rem+1rem)]',
                  // Ensure it's above other content
                  'z-50',
                )}>
                  <ThemeSwitcher />
                </div>
              </nav>]
              : []}
          />
        }
      />
    </>
  );
};
