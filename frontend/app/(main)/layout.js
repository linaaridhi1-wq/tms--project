'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';

// Route access control per role
const ROLE_ROUTES = {
  Admin:      ['/dashboard', '/tenders', '/submissions', '/knowledge-base', '/ai-assistant', '/reports', '/planning', '/users', '/settings'],
  Manager:    ['/dashboard', '/clients', '/tenders', '/submissions', '/knowledge-base', '/ai-assistant', '/reports', '/planning', '/settings'],
  Consultant: ['/tenders', '/submissions', '/knowledge-base', '/ai-assistant', '/planning', '/settings'],
};

function canAccess(role, pathname) {
  const allowed = ROLE_ROUTES[role];
  if (!allowed) return false;
  return allowed.some(route => pathname === route || pathname.startsWith(route + '/'));
}

export default function MainLayout({ children }) {
  const [user, setUser]   = useState(null);
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router             = useRouter();
  const pathname           = usePathname();

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) { router.replace('/'); return; }
    try {
      const parsed = JSON.parse(raw);
      setUser(parsed);

      // Role-based route guard
      if (!canAccess(parsed.role, pathname)) {
        // Redirect to a sensible default for the role
        const defaults = {
          Admin:      '/dashboard',
          Manager:    '/dashboard',
          Consultant: '/tenders',
        };
        router.replace(defaults[parsed.role] || '/');
        return;
      }

      setReady(true);
    } catch {
      router.replace('/');
    }
  }, [router, pathname]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [sidebarOpen]);

  if (!ready) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)'
      }}>
        <div className="animate-pulse-soft" style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '13.5px',
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0,0,0,.12)',
          },
        }}
      />
      <Sidebar mobileOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <div
        className={`sidebar-backdrop${sidebarOpen ? ' show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <div className="main-content">
        <Topbar user={user} onOpenSidebar={() => setSidebarOpen(true)} />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
