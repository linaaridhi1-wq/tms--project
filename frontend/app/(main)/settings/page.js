'use client';
import { useState, useEffect } from 'react';
import { User, Lock, Bell, Palette, Check, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';

const ROLE_META = {
  Admin:      { color: '#7C3AED', bg: '#EDE9FE' },
  Manager:    { color: '#2563EB', bg: '#EFF6FF' },
  Consultant: { color: '#059669', bg: '#ECFDF5' },
};

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [activeSection, setActiveSection] = useState('profile');
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, newPwd: false, confirm: false });
  const [savingPwd, setSavingPwd] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({ deadline3: true, deadline7: true, newTender: true });

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) try { setUser(JSON.parse(raw)); } catch { /**/ }
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  const toggleTheme = (t) => {
    setTheme(t);
    localStorage.setItem('theme', t);
    document.documentElement.setAttribute('data-theme', t);
  };

  const handleChangePwd = async (e) => {
    e.preventDefault();
    if (pwdForm.newPwd !== pwdForm.confirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (pwdForm.newPwd.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setSavingPwd(true);
    try {
      await api.put(`/utilisateurs/${user?.userId}`, { mot_de_passe: pwdForm.newPwd });
      toast.success('Mot de passe mis à jour');
      setPwdForm({ current: '', newPwd: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSavingPwd(false);
    }
  };

  const rm = ROLE_META[user?.role] || { color: '#94A3B8', bg: '#F1F5F9' };

  const sections = [
    { key: 'profile',  label: 'Profil',        icon: User    },
    { key: 'security', label: 'Sécurité',       icon: Lock    },
    { key: 'notifs',   label: 'Notifications',  icon: Bell    },
    { key: 'display',  label: 'Affichage',      icon: Palette },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-breadcrumb"><span>TMS</span><span>›</span><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Paramètres</span></div>
          <h1 className="page-title" style={{ marginTop: 2 }}>Paramètres</h1>
        </div>
      </div>

      <div className="page-body">
        <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>

          {/* Sidebar Nav */}
          <div className="card card-p" style={{ alignSelf: 'start' }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 12 }}>Configuration</div>
            {sections.map(s => (
              <button key={s.key} onClick={() => setActiveSection(s.key)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 10px', borderRadius: 'var(--radius-sm)',
                border: 'none', cursor: 'pointer', marginBottom: 2,
                background: activeSection === s.key ? 'var(--primary)' : 'transparent',
                color: activeSection === s.key ? '#fff' : 'var(--text-secondary)',
                fontWeight: activeSection === s.key ? 700 : 500, fontSize: 13.5,
                transition: 'all .15s',
              }}>
                <s.icon size={16} />
                {s.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div>

            {/* Profile */}
            {activeSection === 'profile' && (
              <div className="card card-p">
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Informations du profil</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Vos informations de compte Yellomind TMS</div>

                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: `linear-gradient(135deg, var(--primary), var(--primary-dark))`,
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, fontWeight: 800,
                  }}>
                    {user?.nom?.[0]}{user?.prenom?.[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.nom} {user?.prenom}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: rm.bg, color: rm.color, borderRadius: 99, padding: '3px 12px', fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                      {user?.role}
                    </div>
                  </div>
                </div>

                {/* Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {[
                    { label: 'Prénom', value: user?.prenom },
                    { label: 'Nom', value: user?.nom },
                    { label: 'Email', value: user?.email },
                    { label: 'Rôle', value: user?.role },
                  ].map(field => (
                    <div key={field.label} className="settings-field-grid" style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{field.label}</div>
                      <div style={{
                        padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)', fontSize: 13.5, color: 'var(--text-primary)',
                      }}>
                        {field.value || '—'}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 24, padding: 14, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 'var(--radius-md)', fontSize: 13, color: '#92400E' }}>
                  ℹ️ Pour modifier vos informations personnelles, contactez votre administrateur Yellomind.
                </div>
              </div>
            )}

            {/* Security */}
            {activeSection === 'security' && (
              <div className="card card-p">
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Sécurité</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Modifiez votre mot de passe</div>

                <form onSubmit={handleChangePwd} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
                  {[
                    { key: 'current', label: 'Mot de passe actuel' },
                    { key: 'newPwd',  label: 'Nouveau mot de passe' },
                    { key: 'confirm', label: 'Confirmer le nouveau mot de passe' },
                  ].map(field => (
                    <div key={field.key} className="form-group">
                      <label className="form-label">{field.label}</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPwd[field.key] ? 'text' : 'password'}
                          className="form-input"
                          value={pwdForm[field.key]}
                          onChange={e => setPwdForm(p => ({ ...p, [field.key]: e.target.value }))}
                          placeholder="••••••••"
                          style={{ paddingRight: 40 }}
                        />
                        <button type="button" onClick={() => setShowPwd(p => ({ ...p, [field.key]: !p[field.key] }))} style={{
                          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                        }}>
                          {showPwd[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}

                  <div style={{ marginTop: 4 }}>
                    <button type="submit" className="btn btn-primary" disabled={savingPwd}>
                      {savingPwd ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
                    </button>
                  </div>
                </form>

                <div style={{ marginTop: 28, padding: '16px 18px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 10 }}>Règles de sécurité</div>
                  {[
                    'Au moins 8 caractères',
                    'Mélanger lettres, chiffres et symboles',
                    'Ne pas réutiliser les anciens mots de passe',
                  ].map(r => (
                    <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      <Check size={13} color="#10B981" /> {r}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifs' && (
              <div className="card card-p">
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Préférences de notifications</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Choisissez quand vous souhaitez être alerté</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[
                    { key: 'deadline3', label: 'Alerte 3 jours avant échéance',    desc: 'Recevez une notification 3 jours avant la date limite d\'un AO' },
                    { key: 'deadline7', label: 'Alerte 7 jours avant échéance',    desc: 'Recevez une notification 7 jours avant la date limite d\'un AO' },
                    { key: 'newTender', label: 'Nouvel appel d\'offres détecté',    desc: 'Soyez informé dès qu\'un nouvel AO est ajouté dans le système' },
                  ].map((pref, idx) => (
                    <div key={pref.key} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '16px 0', borderBottom: idx < 2 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{pref.label}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>{pref.desc}</div>
                      </div>
                      <button
                        onClick={() => { setNotifPrefs(p => ({ ...p, [pref.key]: !p[pref.key] })); toast.success('Préférence mise à jour'); }}
                        style={{
                          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                          background: notifPrefs[pref.key] ? 'var(--primary)' : '#CBD5E1',
                          position: 'relative', transition: 'all .3s', flexShrink: 0,
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: 3, left: notifPrefs[pref.key] ? 22 : 3,
                          width: 18, height: 18, borderRadius: '50%', background: '#fff',
                          transition: 'all .3s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                        }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display */}
            {activeSection === 'display' && (
              <div className="card card-p">
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Apparence</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Personnalisez l&apos;interface</div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 14 }}>Thème de l&apos;interface</div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {[
                      { key: 'light', label: 'Clair', bg: '#F8FAFC', border: '#E2E8F0', textColor: '#1E293B' },
                      { key: 'dark',  label: 'Sombre', bg: '#0F172A', border: '#334155', textColor: '#F8FAFC' },
                    ].map(t => (
                      <button key={t.key} onClick={() => toggleTheme(t.key)} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                        background: 'none', border: `2px solid ${theme === t.key ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-lg)', padding: 16, cursor: 'pointer',
                        transition: 'all .2s', width: 140,
                      }}>
                        <div style={{
                          width: 80, height: 52, borderRadius: 8, background: t.bg,
                          border: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', padding: 6, gap: 4,
                        }}>
                          <div style={{ height: 6, background: '#7C3AED', borderRadius: 3, width: '60%' }} />
                          <div style={{ height: 4, background: t.textColor + '33', borderRadius: 3, width: '90%' }} />
                          <div style={{ height: 4, background: t.textColor + '22', borderRadius: 3, width: '75%' }} />
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{t.label}</div>
                        {theme === t.key && <Check size={15} color="var(--primary)" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ padding: 16, background: '#ECFDF5', border: '1px solid #D1FAE5', borderRadius: 'var(--radius-md)', fontSize: 13, color: '#065F46' }}>
                  ✅ Votre préférence de thème est sauvegardée automatiquement
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
