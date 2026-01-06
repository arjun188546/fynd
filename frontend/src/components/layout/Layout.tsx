import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { RightPanel } from './RightPanel';

interface LayoutProps {
  children: ReactNode;
  showRightPanel?: boolean;
}

export const Layout = ({ children, showRightPanel = true }: LayoutProps) => {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {children}
        </main>
      </div>

      {/* Right Panel */}
      {showRightPanel && <RightPanel />}
    </div>
  );
};
