import React, { useState, useEffect, useCallback } from 'react';
import { useElevenLabs } from './hooks/useElevenLabs.js';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/* ── Design tokens (inline, matching colors_and_type.css) ─────────────── */
const C = {
  purple:      '#8B5CF6',
  purpleDeep:  '#6D28D9',
  purpleSoft:  '#A78BFA',
  yellow:      '#FCD34D',
  bg:          'radial-gradient(ellipse at center, #2D1B69 0%, #0F0720 70%)',
  glass:       'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.10)',
  fg1:         '#FFFFFF',
  fg2:         'rgba(255,255,255,0.78)',
  fg3:         'rgba(255,255,255,0.56)',
  fg4:         'rgba(255,255,255,0.36)',
  success:     '#34D399',
  danger:      '#F87171',
};

const glassStyle = {
  background: C.glass,
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: `1px solid ${C.glassBorder}`,
  borderRadius: '24px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
};

/* ── SVG: Buildy logo (hammer + speech bubble) ─────────────────────────── */
function BuildyLogo() {
  return (
    <svg viewBox="0 0 100 100" width="80" height="80" aria-label="Buildy" role="img">
      <path
        d="M62 28 a22 22 0 1 1 -14.5 38.5 L36 71 l3-9.2 A22 22 0 0 1 62 28 Z"
        fill="none" stroke="#FCD34D" strokeWidth="5" strokeLinejoin="round" />
      <g fill="#FCD34D">
        <rect x="55" y="44" width="3.5" height="12" rx="1.75" />
        <rect x="61" y="38" width="3.5" height="24" rx="1.75" />
        <rect x="67" y="44" width="3.5" height="12" rx="1.75" />
      </g>
      <g transform="rotate(-18 45 50)">
        <path d="M22 22 H50 a4 4 0 0 1 4 4 V36 a4 4 0 0 1 -4 4 H40 V44 a3 3 0 0 1 -3 3 H35 a3 3 0 0 1 -3 -3 V40 H22 a4 4 0 0 1 -4 -4 V26 a4 4 0 0 1 4 -4 Z"
              fill="#8B5CF6" />
        <path d="M32 47 H40 V78 a4 4 0 0 1 -4 4 H36 a4 4 0 0 1 -4 -4 Z" fill="#8B5CF6" />
        <circle cx="36" cy="77" r="1.6" fill="#2D1B69" />
      </g>
    </svg>
  );
}

/* ── SVG: Mic icon ─────────────────────────────────────────────────────── */
function MicIcon({ size = 88 }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} aria-hidden="true">
      <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3z" />
      <path d="M17 11a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" />
    </svg>
  );
}

/* ── Idle orb: purple gradient + rotating yellow conic ring + mic ────── */
function IdleOrb({ connecting }) {
  return (
    <>
      {/* Purple glow */}
      <span className="absolute inset-0 rounded-full" style={{
        boxShadow: '0 0 60px rgba(139,92,246,0.45), 0 0 140px rgba(139,92,246,0.25)',
      }} />

      {/* Rotating yellow glow ring */}
      <span className="buildy-orb-idle-ring" style={{
        position: 'absolute', inset: '-8px', borderRadius: '50%',
      }}>
        <span className="absolute inset-0 rounded-full" style={{
          background: 'conic-gradient(from 0deg, transparent 0deg, rgba(252,211,77,0.55) 60deg, transparent 140deg, transparent 360deg)',
          filter: 'blur(8px)',
        }} />
      </span>

      {/* Orb surface */}
      <span className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center" style={{
        background: 'radial-gradient(circle at 30% 25%, #A78BFA 0%, #8B5CF6 40%, #6D28D9 75%, #4C1D95 100%)',
        border: '1px solid rgba(255,255,255,0.25)',
      }}>
        {/* Specular highlight */}
        <span className="absolute rounded-full" style={{
          top: '12%', left: '18%', width: '40%', height: '28%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.45) 0%, transparent 70%)',
        }} />
        {/* Icon */}
        <span className="relative text-white">
          {connecting
            ? <svg className="animate-spin" width="64" height="64" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.22)" strokeWidth="4" />
                <path fill="rgba(255,255,255,0.85)" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            : <MicIcon />
          }
        </span>
      </span>
    </>
  );
}

