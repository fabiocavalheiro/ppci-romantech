import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface LayoutProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function Layout({ children, allowedRoles }: LayoutProps) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}