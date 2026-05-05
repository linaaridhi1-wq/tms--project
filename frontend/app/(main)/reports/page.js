'use client';
import { useEffect, useState, useCallback } from 'react';
import { BarChart3, TrendingUp, Award, Clock, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';

const formatMoneyShort = (value) => {
  if (!value) return '0';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return String(Math.round(value));
};

export default function ReportsPage() {
  const [kpis, setKpis] = useState({ totalTenders: 0, winRate: null, valueWon: 0, avgDelayDays: null });
  const [sectorData, setSectorData] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [recentResults, setRecentResults] = useState([]);

  const load = useCallback(async () => {
    try {
      const r = await api.get('/stats/reports');
      setKpis(r.data.kpis);
      setSectorData(r.data.sectorData || []);
      setMonthly(r.data.monthly || []);
      setRecentResults(r.data.recentResults || []);
    } catch {
      // keep static UI when stats fail
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const maxTenders = Math.max(...monthly.map(m => m.tenders), 1);
  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-breadcrumb"><span>TMS</span><span>›</span><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Rapports</span></div>
          <h1 className="page-title" style={{ marginTop: 2 }}>Rapports & Analytics</h1>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => toast('Export PDF à venir', { icon: '📄' })}>
          <Download size={15} /> Exporter
        </button>
      </div>

      <div className="page-body">
        {/* KPIs */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {[
            { label: 'Total AO traités', value: kpis.totalTenders ?? '—',  sub: 'Depuis le début',         color: 'purple', icon: BarChart3   },
            { label: 'Taux de succès',   value: kpis.winRate === null ? '—' : `${kpis.winRate}%`, sub: 'Gagnés vs perdus', color: 'green',  icon: TrendingUp  },
            { label: 'Valeur gagnée',    value: formatMoneyShort(kpis.valueWon), sub: 'En milliers DA',         color: 'blue',   icon: Award       },
            { label: 'Délai moyen',      value: kpis.avgDelayDays === null ? '—' : `${kpis.avgDelayDays}j`,  sub: 'De détection à soumission',color:'amber', icon: Clock       },
          ].map(c => (
            <div key={c.label} className={`kpi-card ${c.color}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="kpi-label">{c.label}</div>
                  <div className="kpi-value">{c.value}</div>
                  <div className="kpi-sub">{c.sub}</div>
                </div>
                <div className="kpi-icon" style={{
                  background: c.color==='purple'?'#EDE9FE':c.color==='green'?'#ECFDF5':c.color==='blue'?'#EFF6FF':'#FFFBEB',
                  color: c.color==='purple'?'#7C3AED':c.color==='green'?'#059669':c.color==='blue'?'#2563EB':'#D97706',
                }}>
                  <c.icon size={22} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Monthly chart */}
          <div className="card card-p">
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Volume mensuel</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Appels d&apos;offres traités par mois</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 140 }}>
              {monthly.map(m => (
                <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>{m.tenders}</div>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                    <div style={{ width: '60%', height: `${(m.won / maxTenders) * 110}px`, background: 'linear-gradient(180deg,#7C3AED,#6D28D9)', borderRadius: '4px 4px 0 0', transition: 'height .5s' }} title={`Gagnés: ${m.won}`} />
                    <div style={{ width: '60%', height: `${((m.tenders - m.won) / maxTenders) * 110}px`, background: '#EDE9FE', borderRadius: '0 0 4px 4px' }} title={`Perdus/Att: ${m.tenders - m.won}`} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{m.month}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#7C3AED' }} />Gagnés</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#EDE9FE', border: '1px solid #C4B5FD' }} />Autres</div>
            </div>
          </div>

          {/* Sector performance */}
          <div className="card card-p">
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Performance par secteur</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Taux de succès par domaine</div>
              {sectorData.map(s => (
              <div key={s.name} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{s.name}</span>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{s.won}/{s.total}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: s.rate >= 60 ? '#10B981' : s.rate >= 45 ? '#F59E0B' : '#EF4444' }}>{s.rate}%</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${s.rate}%`, background: s.rate >= 60 ? 'linear-gradient(90deg,#10B981,#34D399)' : s.rate >= 45 ? 'linear-gradient(90deg,#F59E0B,#FCD34D)' : 'linear-gradient(90deg,#EF4444,#F87171)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results table */}
        <div className="card">
          <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Résultats récents</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Historique des soumissions avec résultats</div>
            </div>
          </div>
          <table className="tms-table">
            <thead><tr><th>Appel d&apos;offres</th><th>Résultat</th><th>Montant</th><th>Date</th></tr></thead>
            <tbody>
              {recentResults.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{r.titre}</td>
                  <td>
                    <span className={`badge ${r.statut === 'gagne' ? 'badge-green' : r.statut === 'perdu' ? 'badge-red' : 'badge-slate'}`}>
                      <span className="badge-dot" style={{ background: r.statut === 'gagne' ? '#10B981' : r.statut === 'perdu' ? '#EF4444' : '#94A3B8' }} />
                      {r.statut === 'gagne' ? 'Gagné' : r.statut === 'perdu' ? 'Perdu' : 'En attente'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{r.montant}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
