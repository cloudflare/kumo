import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../utils";
import { Link, useLocation } from "react-router";

export type TabItem = {
    label: string;
    href: string;
}

export function Tabs({
    links,
    matchQuery = false,
    matchQueryKeys,
}: {
    links?: TabItem[];
    matchQuery?: boolean;
    matchQueryKeys?: string[];
}) {
    const location = useLocation();
    
    const trackRef = useRef<HTMLDivElement | null>(null);
    const [indicator, setIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
    const [transitionMs, setTransitionMs] = useState<number>(200);
    const prevLeftRef = useRef<number | undefined>(undefined);
    const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

    const normalizeParams = (sp: URLSearchParams) => {
        const entries: string[] = [];
        sp.forEach((value, key) => {
            entries.push(`${key}=${value}`);
        });
        return entries.sort().join('&');
    };

    const getUrlParts = (href: string) => {
        const url = new URL(href, 'http://dummy');
        return { pathname: url.pathname, searchParams: url.searchParams };
    };

    const isLinkActive = (href: string) => {
        const currentPath = location.pathname;
        const currentParams = new URLSearchParams(location.search);
        const { pathname: hrefPath, searchParams: hrefParams } = getUrlParts(href);

        if (matchQueryKeys && matchQueryKeys.length > 0) {
            if (currentPath !== hrefPath) return false;
            for (const key of matchQueryKeys) {
                if (currentParams.get(key) !== hrefParams.get(key)) return false;
            }
            return true;
        }

        if (matchQuery) {
            return (
                currentPath === hrefPath &&
                normalizeParams(currentParams) === normalizeParams(hrefParams)
            );
        }

        return currentPath === hrefPath;
    };

    const recomputeIndicator = useCallback(() => {
        const track = trackRef.current;
        if (!track) return;

        const active = track.querySelector('a[data-active="true"]') as HTMLElement | null;
        if (!active) return;

        const trackRect = track.getBoundingClientRect();
        const activeRect = active.getBoundingClientRect();

        const scrollLeft = track.scrollLeft || 0;
        const newLeft = activeRect.left - trackRect.left + scrollLeft;
        const prevLeft = prevLeftRef.current;
        if (prevLeft === undefined) {
            setTransitionMs(0);
        } else {
            const distance = Math.abs(newLeft - prevLeft);
            const trackWidth = Math.max(1, trackRect.width);
            const distanceRatio = clamp(distance / trackWidth, 0, 1);
            const msPerPx = 0.6 - distanceRatio * 0.35;
            const base = 120;
            setTransitionMs(clamp(base + distance * msPerPx, 140, 380));
        }

        setIndicator({ left: newLeft, width: activeRect.width });
        prevLeftRef.current = newLeft;
    }, []);

    useEffect(() => {
        recomputeIndicator();
    }, [location.pathname, location.search, links, matchQuery, matchQueryKeys, recomputeIndicator]);

    useEffect(() => {
        const onResize = () => recomputeIndicator();
        window.addEventListener('resize', onResize);

        const track = trackRef.current;
        const onScroll = () => recomputeIndicator();

        if (track) track.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('resize', onResize);
            if (track) track.removeEventListener('scroll', onScroll as any);
        };
    }, [recomputeIndicator]);

    return (
        <nav ref={trackRef} className="relative font-medium flex text-base rounded-lg h-8.5 bg-accent dark:bg-neutral-900 overflow-x-auto flex-shrink min-w-0 scrollbar-hide">
          {/* Sliding background indicator */}
          <div
            className="absolute top-0 bottom-0 my-[1px] rounded-lg bg-surface shadow ring ring-neutral-950/10 dark:ring-neutral-800 dark:bg-neutral-850 transform-gpu will-change-[transform] will-change-[width] transition-transform transition-[width] ease-out"
            style={{ transform: `translate3d(${indicator.left}px, 0, 0)`, width: `${indicator.width}px`, transitionDuration: `${transitionMs}ms` }}
          />

          {/* Link buttons */}
          <div className="relative flex whitespace-nowrap px-[1px] items-stretch">
            {links?.map((link, i) => {
              const isActive = isLinkActive(link.href);
              return (
                <Link
                  className={cn(
                    '!no-underline relative z-10 flex items-center px-2.5 my-px rounded-lg whitespace-nowrap',
                    isActive
                      ? '!text-inherit'
                      : '!text-neutral-500 dark:!text-neutral-400 border-transparent'
                  )}
                  key={link.label}
                  to={link.href}
                  data-active={isActive || undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
    )
}