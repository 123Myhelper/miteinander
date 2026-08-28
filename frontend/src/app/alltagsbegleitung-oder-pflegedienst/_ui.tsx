import type { ReactNode } from "react";

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
