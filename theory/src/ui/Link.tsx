import type { MouseEvent, ReactNode } from 'react';
import { useTheory } from './context';
import { isPlainClick } from './plainClick';

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
    if (!isPlainClick(e)) return;
    e.preventDefault();
    navigate(href);
  };
  return (
    <a href={href} className={className} aria-current={ariaCurrent} onClick={onClick}>
      {children}
    </a>
  );
}
