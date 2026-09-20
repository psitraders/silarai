import React, { useState, useEffect, useRef } from 'react';

interface DeferredSectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  minHeight?: string | number;
  id?: string;
  className?: string;
}

/**
 * DeferredSection: High-performance viewport and idle-based hydration wrapper.
 * Defers loading and rendering of below-the-fold components until user approaches
 * them or until browser reaches idle state, eliminating unused JavaScript on initial
 * page load and drastically cutting initial main-thread blocking time (TBT).
 */
export const DeferredSection: React.FC<DeferredSectionProps> = ({
  children,
  fallback = null,
  rootMargin = '600px',
  minHeight = '180px',
  id,
  className = '',
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldRender) return;

    // Direct render if IntersectionObserver is not supported
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry && entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold: 0.01,
      }
    );

    const currentEl = containerRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    // Safety idle timer: hydrate during browser idle time after initial LCP window
    const idleId =
      'requestIdleCallback' in window
        ? (window as any).requestIdleCallback(() => setShouldRender(true), { timeout: 3500 })
        : setTimeout(() => setShouldRender(true), 3500);

    return () => {
      observer.disconnect();
      if ('cancelIdleCallback' in window && typeof idleId === 'number') {
        (window as any).cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId);
      }
    };
  }, [shouldRender, rootMargin]);

  return (
    <div
      ref={containerRef}
      id={id}
      className={className}
      style={{ minHeight: shouldRender ? undefined : minHeight }}
    >
      {shouldRender ? children : fallback}
    </div>
  );
};
