import { Topbar } from './Topbar';
import { BottomDock } from './BottomDock';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-shell">
      <div className="dashboard-main-column">
        <Topbar />
        <main className="dashboard-content">{children}</main>
      </div>
      <BottomDock />
    </div>
  );
}
