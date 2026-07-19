import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10">
        <div className="mx-auto w-full max-w-4xl animate-pop-in">{children}</div>
      </main>
    </div>
  );
}
