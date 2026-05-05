'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  Users, FileText, ClipboardList, TrendingUp,
  AlertCircle, ArrowUpRight, Clock, CheckCircle2, XCircle
} from 'lucide-react';
import Link from 'next/link';
import api from '../../../lib/api';

const STATUS_CONFIG = {
  detecte:    { label: 'Détecté',   cls: 'badge-slate'  },
  qualifie:   { label: 'Qualifié',  cls: 'badge-blue'   },
  en_cours:   { label: 'En cours',  cls: 'badge-amber'  },
  soumis:     { label: 'Soumis',    cls: 'badge-purple' },
  gagne:      { label: 'Gagné',     cls: 'badge-green'  },
  perdu:      { label: 'Perdu',     cls: 'badge-red'    },
};

function KpiCard({ label, value, sub, color, icon: Icon, href }) {
  const card = (
    <div className={`kpi-card ${color}`}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="kpi-label">{label}</div>
          <div className="kpi-value">{value}</div>
          <div className="kpi-sub">{sub}</div>
        </div>
        <div className={`kpi-icon`} style={{
          background: color === 'purple' ? '#EDE9FE'
            : color === 'blue'   ? '#EFF6FF'
            : color === 'green'  ? '#ECFDF5'
            : color === 'amber'  ? '#FFFBEB'
            : '#FFF1F2',
          color: color === 'purple' ? '#7C3AED'
            : color === 'blue'   ? '#2563EB'
            : color === 'green'  ? '#059669'
            : color === 'amber'  ? '#D97706'
            : '#E11D48',
        }}>
          <Icon size={22} />
        </div>
      </div>
      {href && (
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
          Voir tout <ArrowUpRight size={13} />
        </div>
      )}
    </div>
  );
  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{card}</Link> : card;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ counts: null, winRate: null, recentTenders: [], statusCounts: {} });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/stats/dashboard');
      setStats(r.data);
    } catch {
      // keep UI usable even if stats fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) setUser(JSON.parse(raw));
    load();
  }, [load]);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Bonjour' : now.getHours() < 18 ? 'Bon après-midi' : 'Bonsoir';
  const counts = stats.counts || {};
  const winRateValue = stats.winRate === null || stats.winRate === undefined ? '—' : `${stats.winRate}%`;
  const winRateSub = stats.winRate === null || stats.winRate === undefined
    ? 'Aucun résultat'
    : 'Basé sur gagnés/perdus';
  const recentTenders = stats.recentTenders || [];
  const statusCounts = stats.statusCounts || {};
  const pipelineTotal = ['detecte', 'qualifie', 'en_cours', 'soumis'].reduce((acc, key) => acc + (statusCounts[key] || 0), 0);
  const pipeline = [
    { key: 'detecte', label: 'Détecté', color: '#94A3B8' },
    { key: 'qualifie', label: 'Qualifié', color: '#3B82F6' },
    { key: 'en_cours', label: 'En cours', color: '#F59E0B' },
    { key: 'soumis', label: 'Soumis', color: '#7C3AED' },
  ].map((s) => {
    const count = statusCounts[s.key] || 0;
    const pct = pipelineTotal > 0 ? Math.round((count / pipelineTotal) * 100) : 0;
    return { ...s, count, pct };
  });
  const alerts = recentTenders
    .filter(t => t.date_limite)
    .map(t => ({
      label: t.titre,
      days: Math.ceil((new Date(t.date_limite) - now) / 86400000),
    }))
    .sort((a, b) => a.days - b.days)
    .slice(0, 3);

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="page-breadcrumb">
            <span>Yellomind TMS</span>
            <span>›</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Tableau de bord</span>
          </div>
          <h1 className="page-title" style={{ marginTop: 2 }}>
            {greeting}{user?.prenom ? `, ${user.prenom}` : ''} 👋
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/tenders" className="btn btn-primary btn-sm">
            <FileText size={15} /> Nouvel appel d&apos;offres
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="page-body">

        {/* KPI Grid */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          <KpiCard label="Clients" value={counts.clients ?? '—'} sub="Actifs dans le système" color="purple" icon={Users} href="/clients" />
          <KpiCard label="Appels d'offres" value={counts.tenders ?? '—'} sub="Actifs dans le système" color="blue" icon={FileText} href="/tenders" />
          <KpiCard label="Soumissions" value={counts.submissions ?? '—'} sub="Actifs dans le système" color="amber" icon={ClipboardList} href="/submissions" />
          <KpiCard label="Taux de succès" value={winRateValue} sub={winRateSub} color="green" icon={TrendingUp} href="/reports" />
        </div>

        {/* Main content row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>

          {/* Recent Tenders Table */}
          <div className="card">
            <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Appels d&apos;offres récents</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Aperçu des dernières opportunités</div>
              </div>
              <Link href="/tenders" className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>
                Tout voir <ArrowUpRight size={13} />
              </Link>
            </div>
            <table className="tms-table">
              <thead>
                <tr>
                  <th>Intitulé</th>
                  <th>Client</th>
                  <th>Statut</th>
                  <th>Échéance</th>
                  <th>Budget estimé</th>
                </tr>
              </thead>
              <tbody>
                {loading && recentTenders.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '18px 0' }}>
                      Chargement…
                    </td>
                  </tr>
                ) : recentTenders.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '18px 0' }}>
                      Aucun appel d&apos;offres
                    </td>
                  </tr>
                ) : recentTenders.map(t => {
                  const s = STATUS_CONFIG[t.statut] || STATUS_CONFIG.detecte;
                  const daysLeft = t.date_limite ? Math.ceil((new Date(t.date_limite) - now) / 86400000) : null;
                  return (
                    <tr key={t.tender_id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{t.titre}</div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{t.client}</td>
                      <td>
                        <span className={`badge ${s.cls}`}>
                          <span className="badge-dot" style={{
                            background: s.cls.includes('green') ? '#10B981'
                              : s.cls.includes('amber') ? '#F59E0B'
                              : s.cls.includes('blue') ? '#3B82F6'
                              : s.cls.includes('purple') ? '#7C3AED'
                              : s.cls.includes('red') ? '#EF4444' : '#94A3B8'
                          }} />
                          {s.label}
                        </span>
                      </td>
                      <td>
                        {daysLeft === null ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={13} style={{ color: daysLeft < 7 ? '#EF4444' : 'var(--text-muted)' }} />
                            <span style={{ fontSize: 13, color: daysLeft < 7 ? '#EF4444' : 'var(--text-secondary)', fontWeight: daysLeft < 7 ? 600 : 400 }}>
                              {daysLeft > 0 ? `J-${daysLeft}` : 'Expiré'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.budget || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Pipeline */}
            <div className="card card-p">
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Pipeline status</div>
              {pipeline.map(s => (
                <div key={s.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 500, marginBottom: 5 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                    <span style={{ fontWeight: 700 }}>{s.count}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${s.pct}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Alerts */}
            <div className="card card-p">
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Alertes échéances</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {alerts.length === 0 ? (
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Aucune échéance à afficher</div>
                ) : alerts.map((a, i) => {
                  const type = a.days <= 3 ? 'danger' : a.days <= 7 ? 'warning' : 'ok';
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 'var(--radius-md)',
                      background: type === 'danger' ? '#FEF2F2' : type === 'warning' ? '#FFFBEB' : '#F0FDF4',
                    }}>
                      {type === 'danger'  ? <XCircle     size={15} color="#EF4444" /> :
                       type === 'warning' ? <AlertCircle size={15} color="#F59E0B" /> :
                                             <CheckCircle2 size={15} color="#10B981" />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.label}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                          {type === 'ok' ? `J-${a.days} — dans les temps` : `⚠️ J-${a.days} — urgent`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick actions */}
            <div className="card card-p">
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Actions rapides</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Nouveau client',        href: '/clients'        },
                  { label: 'Nouvel appel d\'offres', href: '/tenders'        },
                  { label: 'Assistant IA',           href: '/ai-assistant'   },
                  { label: 'Voir les rapports',      href: '/reports'        },
                ].map(a => (
                  <Link key={a.href} href={a.href} className="btn btn-secondary btn-sm" style={{ justifyContent: 'space-between' }}>
                    {a.label} <ArrowUpRight size={13} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
