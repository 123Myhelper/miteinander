import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Route-local presentation primitives.
 *
 * Deliberately duplicated from the /alltagsbegleitung-oder-pflegedienst route
 * rather than extracted into a shared module: that page is production-verified,
 * and this milestone does not touch its component architecture. Extracting a
 * shared editorial primitive is logged as post-release cleanup.
 */
export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-4 mt-12 font-serif text-2xl text-primary sm:text-3xl">
      {children}
    </h2>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 mt-8 font-serif text-xl text-primary">{children}</h3>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="my-4 space-y-2 pl-5">
      {items.map((item) => (
        <li key={item} className="list-disc marker:text-accent">
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * Inline link used inside prose. The surrounding sentence is split across
 * `textBefore` / `textAfter` content keys so the anchor stays part of the
 * sentence rather than being appended as a bare "hier klicken" link.
 */
export function InlineLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-md text-accent transition-colors hover:text-accent-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      {children}
    </Link>
  );
}
