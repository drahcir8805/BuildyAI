import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useElevenLabs } from './hooks/useElevenLabs.js';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// ── Animated wave bars (agent speaking) ────────────────────────────────────
function WaveBars() {
  return (
    <div className="flex items-end justify-center gap-[3px] h-10 w-10">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-[4px] bg-white rounded-full"
          style={{
            height: '100%',
            animation: 'waveBar 1.1s ease-in-out infinite',
            animationDelay: `${i * 0.11}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Pulse rings (user speaking / listening) ────────────────────────────────
function PulseRings() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-0"
          style={{
            animation: 'pulseRing 2s ease-out infinite',
            animationDelay: `${i * 0.65}s`,
          }}
        />
      ))}
    </>
  );
}

// ── Step card shown below orb after instructions load ──────────────────────
function StepCard({ steps, currentStep, onPrev, onNext }) {
  if (!steps || steps.length === 0) return null;

  const step = steps[currentStep];
  if (!step) return null;

  return (
    <div className="w-full max-w-sm bg-gray-900/80 backdrop-blur border border-gray-700 rounded-2xl p-4 space-y-2 animate-fadeIn">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-wider">
          Step {step.stepNumber} of {steps.length}
        </span>
        <div className="flex gap-1">
          <button
            onClick={onPrev}
            disabled={currentStep === 0}
            className="p-1 rounded-lg text-gray-500 hover:text-white disabled:opacity-20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={onNext}
            disabled={currentStep >= steps.length - 1}
            className="p-1 rounded-lg text-gray-500 hover:text-white disabled:opacity-20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-white font-semibold text-sm leading-snug">{step.title}</p>
      <p className="text-gray-400 text-xs leading-relaxed">{step.description}</p>

      {step.warning && (
        <div className="flex gap-2 items-start bg-yellow-950/50 border border-yellow-700/40 rounded-lg px-3 py-2">
          <svg className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-yellow-300 text-xs">{step.warning}</p>
        </div>
      )}

      {/* Progress dots */}
      <div className="flex gap-1 pt-1 justify-center">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === currentStep
                ? 'w-4 bg-blue-400'
                : i < currentStep
                ? 'w-1.5 bg-green-600'
                : 'w-1.5 bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [signedUrl, setSignedUrl] = useState('');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [manualData, setManualData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [searchingLabel, setSearchingLabel] = useState('');

  const handleManualFound = useCallback((data) => {
    setManualData(data);
    setCurrentStep(0);
    setSearchingLabel('');
  }, []);

  const { startConversation, endConversation, status, isSpeaking, isListening, isActive, lastMessage } =
    useElevenLabs({ onManualFound: handleManualFound });

  // Setup agent + get signed URL on mount
  useEffect(() => {
    async function init() {
      try {
        const [setupRes, urlRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/elevenlabs/setup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }),
          fetch(`${BACKEND_URL}/api/elevenlabs/signed-url`),
        ]);

        if (!setupRes.ok || !urlRes.ok) throw new Error('Backend setup failed');

        const { signedUrl: url } = await urlRes.json();
        setSignedUrl(url);
        setReady(true);
      } catch (err) {
        setError('Could not connect to backend. Make sure it is running on port 3001.');
      }
    }
    init();
  }, []);

  // Detect when Claude is searching (looking for a tool-call-like phrase in lastMessage)
  useEffect(() => {
    if (lastMessage && !manualData) {
      const lower = lastMessage.toLowerCase();
      if (lower.includes('searching') || lower.includes('looking up') || lower.includes('find') || lower.includes('one moment')) {
        setSearchingLabel('Searching...');
      }
    }
  }, [lastMessage, manualData]);

  const handleOrbClick = useCallback(async () => {
    if (!ready || status === 'connecting') return;
    if (isActive) {
      await endConversation();
      setManualData(null);
      setCurrentStep(0);
      setSearchingLabel('');
      // Refresh signed URL for next session
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
  }, [ready, status, isActive, signedUrl, startConversation, endConversation]);

  // ── Orb visual state ────────────────────────────────────────────────────
  const orbState = isSpeaking ? 'speaking' : isListening ? 'listening' : status;

  const orbStyles = {
    idle: {
      bg: 'bg-gray-800',
      border: 'border-gray-600',
      shadow: '0 0 30px rgba(99,102,241,0.15)',
      label: ready ? 'Tap to start' : 'Connecting...',
      sub: ready ? 'Speak what you\'re building' : 'Setting up assistant',
    },
    connecting: {
      bg: 'bg-indigo-950',
      border: 'border-indigo-600',
      shadow: '0 0 40px rgba(99,102,241,0.4)',
      label: 'Connecting',
      sub: '',
    },
    connected: {
      bg: 'bg-blue-800',
      border: 'border-blue-400',
      shadow: '0 0 50px rgba(59,130,246,0.5)',
      label: 'Listening',
      sub: 'Tell me what you\'re building',
    },
    listening: {
      bg: 'bg-blue-700',
      border: 'border-blue-400',
      shadow: '0 0 60px rgba(59,130,246,0.6)',
      label: 'Listening',
      sub: 'Say what you\'re building',
    },
    speaking: {
      bg: 'bg-violet-700',
      border: 'border-violet-400',
      shadow: '0 0 60px rgba(139,92,246,0.6)',
      label: 'Speaking',
      sub: '',
    },
    error: {
      bg: 'bg-red-900',
      border: 'border-red-600',
      shadow: '0 0 30px rgba(239,68,68,0.3)',
      label: 'Error',
      sub: 'Tap to retry',
    },
  };

  const s = orbStyles[orbState] || orbStyles.idle;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow background */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: isSpeaking
            ? 'radial-gradient(ellipse at center, rgba(139,92,246,0.08) 0%, transparent 70%)'
            : isListening
            ? 'radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, transparent 70%)'
            : 'none',
        }}
      />

      {/* Header */}
      <p className="absolute top-6 text-gray-600 text-sm tracking-widest uppercase select-none">
        Assembly Assistant
      </p>

      {/* Product name badge — shows after tool fires */}
      {manualData?.productName && (
        <div className="absolute top-14 flex items-center gap-2 bg-gray-800/70 border border-gray-700 px-3 py-1.5 rounded-full animate-fadeIn">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-gray-200 text-sm font-medium">{manualData.productName}</span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="absolute top-20 max-w-sm w-full mx-4 bg-red-900/80 border border-red-700 rounded-xl px-4 py-3 flex items-start gap-2">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-200 text-sm flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── THE ORB ── */}
      <div className="flex flex-col items-center gap-8">
        <div className="relative flex items-center justify-center">
          {/* Pulse rings */}
          {(isListening || status === 'connected') && !isSpeaking && (
            <div className="absolute w-48 h-48 flex items-center justify-center">
              <PulseRings />
            </div>
          )}

          {/* Orb button */}
          <button
            onClick={handleOrbClick}
            disabled={!ready && !isActive}
            className={`
              relative z-10 w-44 h-44 rounded-full border-2
              ${s.bg} ${s.border}
              flex items-center justify-center
              transition-all duration-500 ease-in-out
              hover:scale-105 active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed
              focus:outline-none
            `}
            style={{ boxShadow: s.shadow }}
          >
            {isSpeaking ? (
              <WaveBars />
            ) : status === 'connecting' ? (
              <svg className="w-12 h-12 text-indigo-300 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : !ready ? (
              <svg className="w-12 h-12 text-gray-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-14 h-14 text-white opacity-90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </button>
        </div>

        {/* Status label */}
        <div className="text-center min-h-[3rem]">
          <p className="text-white font-semibold text-xl">{s.label}</p>
          {searchingLabel && !manualData ? (
            <p className="text-blue-400 text-sm mt-1 animate-pulse">{searchingLabel}</p>
          ) : s.sub ? (
            <p className="text-gray-500 text-sm mt-1">{s.sub}</p>
          ) : null}
        </div>

        {/* Step card — slides in once instructions are found */}
        {manualData?.steps?.length > 0 && isActive && (
          <StepCard
            steps={manualData.steps}
            currentStep={currentStep}
            onPrev={() => setCurrentStep((n) => Math.max(0, n - 1))}
            onNext={() => setCurrentStep((n) => Math.min(manualData.steps.length - 1, n + 1))}
          />
        )}
      </div>

      {/* CSS keyframes */}
      <style>{`
        @keyframes pulseRing {
          0%   { transform: scale(1);   opacity: 0.55; }
          100% { transform: scale(1.75); opacity: 0; }
        }
        @keyframes waveBar {
          0%, 100% { transform: scaleY(0.25); }
          50%       { transform: scaleY(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}
