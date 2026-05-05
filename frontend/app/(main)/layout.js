'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';

export default function MainLayout({ children }) {
  const [user, setUser]   = useState(null);
  const router             = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) { router.replace('/'); return; }
    try { setUser(JSON.parse(raw)); } catch { router.replace('/'); }
  }, [router]);

  if (!user) {
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
      <Sidebar />
      <div className="main-content">
        <Topbar user={user} />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
