import React, { useState, useCallback } from 'react';
import ProductSearch from './components/ProductSearch.jsx';
import StepTracker from './components/StepTracker.jsx';
import VoiceOrb from './components/VoiceOrb.jsx';
import PartsList from './components/PartsList.jsx';
import { useElevenLabs } from './hooks/useElevenLabs.js';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function App() {
  const [view, setView] = useState('search');
  const [error, setError] = useState('');
  const [loadingStep, setLoadingStep] = useState('');
  const [manualData, setManualData] = useState(null);
  const [signedUrl, setSignedUrl] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState('steps');

  const {
    startConversation,
    endConversation,
    status,
    isSpeaking,
    isListening,
    isActive,
    lastMessage,
  } = useElevenLabs();

  const handleProductSubmit = useCallback(async (submission) => {
    setError('');
    setView('loading');

    try {
      // Step 1: Parse manual
      setLoadingStep('Fetching and parsing your IKEA manual...');
      let parseRes;

      if (submission.type === 'file') {
        const formData = new FormData();
        formData.append('pdf', submission.file);
        parseRes = await fetch(`${BACKEND_URL}/api/manual/parse`, {
          method: 'POST',
          body: formData,
        });
      } else {
        const body =
          submission.type === 'url'
            ? { pdfUrl: submission.pdfUrl }
            : { articleNumber: submission.articleNumber };

        parseRes = await fetch(`${BACKEND_URL}/api/manual/parse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      if (!parseRes.ok) {
        const err = await parseRes.json().catch(() => ({ error: 'Parse failed' }));
        throw new Error(err.error || `Server error ${parseRes.status}`);
      }

      const parsed = await parseRes.json();
      setManualData(parsed);

      // Step 2: Update ElevenLabs agent with manual context
      setLoadingStep('Configuring your voice assistant...');
      const updateRes = await fetch(`${BACKEND_URL}/api/elevenlabs/update-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          steps: parsed.steps,
          productName: parsed.productName,
          parts: parsed.parts,
        }),
      });

      if (!updateRes.ok) {
        const err = await updateRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to configure voice assistant');
      }

      // Step 3: Get signed URL
      setLoadingStep('Getting secure voice connection...');
      const urlRes = await fetch(`${BACKEND_URL}/api/elevenlabs/signed-url`);

      if (!urlRes.ok) {
        const err = await urlRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to get voice connection URL');
      }

      const { signedUrl: url } = await urlRes.json();
      setSignedUrl(url);
      setCurrentStep(0);
      setView('assembly');
    } catch (err) {
      console.error('Setup error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setView('search');
    }
  }, []);

  const handleStartConversation = useCallback(async (url) => {
    try {
      await startConversation(url);
    } catch (err) {
      setError('Failed to start voice session. Check your microphone permissions.');
    }
  }, [startConversation]);

  const handleReset = useCallback(async () => {
    if (isActive) await endConversation();
    setManualData(null);
    setSignedUrl('');
    setCurrentStep(0);
    setError('');
    setView('search');
  }, [isActive, endConversation]);

  if (view === 'search') {
    return (
      <div className="min-h-screen bg-gray-950">
        {error && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4">
            <div className="bg-red-900/90 border border-red-700 rounded-xl px-4 py-3 flex items-start gap-3 shadow-xl">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-200">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        <ProductSearch onSubmit={handleProductSubmit} isLoading={false} />
      </div>
    );
  }

  if (view === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-6 px-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-gray-700 border-t-blue-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Setting up your assistant</h2>
          <p className="text-gray-400 text-sm">{loadingStep}</p>
        </div>
      </div>
    );
  }

  // Assembly view
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Back to search"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-white font-semibold text-sm leading-tight">
              {manualData?.productName || 'Assembly Assistant'}
            </h1>
            {manualData?.estimatedTime && (
              <p className="text-gray-500 text-xs">Est. time: {manualData.estimatedTime}</p>
            )}
          </div>
        </div>

        {/* Step counter badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-full">
            Step {currentStep} / {manualData?.steps?.length || 0}
          </span>
        </div>
      </header>

      {/* Last message ticker */}
      {lastMessage && (
        <div className="flex-shrink-0 bg-gray-900 border-b border-gray-800 px-4 py-2">
          <p className="text-xs text-gray-400 truncate">
            <span className="text-blue-400 font-medium mr-1">Assistant:</span>
            {lastMessage}
          </p>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Voice orb — center panel */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center py-10 px-4 lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-800">
          <VoiceOrb
            signedUrl={signedUrl}
            onStart={handleStartConversation}
            onEnd={endConversation}
            status={status}
            isSpeaking={isSpeaking}
            isListening={isListening}
            isActive={isActive}
          />

          {/* Step nav buttons */}
          {isActive && (
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                disabled={currentStep === 0}
                className="flex items-center gap-1 text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Prev
              </button>
              <button
                onClick={() => setCurrentStep((s) => Math.min(manualData?.steps?.length || 0, s + 1))}
                disabled={currentStep >= (manualData?.steps?.length || 0)}
                className="flex items-center gap-1 text-xs bg-blue-700 hover:bg-blue-600 disabled:opacity-30 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Next
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Right panel — steps + parts */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex-shrink-0 flex border-b border-gray-800">
            {[
              { key: 'steps', label: 'Steps', count: manualData?.steps?.length },
              { key: 'parts', label: 'Parts', count: manualData?.parts?.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
                {tab.count != null && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? 'bg-blue-700 text-blue-100' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden pt-4">
            {activeTab === 'steps' && (
              <StepTracker
                steps={manualData?.steps || []}
                currentStep={currentStep}
              />
            )}
            {activeTab === 'parts' && (
              <PartsList
                parts={manualData?.parts || []}
                tools={manualData?.tools || []}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
