'use client';
import { useState, useRef, useCallback } from 'react';
import {
  Sparkles, Upload, FileText, X, CheckCircle2, AlertCircle,
  XCircle, ChevronDown, ChevronUp, Target, Zap, TrendingUp,
  Clock, MapPin, DollarSign, Layers, Award, AlertTriangle, ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import { useEffect } from 'react';

// ── Score Gauge (SVG circle) ──────────────────────────────────────────
function ScoreGauge({ score, label }) {
  const r = 80, cx = 100, cy = 100;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const offset = circ * (1 - pct);
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : score >= 40 ? '#F97316' : '#EF4444';
  const labelColor = color;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg width={200} height={200} viewBox="0 0 200 200">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={14} />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth={14}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
          style={{ transition: 'stroke-dashoffset 1.2s ease' }}
        />
        <text x={cx} y={cy - 10} textAnchor="middle" fill="var(--text-primary)" fontSize="36" fontWeight="800">{score}</text>
        <text x={cx} y={cy + 16} textAnchor="middle" fill="var(--text-muted)" fontSize="12">/100</text>
      </svg>
      <span style={{
        padding: '6px 20px', borderRadius: 99, fontWeight: 700, fontSize: 14,
        background: color + '20', color: labelColor, border: `1.5px solid ${color}40`
      }}>{label}</span>
    </div>
  );
}

// ── Dimension bar ─────────────────────────────────────────────────────
function DimBar({ label, score, max, icon: Icon, color }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          <Icon size={13} color={color} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>{score}/{max}</span>
      </div>
      <div className="progress-bar">
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 99,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          transition: 'width 1s ease'
        }} />
      </div>
    </div>
  );
}

