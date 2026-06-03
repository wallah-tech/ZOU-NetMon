import { useState, FormEvent } from 'react';
import { Eye, EyeOff, Network, Shield, Lock, Mail, ChevronRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DEMO_CREDENTIALS = [
  { label: 'Administrator', email: 'admin@ict.gov.zw', password: 'Admin@2024', color: '#3b82f6' },
  { label: 'Operator', email: 'netops@ict.gov.zw', password: 'NetOps@2024', color: '#10b981' },
  { label: 'Viewer', email: 'viewer@ict.gov.zw', password: 'Viewer@2024', color: '#8b5cf6' },
];

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState<number | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password) { setError('Please enter your password.'); return; }
    setIsLoading(true);
    // Slight delay for realism
    await new Promise((r) => setTimeout(r, 700));
    const result = login(email, password);
    if (!result.success) {
      setError(result.error ?? 'Login failed.');
      setIsLoading(false);
    }
    // On success, App.tsx will unmount this component automatically
  };

  const fillDemo = (idx: number) => {
    const cred = DEMO_CREDENTIALS[idx];
    setEmail(cred.email);
    setPassword(cred.password);
    setActiveDemo(idx);
    setError('');
  };

  return (
    <div style={styles.page}>
      {/* Animated background grid */}
      <div style={styles.gridOverlay} />

      {/* Floating orbs */}
      <div style={{ ...styles.orb, ...styles.orb1 }} />
      <div style={{ ...styles.orb, ...styles.orb2 }} />
      <div style={{ ...styles.orb, ...styles.orb3 }} />

      <div style={styles.layout}>
        {/* ── Left branding panel ── */}
        <div style={styles.brandPanel}>
          <div style={styles.brandContent}>
            <div style={styles.logoWrap}>
              <img src="./logo.avif" alt="Ministry of ICT" style={styles.logoImg} />
            </div>
            <h1 style={styles.brandTitle}>Ministry of ICT</h1>
            <h2 style={styles.brandSubtitle}>NetMon Platform</h2>
            <p style={styles.brandDesc}>
              Network Intelligence Platform — Real-time monitoring, threat detection and
              analytics for Zimbabwe's national ICT infrastructure.
            </p>

            <div style={styles.featureList}>
              {[
                { icon: <Network size={18} />, text: 'Live Router Monitoring' },
                { icon: <Shield size={18} />, text: 'Role-Based Access Control' },
                { icon: <Lock size={18} />, text: 'Secure Government Portal' },
              ].map((f, i) => (
                <div key={i} style={styles.featureItem}>
                  <span style={styles.featureIcon}>{f.icon}</span>
                  <span style={styles.featureText}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Demo credentials */}
          <div style={styles.demoBox}>
            <p style={styles.demoLabel}>Quick Access Credentials</p>
            <div style={styles.demoGrid}>
              {DEMO_CREDENTIALS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => fillDemo(i)}
                  style={{
                    ...styles.demoBtn,
                    border: `1px solid ${activeDemo === i ? c.color : 'rgba(255,255,255,0.15)'}`,
                    background: activeDemo === i ? `${c.color}22` : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <span
                    style={{
                      ...styles.demoDot,
                      background: c.color,
                    }}
                  />
                  <span style={styles.demoBtnLabel}>{c.label}</span>
                  <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right login card ── */}
        <div style={styles.cardWrap}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIconWrap}>
                <Lock size={22} color="#3b82f6" />
              </div>
              <div>
                <h3 style={styles.cardTitle}>Sign In</h3>
                <p style={styles.cardSub}>Access your network dashboard</p>
              </div>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={styles.form}>
              {/* Email */}
              <div style={styles.fieldWrap}>
                <label htmlFor="login-email" style={styles.label}>
                  Email Address
                </label>
                <div style={styles.inputWrap}>
                  <Mail size={16} style={styles.inputIcon} />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@ict.gov.zw"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); setActiveDemo(null); }}
                    style={styles.input}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={styles.fieldWrap}>
                <label htmlFor="login-password" style={styles.label}>
                  Password
                </label>
                <div style={styles.inputWrap}>
                  <Lock size={16} style={styles.inputIcon} />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); setActiveDemo(null); }}
                    style={{ ...styles.input, paddingRight: 44 }}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={styles.eyeBtn}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={isLoading}
                style={{
                  ...styles.submitBtn,
                  opacity: isLoading ? 0.75 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {isLoading ? (
                  <span style={styles.spinner} />
                ) : null}
                {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
              </button>
            </form>

            <p style={styles.footerNote}>
              🔒 Secured by Ministry of ICT · National Network Monitoring
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Inline styles (no Tailwind dependency for this standalone page) ─────────────── */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 45%, #0f172a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  gridOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)',
    backgroundSize: '50px 50px',
    pointerEvents: 'none',
  },
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(80px)',
    pointerEvents: 'none',
  },
  orb1: {
    width: 500,
    height: 500,
    background: 'rgba(59,130,246,0.12)',
    top: '-100px',
    left: '-100px',
  },
  orb2: {
    width: 400,
    height: 400,
    background: 'rgba(139,92,246,0.10)',
    bottom: '-80px',
    right: '20%',
  },
  orb3: {
    width: 300,
    height: 300,
    background: 'rgba(16,185,129,0.08)',
    top: '30%',
    right: '-60px',
  },
  layout: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    width: '100%',
    maxWidth: 1100,
    minHeight: '100vh',
    alignItems: 'stretch',
  },
  brandPanel: {
    flex: '0 0 420px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '60px 48px',
    borderRight: '1px solid rgba(255,255,255,0.06)',
  },
  brandContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  logoWrap: {
    width: 72,
    height: 72,
    background: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    boxShadow: '0 0 0 3px rgba(59,130,246,0.3), 0 8px 32px rgba(0,0,0,0.4)',
  },
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  brandTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    color: '#ffffff',
    letterSpacing: '-0.5px',
    lineHeight: 1.2,
  },
  brandSubtitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: '#3b82f6',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  brandDesc: {
    margin: 0,
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.7,
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginTop: 8,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    background: 'rgba(59,130,246,0.15)',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#60a5fa',
    flexShrink: 0,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: 500,
  },
  demoBox: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '20px 24px',
  },
  demoLabel: {
    margin: '0 0 12px',
    fontSize: 11,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  demoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  demoBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '100%',
    textAlign: 'left',
  },
  demoDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  demoBtnLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.85)',
  },
  cardWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 48px',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 20,
    padding: '40px 40px 32px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    background: 'rgba(59,130,246,0.15)',
    border: '1px solid rgba(59,130,246,0.3)',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: '#ffffff',
  },
  cardSub: {
    margin: '2px 0 0',
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '12px 14px',
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 10,
    color: '#fca5a5',
    fontSize: 13,
    marginBottom: 20,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  fieldWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.7)',
  },
  inputWrap: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(255,255,255,0.3)',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    color: '#ffffff',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
  },
  submitBtn: {
    marginTop: 8,
    padding: '14px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    border: 'none',
    borderRadius: 10,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: '0.3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0 4px 20px rgba(59,130,246,0.35)',
    transition: 'opacity 0.2s, transform 0.1s',
    width: '100%',
  },
  spinner: {
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
  footerNote: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
  },
};
