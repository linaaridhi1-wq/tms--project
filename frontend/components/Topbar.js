'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, ChevronDown } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';

export default function Topbar({ user }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) { }
    localStorage.clear();
    toast.success('Déconnexion réussie');
    router.push('/');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user
    ? `${user.nom?.[0] ?? ''}${user.prenom?.[0] ?? ''}`.toUpperCase()
    : 'U';

  return (
    <>
      <div style={{
      height: 64,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 28px',
      position: 'relative',
      zIndex: 30,
      flexShrink: 0
    }}>
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px 8px', borderRadius: 'var(--radius-md)',
            transition: 'background 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--surface-2)'}
          onMouseOut={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700
          }}>
            {initials}
          </div>
          <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
              {user ? `${user.nom} ${user.prenom}` : 'Utilisateur'}
            </span>
            <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} />
          </div>
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 8,
            width: 220, background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden', padding: 6,
            animation: 'slideUp 0.2s ease-out'
          }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{user ? `${user.nom} ${user.prenom}` : 'Admin Yellomind'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user?.email || 'admin@yellomind.com'}</div>
            </div>

            <button
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)',
                textAlign: 'left', borderRadius: 'var(--radius-sm)'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              <User size={16} style={{ color: 'var(--text-muted)' }} /> Mon Profil
            </button>

            <button
              onClick={() => { setLogoutConfirm(true); setOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#EF4444',
                textAlign: 'left', borderRadius: 'var(--radius-sm)', marginTop: 2
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#FEF2F2'; if (document.documentElement.getAttribute('data-theme') === 'dark') e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={16} style={{ color: '#EF4444' }} /> Se déconnecter
            </button>
          </div>
        )}
      </div>
    </div>
    <ConfirmModal
      open={logoutConfirm}
      title="Déconnexion"
      message="Êtes-vous sûr de vouloir vous déconnecter ?"
      confirmText="Se déconnecter"
      onConfirm={handleLogout}
      onClose={() => setLogoutConfirm(false)}
    />
    </>
  );
}
