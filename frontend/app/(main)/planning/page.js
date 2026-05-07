'use client';
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Calendar, Clock, Building2, FileText, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import ConfirmModal from '../../../components/ConfirmModal';

const EVENT_TYPES = [
  { key: 'reunion',       label: 'Réunion',       color: '#7C3AED' },
  { key: 'echeance',      label: 'Échéance',       color: '#EF4444' },
  { key: 'presentation',  label: 'Présentation',   color: '#F59E0B' },
  { key: 'suivi',         label: 'Suivi',          color: '#10B981' },
  { key: 'qualification', label: 'Qualification',  color: '#3B82F6' },
  { key: 'autre',         label: 'Autre',          color: '#64748B' },
];

const TYPE_MAP = Object.fromEntries(EVENT_TYPES.map(t => [t.key, t]));

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS_FR   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

const EMPTY_FORM = { titre: '', type: 'reunion', date_debut: '', date_fin: '', note: '', couleur: '#7C3AED', client_id: '', tender_id: '' };

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

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Mon = 0
}

export default function PlanningPage() {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [clients, setClients]   = useState([]);
  const [tenders, setTenders]   = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) try { setUserRole(JSON.parse(raw)?.role); } catch { /**/ }
  }, []);

  const canWrite = userRole === 'Manager' || userRole === 'Admin';

  const load = useCallback(async () => {
    try {
      const r = await api.get('/planning');
      setEvents(r.data);
    } catch { /**/ }
  }, []);

  useEffect(() => {
    load();
    // Load clients and tenders for linking
    api.get('/clients').then(r => setClients(r.data || [])).catch(() => {});
    api.get('/tenders').then(r => setTenders(r.data || [])).catch(() => {});
  }, [load]);

  // Group events by date key (YYYY-MM-DD)
  const eventsByDay = {};
  events.forEach(ev => {
    const dk = ev.date_debut?.substring(0, 10);
    if (!dk) return;
    if (!eventsByDay[dk]) eventsByDay[dk] = [];
    eventsByDay[dk].push(ev);
  });

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDayOfMonth(year, month);

  const openCreate = (date) => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, date_debut: date || '' });
    setShowForm(true);
  };
  const openEdit = (ev) => {
    setEditing(ev);
    setForm({
      titre:      ev.titre || '',
      type:       ev.type || 'autre',
      date_debut: ev.date_debut ? ev.date_debut.substring(0, 16) : '',
      date_fin:   ev.date_fin   ? ev.date_fin.substring(0, 16)   : '',
      note:       ev.note || '',
      couleur:    ev.couleur || '#7C3AED',
      client_id:  ev.client_id || '',
      tender_id:  ev.tender_id || '',
    });
    setSelectedEvent(null);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        client_id: form.client_id || null,
        tender_id: form.tender_id || null,
      };
      if (editing) {
        await api.put(`/planning/${editing.event_id}`, payload);
        toast.success('Événement mis à jour');
      } else {
        await api.post('/planning', payload);
        toast.success('Événement créé');
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

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.delete(`/planning/${deleteConfirm.event_id}`);
      toast.success('Événement supprimé');
      setDeleteConfirm(null);
      setSelectedEvent(null);
      load();
    } catch {
      toast.error('Erreur');
    }
  };

  const f = (k) => (e) => {
    let val = e.target.value;
    if (k === 'type') {
      const t = EVENT_TYPES.find(t => t.key === val);
      setForm(p => ({ ...p, type: val, couleur: t?.color || p.couleur }));
    } else {
      setForm(p => ({ ...p, [k]: val }));
    }
  };

  const dayEventsOfSelected = selectedDay ? (eventsByDay[selectedDay] || []) : [];

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-breadcrumb"><span>TMS</span><span>›</span><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Planning</span></div>
          <h1 className="page-title" style={{ marginTop: 2 }}>Planning & Calendrier</h1>
        </div>
        {canWrite && (
          <button className="btn btn-primary" onClick={() => openCreate('')}>
            <Plus size={16} /> Nouvel événement
          </button>
        )}
      </div>

      <div className="page-body">
        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {EVENT_TYPES.map(t => (
            <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-secondary)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.color }} />
              {t.label}
            </div>
          ))}
        </div>

        <div className="planning-grid" style={{ display: 'grid', gridTemplateColumns: selectedDay ? '1fr 320px' : '1fr', gap: 24 }}>
          {/* Calendar */}
          <div className="card planning-calendar-card" style={{ padding: 24 }}>
            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <button className="btn btn-ghost btn-icon" onClick={prevMonth}><ChevronLeft size={18} /></button>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
                {MONTHS_FR[month]} {year}
              </div>
              <button className="btn btn-ghost btn-icon" onClick={nextMonth}><ChevronRight size={18} /></button>
            </div>

            {/* Day headers */}
            <div className="calendar-weekdays" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 8 }}>
              {DAYS_FR.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '.5px' }}>{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="calendar-days" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {/* Empty cells for offset */}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day  = i + 1;
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEvents = eventsByDay[dateKey] || [];
                const isToday   = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                const isSelected = selectedDay === dateKey;

                return (
                  <div
                    key={day}
                    className="calendar-day"
                    onClick={() => { setSelectedDay(isSelected ? null : dateKey); }}
                    style={{
                      minHeight: 72, borderRadius: 'var(--radius-md)',
                      padding: '6px 8px', cursor: 'pointer',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: isSelected ? '#EDE9FE' : isToday ? 'var(--surface-2)' : 'var(--surface)',
                      transition: 'all .15s',
                      position: 'relative',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--primary)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <div className="calendar-day-number" style={{
                      fontSize: 13, fontWeight: isToday ? 800 : 500,
                      color: isToday ? 'var(--primary)' : 'var(--text-primary)',
                      marginBottom: 4,
                    }}>
                      {isToday ? (
                        <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                          {day}
                        </span>
                      ) : day}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {dayEvents.slice(0, 3).map(ev => (
                        <div key={ev.event_id} style={{
                          fontSize: 10.5, fontWeight: 600,
                          background: (TYPE_MAP[ev.type]?.color || '#7C3AED') + '22',
                          color: TYPE_MAP[ev.type]?.color || '#7C3AED',
                          borderLeft: `2px solid ${TYPE_MAP[ev.type]?.color || '#7C3AED'}`,
                          padding: '1px 5px', borderRadius: 3,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {ev.titre}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', paddingLeft: 5 }}>+{dayEvents.length - 3} autres</div>
                      )}
                    </div>
                    {canWrite && (
                      <button
                        onClick={e => { e.stopPropagation(); openCreate(dateKey); }}
                        style={{
                          position: 'absolute', bottom: 4, right: 4,
                          width: 18, height: 18, borderRadius: '50%',
                          background: 'var(--primary)', color: '#fff',
                          border: 'none', cursor: 'pointer', fontSize: 14,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: 0, transition: 'opacity .15s',
                        }}
                        className="day-add-btn"
                        title="Ajouter un événement"
                      >
                        +
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day Detail Panel */}
          {selectedDay && (
            <div className="card" style={{ alignSelf: 'start' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {new Date(selectedDay + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                    {dayEventsOfSelected.length} événement{dayEventsOfSelected.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {canWrite && (
                    <button className="btn btn-primary btn-sm" onClick={() => openCreate(selectedDay)}>
                      <Plus size={14} />
                    </button>
                  )}
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => setSelectedDay(null)}
                    title="Fermer"
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#EF4444',
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.borderColor = '#FCA5A5'; }}
                    onMouseOut={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#FECACA'; }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 500, overflowY: 'auto' }}>
                {dayEventsOfSelected.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                    Aucun événement ce jour.<br />
                    {canWrite && <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => openCreate(selectedDay)}>+ Ajouter</span>}
                  </div>
                ) : dayEventsOfSelected.map(ev => {
                  const typeInfo = TYPE_MAP[ev.type] || TYPE_MAP.autre;
                  return (
                    <div
                      key={ev.event_id}
                      onClick={() => setSelectedEvent(ev)}
                      style={{
                        padding: '12px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                        border: `1px solid ${typeInfo.color}33`,
                        background: typeInfo.color + '0D',
                        borderLeft: `3px solid ${typeInfo.color}`,
                        transition: 'all .15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)' }}>{ev.titre}</div>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: typeInfo.color, background: typeInfo.color + '22', borderRadius: 99, padding: '2px 8px', flexShrink: 0 }}>
                          {typeInfo.label}
                        </span>
                      </div>
                      {ev.date_debut && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>
                          <Clock size={11} />
                          {new Date(ev.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                      {ev.client_nom && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                          <Building2 size={11} />{ev.client_nom}
                        </div>
                      )}
                      {ev.tender_titre && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                          <FileText size={11} />{ev.tender_titre}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: TYPE_MAP[selectedEvent.type]?.color || '#7C3AED' }} />
                <span className="modal-title">{selectedEvent.titre}</span>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedEvent(null)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge badge-purple">{TYPE_MAP[selectedEvent.type]?.label}</span>
              </div>
              {[
                { icon: Calendar, label: 'Date', value: selectedEvent.date_debut ? new Date(selectedEvent.date_debut).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' }) : '—' },
                { icon: Building2, label: 'Client', value: selectedEvent.client_nom },
                { icon: FileText,  label: "Appel d'offres", value: selectedEvent.tender_titre },
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
              {selectedEvent.note && (
                <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' }}>Notes</div>
                  <div style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>{selectedEvent.note}</div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedEvent(null)}>Fermer</button>
              {canWrite && (
                <>
                  <button className="btn btn-ghost" onClick={() => openEdit(selectedEvent)}><Pencil size={14} /> Modifier</button>
                  <button className="btn btn-danger" onClick={() => { setDeleteConfirm(selectedEvent); setSelectedEvent(null); }}><Trash2 size={14} /> Supprimer</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={showForm} title={editing ? 'Modifier l\'événement' : 'Nouvel événement'} onClose={() => { setShowForm(false); setEditing(null); }}>
        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Titre <span className="form-required">*</span></label>
              <input required className="form-input" value={form.titre} onChange={f('titre')} placeholder="Ex: Réunion client Cevital" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={form.type} onChange={f('type')}>
                  {EVENT_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date de début <span className="form-required">*</span></label>
                <input required type="datetime-local" className="form-input" value={form.date_debut} onChange={f('date_debut')} />
              </div>
              <div className="form-group">
                <label className="form-label">Date de fin</label>
                <input type="datetime-local" className="form-input" value={form.date_fin} onChange={f('date_fin')} />
              </div>
              <div className="form-group">
                <label className="form-label">Client lié</label>
                <select className="form-select" value={form.client_id} onChange={f('client_id')}>
                  <option value="">Aucun</option>
                  {clients.map(c => <option key={c.client_id} value={c.client_id}>{c.raison_sociale}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Appel d&apos;offres lié</label>
                <select className="form-select" value={form.tender_id} onChange={f('tender_id')}>
                  <option value="">Aucun</option>
                  {tenders.map(t => <option key={t.tender_id} value={t.tender_id}>{t.titre}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" value={form.note} onChange={f('note')} placeholder="Détails, instructions, lien de visio…" style={{ minHeight: 80 }} />
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
        title="Supprimer l'événement"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteConfirm?.titre}" ?`}
        confirmText="Supprimer"
        onConfirm={confirmDelete}
        onClose={() => setDeleteConfirm(null)}
      />

      <style>{`
        .day-add-btn { opacity: 0 !important; }
        div:hover > .day-add-btn { opacity: 1 !important; }
      `}</style>
    </>
  );
}
