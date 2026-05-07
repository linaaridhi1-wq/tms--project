'use client';
import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Building2, Mail, Phone, Globe, MapPin, Pencil, Trash2, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import ConfirmModal from '../../../components/ConfirmModal';

const SECTORS = ['Informatique & IT', 'Banque & Finance', 'Industrie', 'Santé', 'Énergie', 'Transport & Logistique', 'Construction & BTP', 'Télécommunications', 'Education', 'Autre'];

const EMPTY_FORM = { raison_sociale: '', secteur: '', contact: '', email: '', telephone: '', pays: '', site_web: '', notes: '' };

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/clients');
      setClients(r.data);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = clients.filter(c =>
    c.raison_sociale?.toLowerCase().includes(search.toLowerCase()) ||
    c.secteur?.toLowerCase().includes(search.toLowerCase()) ||
    c.pays?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...c }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/clients/${editing.client_id}`, form);
        toast.success('Client mis à jour');
      } else {
        await api.post('/clients', form);
        toast.success('Client créé avec succès');
      }
      closeForm(); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally { setSaving(false); }
  };

  const handleDelete = async (c) => {
    setDeleteConfirm(c);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.delete(`/clients/${deleteConfirm.client_id}`);
      toast.success('Client supprimé');
      load();
    } catch { toast.error('Erreur lors de la suppression'); }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-breadcrumb"><span>TMS</span><span>›</span><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Clients</span></div>
          <h1 className="page-title" style={{ marginTop: 2 }}>Gestion des clients</h1>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Nouveau client
        </button>
      </div>

      <div className="page-body">
        {/* Stats row */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total clients', value: clients.length, color: '#7C3AED', bg: '#EDE9FE' },
            { label: 'Actifs', value: clients.filter(c => c.actif).length, color: '#10B981', bg: '#ECFDF5' },
            { label: 'Secteurs', value: [...new Set(clients.map(c => c.secteur).filter(Boolean))].length, color: '#3B82F6', bg: '#EFF6FF' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 18px' }}>
              <div style={{ width: 36, height: 36, background: s.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={18} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="card">
          {/* Toolbar */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="search-bar" style={{ flex: 1, maxWidth: 340 }}>
              <Search size={15} className="search-icon" />
              <input className="form-input" style={{ paddingLeft: 36, height: 38 }} placeholder="Rechercher un client…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
              {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }} className="animate-pulse-soft">
              Chargement des clients…
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Building2 size={28} /></div>
              <div className="empty-state-title">{search ? 'Aucun résultat' : 'Aucun client enregistré'}</div>
              <div className="empty-state-desc">
                {search ? 'Modifiez votre recherche ou effacez le filtre.' : 'Commencez par ajouter votre premier client.'}
              </div>
              {!search && <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Nouveau client</button>}
            </div>
          ) : (
            <div className="table-scroll">
              <table className="tms-table">
                <thead>
                  <tr>
                    <th>Raison sociale</th>
                    <th>Secteur</th>
                    <th>Contact</th>
                    <th>Pays</th>
                    <th>Statut</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.client_id} onClick={() => setSelected(c)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: 8,
                            background: 'linear-gradient(135deg, #7C3AED22, #6D28D922)',
                            border: '1px solid #7C3AED33',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700, color: '#7C3AED', flexShrink: 0,
                          }}>
                            {c.raison_sociale?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.raison_sociale}</div>
                            {c.email && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        {c.secteur
                          ? <span className="badge badge-blue">{c.secteur}</span>
                          : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                        {c.contact || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td>
                        {c.pays
                          ? <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', fontSize: 13 }}><MapPin size={12} />{c.pays}</div>
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td>
                        <span className={`badge ${c.actif !== false ? 'badge-green' : 'badge-slate'}`}>
                          <span className="badge-dot" style={{ background: c.actif !== false ? '#10B981' : '#94A3B8' }} />
                          {c.actif !== false ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(c)} title="Modifier">
                            <Pencil size={14} />
                          </button>
                          <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(c)} title="Supprimer">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal open={showForm} title={editing ? 'Modifier le client' : 'Nouveau client'} onClose={closeForm}>
        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Raison sociale <span className="form-required">*</span></label>
                <input required className="form-input" value={form.raison_sociale} onChange={f('raison_sociale')} placeholder="Nom de l'entreprise" />
              </div>
              <div className="form-group">
                <label className="form-label">Secteur d&apos;activité</label>
                <select className="form-select" value={form.secteur} onChange={f('secteur')}>
                  <option value="">Sélectionner…</option>
                  {SECTORS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nom du contact</label>
                <input className="form-input" value={form.contact} onChange={f('contact')} placeholder="Nom prénom" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={form.email} onChange={f('email')} placeholder="contact@exemple.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <input className="form-input" value={form.telephone} onChange={f('telephone')} placeholder="+213 XX XX XX XX" />
              </div>
              <div className="form-group">
                <label className="form-label">Pays</label>
                <input className="form-input" value={form.pays} onChange={f('pays')} placeholder="Algérie" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Site web</label>
                <input className="form-input" value={form.site_web} onChange={f('site_web')} placeholder="https://www.entreprise.com" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Notes internes</label>
                <textarea className="form-textarea" value={form.notes} onChange={f('notes')} placeholder="Informations complémentaires…" />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeForm}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Créer le client'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail drawer (simple) */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff' }}>
                  {selected.raison_sociale?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="modal-title">{selected.raison_sociale}</div>
                  {selected.secteur && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{selected.secteur}</div>}
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: Mail, label: 'Email', value: selected.email },
                  { icon: Phone, label: 'Téléphone', value: selected.telephone },
                  { icon: MapPin, label: 'Pays', value: selected.pays },
                  { icon: Globe, label: 'Site web', value: selected.site_web },
                ].map(({ icon: Icon, label, value }) => value ? (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, background: 'var(--surface-2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={14} color="var(--text-muted)" />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>{label}</div>
                      <div style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 500 }}>{value}</div>
                    </div>
                  </div>
                ) : null)}
                {selected.notes && (
                  <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600, marginBottom: 6 }}>Notes</div>
                    <div style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>{selected.notes}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Fermer</button>
              <button className="btn btn-primary" onClick={() => { openEdit(selected); setSelected(null); }}>
                <Pencil size={14} /> Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteConfirm}
        title="Confirmation de suppression"
        message={`Êtes-vous sûr de vouloir supprimer le client "${deleteConfirm?.raison_sociale}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        onConfirm={confirmDelete}
        onClose={() => setDeleteConfirm(null)}
      />
    </>
  );
}
