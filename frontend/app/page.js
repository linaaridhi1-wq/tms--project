'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Target, Bot, TrendingUp, Check } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
});

export default function LoginPage() {
  const [email,      setEmail]      = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading('Connexion en cours…');
    try {
      const res = await api.post('/auth/login', { email, motDePasse });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Bienvenue !', { id: tid });
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Identifiants incorrects', { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Inter, sans-serif', fontSize: '13.5px', borderRadius: '10px' } }} />
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
        
        {/* Left Side: Branding (Exactly 50% split) */}
        <div className="login-left-panel" style={{ 
          flex: 1, 
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)', 
          position: 'relative', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          padding: '60px 8%', 
          color: '#fff', 
        }}>
          {/* Subtle Background Glow */}
          <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(124,58,237,.2) 0%, transparent 60%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 2, maxWidth: 480, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
              <div style={{ 
                width: 56, height: 56, borderRadius: '16px', border: '1px solid rgba(167, 139, 250, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#fff', overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)'
              }}>
                <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>
                YELLOMIND TMS
              </h1>
            </div>

            <p style={{ fontSize: 15, color: '#CBD5E1', lineHeight: 1.6, marginBottom: 40 }}>
              Votre hub stratégique pour la gestion des appels d&apos;offres. Transformez votre processus d&apos;avant-vente en un avantage concurrentiel décisif.
            </p>

            {/* Enhanced UI with Pro Icons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              
              <div style={{ display: 'flex', gap: 18 }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Target size={22} color="#A78BFA" />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px 0', color: '#F8FAFC' }}>Centralisation des opportunités</h3>
                  <p style={{ fontSize: 13.5, color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>Détectez, filtrez et qualifiez vos appels d&apos;offres depuis un espace de travail unique et collaboratif.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 18 }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={22} color="#60A5FA" />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px 0', color: '#F8FAFC' }}>Rédaction assistée par l&apos;IA</h3>
                  <p style={{ fontSize: 13.5, color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>Générez des propositions techniques et commerciales percutantes grâce à notre assistant intelligent embarqué.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 18 }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <TrendingUp size={22} color="#34D399" />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px 0', color: '#F8FAFC' }}>Analyse de performance</h3>
                  <p style={{ fontSize: 13.5, color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>Suivez vos KPI, analysez vos succès et maximisez vos taux de conversion avec des dashboards précis.</p>
                </div>
              </div>

            </div>
          </div>
          
          <div style={{ position: 'absolute', bottom: 30, left: '8%', fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', zIndex: 2 }}>
            © {new Date().getFullYear()} YELLOMIND TMS
          </div>
        </div>

        {/* Right Side: Login Form (Exactly 50% split) */}
        <div className="login-right-panel" style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          padding: '40px 10%', 
          background: 'var(--surface)', 
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
            
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 50, textAlign: 'center' }}>
              Accédez à votre compte
            </h2>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 8 }}>
                  Adresse Email
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Entrez votre email"
                    style={{
                      width: '100%', border: 'none', borderBottom: '2px solid #E2E8F0',
                      padding: '8px 0 12px 0', fontSize: 14, color: 'var(--text-primary)', background: 'transparent',
                      outline: 'none', transition: 'border-color 0.3s'
                    }}
                    onFocus={e => e.target.style.borderBottomColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderBottomColor = '#E2E8F0'}
                  />
                  {email.includes('@') && <Check size={16} style={{ position: 'absolute', right: 0, top: 10, color: 'var(--primary)' }} />}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 8 }}>
                  Mot de Passe
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required value={motDePasse}
                    onChange={e => setMotDePasse(e.target.value)}
                    placeholder="Entrez votre mot de passe"
                    style={{
                      width: '100%', border: 'none', borderBottom: '2px solid #E2E8F0',
                      padding: '8px 40px 12px 0', fontSize: 14, color: 'var(--text-primary)', background: 'transparent',
                      outline: 'none', transition: 'border-color 0.3s'
                    }}
                    onFocus={e => e.target.style.borderBottomColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderBottomColor = '#E2E8F0'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    style={{
                      position: 'absolute', right: 0, top: 8,
                      background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0
                    }}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: -12 }}>
                <input type="checkbox" id="remember" style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: 14, height: 14 }} />
                <label htmlFor="remember" style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>
                  En vous connectant, vous acceptez les conditions d&apos;utilisation.
                </label>
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                <button
                  type="submit" disabled={loading}
                  style={{
                    flex: 1, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 99,
                    padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)', transition: 'all 0.2s',
                    opacity: loading ? 0.7 : 1
                  }}
                  onMouseOver={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.background = 'var(--primary-dark)'; }}
                  onMouseOut={e => { e.target.style.transform = 'none'; e.target.style.background = 'var(--primary)'; }}
                >
                  {loading ? 'Connexion en cours…' : 'Se connecter'}
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>
      
      {/* Mobile responsiveness */}
      <style>{`
        @media(max-width: 900px) {
          .login-left-panel { display: none !important; }
          .login-right-panel { padding: 40px 24px !important; }
        }
      `}</style>
    </>
  );
}
