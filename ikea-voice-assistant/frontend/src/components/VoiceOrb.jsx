import React, { useEffect, useState } from 'react';

const STATUS_CONFIG = {
  idle: {
    label: 'Tap to Start',
    sublabel: 'Ready when you are',
    bg: 'bg-gray-800',
    border: 'border-gray-600',
    glow: 'shadow-gray-700/40',
    iconColor: 'text-gray-300',
  },
  connecting: {
    label: 'Connecting...',
    sublabel: 'Setting up voice session',
    bg: 'bg-blue-900',
    border: 'border-blue-600',
    glow: 'shadow-blue-600/50',
    iconColor: 'text-blue-300',
  },
  connected: {
    label: 'Listening',
    sublabel: 'Speak now',
    bg: 'bg-blue-700',
    border: 'border-blue-400',
    glow: 'shadow-blue-500/60',
    iconColor: 'text-white',
  },
  listening: {
    label: 'Listening',
    sublabel: 'Speak now',
    bg: 'bg-blue-700',
    border: 'border-blue-400',
    glow: 'shadow-blue-500/60',
    iconColor: 'text-white',
  },
  speaking: {
    label: 'Speaking',
    sublabel: 'Assistant is talking',
    bg: 'bg-purple-700',
    border: 'border-purple-400',
    glow: 'shadow-purple-500/60',
    iconColor: 'text-white',
  },
  error: {
    label: 'Error',
    sublabel: 'Tap to retry',
    bg: 'bg-red-900',
    border: 'border-red-600',
    glow: 'shadow-red-600/40',
    iconColor: 'text-red-300',
  },
};

function WaveBars() {
  return (
    <div className="flex items-center gap-1 h-8">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-1 bg-white rounded-full"
          style={{
            height: '100%',
            animation: `wave 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

function PulseRings({ color = 'border-blue-400' }) {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`absolute inset-0 rounded-full border-2 ${color} opacity-0`}
          style={{
            animation: 'pulseRing 1.8s ease-out infinite',
            animationDelay: `${i * 0.6}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.7); opacity: 0; }
        }
      `}</style>
    </>
  );
}

export default function VoiceOrb({ signedUrl, onStart, onEnd, status, isSpeaking, isListening, isActive }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (status === 'connecting') {
      const interval = setInterval(() => {
        setDots((d) => (d.length >= 3 ? '' : d + '.'));
      }, 400);
      return () => clearInterval(interval);
    }
    setDots('');
  }, [status]);

  const displayStatus = isSpeaking ? 'speaking' : isListening ? 'listening' : status;
  const config = STATUS_CONFIG[displayStatus] || STATUS_CONFIG.idle;

  const handleClick = async () => {
    if (status === 'connecting') return;
    if (isActive) {
      onEnd();
    } else {
      onStart(signedUrl);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Orb container */}
      <div className="relative flex items-center justify-center">
        {/* Pulse rings — shown when listening */}
        {(isListening || status === 'connected') && !isSpeaking && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-36 h-36">
              <PulseRings color="border-blue-400" />
            </div>
          </div>
        )}

        {/* Main orb button */}
        <button
          onClick={handleClick}
          disabled={status === 'connecting'}
          className={`
            relative z-10 w-36 h-36 rounded-full border-2
            ${config.bg} ${config.border}
            flex items-center justify-center
            transition-all duration-300 ease-in-out
            shadow-2xl ${config.glow}
            hover:scale-105 active:scale-95
            disabled:cursor-not-allowed disabled:opacity-80
          `}
          style={{ boxShadow: `0 0 40px var(--glow-color, rgba(59,130,246,0.3))` }}
          aria-label={isActive ? 'End conversation' : 'Start conversation'}
        >
          {/* Inner content */}
          <div className="flex flex-col items-center gap-2">
            {isSpeaking ? (
              <WaveBars />
            ) : status === 'connecting' ? (
              <svg className={`w-10 h-10 animate-spin ${config.iconColor}`} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className={`w-10 h-10 ${config.iconColor}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </div>
        </button>
      </div>

      {/* Status text */}
      <div className="text-center">
        <p className="text-white font-semibold text-lg">
          {config.label}{status === 'connecting' ? dots : ''}
        </p>
        <p className="text-gray-400 text-sm mt-0.5">{config.sublabel}</p>
      </div>

      {/* End session button — shown when active */}
      {isActive && (
        <button
          onClick={onEnd}
          className="text-xs text-red-400 hover:text-red-300 border border-red-800 hover:border-red-600 px-4 py-1.5 rounded-full transition-colors"
        >
          End Session
        </button>
      )}
    </div>
  );
}
