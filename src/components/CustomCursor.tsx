'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const [isMounted, setIsMounted] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const cursor = cursorRef.current;
    if (!cursor) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    };

    const handleMouseEnter = () => {
      cursor.classList.add('cursor-hover');
    };

    const handleMouseLeave = () => {
      cursor.classList.remove('cursor-hover');
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Add hover effect to interactive elements
    const addHoverListeners = () => {
      const hoverTriggers = document.querySelectorAll('a, button, [role="button"], .hover-trigger, [class*="cursor-pointer"]');
      hoverTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', handleMouseEnter);
        trigger.addEventListener('mouseleave', handleMouseLeave);
      });
    };

    // Initial setup
    addHoverListeners();

    // Re-setup when DOM changes (for dynamic content)
    const observer = new MutationObserver(() => {
      addHoverListeners();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
      const hoverTriggers = document.querySelectorAll('a, button, [role="button"], .hover-trigger, [class*="cursor-pointer"]');
      hoverTriggers.forEach(trigger => {
        trigger.removeEventListener('mouseenter', handleMouseEnter);
        trigger.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [isMounted]);

  // Only render on client to avoid hydration mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      id="cursor"
      className="cursor-dot hidden md:block"
    />
  );
}
