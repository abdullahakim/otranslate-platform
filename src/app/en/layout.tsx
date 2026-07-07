import type { ReactNode } from 'react';

type EnglishLayoutProps = {
  children: ReactNode;
};

export default function EnglishLayout({ children }: EnglishLayoutProps) {
  return (
    <section lang="en" dir="ltr">
      {children}
    </section>
  );
}
