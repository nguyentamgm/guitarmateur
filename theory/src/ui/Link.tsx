import type { MouseEvent, ReactNode } from 'react';
import { useTheory } from './context';

/** An in-app link: a real <a href> (open in new tab still works), navigated client-side. */
export function Link({
  href,
  className,
  children,
  'aria-current': ariaCurrent,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  'aria-current'?: 'page';
}) {
  const { navigate } = useTheory();
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(href);
  };
  return (
    <a href={href} className={className} aria-current={ariaCurrent} onClick={onClick}>
      {children}
    </a>
  );
}
