'use client';
import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Paperclip, Bot, User as UserIcon, Loader2, X, FileText, CheckCircle2, AlertCircle, XCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const SUGGESTED = [
  'Rédige un résumé exécutif pour un projet cloud',
  'Génère une proposition technique pour un audit sécurité',
  'Vérifie la conformité de ma soumission',
  'Quels sont les risques d\'un projet ERP ?',
];

const BOT_INTRO = {
  role: 'bot',
  content: "Bonjour ! Je suis votre **Assistant IA** Yellomind.\n\nJe peux vous aider à :\n\n📄 **Analyser** des documents d'appels d'offres\n✍️ **Générer** des sections de propositions\n✅ **Vérifier** la conformité de vos soumissions\n💡 **Suggérer** du contenu depuis la base de savoirs\n\nComment puis-je vous aider ?"
};

function renderContent(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');
}

function simulateAI(msg) {
  const l = msg.toLowerCase();
  if (l.includes('résumé') || l.includes('executive'))
    return "Voici un **résumé exécutif** :\n\nNotre société propose une solution innovante basée sur **10 ans d'expertise**. Nos engagements :\n✅ Délais respectés\n✅ Qualité certifiée ISO 9001\n✅ Support 24/7 pendant 12 mois\n✅ Formation complète des équipes";
  if (l.includes('conformit') || l.includes('vérifie'))
    return "**Rapport de conformité :**\n\n✅ 18/22 exigences couvertes\n⚠️ 3 exigences partielles (clauses 4.2, 7.1, 9.3)\n❌ 1 exigence manquante (Certification ISO 27001)\n\n**Recommandation :** Complétez les clauses manquantes avant soumission.";
  if (l.includes('risque'))
    return "**Risques typiques :**\n\n🔴 Critiques : Dépassement budget, changement périmètre\n🟡 Modérés : Retards validation, turnover équipe\n🟢 Faibles : Documentation, formation utilisateurs";
  return "Merci ! Pour une réponse précise, précisez :\n1. Le **secteur** (IT, Industrie, Public)\n2. La **section** souhaitée (technique, commerciale)\n3. Ou **uploadez un PDF** pour une analyse automatique";
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([BOT_INTRO]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [fileName, setFileName] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    setMessages(p => [...p, { role: 'user', content: msg }]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 800));
    setMessages(p => [...p, { role: 'bot', content: simulateAI(msg) }]);
    setLoading(false);
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f || f.type !== 'application/pdf') { toast.error('PDF uniquement'); return; }
    setFileName(f.name);
    const tid = toast.loading('Analyse du PDF…');
    setTimeout(() => {
      toast.success('Analyse terminée', { id: tid });
      setAnalysis({
        budget: '1 200 000 DA', deadline: '30 août 2025',
        exigences: [
          { id: 1, texte: 'Application web responsive', statut: 'couverte' },
          { id: 2, texte: 'Compatibilité mobile', statut: 'couverte' },
          { id: 3, texte: 'Certification ISO 27001', statut: 'manquante' },
          { id: 4, texte: 'Livraison sous 6 mois', statut: 'partielle' },
          { id: 5, texte: 'Support 24/7', statut: 'couverte' },
        ],
      });
      setMessages(p => [...p, { role: 'bot', content: `✅ **PDF analysé** : "${f.name}"\n\nJ'ai extrait **5 exigences clés** avec un budget de **1 200 000 DA** et une échéance au **30 août 2025**.\n\nLes résultats sont affichés dans le panneau latéral. Que souhaitez-vous générer ?` }]);
    }, 2500);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-breadcrumb"><span>TMS</span><span>›</span><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Assistant IA</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
            <h1 className="page-title">Assistant IA</h1>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: '#10B981', background: '#ECFDF5', padding: '3px 10px', borderRadius: 99, border: '1px solid #D1FAE5', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} /> En ligne
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <label htmlFor="pdf-upload" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
            <Paperclip size={15} /> Analyser un PDF
          </label>
          <input id="pdf-upload" type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFile} />
          <button className="btn btn-ghost btn-sm" onClick={() => { setMessages([BOT_INTRO]); setAnalysis(null); setFileName(''); }}>
            <X size={14} /> Effacer
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 73px)' }}>
        {/* Analysis panel */}
        {analysis && (
          <div style={{ width: 280, minWidth: 280, borderRight: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <FileText size={15} color="#7C3AED" /> Analyse PDF
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fileName}</div>
            </div>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 16 }}>
              <div><div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Budget</div><div style={{ fontWeight: 700, fontSize: 13 }}>{analysis.budget}</div></div>
              <div><div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Échéance</div><div style={{ fontWeight: 700, fontSize: 13 }}>{analysis.deadline}</div></div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>Exigences extraites</div>
              {analysis.exigences.map(ex => (
                <div key={ex.id} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
                  {ex.statut === 'couverte'  && <CheckCircle2 size={15} color="#10B981" style={{ flexShrink: 0, marginTop: 1 }} />}
                  {ex.statut === 'partielle' && <AlertCircle  size={15} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />}
                  {ex.statut === 'manquante' && <XCircle      size={15} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />}
                  <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ex.texte}</span>
                </div>
              ))}
              <div style={{ marginTop: 14, padding: 12, background: '#ECFDF5', border: '1px solid #D1FAE5', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#065F46' }}>Score global</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#10B981' }}>72%</div>
              </div>
            </div>
          </div>
        )}

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: m.role === 'bot' ? 'linear-gradient(135deg,#7C3AED,#6D28D9)' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {m.role === 'bot' ? <Sparkles size={16} color="#fff" /> : <UserIcon size={16} color="#475569" />}
                </div>
                <div style={{ maxWidth: '70%', background: m.role === 'bot' ? 'var(--surface)' : 'linear-gradient(135deg,#7C3AED,#6D28D9)', border: m.role === 'bot' ? '1px solid var(--border)' : 'none', borderRadius: m.role === 'bot' ? '4px 14px 14px 14px' : '14px 4px 14px 14px', padding: '12px 15px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: 14, lineHeight: 1.65, color: m.role === 'bot' ? 'var(--text-primary)' : '#fff' }} dangerouslySetInnerHTML={{ __html: renderContent(m.content) }} />
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Sparkles size={16} color="#fff" /></div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px 14px 14px 14px', padding: '14px 18px', display: 'flex', gap: 5 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#7C3AED', animation: `bounce .9s ease ${i*.15}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && (
            <div style={{ padding: '0 28px 14px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SUGGESTED.map(s => (
                <button key={s} onClick={() => handleSend(s)} style={{ fontSize: 12.5, fontWeight: 500, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 99, padding: '6px 13px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Zap size={11} color="#7C3AED" />{s}
                </button>
              ))}
            </div>
          )}

          <div style={{ padding: '14px 28px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '10px 14px' }}>
              <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Posez votre question… (Entrée pour envoyer)" style={{ flex: 1, border: 'none', background: 'transparent', resize: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5, maxHeight: 100, minHeight: 22 }} rows={1} />
              <button onClick={() => handleSend()} disabled={!input.trim() || loading} className="btn btn-primary btn-icon" style={{ borderRadius: 10, flexShrink: 0 }}>
                {loading ? <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={17} />}
              </button>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 7 }}>Alimenté par GPT-4o · Yellomind TMS AI</div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
    </>
  );
}
