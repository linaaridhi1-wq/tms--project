'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Users, FileText, ClipboardList,
  BookOpen, Sparkles, BarChart3, Settings, Moon, Sun,
  ChevronRight, Menu, Calendar, UserCog
} from 'lucide-react';

// ── Nav items per role ────────────────────────────────────────────────
const NAV_BY_ROLE = {
  Admin: [
    { href: '/dashboard',      label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/tenders',        label: "Appels d'offres",  icon: FileText        },
    { href: '/submissions',    label: 'Soumissions',      icon: ClipboardList   },
    { href: '/knowledge-base', label: 'Base de savoirs',  icon: BookOpen        },
    { href: '/ai-assistant',   label: 'Assistant IA',     icon: Sparkles        },
    { href: '/reports',        label: 'Rapports',         icon: BarChart3       },
    { href: '/planning',       label: 'Planning',         icon: Calendar        },
    { href: '/users',          label: 'Utilisateurs',     icon: UserCog         },
  ],
  Manager: [
    { href: '/dashboard',      label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/clients',        label: 'Clients',          icon: Users           },
    { href: '/tenders',        label: "Appels d'offres",  icon: FileText        },
    { href: '/submissions',    label: 'Soumissions',      icon: ClipboardList   },
    { href: '/knowledge-base', label: 'Base de savoirs',  icon: BookOpen        },
    { href: '/ai-assistant',   label: 'Assistant IA',     icon: Sparkles        },
    { href: '/reports',        label: 'Rapports',         icon: BarChart3       },
    { href: '/planning',       label: 'Planning',         icon: Calendar        },
  ],
  Consultant: [
    { href: '/tenders',        label: "Mes appels d'offres", icon: FileText     },
    { href: '/submissions',    label: 'Soumissions',         icon: ClipboardList},
    { href: '/knowledge-base', label: 'Base de savoirs',     icon: BookOpen     },
    { href: '/ai-assistant',   label: 'Assistant IA',        icon: Sparkles     },
    { href: '/planning',       label: 'Planning',            icon: Calendar     },
  ],
};

// Fallback (unknown role) — minimal
const NAV_DEFAULT = NAV_BY_ROLE.Consultant;

export default function Sidebar({ mobileOpen = false, onNavigate }) {
  const pathname = usePathname();
  const [theme,     setTheme]     = useState('light');
  const [collapsed, setCollapsed] = useState(false);
  const [role,      setRole]      = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const raw = localStorage.getItem('user');
    if (raw) {
      try { setRole(JSON.parse(raw)?.role || null); } catch { /* */ }
    }
  }, []);

  const navItems = NAV_BY_ROLE[role] || NAV_DEFAULT;

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // ── Role badge color ──────────────────────────────────────────────
  const roleMeta = {
    Admin:      { color: '#7C3AED', bg: '#EDE9FE', label: 'Admin'      },
    Manager:    { color: '#2563EB', bg: '#EFF6FF', label: 'Manager'    },
    Consultant: { color: '#059669', bg: '#ECFDF5', label: 'Consultant' },
  }[role] || { color: '#94A3B8', bg: '#F1F5F9', label: role };

  const isCollapsed = mobileOpen ? false : collapsed;

  return (
    <aside
      className={`sidebar${isCollapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}
      style={{ display: 'flex', flexDirection: 'column', height: '100vh', borderRight: '1px solid var(--sidebar-border)' }}
    >
      {/* ── Logo area ── */}
      <div
        className="sidebar-logo"
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '20px 0' : '20px 16px',
          gap: 12,
        }}
      >
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px',
              cursor: 'pointer',
              color: 'var(--sidebar-text)',
              width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            title="Développer"
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            <Menu size={20} />
          </button>
        ) : (
          <>
            <div className="sidebar-logo-icon" style={{ padding: 0, overflow: 'hidden', background: '#fff', flexShrink: 0 }}>
              <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div className="sidebar-logo-text" style={{ flex: 1 }}>
              <div className="sidebar-logo-title">Yellomind</div>
              <div className="sidebar-logo-sub">TMS Platform</div>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#B8B5E0',
                width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s',
              }}
              title="Réduire"
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#B8B5E0'; }}
            >
              <Menu size={15} />
            </button>
          </>
        )}
      </div>

      {/* ── Role badge (when expanded) ── */}
      {!collapsed && role && (
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: roleMeta.bg, color: roleMeta.color,
            borderRadius: 99, padding: '4px 12px', fontSize: 11.5, fontWeight: 700,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: roleMeta.color }} />
            {roleMeta.label}
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="sidebar-section" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="sidebar-section-label">Navigation</div>

        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item${active ? ' active' : ''}`}
              title={collapsed ? label : ''}
              onClick={() => onNavigate?.()}
            >
              <Icon className="nav-icon" size={18} />
              <span>{label}</span>
              {active && !collapsed && <ChevronRight size={13} style={{ marginLeft: 'auto', opacity: .6 }} />}
            </Link>
          );
        })}
      </div>

      {/* ── Footer: Settings + Theme toggle ── */}
      <div style={{ flexShrink: 0, paddingBottom: 16 }}>
        <div style={{ margin: '0 12px', height: 1, background: 'var(--sidebar-border)' }} />

        <div style={{ padding: '12px 12px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Link
            href="/settings"
            className={`nav-item${pathname === '/settings' ? ' active' : ''}`}
            title={collapsed ? 'Paramètres' : ''}
            onClick={() => onNavigate?.()}
          >
            <Settings className="nav-icon" size={18} />
            <span>Paramètres</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="nav-item"
            title={collapsed ? `Mode ${theme === 'dark' ? 'Sombre' : 'Clair'}` : ''}
            style={{
              background: 'none', border: 'none', width: '100%',
              textAlign: 'left', display: 'flex', alignItems: 'center', cursor: 'pointer'
            }}
          >
            {theme === 'dark'
              ? <Moon className="nav-icon" size={18} />
              : <Sun className="nav-icon" size={18} />
            }
            <span>Mode {theme === 'dark' ? 'Sombre' : 'Clair'}</span>

            {!collapsed && (
              <div style={{
                marginLeft: 'auto', width: 32, height: 18, borderRadius: 10,
                background: theme === 'dark' ? 'var(--primary)' : 'rgba(255,255,255,0.2)',
                position: 'relative', transition: 'all 0.3s'
              }}>
                <div style={{
                  position: 'absolute', top: 2,
                  left: theme === 'dark' ? 16 : 2,
                  width: 14, height: 14, borderRadius: '50%', background: '#fff',
                  transition: 'all 0.3s'
                }} />
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