// ── Upload Zone ───────────────────────────────────────────────────────
function UploadZone({ onFile, disabled }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  const handle = (f) => {
    if (!f || f.type !== 'application/pdf') { toast.error('PDF uniquement'); return; }
    if (f.size > 20 * 1024 * 1024) { toast.error('Fichier trop grand (max 20 MB)'); return; }
    onFile(f);
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
      style={{
        border: `2px dashed ${drag ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)', padding: '48px 32px', textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1,
        background: drag ? 'var(--primary-subtle)' : 'var(--surface-2)',
        transition: 'all .2s'
      }}
    >
      <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }}
        onChange={e => handle(e.target.files?.[0])} disabled={disabled} />
      <div style={{
        width: 64, height: 64, borderRadius: 'var(--radius-lg)', margin: '0 auto 16px',
        background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Upload size={28} color="#fff" />
      </div>
      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>
        Déposer un cahier des charges PDF
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        Glisser-déposer ou cliquer · PDF · Max 20 MB
      </div>
    </div>
  );
}

// ── Pipeline Steps ────────────────────────────────────────────────────
const STEPS = [
  { label: 'Extraction du PDF', desc: 'Lecture du texte brut' },
  { label: 'Analyse LLM', desc: 'Extraction structurée des exigences' },
  { label: 'Calcul du score TFS', desc: 'Évaluation hybride règles + IA' },
];

function PipelineProgress({ step }) {
  return (
    <div style={{ padding: '32px 0' }}>
      <div style={{ fontWeight: 700, fontSize: 16, textAlign: 'center', marginBottom: 28, color: 'var(--text-primary)' }}>
        Analyse IA en cours…
      </div>
      {STEPS.map((s, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
              background: done ? '#10B981' : active ? 'var(--primary)' : 'var(--border)',
              color: done || active ? '#fff' : 'var(--text-muted)',
              boxShadow: active ? '0 0 0 4px rgba(124,58,237,.2)' : 'none',
              animation: active ? 'pulse 1.5s ease infinite' : 'none'
            }}>
              {done ? <CheckCircle2 size={16} /> : i + 1}
            </div>
            <div style={{ paddingTop: 6 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: done ? '#10B981' : active ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.label}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>{s.desc}</div>
            </div>
          </div>
        );
      })}
      <style>{`@keyframes pulse{0%,100%{box-shadow:0 0 0 4px rgba(124,58,237,.2)}50%{box-shadow:0 0 0 8px rgba(124,58,237,.05)}}`}</style>
    </div>
  );
}

// ── Requirements list ─────────────────────────────────────────────────
const CAT_COLORS = {
  Technical: '#3B82F6', Financial: '#10B981', Legal: '#7C3AED',
  Operational: '#F59E0B', Functional: '#06B6D4', Quality: '#EC4899',
};

function RequirementsList({ requirements }) {
  const [open, setOpen] = useState(null);
  const cats = [...new Set(requirements.map(r => r.category))];
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? requirements : requirements.filter(r => r.category === filter);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {['all', ...cats].map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            border: `1.5px solid ${filter === c ? 'var(--primary)' : 'var(--border)'}`,
            background: filter === c ? 'var(--primary-subtle)' : 'transparent',
            color: filter === c ? 'var(--primary)' : 'var(--text-muted)'
          }}>{c === 'all' ? `Toutes (${requirements.length})` : c}</button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((req, i) => (
          <div key={req.id || i} style={{
            border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden',
            background: 'var(--surface)'
          }}>
            <div onClick={() => setOpen(open === i ? null : i)}
              style={{ padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                background: (CAT_COLORS[req.category] || '#7C3AED') + '20',
                color: CAT_COLORS[req.category] || '#7C3AED'
              }}>{req.category}</span>
              <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>
                {req.description?.slice(0, 80)}{req.description?.length > 80 ? '…' : ''}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, marginRight: 8,
                background: req.priority === 'Must Have' ? '#FEF2F2' : req.priority === 'Should Have' ? '#FFFBEB' : '#F0FDF4',
                color: req.priority === 'Must Have' ? '#DC2626' : req.priority === 'Should Have' ? '#D97706' : '#059669'
              }}>{req.priority || 'Must Have'}</span>
              {open === i ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
            </div>
            {open === i && (
              <div style={{ padding: '0 16px 14px', fontSize: 13, color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                {req.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function AIAssistantPage() {
  const [file, setFile] = useState(null);
  const [tenderId, setTenderId] = useState('');
  const [pipelineStep, setPipelineStep] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('score');
  const [history, setHistory] = useState([]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await api.get('/ai/history');
      setHistory(res.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const reset = () => { setFile(null); setResult(null); setError(null); setPipelineStep(-1); setTenderId(''); loadHistory(); };

  const loadPastAnalysis = async (tid) => {
    setLoading(true); setError(null); setResult(null);
    try {
      const resA = await api.get(`/tenders/${tid}/analysis`);
      const resS = await api.get(`/tenders/${tid}/score`);
      setResult({ analysis: resA.data, score: resS.data });
    } catch (e) {
      toast.error('Erreur lors du chargement de l\'analyse');
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = useCallback(async () => {
    if (!file || !tenderId) { toast.error('Sélectionnez un tender ID et un fichier PDF'); return; }
    setLoading(true); setError(null); setResult(null); setPipelineStep(0);

    try {
      const fd = new FormData();
      fd.append('pdf', file);
      setPipelineStep(1);
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/tenders/${tenderId}/analyze`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd }
      );
      setPipelineStep(2);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.detail || 'Erreur analyse');
      setPipelineStep(3);
      await new Promise(r => setTimeout(r, 600));
      setResult(data);
      loadHistory();
      toast.success('Analyse IA complète !');
    } catch (e) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [file, tenderId]);

  const score = result?.score;
  const analysis = result?.analysis;

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-breadcrumb"><span>TMS</span><span>›</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Analyse IA</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
            <h1 className="page-title">Analyse IA — Tender Fit Score</h1>
          </div>
        </div>
        {result && (
          <button className="btn btn-secondary btn-sm" onClick={reset}>
            <ArrowLeft size={14} /> Retour
          </button>
        )}
      </div>

      <div className="page-body">
        {/* ── Upload & History Panel ── */}
        {!result && !loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
            {/* Upload Zone */}
            <div>
              <div className="card card-p" style={{ marginBottom: 20 }}>
                <div className="form-group">
                  <label className="form-label">ID de l'appel d'offres <span className="form-required">*</span></label>
                  <input
                    className="form-input"
                    type="number" min="1"
                    placeholder="Ex: 3"
                    value={tenderId}
                    onChange={e => setTenderId(e.target.value)}
                  />
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    Retrouvez l'ID dans la page Appels d'offres
                  </div>
                </div>
              </div>

              <div className="card card-p" style={{ marginBottom: 20 }}>
                {file ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 12, background: 'var(--primary-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <FileText size={28} color="var(--primary)" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{file.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(0)} KB</div>
                    </div>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setFile(null)}><X size={14} /></button>
                  </div>
                ) : (
                  <UploadZone onFile={setFile} disabled={false} />
                )}
              </div>

              {error && (
                <div style={{ padding: 16, background: 'var(--danger-bg)', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', marginBottom: 16, color: 'var(--danger)', fontSize: 13 }}>
                  <strong>Erreur :</strong> {error}
                </div>
              )}

              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: 14, fontSize: 15, justifyContent: 'center' }}
                disabled={!file || !tenderId}
                onClick={runAnalysis}
              >
                <Sparkles size={18} /> Lancer l'analyse IA
              </button>
            </div>

            {/* History Zone */}
            <div className="card card-p">
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={15} /> Historique des analyses
              </div>
              
              {history.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px 10px' }}>
                  <div className="empty-state-icon" style={{ width: 48, height: 48, margin: '0 auto 10px' }}><FileText size={20} /></div>
                  <div className="empty-state-title" style={{ fontSize: 14 }}>Aucun historique</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {history.map((h, i) => {
                    const color = h.score ? (h.score.total_score >= 80 ? '#10B981' : h.score.total_score >= 60 ? '#F59E0B' : h.score.total_score >= 40 ? '#F97316' : '#EF4444') : 'var(--text-muted)';
                    return (
                      <div key={i} onClick={() => loadPastAnalysis(h.analysis.tender_id)} style={{
                        padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                        background: 'var(--surface-2)', cursor: 'pointer', transition: 'all .2s'
                      }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary-light)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {h.analysis.extracted_title || h.analysis.filename}
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Tender #{h.analysis.tender_id}</div>
                          {h.score ? (
                            <span style={{ fontSize: 11, fontWeight: 700, color: color, background: color+'15', padding: '2px 8px', borderRadius: 99 }}>
                              {h.score.total_score}/100
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--warning)', background: 'var(--warning-bg)', padding: '2px 8px', borderRadius: 99 }}>Échoué</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Pipeline Progress ── */}
        {loading && (
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <div className="card card-p">
              <PipelineProgress step={pipelineStep} />
            </div>
          </div>
        )}

        {/* ── Results Dashboard ── */}
        {result && score && (
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>

            {/* Left — Score Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card card-p" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 20 }}>
                  Tender Fit Score
                </div>
                <ScoreGauge score={score.total_score} label={score.label} />
                <div style={{ marginTop: 20, padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {score.recommendation}
                </div>
              </div>

              <div className="card card-p">
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 16 }}>
                  Dimensions
                </div>
                <DimBar label="Adéquation services" score={score.service_match_score} max={30} icon={Layers} color="#7C3AED" />
                <DimBar label="Secteur" score={score.sector_fit_score} max={20} icon={Target} color="#3B82F6" />
                <DimBar label="Budget" score={score.budget_alignment_score} max={15} icon={DollarSign} color="#10B981" />
                <DimBar label="Timeline" score={score.timeline_score} max={15} icon={Clock} color="#F59E0B" />
                <DimBar label="Géographie" score={score.geographic_score} max={10} icon={MapPin} color="#06B6D4" />
                <DimBar label="Similarité passée" score={score.past_similarity_score || 0} max={10} icon={Award} color="#EC4899" />
              </div>
            </div>

            {/* Right — Tabs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Tender info strip */}
              {analysis && (
                <div className="card card-p" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                  {[
                    { label: 'Secteur', value: analysis.sector || '—' },
                    { label: 'Type', value: analysis.tender_type || '—' },
                    { label: 'Client', value: analysis.client_name || '—' },
                    { label: 'Durée', value: analysis.estimated_duration_weeks ? `${analysis.estimated_duration_weeks} sem.` : '—' },
                  ].map(it => (
                    <div key={it.label}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>{it.label}</div>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)' }}>{it.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                {[
                  { key: 'score', label: 'Analyse', icon: TrendingUp },
                  { key: 'reqs', label: `Exigences (${analysis?.requirements?.length || 0})`, icon: FileText },
                ].map(t => (
                  <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 600,
                    color: activeTab === t.key ? 'var(--primary)' : 'var(--text-muted)',
                    borderBottom: activeTab === t.key ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                    marginBottom: -1
                  }}>
                    <t.icon size={14} />{t.label}
                  </button>
                ))}
              </div>

              <div className="card card-p">
                {activeTab === 'score' && (
                  <div>
                    {/* Summary */}
                    {analysis?.summary && (
                      <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10 }}>Résumé du tender</div>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{analysis.summary}</p>
                      </div>
                    )}
                    {/* Reasoning */}
                    {score.reasoning && (
                      <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10 }}>Analyse du score</div>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{score.reasoning}</p>
                      </div>
                    )}
                    {/* Strengths & Risks */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      {score.strengths?.length > 0 && (
                        <div style={{ background: '#ECFDF5', border: '1px solid #D1FAE5', borderRadius: 'var(--radius-md)', padding: 16 }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: '#065F46', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CheckCircle2 size={14} /> Points forts
                          </div>
                          {score.strengths.map((s, i) => (
                            <div key={i} style={{ fontSize: 13, color: '#047857', marginBottom: 6, display: 'flex', gap: 6 }}>
                              <span style={{ color: '#10B981', marginTop: 2 }}>✓</span>{s}
                            </div>
                          ))}
                        </div>
                      )}
                      {score.risks?.length > 0 && (
                        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', padding: 16 }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: '#991B1B', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <AlertTriangle size={14} /> Risques
                          </div>
                          {score.risks.map((r, i) => (
                            <div key={i} style={{ fontSize: 13, color: '#B91C1C', marginBottom: 6, display: 'flex', gap: 6 }}>
                              <span style={{ color: '#EF4444', marginTop: 2 }}>!</span>{r}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Deliverables */}
                    {analysis?.key_deliverables?.length > 0 && (
                      <div style={{ marginTop: 20 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10 }}>Livrables clés</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {analysis.key_deliverables.map((d, i) => (
                            <span key={i} style={{ padding: '5px 12px', background: 'var(--primary-subtle)', color: 'var(--primary)', borderRadius: 99, fontSize: 12.5, fontWeight: 600 }}>{d}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reqs' && analysis?.requirements?.length > 0 && (
                  <RequirementsList requirements={analysis.requirements} />
                )}

                {activeTab === 'reqs' && (!analysis?.requirements || analysis.requirements.length === 0) && (
                  <div className="empty-state">
                    <div className="empty-state-icon"><FileText size={28} /></div>
                    <div className="empty-state-title">Aucune exigence extraite</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
