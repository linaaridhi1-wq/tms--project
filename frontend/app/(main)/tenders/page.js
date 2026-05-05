'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, FileText, Clock, Filter, ChevronDown, X, Calendar, DollarSign, User, Building2, Paperclip } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import ConfirmModal from '../../../components/ConfirmModal';

const STATUS_MAP = {
  detecte: { label: 'Détecté', badge: 'badge-slate', dot: '#94A3B8' },
  qualifie: { label: 'Qualifié', badge: 'badge-blue', dot: '#3B82F6' },
  en_cours: { label: 'En cours', badge: 'badge-amber', dot: '#F59E0B' },
  soumis: { label: 'Soumis', badge: 'badge-purple', dot: '#7C3AED' },
  gagne: { label: 'Gagné', badge: 'badge-green', dot: '#10B981' },
  perdu: { label: 'Perdu', badge: 'badge-red', dot: '#EF4444' },
};

const EMPTY_FORM = { titre: '', client: '', date_limite: '', budget: '', statut: 'detecte', description: '', responsable: '' };

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function TendersPage() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/tenders');
      setTenders(r.data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tenders.filter(t => {
    const query = search.toLowerCase();
    const matchSearch = (t.titre || '').toLowerCase().includes(query) || (t.client || '').toLowerCase().includes(query);
    const matchFilter = filter === 'all' || t.statut === filter;
    return matchSearch && matchFilter;
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/tenders', form);
      toast.success('Appel d\'offres créé');
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (tender) => {
    setDeleteConfirm(tender);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.delete(`/tenders/${deleteConfirm.tender_id}`);
      toast.success('Supprimé');
      setDeleteConfirm(null);
      load();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const now = new Date();
  const counts = Object.fromEntries(Object.keys(STATUS_MAP).map(s => [s, tenders.filter(t => t.statut === s).length]));

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-breadcrumb"><span>TMS</span><span>›</span><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Appels d&apos;offres</span></div>
          <h1 className="page-title" style={{ marginTop: 2 }}>Appels d&apos;offres</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Nouvel appel d&apos;offres
        </button>
      </div>

      <div className="page-body">
        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {[{ key: 'all', label: 'Tous', count: tenders.length }, ...Object.entries(STATUS_MAP).map(([k, v]) => ({ key: k, label: v.label, count: counts[k] }))].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '7px 14px', borderRadius: 'var(--radius-md)', fontWeight: 600,
                fontSize: 13, cursor: 'pointer', border: 'none', transition: 'all .15s',
                background: filter === tab.key ? 'var(--primary)' : 'var(--surface)',
                color: filter === tab.key ? '#fff' : 'var(--text-secondary)',
                boxShadow: filter === tab.key ? '0 4px 12px rgba(124,58,237,.3)' : 'none',
                border: filter === tab.key ? 'none' : '1px solid var(--border)',
              }}
            >
              {tab.label} {tab.count > 0 && <span style={{ marginLeft: 5, background: filter === tab.key ? 'rgba(255,255,255,.25)' : 'var(--border)', color: filter === tab.key ? '#fff' : 'var(--text-muted)', borderRadius: 99, padding: '0 7px', fontSize: 11 }}>{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Table Card */}
        <div className="card">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="search-bar" style={{ flex: 1, maxWidth: 340 }}>
              <Search size={15} className="search-icon" />
              <input className="form-input" style={{ paddingLeft: 36, height: 38 }} placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</div>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="empty-state-icon"><FileText size={28} /></div>
              <div className="empty-state-title">Chargement…</div>
              <div className="empty-state-desc">Récupération des appels d&apos;offres.</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><FileText size={28} /></div>
              <div className="empty-state-title">Aucun appel d&apos;offres</div>
              <div className="empty-state-desc">Ajoutez votre premier appel d&apos;offres pour commencer.</div>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={15} /> Nouveau</button>
            </div>
          ) : (
            <table className="tms-table">
              <thead><tr>
                <th>Intitulé</th><th>Client</th><th>Statut</th><th>Responsable</th><th>Échéance</th><th>Budget</th><th style={{ textAlign: 'right' }}>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(t => {
                  const s = STATUS_MAP[t.statut] || STATUS_MAP.detecte;
                  const daysLeft = t.date_limite ? Math.ceil((new Date(t.date_limite) - now) / 86400000) : null;
                  return (
                    <tr key={t.tender_id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{t.titre}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <Building2 size={13} color="var(--text-muted)" />
                          <span style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>{t.client}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${s.badge}`}><span className="badge-dot" style={{ background: s.dot }} />{s.label}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 24, height: 24, background: '#EDE9FE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#7C3AED' }}>
                            {t.responsable?.[0]}
                          </div>
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.responsable || '—'}</span>
                        </div>
                      </td>
                      <td>
                        {daysLeft !== null && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Clock size={12} color={daysLeft < 0 ? '#EF4444' : daysLeft < 7 ? '#F59E0B' : 'var(--text-muted)'} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: daysLeft < 0 ? '#EF4444' : daysLeft < 7 ? '#F59E0B' : 'var(--text-secondary)' }}>
                              {daysLeft < 0 ? 'Expiré' : `J-${daysLeft}`}
                            </span>
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13.5 }}>{t.budget || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t)} style={{ fontSize: 12 }}>Supprimer</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={showForm} title="Nouvel appel d'offres" onClose={() => setShowForm(false)}>
        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <div className="form-group">
              <label className="form-label">Intitulé <span className="form-required">*</span></label>
              <input required className="form-input" value={form.titre} onChange={f('titre')} placeholder="Ex: Développement d'une application web" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Client <span className="form-required">*</span></label>
                <input required className="form-input" value={form.client} onChange={f('client')} placeholder="Nom de l'organisation" />
              </div>
              <div className="form-group">
                <label className="form-label">Statut</label>
                <select className="form-select" value={form.statut} onChange={f('statut')}>
                  {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date limite</label>
                <input type="date" className="form-input" value={form.date_limite} onChange={f('date_limite')} />
              </div>
              <div className="form-group">
                <label className="form-label">Budget estimé</label>
                <input className="form-input" value={form.budget} onChange={f('budget')} placeholder="Ex: 500 000 DA" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Responsable</label>
                <input className="form-input" value={form.responsable} onChange={f('responsable')} placeholder="Nom du responsable" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={f('description')} placeholder="Description de l'appel d'offres…" />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Création…' : 'Créer'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteConfirm}
        title="Confirmation de suppression"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteConfirm?.titre}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        onConfirm={confirmDelete}
        onClose={() => setDeleteConfirm(null)}
      />
    </>
  );
}
