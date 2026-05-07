'use client';
import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Search, Plus, Tag, Star, X, Copy, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import ConfirmModal from '../../../components/ConfirmModal';

const CATEGORIES = ['Tous', 'Résumé exécutif', 'Proposition technique', 'Offre commerciale', 'Méthodologie', 'Références', 'Équipe projet', 'Planning'];

const EMPTY_ITEM = { titre: '', categorie: 'Résumé exécutif', secteur: '', contenu: '' };

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function KnowledgeBasePage() {
  const [items,    setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,   setSearch]  = useState('');
  const [category, setCategory] = useState('Tous');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [formItem, setFormItem] = useState(EMPTY_ITEM);
  const [saving,   setSaving]   = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) try { setUserRole(JSON.parse(raw)?.role); } catch { /**/ }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/knowledge-base');
      setItems(r.data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const canWrite = userRole !== 'Consultant';

  const filtered = items.filter(i => {
    const matchSearch = (i.titre || '').toLowerCase().includes(search.toLowerCase()) || (i.contenu || '').toLowerCase().includes(search.toLowerCase());
    const matchCat    = category === 'Tous' || i.categorie === category;
    return matchSearch && matchCat;
  });

  const openCreate = () => { setEditing(null); setFormItem(EMPTY_ITEM); setShowForm(true); };
  const openEdit   = (item) => { setEditing(item); setFormItem({ titre: item.titre, categorie: item.categorie, secteur: item.secteur || '', contenu: item.contenu || '' }); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/knowledge-base/${editing.item_id}`, formItem);
        toast.success('Élément mis à jour');
      } else {
        await api.post('/knowledge-base', formItem);
        toast.success('Élément ajouté à la base de savoirs');
      }
      setShowForm(false);
      setEditing(null);
      setFormItem(EMPTY_ITEM);
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
      await api.delete(`/knowledge-base/${deleteConfirm.item_id}`);
      toast.success('Élément supprimé');
      setDeleteConfirm(null);
      if (selected?.item_id === deleteConfirm.item_id) setSelected(null);
      load();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleCopy = async (item) => {
    try {
      await navigator.clipboard.writeText(item.contenu);
      toast.success('Copié dans le presse-papier');
      const r = await api.post(`/knowledge-base/${item.item_id}/use`);
      setItems(prev => prev.map(i => i.item_id === item.item_id ? r.data : i));
      if (selected?.item_id === item.item_id) setSelected(r.data);
    } catch {
      toast.error('Erreur lors de la copie');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-breadcrumb"><span>TMS</span><span>›</span><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Base de savoirs</span></div>
          <h1 className="page-title" style={{ marginTop: 2 }}>Base de savoirs</h1>
        </div>
        {canWrite && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Nouvel élément
          </button>
        )}
      </div>

      <div className="page-body">
        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Éléments',       value: items.length,                       icon: BookOpen, color: '#7C3AED', bg: '#EDE9FE' },
            { label: 'Catégories',     value: CATEGORIES.length - 1,              icon: Tag,      color: '#3B82F6', bg: '#EFF6FF' },
            { label: 'Réutilisations', value: items.reduce((a,i)=>a+i.usages,0),  icon: Copy,     color: '#10B981', bg: '#ECFDF5' },
            { label: 'Note moyenne',   value: items.length > 0 ? (items.reduce((a,i)=>a+i.note,0)/items.length).toFixed(1) + '★' : '—', icon: Star, color: '#F59E0B', bg: '#FFFBEB' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 18px' }}>
              <div style={{ width: 36, height: 36, background: s.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={18} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="knowledge-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
          {/* Sidebar categories */}
          <div className="card card-p" style={{ alignSelf: 'start' }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: 'var(--text-primary)' }}>Catégories</div>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                border: 'none', cursor: 'pointer', marginBottom: 2,
                background: category === cat ? '#EDE9FE' : 'transparent',
                color: category === cat ? '#7C3AED' : 'var(--text-secondary)',
                fontWeight: category === cat ? 700 : 500, fontSize: 13.5,
                transition: 'all .15s',
              }}>
                <span>{cat}</span>
                <span style={{ fontSize: 11, background: category === cat ? '#7C3AED' : 'var(--border)', color: category === cat ? '#fff' : 'var(--text-muted)', padding: '1px 7px', borderRadius: 99, fontWeight: 600 }}>
                  {cat === 'Tous' ? items.length : items.filter(i => i.categorie === cat).length}
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div>
            <div className="search-bar" style={{ marginBottom: 16 }}>
              <Search size={15} className="search-icon" />
              <input className="form-input" style={{ paddingLeft: 36, height: 40 }} placeholder="Rechercher dans la base de savoirs…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {loading ? (
              <div className="empty-state card"><div className="empty-state-icon"><BookOpen size={28} /></div><div className="empty-state-title">Chargement…</div></div>
            ) : filtered.length === 0 ? (
              <div className="empty-state card"><div className="empty-state-icon"><BookOpen size={28} /></div><div className="empty-state-title">Aucun élément trouvé</div></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filtered.map(item => (
                  <div key={item.item_id} className="card" style={{ padding: '18px 20px', cursor: 'pointer', transition: 'all .2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#7C3AED55'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    onClick={() => setSelected(item)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                          <span className="badge badge-purple">{item.categorie}</span>
                          {item.secteur && <span className="badge badge-slate">{item.secteur}</span>}
                          <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>★ {item.note}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text-primary)', marginBottom: 8 }}>{item.titre}</div>
                        <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {item.contenu}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleCopy(item)} title="Copier"><Copy size={15} /></button>
                        {canWrite && (
                          <>
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(item)} title="Modifier"><Pencil size={14} /></button>
                            <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteConfirm(item)} title="Supprimer"><Trash2 size={14} /></button>
                          </>
                        )}
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
                          <div style={{ fontWeight: 600 }}>{item.usages}</div>
                          <div>usages</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{selected.titre}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <span className="badge badge-purple">{selected.categorie}</span>
                {selected.secteur && <span className="badge badge-slate">{selected.secteur}</span>}
                <span style={{ fontSize: 12.5, color: '#F59E0B', fontWeight: 700 }}>★ {selected.note}</span>
                <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>· {selected.usages} utilisations</span>
              </div>
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 18, fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                {selected.contenu}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Fermer</button>
              {canWrite && <button className="btn btn-ghost" onClick={() => { openEdit(selected); setSelected(null); }}><Pencil size={14} /> Modifier</button>}
              <button className="btn btn-ghost" onClick={() => handleCopy(selected)}><Copy size={14} /> Copier</button>
              <button className="btn btn-primary" onClick={() => { toast.success('Inséré dans la soumission'); setSelected(null); }}>
                Utiliser dans une soumission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={showForm} title={editing ? 'Modifier l\'élément' : 'Nouvel élément'} onClose={() => { setShowForm(false); setEditing(null); }}>
        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <div className="form-group">
              <label className="form-label">Titre <span className="form-required">*</span></label>
              <input required className="form-input" value={formItem.titre} onChange={e => setFormItem(p=>({...p,titre:e.target.value}))} placeholder="Titre de l'élément" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Catégorie</label>
                <select className="form-select" value={formItem.categorie} onChange={e => setFormItem(p=>({...p,categorie:e.target.value}))}>
                  {CATEGORIES.filter(c=>c!=='Tous').map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Secteur</label>
                <input className="form-input" value={formItem.secteur} onChange={e => setFormItem(p=>({...p,secteur:e.target.value}))} placeholder="IT, Finance, Public…" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Contenu <span className="form-required">*</span></label>
              <textarea required className="form-textarea" style={{ minHeight: 140 }} value={formItem.contenu} onChange={e => setFormItem(p=>({...p,contenu:e.target.value}))} placeholder="Texte réutilisable…" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditing(null); }}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Ajouter'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteConfirm}
        title="Confirmation de suppression"
        message={`Supprimer "${deleteConfirm?.titre}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        onConfirm={confirmDelete}
        onClose={() => setDeleteConfirm(null)}
      />
    </>
  );
}
