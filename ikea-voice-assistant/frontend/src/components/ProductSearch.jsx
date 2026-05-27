import React, { useState, useRef } from 'react';

export default function ProductSearch({ onSubmit, isLoading }) {
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState('article');
  const [fileName, setFileName] = useState('');
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFileName(file.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (inputType === 'file') {
      const file = fileRef.current?.files[0];
      if (!file) return;
      onSubmit({ type: 'file', file });
    } else if (inputType === 'url') {
      if (!input.trim()) return;
      onSubmit({ type: 'url', pdfUrl: input.trim() });
    } else {
      if (!input.trim()) return;
      onSubmit({ type: 'article', articleNumber: input.trim() });
    }
  };

  const placeholders = {
    article: 'e.g. 503.498.48 or 50349848',
    url: 'https://www.ikea.com/us/en/assembly_instructions/...',
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-600 mb-4 shadow-lg shadow-blue-600/30">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">IKEA Assembly Assistant</h1>
          <p className="text-gray-400">Your AI-powered voice guide for furniture assembly</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">Load Your Assembly Manual</h2>

          {/* Input type tabs */}
          <div className="flex rounded-lg overflow-hidden border border-gray-700 mb-6">
            {[
              { key: 'article', label: 'Article Number' },
              { key: 'url', label: 'PDF URL' },
              { key: 'file', label: 'Upload PDF' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setInputType(tab.key); setInput(''); setFileName(''); }}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  inputType === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {inputType === 'file' ? (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors group"
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <svg className="w-10 h-10 text-gray-600 group-hover:text-blue-400 mx-auto mb-3 transition-colors"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {fileName ? (
                  <p className="text-blue-400 font-medium">{fileName}</p>
                ) : (
                  <>
                    <p className="text-gray-400 mb-1">Click to upload your IKEA manual PDF</p>
                    <p className="text-gray-600 text-sm">PDF files up to 20MB</p>
                  </>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {inputType === 'article' ? 'Article Number' : 'PDF URL'}
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={placeholders[inputType]}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                {inputType === 'article' && (
                  <p className="text-xs text-gray-600 mt-2">
                    Find the article number on the product page or packaging label
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (inputType === 'file' ? !fileName : !input.trim())}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Load Manual
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Powered by ElevenLabs Conversational AI + Claude
        </p>
      </div>
    </div>
  );
}