/* ── Listening orb: pulse rings + bright orb + mic ───────────────────── */
function ListeningOrb() {
  return (
    <>
      {[0, 1, 2].map(i => (
        <span key={i} className="absolute inset-0 rounded-full buildy-pulse-ring" style={{
          border: '2px solid #FCD34D',
          animationDelay: `${i * 0.7}s`,
        }} />
      ))}

      <span className="absolute inset-0 rounded-full" style={{
        boxShadow: '0 0 80px rgba(252,211,77,0.55), 0 0 160px rgba(252,211,77,0.30)',
      }} />

      <span className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center" style={{
        background: 'radial-gradient(circle at 30% 25%, #C4B5FD 0%, #A78BFA 35%, #8B5CF6 75%, #6D28D9 100%)',
        border: '1.5px solid rgba(252,211,77,0.55)',
      }}>
        <span className="absolute rounded-full" style={{
          top: '12%', left: '18%', width: '40%', height: '28%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, transparent 70%)',
        }} />
        <span className="relative text-white"><MicIcon /></span>
      </span>
    </>
  );
}

/* ── Speaking orb: liquid blob + conic gradient + audio bars ─────────── */
function SpeakingOrb() {
  const barHeights = [40, 56, 72, 56, 40];
  return (
    <>
      <span className="absolute inset-0 rounded-full" style={{
        boxShadow: '0 0 80px rgba(139,92,246,0.65), 0 0 160px rgba(252,211,77,0.30)',
      }} />

      <span className="relative w-full h-full buildy-blob-morph overflow-hidden" style={{
        border: '1.5px solid rgba(255,255,255,0.25)',
      }}>
        {/* Rotating gradient fill */}
        <span className="absolute inset-0 buildy-blob-shimmer" style={{
          background: 'conic-gradient(from 0deg, #FCD34D 0deg, #A78BFA 90deg, #8B5CF6 180deg, #6D28D9 270deg, #FCD34D 360deg)',
        }} />
        {/* Center vignette */}
        <span className="absolute inset-0" style={{
          background: 'radial-gradient(circle at center, rgba(45,27,105,0.35) 0%, transparent 70%)',
        }} />
        {/* Audio bars */}
        <span className="absolute inset-0 flex items-center justify-center gap-2">
          {barHeights.map((h, i) => (
            <span key={i} className="buildy-bar rounded-full" style={{
              width: '8px',
              height: `${h}px`,
              background: 'rgba(255,255,255,0.95)',
              animationDelay: `${i * 0.12}s`,
              boxShadow: '0 0 12px rgba(255,255,255,0.6)',
            }} />
          ))}
        </span>
      </span>
    </>
  );
}

