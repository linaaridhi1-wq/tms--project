'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, ChevronDown, Bell, Settings, Link2, Menu, X } from 'lucide-react';
import Link from 'next/link';
import api from '../lib/api';
import toast from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';

const ROLE_META = {
  Admin:      { color: '#7C3AED', bg: '#EDE9FE' },
  Manager:    { color: '#2563EB', bg: '#EFF6FF' },
  Consultant: { color: '#059669', bg: '#ECFDF5' },
};

export default function Topbar({ user, onOpenSidebar }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState({});
  const dropdownRef = useRef(null);
  const alertsRef   = useRef(null);
  const hasMenu = typeof onOpenSidebar === 'function';

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch (_) { }
    const preservedDismissed = {};
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key && key.startsWith('tms.dismissedAlerts.')) keys.push(key);
      }
      keys.forEach((key) => {
        preservedDismissed[key] = localStorage.getItem(key);
      });
    } catch { /* ignore storage errors */ }

    localStorage.clear();

    try {
      Object.entries(preservedDismissed).forEach(([key, value]) => {
        if (value !== null) localStorage.setItem(key, value);
      });
    } catch { /* ignore storage errors */ }
    toast.success('Déconnexion réussie');
    router.push('/');
  };

  // Load deadline alerts
  const loadAlerts = useCallback(async () => {
    try {
      const r = await api.get('/tenders');
      const now = new Date();
      const urgent = (r.data || [])
        .filter(t => t.date_limite)
        .map(t => ({
          id: t.tender_id,
          titre: t.titre,
          days: Math.ceil((new Date(t.date_limite) - now) / 86400000),
        }))
        .filter(t => t.days >= 0 && t.days <= 7)
        .sort((a, b) => a.days - b.days)
        .slice(0, 5);
      setAlerts(urgent);
    } catch { /* keep silent */ }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(loadAlerts, 0);
    const intervalId = setInterval(loadAlerts, 30000);
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
      if (alertsRef.current   && !alertsRef.current.contains(e.target))   setShowAlerts(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [loadAlerts]);

  useEffect(() => {
    if (!user) return;
    const key = `tms.dismissedAlerts.${user.email || user.user_id || 'default'}`;
    const timeoutId = setTimeout(() => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) setDismissedAlerts(JSON.parse(raw));
      } catch {
        setDismissedAlerts({});
      }
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [user]);

  const initials = user
    ? `${user.nom?.[0] ?? ''}${user.prenom?.[0] ?? ''}`.toUpperCase()
    : 'U';

  const roleMeta = ROLE_META[user?.role] || { color: '#94A3B8', bg: '#F1F5F9' };
  const canDismissAlerts = user?.role === 'Admin' || user?.role === 'Manager';
  const visibleAlerts = alerts.filter(a => !dismissedAlerts[a.id]);

  const dismissAlert = (id) => {
    setDismissedAlerts((prev) => {
      const next = { ...prev, [id]: true };
      if (user) {
        const key = `tms.dismissedAlerts.${user.email || user.user_id || 'default'}`;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch { /* ignore storage errors */ }
      }
      return next;
    });
  };

  return (
    <>
      <div style={{
        height: 64,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: hasMenu ? 'space-between' : 'flex-end',
        padding: '0 28px',
        position: 'relative',
        zIndex: 30,
        flexShrink: 0,
      }}>

        {hasMenu && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              className="topbar-menu-btn"
              onClick={onOpenSidebar}
              aria-label="Ouvrir le menu"
              title="Menu"
            >
              <Menu size={18} />
            </button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Notification Bell */}
        <div ref={alertsRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowAlerts(v => !v)}
            style={{
              position: 'relative',
              background: 'none', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer', padding: '7px 9px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
            title="Alertes échéances"
          >
            <Bell size={18} />
            {visibleAlerts.length > 0 && (
              <div style={{
                position: 'absolute', top: -4, right: -4,
                width: 17, height: 17, borderRadius: '50%',
                background: '#EF4444', color: '#fff',
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--surface)',
              }}>
                {visibleAlerts.length}
              </div>
            )}
          </button>

          {showAlerts && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 8,
              width: 300, background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Alertes échéances</div>
                {visibleAlerts.length > 0 && (
                  <span style={{ fontSize: 11, background: '#FEF2F2', color: '#EF4444', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                    {visibleAlerts.length} urgent{visibleAlerts.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                {visibleAlerts.length === 0 ? (
                  <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                    ✅ Aucune échéance urgente
                  </div>
                ) : visibleAlerts.map(a => (
                  <div key={a.id} style={{
                    padding: '11px 16px', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      background: a.days <= 2 ? '#EF4444' : a.days <= 5 ? '#F59E0B' : '#10B981',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.titre}
                      </div>
                      <div style={{ fontSize: 11.5, color: a.days <= 2 ? '#EF4444' : a.days <= 5 ? '#F59E0B' : 'var(--text-muted)', fontWeight: 500 }}>
                        {a.days === 0 ? '⚠️ Expire aujourd\'hui !' : `J-${a.days} restant${a.days > 1 ? 's' : ''}`}
                      </div>
                    </div>
                    {canDismissAlerts && (
                      <button
                        onClick={(e) => { e.stopPropagation(); dismissAlert(a.id); }}
                        title="Masquer"
                        style={{
                          width: 22, height: 22,
                          borderRadius: 6,
                          border: '1px solid #FECACA',
                          background: '#FEF2F2',
                          color: '#EF4444',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', flexShrink: 0,
                          transition: 'all 0.15s',
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.borderColor = '#FCA5A5'; }}
                        onMouseOut={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#FECACA'; }}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ padding: '10px 16px' }}>
                <Link href="/planning" onClick={() => setShowAlerts(false)} style={{
                  display: 'block', textAlign: 'center', fontSize: 12.5,
                  color: 'var(--primary)', fontWeight: 600, textDecoration: 'none',
                }}>
                  Voir le planning →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
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
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {user ? `${user.nom} ${user.prenom}` : 'Utilisateur'}
              </div>
              {user?.role && (
                <div style={{
                  fontSize: 11, fontWeight: 700,
                  color: roleMeta.color, lineHeight: 1.2,
                }}>
                  {user.role}
                </div>
              )}
            </div>
            <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} />
          </button>

          {open && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 8,
              width: 230, background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden', padding: 6,
              animation: 'slideUp 0.2s ease-out'
            }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user ? `${user.nom} ${user.prenom}` : 'Admin Yellomind'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user?.email || 'admin@yellomind.com'}</div>
                {user?.role && (
                  <div style={{
                    marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: roleMeta.bg, color: roleMeta.color,
                    borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 700,
                  }}>
                    {user.role}
                  </div>
                )}
              </div>

              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', color: 'var(--text-primary)',
                  fontSize: 13, fontWeight: 500, borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none', transition: 'background 0.15s',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <Settings size={16} style={{ color: 'var(--text-muted)' }} /> Paramètres
              </Link>

              <button
                onClick={() => { setLogoutConfirm(true); setOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#EF4444',
                  textAlign: 'left', borderRadius: 'var(--radius-sm)', marginTop: 2
                }}
                onMouseOver={e => e.currentTarget.style.background = '#FEF2F2'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={16} style={{ color: '#EF4444' }} /> Se déconnecter
              </button>
            </div>
          )}
        </div>
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
