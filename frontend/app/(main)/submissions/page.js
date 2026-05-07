'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, ClipboardList, CheckCircle2, AlertCircle, XCircle, X, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import ConfirmModal from '../../../components/ConfirmModal';

const STATUS_MAP = {
  brouillon:   { label: 'Brouillon',   badge: 'badge-slate',  dot: '#94A3B8' },
  en_revision: { label: 'En révision', badge: 'badge-amber',  dot: '#F59E0B' },
  finalise:    { label: 'Finalisé',    badge: 'badge-blue',   dot: '#3B82F6' },
  soumis:      { label: 'Soumis',      badge: 'badge-purple', dot: '#7C3AED' },
};

const RESULT_MAP = {
  pending: { label: 'En attente', badge: 'badge-slate' },
  gagne:   { label: 'Gagné',      badge: 'badge-green' },
  perdu:   { label: 'Perdu',      badge: 'badge-red'   },
};

const EMPTY_FORM = { titre: '', appel: '', statut: 'brouillon', resultat: 'pending', score: 0, date: '' };

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function SubmissionsPage() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]  = useState(null);
  const [form,    setForm]     = useState(EMPTY_FORM);
  const [saving,  setSaving]   = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) try { setUserRole(JSON.parse(raw)?.role); } catch { /**/ }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/submissions');
      setItems(r.data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const canWrite = userRole === 'Manager' || userRole === 'Admin';

  const filtered = items.filter(i =>
    (i.titre || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.appel || '').toLowerCase().includes(search.toLowerCase())
  );

  const getScoreColor = (s) => s >= 80 ? '#10B981' : s >= 60 ? '#F59E0B' : '#EF4444';

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit   = (item) => {
    setEditing(item);
    setForm({
      titre: item.titre || '',
      appel: item.appel || '',
      statut: item.statut || 'brouillon',
      resultat: item.resultat || 'pending',
      score: item.score ?? 0,
      date: item.date ? item.date.substring(0, 10) : '',
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/submissions/${editing.submission_id}`, form);
        toast.success('Soumission mise à jour');
      } else {
        await api.post('/submissions', form);
        toast.success('Soumission créée');
      }
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.delete(`/submissions/${deleteConfirm.submission_id}`);
      toast.success('Supprimé');
      setDeleteConfirm(null);
      load();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const f = (k) => (e) => {
    const value = k === 'score' ? Number(e.target.value) : e.target.value;
    setForm(p => ({ ...p, [k]: value }));
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-breadcrumb"><span>TMS</span><span>›</span><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Soumissions</span></div>
          <h1 className="page-title" style={{ marginTop: 2 }}>Soumissions</h1>
        </div>
        {canWrite && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Nouvelle soumission
          </button>
        )}
      </div>

      <div className="page-body">
        {/* Summary cards */}
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total',    value: items.length,                              color: 'purple', icon: ClipboardList },
            { label: 'En cours', value: items.filter(i=>i.statut!=='soumis').length, color: 'amber',  icon: AlertCircle  },
            { label: 'Soumises', value: items.filter(i=>i.statut==='soumis').length, color: 'blue',   icon: CheckCircle2 },
            { label: 'Gagnées',  value: items.filter(i=>i.resultat==='gagne').length, color: 'green',  icon: CheckCircle2 },
          ].map(c => (
            <div key={c.label} className={`kpi-card ${c.color}`}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="kpi-label">{c.label}</div>
                  <div className="kpi-value">{c.value}</div>
                </div>
                <div className="kpi-icon" style={{
                  background: c.color==='purple'?'#EDE9FE':c.color==='amber'?'#FFFBEB':c.color==='blue'?'#EFF6FF':'#ECFDF5',
                  color: c.color==='purple'?'#7C3AED':c.color==='amber'?'#D97706':c.color==='blue'?'#2563EB':'#059669',
                }}><c.icon size={22} /></div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12 }}>
            <div className="search-bar" style={{ flex: 1, maxWidth: 340 }}>
              <Search size={15} className="search-icon" />
              <input className="form-input" style={{ paddingLeft: 36, height: 38 }} placeholder="Rechercher une soumission…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</div>
          </div>

          {loading ? (
            <div className="empty-state"><div className="empty-state-icon"><ClipboardList size={28} /></div><div className="empty-state-title">Chargement…</div></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><ClipboardList size={28} /></div>
              <div className="empty-state-title">Aucune soumission</div>
              <div className="empty-state-desc">Les soumissions seront visibles ici une fois créées.</div>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="tms-table">
                <thead><tr>
                  <th>Proposition</th><th>Appel d&apos;offres lié</th><th>Statut</th><th>Résultat</th><th>Conformité</th><th>Date</th>
                  {canWrite && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr></thead>
                <tbody>
                  {filtered.map(item => {
                    const st = STATUS_MAP[item.statut] || STATUS_MAP.brouillon;
                    const rt = RESULT_MAP[item.resultat] || RESULT_MAP.pending;
                    return (
                      <tr key={item.submission_id}>
                        <td><div style={{ fontWeight: 600 }}>{item.titre}</div></td>
                        <td><div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.appel}</div></td>
                        <td><span className={`badge ${st.badge}`}><span className="badge-dot" style={{ background: st.dot }} />{st.label}</span></td>
                        <td><span className={`badge ${rt.badge}`}>{rt.label}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden', maxWidth: 80 }}>
                              <div style={{ height: '100%', width: `${item.score}%`, background: getScoreColor(item.score), borderRadius: 99, transition: 'width .5s' }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: getScoreColor(item.score) }}>{item.score}%</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.date ? new Date(item.date).toLocaleDateString('fr-FR') : '—'}</td>
                        {canWrite && (
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(item)} title="Modifier"><Pencil size={14} /></button>
                              <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteConfirm(item)} title="Supprimer"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal open={showForm} title={editing ? 'Modifier la soumission' : 'Nouvelle soumission'} onClose={() => { setShowForm(false); setEditing(null); }}>
        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Titre <span className="form-required">*</span></label>
              <input required className="form-input" value={form.titre} onChange={f('titre')} placeholder="Titre de la soumission" />
            </div>
            <div className="form-group">
              <label className="form-label">Appel d&apos;offres <span className="form-required">*</span></label>
              <input required className="form-input" value={form.appel} onChange={f('appel')} placeholder="Nom de l'appel d'offres" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Statut</label>
                <select className="form-select" value={form.statut} onChange={f('statut')}>
                  {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Résultat</label>
                <select className="form-select" value={form.resultat} onChange={f('resultat')}>
                  {Object.entries(RESULT_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Score de conformité (0–100)</label>
                <input type="number" min="0" max="100" className="form-input" value={form.score} onChange={f('score')} />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="form-input" value={form.date} onChange={f('date')} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditing(null); }}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Créer'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteConfirm}
        title="Confirmation de suppression"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteConfirm?.titre}" ?`}
        confirmText="Supprimer"
        onConfirm={confirmDelete}
        onClose={() => setDeleteConfirm(null)}
      />
    </>
  );
}
