import React, { useState } from 'react';

export default function PartsList({ parts = [], tools = [] }) {
  const [checked, setChecked] = useState({});

  const toggle = (id) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const totalParts = parts.length;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Parts Checklist</h3>
          {totalParts > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              checkedCount === totalParts
                ? 'bg-green-800 text-green-200'
                : 'bg-gray-700 text-gray-300'
            }`}>
              {checkedCount}/{totalParts}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-1.5">
        {parts.length > 0 ? (
          <>
            {parts.map((part) => {
              const isChecked = !!checked[part.id];
              return (
                <button
                  key={part.id}
                  onClick={() => toggle(part.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150
                    ${isChecked
                      ? 'bg-green-900/30 border border-green-700/50'
                      : 'bg-gray-800/60 border border-gray-700/50 hover:bg-gray-800'}
                  `}
                >
                  {/* Checkbox */}
                  <div className={`
                    flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                    ${isChecked ? 'bg-green-600 border-green-600' : 'border-gray-600'}
                  `}>
                    {isChecked && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Part info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isChecked ? 'text-gray-400 line-through' : 'text-gray-200'}`}>
                      {part.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {part.id} · Qty: {part.quantity}
                    </p>
                  </div>

                  {/* Quantity badge */}
                  <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                    isChecked ? 'bg-green-800/50 text-green-400' : 'bg-gray-700 text-gray-300'
                  }`}>
                    ×{part.quantity}
                  </span>
                </button>
              );
            })}
          </>
        ) : (
          <div className="text-center text-gray-600 py-6">
            <p className="text-sm">No parts data available</p>
          </div>
        )}

        {/* Tools section */}
        {tools && tools.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Tools Needed
            </p>
            <div className="flex flex-wrap gap-2">
              {tools.map((tool, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 text-gray-300 text-xs px-2.5 py-1 rounded-full">
                  <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* All checked state */}
      {checkedCount === totalParts && totalParts > 0 && (
        <div className="px-4 py-3 mt-2">
          <div className="bg-green-900/40 border border-green-700/50 rounded-lg px-3 py-2 text-center">
            <p className="text-green-300 text-sm font-medium">All parts accounted for!</p>
          </div>
        </div>
      )}
    </div>
  );
}
