import { ReactNode } from 'react';
import Navbar from '../Navbar';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
}

export const PageLayout = ({ children, className = '', header }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 pb-12">
        <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
          {header && <div className="mb-8 pt-4">{header}</div>}
          {children}
        </div>
      </main>
    </div>
  );
};

export default PageLayout;
