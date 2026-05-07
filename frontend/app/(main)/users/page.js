'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, UserCog, X, Pencil, Trash2, Shield, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import ConfirmModal from '../../../components/ConfirmModal';

const ROLE_META = {
  Admin:      { color: '#7C3AED', bg: '#EDE9FE' },
  Manager:    { color: '#2563EB', bg: '#EFF6FF' },
  Consultant: { color: '#059669', bg: '#ECFDF5' },
};

const EMPTY_FORM = { nom: '', prenom: '', email: '', motDePasse: '', roleId: 2 };

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users,   setUsers]   = useState([]);
  const [roles,   setRoles]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [deactivateConfirm, setDeactivateConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([api.get('/utilisateurs'), api.get('/roles')]);
      setUsers(u.data);
      setRoles(r.data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u =>
    `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, roleId: roles[1]?.role_id || 2 });
    setShowForm(true);
  };
  const openEdit = (user) => {
    setEditing(user);
    setForm({ nom: user.nom, prenom: user.prenom, email: user.email, motDePasse: '', roleId: user.role_id });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (editing && !payload.motDePasse) delete payload.motDePasse;
      if (editing) {
        await api.put(`/utilisateurs/${editing.user_id}`, { nom: payload.nom, prenom: payload.prenom, email: payload.email, role_id: payload.roleId, ...(payload.motDePasse ? { mot_de_passe: payload.motDePasse } : {}) });
        toast.success('Utilisateur mis à jour');
      } else {
        await api.post('/utilisateurs', payload);
        toast.success('Utilisateur créé');
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeactivate = async () => {
    if (!deactivateConfirm) return;
    try {
      await api.delete(`/utilisateurs/${deactivateConfirm.user_id}`);
      toast.success(`${deactivateConfirm.prenom} désactivé`);
      setDeactivateConfirm(null);
      load();
    } catch {
      toast.error('Erreur');
    }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-breadcrumb"><span>TMS</span><span>›</span><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Utilisateurs</span></div>
          <h1 className="page-title" style={{ marginTop: 2 }}>Gestion des utilisateurs</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={load} title="Rafraîchir"><RefreshCw size={15} /></button>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Nouvel utilisateur</button>
        </div>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: users.length, color: '#7C3AED', bg: '#EDE9FE' },
            { label: 'Actifs', value: users.filter(u => u.actif).length, color: '#10B981', bg: '#ECFDF5' },
            { label: 'Inactifs', value: users.filter(u => !u.actif).length, color: '#EF4444', bg: '#FEF2F2' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 18px' }}>
              <div style={{ width: 36, height: 36, background: s.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCog size={18} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="search-bar" style={{ flex: 1, maxWidth: 340 }}>
              <Search size={15} className="search-icon" />
              <input className="form-input" style={{ paddingLeft: 36, height: 38 }} placeholder="Rechercher un utilisateur…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} utilisateur{filtered.length !== 1 ? 's' : ''}</div>
          </div>

          {loading ? (
            <div className="empty-state"><div className="empty-state-icon"><UserCog size={28} /></div><div className="empty-state-title">Chargement…</div></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><UserCog size={28} /></div>
              <div className="empty-state-title">Aucun utilisateur</div>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="tms-table">
                <thead><tr>
                  <th>Utilisateur</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Créé le</th><th style={{ textAlign: 'right' }}>Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map(u => {
                    const rm = ROLE_META[u.role?.libelle] || { color: '#94A3B8', bg: '#F1F5F9' };
                    return (
                      <tr key={u.user_id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: '50%',
                              background: `linear-gradient(135deg, ${rm.color}33, ${rm.color}55)`,
                              border: `1px solid ${rm.color}44`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, fontWeight: 700, color: rm.color, flexShrink: 0,
                            }}>
                              {u.nom?.[0]}{u.prenom?.[0]}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{u.nom} {u.prenom}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{u.email}</td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: rm.bg, color: rm.color, borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
                            <Shield size={11} />{u.role?.libelle || '—'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${u.actif ? 'badge-green' : 'badge-slate'}`}>
                            <span className="badge-dot" style={{ background: u.actif ? '#10B981' : '#94A3B8' }} />
                            {u.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                          {u.date_creation ? new Date(u.date_creation).toLocaleDateString('fr-FR') : '—'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(u)} title="Modifier"><Pencil size={14} /></button>
                            {u.actif && (
                              <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeactivateConfirm(u)} title="Désactiver"><Trash2 size={14} /></button>
                            )}
                          </div>
                        </td>
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
      <Modal open={showForm} title={editing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'} onClose={() => { setShowForm(false); setEditing(null); }}>
        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nom <span className="form-required">*</span></label>
                <input required className="form-input" value={form.nom} onChange={f('nom')} placeholder="Nom de famille" />
              </div>
              <div className="form-group">
                <label className="form-label">Prénom <span className="form-required">*</span></label>
                <input required className="form-input" value={form.prenom} onChange={f('prenom')} placeholder="Prénom" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email <span className="form-required">*</span></label>
              <input required type="email" className="form-input" value={form.email} onChange={f('email')} placeholder="email@yellomind.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Mot de passe {editing ? '(laisser vide = inchangé)' : <span className="form-required">*</span>}</label>
              <input type="password" className="form-input" value={form.motDePasse} onChange={f('motDePasse')} placeholder="••••••••" required={!editing} />
            </div>
            <div className="form-group">
              <label className="form-label">Rôle <span className="form-required">*</span></label>
              <select className="form-select" value={form.roleId} onChange={e => setForm(p => ({ ...p, roleId: Number(e.target.value) }))}>
                {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.libelle}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditing(null); }}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Créer'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deactivateConfirm}
        title="Désactiver l'utilisateur"
        message={`Désactiver le compte de ${deactivateConfirm?.prenom} ${deactivateConfirm?.nom} ? L'utilisateur ne pourra plus se connecter.`}
        confirmText="Désactiver"
        onConfirm={confirmDeactivate}
        onClose={() => setDeactivateConfirm(null)}
      />
    </>
  );
}