/* ── Orb button (280px, 3 states) ──────────────────────────────────────── */
function Orb({ orbState, onClick, disabled, connecting }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={`Voice orb — ${orbState}`}
      style={{
        position: 'relative',
        width: '280px',
        height: '280px',
        borderRadius: '50%',
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
        transition: 'transform 300ms cubic-bezier(0.4,0,0.2,1), opacity 300ms',
        outline: 'none',
        flexShrink: 0,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = 'scale(1.04)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={e => { if (!disabled) e.currentTarget.style.transform = 'scale(1.04)'; }}
    >
      {orbState === 'idle'      && <IdleOrb connecting={connecting} />}
      {orbState === 'listening' && <ListeningOrb />}
      {orbState === 'speaking'  && <SpeakingOrb />}
    </button>
  );
}

/* ── Parts Checklist (left glass card) ────────────────────────────────── */
function PartsCard({ parts, checkedParts, onToggle }) {
  const checkedCount = Object.values(checkedParts).filter(Boolean).length;
  const total = parts.length;

  return (
    <div className="glass-card p-6 flex flex-col gap-3" style={{ maxHeight: '72vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <h2 style={{ color: C.yellow, fontWeight: 700, fontSize: '18px', margin: 0 }}>
          Parts Checklist
        </h2>
        {total > 0 && (
          <span style={{ color: C.fg3, fontSize: '14px', fontWeight: 600 }}>
            {checkedCount}/{total}
          </span>
        )}
      </div>

      {/* Scrollable list */}
      <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {total === 0 ? (
          <p style={{ color: C.fg4, fontSize: '14px', textAlign: 'center', padding: '32px 0', margin: 0 }}>
            Say what you're building to load your parts list
          </p>
        ) : (
          parts.map(part => {
            const checked = !!checkedParts[part.id];
            return (
              <button
                key={part.id}
                onClick={() => onToggle(part.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: checked ? 'rgba(252,211,77,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${checked ? 'rgba(252,211,77,0.35)' : 'rgba(255,255,255,0.08)'}`,
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'all 200ms cubic-bezier(0.4,0,0.2,1)',
                  fontFamily: 'inherit',
                }}
              >
                {/* Checkbox */}
                <span style={{
                  flexShrink: 0, width: '20px', height: '20px', borderRadius: '6px',
                  border: `2px solid ${checked ? C.yellow : 'rgba(255,255,255,0.30)'}`,
                  background: checked ? C.yellow : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 200ms',
                }}>
                  {checked && (
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#1a1a1a" strokeWidth="3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>

                {/* Name */}
                <span style={{
                  flex: 1, fontSize: '14px', fontWeight: 500,
                  color: checked ? C.fg4 : C.fg2,
                  textDecoration: checked ? 'line-through' : 'none',
                  transition: 'all 200ms',
                }}>
                  {part.name}
                </span>

                {/* Qty */}
                <span style={{
                  fontSize: '13px', fontWeight: 600,
                  color: checked ? 'rgba(252,211,77,0.55)' : C.fg4,
                }}>
                  ×{part.quantity}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* All-clear banner */}
      {checkedCount === total && total > 0 && (
        <div className="buildy-fade-up" style={{
          background: 'rgba(52,211,153,0.12)',
          border: '1px solid rgba(52,211,153,0.35)',
          borderRadius: '12px',
          padding: '10px 14px',
          textAlign: 'center',
          color: C.success,
          fontSize: '13px',
          fontWeight: 700,
          flexShrink: 0,
        }}>
          All parts accounted for!
        </div>
      )}
    </div>
  );
}

/* ── Current Step card (right glass card) ──────────────────────────────── */
function StepCard({ steps, currentStepIndex, onPrev, onNext }) {
  const total = steps.length;
  const step = steps[currentStepIndex];
  const stepNum = currentStepIndex + 1;
  const pct = total > 0 ? (stepNum / total) * 100 : 0;

  return (
    <div className="glass-card p-6 flex flex-col gap-4" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
      <h2 style={{ color: C.yellow, fontWeight: 700, fontSize: '18px', margin: 0, flexShrink: 0 }}>
        Current Step
      </h2>

      {!step ? (
        <p style={{ color: C.fg4, fontSize: '14px', margin: 0, padding: '32px 0' }}>
          Your steps will appear here once assembly begins
        </p>
      ) : (
        <>
          {/* Giant step number */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', lineHeight: 1 }}>
            <span style={{
              fontSize: '96px', fontWeight: 900, lineHeight: 1,
              letterSpacing: '-0.04em', color: C.fg1,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {String(stepNum).padStart(2, '0')}
            </span>
            <span style={{ paddingBottom: '14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ color: C.fg4, fontSize: '20px', fontWeight: 600 }}>/</span>
              <span style={{ color: C.fg4, fontSize: '18px', fontWeight: 600 }}>
                {String(total).padStart(2, '0')}
              </span>
            </span>
          </div>

          {/* Title */}
          {step.title && (
            <p style={{ fontWeight: 700, fontSize: '15px', color: C.fg1, margin: 0, marginTop: '-8px' }}>
              {step.title}
            </p>
          )}

          {/* Description */}
          <p style={{ color: C.fg2, fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
            {step.description}
          </p>

          {/* Warning */}
          {step.warning && (
            <div style={{
              background: 'rgba(252,211,77,0.10)',
              border: '1px solid rgba(252,211,77,0.28)',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex', gap: '8px', alignItems: 'flex-start',
            }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                   stroke={C.yellow} strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span style={{ color: C.yellow, fontSize: '13px', fontWeight: 500 }}>{step.warning}</span>
            </div>
          )}

          {/* Progress bar */}
          <div>
            <div style={{
              height: '6px',
              background: 'rgba(255,255,255,0.10)',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                background: C.yellow,
                borderRadius: '9999px',
                transition: 'width 500ms cubic-bezier(0.4,0,0.2,1)',
              }} />
            </div>
            <p style={{
              fontSize: '12px', fontWeight: 600, margin: '8px 0 0',
              color: C.fg4, textTransform: 'uppercase', letterSpacing: '0.12em',
            }}>
              {stepNum} of {total} steps
            </p>
          </div>

          {/* Prev / Next */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { label: '← Prev', action: onPrev, disabled: currentStepIndex === 0 },
              { label: 'Next →', action: onNext, disabled: currentStepIndex >= total - 1, accent: true },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={btn.action}
                disabled={btn.disabled}
                style={{
                  flex: 1, padding: '9px',
                  borderRadius: '10px',
                  background: btn.disabled ? 'rgba(255,255,255,0.04)' : btn.accent ? 'rgba(252,211,77,0.14)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${btn.disabled ? 'rgba(255,255,255,0.08)' : btn.accent ? 'rgba(252,211,77,0.28)' : 'rgba(255,255,255,0.10)'}`,
                  color: btn.disabled ? C.fg4 : btn.accent ? C.yellow : C.fg3,
                  fontSize: '13px', fontWeight: 700,
                  cursor: btn.disabled ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 200ms',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main App ──────────────────────────────────────────────────────────── */
export default function App() {
  const [ready, setReady]                   = useState(false);
  const [signedUrl, setSignedUrl]           = useState('');
  const [error, setError]                   = useState('');
  const [manualData, setManualData]         = useState(null);
  const [currentStepIndex, setCurrentStep] = useState(0);
  const [checkedParts, setCheckedParts]     = useState({});

  const handleManualFound = useCallback((data) => {
    setManualData(data);
    setCurrentStep(0);
    setCheckedParts({});
  }, []);

  const { startConversation, endConversation, status, isSpeaking, isListening, isActive } =
    useElevenLabs({ onManualFound: handleManualFound });

  /* Initialize: configure agent + fetch signed URL */
  useEffect(() => {
    (async () => {
      try {
        const [setupRes, urlRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/elevenlabs/setup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{}',
          }),
          fetch(`${BACKEND_URL}/api/elevenlabs/signed-url`),
        ]);
        if (!setupRes.ok || !urlRes.ok) throw new Error();
        const { signedUrl: url } = await urlRes.json();
        setSignedUrl(url);
        setReady(true);
      } catch {
        setError('Could not connect to backend. Make sure it is running on port 3001.');
      }
    })();
  }, []);

  /* Derive orb state from hook */
  const connecting = status === 'connecting';
  const orbState = isSpeaking ? 'speaking'
    : (isListening || status === 'connected') ? 'listening'
    : 'idle';

  const handleOrbClick = useCallback(async () => {
    if (!ready || connecting) return;
    if (isActive) {
      await endConversation();
      setManualData(null);
      setCurrentStep(0);
      try {
        const res = await fetch(`${BACKEND_URL}/api/elevenlabs/signed-url`);
        const { signedUrl: url } = await res.json();
        setSignedUrl(url);
      } catch {}
    } else {
      try {
        await startConversation(signedUrl);
      } catch {
        setError('Could not start voice session. Allow microphone access and try again.');
      }
    }
  }, [ready, connecting, isActive, signedUrl, startConversation, endConversation]);

  const togglePart = useCallback((id) => {
    setCheckedParts(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      color: C.fg1,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Nunito', system-ui, -apple-system, sans-serif",
    }}>
      {/* Atmosphere orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-120px', left: '-100px',
          width: '520px', height: '520px', borderRadius: '50%',
          background: 'rgba(139,92,246,0.35)', filter: 'blur(80px)', opacity: 0.7,
        }} />
        <div style={{
          position: 'absolute', bottom: '-180px', right: '-140px',
          width: '620px', height: '620px', borderRadius: '50%',
          background: 'rgba(109,40,217,0.30)', filter: 'blur(90px)', opacity: 0.7,
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '55%',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'rgba(252,211,77,0.10)', filter: 'blur(80px)', opacity: 0.6,
        }} />
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 50, maxWidth: '420px', width: 'calc(100% - 32px)',
          background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.35)',
          borderRadius: '14px', padding: '12px 16px',
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          backdropFilter: 'blur(16px)',
        }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
               stroke={C.danger} strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span style={{ flex: 1, fontSize: '14px', color: C.danger }}>{error}</span>
          <button onClick={() => setError('')}
                  style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer', padding: 0 }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* 3-column grid */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'grid',
        gridTemplateColumns: '1fr 2fr 1fr',
        gap: '24px',
        minHeight: '100vh',
        alignItems: 'center',
        padding: '40px 32px',
      }}>

        {/* ── LEFT: Parts Checklist ── */}
        <div>
          <PartsCard
            parts={manualData?.parts || []}
            checkedParts={checkedParts}
            onToggle={togglePart}
          />
        </div>

        {/* ── CENTER: Brand lockup + Orb ── */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center', gap: 0,
        }}>
          {/* Logo */}
          <BuildyLogo />

          {/* "buildy" wordmark */}
          <h1 style={{
            fontSize: '64px', fontWeight: 900, lineHeight: 1,
            letterSpacing: '-0.02em', color: C.fg1,
            margin: '16px 0 0',
          }}>
            buildy
          </h1>

          {/* Subtitle eyebrow */}
          <p style={{
            marginTop: '12px', fontSize: '13px', fontWeight: 700,
            letterSpacing: '0.22em', textTransform: 'uppercase', color: C.fg3,
          }}>
            Your AI Assembly Assistant
          </p>

          {/* Product name pill — fades in when data loads */}
          {manualData?.productName ? (
            <div className="buildy-fade-up" style={{
              marginTop: '16px',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(252,211,77,0.10)',
              border: '1px solid rgba(252,211,77,0.30)',
              borderRadius: '9999px', padding: '6px 18px',
            }}>
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: C.yellow, display: 'inline-block', flexShrink: 0,
              }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: C.fg2 }}>
                {manualData.productName}
              </span>
            </div>
          ) : (
            <div style={{ height: '38px' }} /> /* reserved height so orb stays put */
          )}

          {/* The Orb */}
          <div style={{ marginTop: '32px' }}>
            <Orb
              orbState={orbState}
              onClick={handleOrbClick}
              disabled={!ready && !isActive}
              connecting={connecting}
            />
          </div>

          {/* Status label + End Session */}
          <div style={{
            marginTop: '24px', minHeight: '72px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
          }}>
            <p style={{
              fontSize: '18px', fontWeight: 700,
              color: C.fg2, letterSpacing: '0.01em', margin: 0,
            }}>
              {orbState === 'idle'      && (ready ? 'Tap to Start' : 'Connecting…')}
              {orbState === 'listening' && 'Listening…'}
              {orbState === 'speaking'  && 'Buildy is speaking…'}
            </p>

            {isActive && (
              <button
                className="buildy-fade-up"
                onClick={() => endConversation()}
                style={{
                  fontSize: '14px', fontWeight: 700, letterSpacing: '0.03em',
                  color: C.fg3, background: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  border: '1px solid rgba(255,255,255,0.12)', borderRadius: '9999px',
                  padding: '8px 22px',
                  transition: 'color 300ms, border-color 300ms',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = C.fg1;
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = C.fg3;
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                }}
              >
                End Session
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT: Current Step ── */}
        <div>
          <StepCard
            steps={manualData?.steps || []}
            currentStepIndex={currentStepIndex}
            onPrev={() => setCurrentStep(i => Math.max(0, i - 1))}
            onNext={() => setCurrentStep(i => Math.min((manualData?.steps?.length || 1) - 1, i + 1))}
          />
        </div>
      </div>
    </div>
  );
}
