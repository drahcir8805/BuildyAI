import React from 'react';

export default function StepTracker({ steps = [], currentStep = 0 }) {
  const total = steps.length;
  const completed = currentStep;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">Progress</span>
          <span className="text-sm text-gray-400">
            {completed} / {total} steps
          </span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-right text-xs text-gray-500 mt-1">{progressPercent}% complete</p>
      </div>

      {/* Steps list */}
      <div className="flex-1 overflow-y-auto space-y-2 px-4 pb-4">
        {steps.map((step, index) => {
          const stepNum = step.stepNumber ?? index + 1;
          const isDone = stepNum <= currentStep;
          const isCurrent = stepNum === currentStep + 1;
          const isFuture = stepNum > currentStep + 1;

          return (
            <div
              key={stepNum}
              className={`
                rounded-xl border transition-all duration-300 overflow-hidden
                ${isCurrent
                  ? 'border-blue-500 bg-blue-950/60 shadow-lg shadow-blue-900/30'
                  : isDone
                  ? 'border-gray-700 bg-gray-900/40'
                  : 'border-gray-800 bg-gray-900/20'}
              `}
            >
              {/* Step header */}
              <div className={`flex items-center gap-3 px-4 py-3 ${isFuture ? 'opacity-40' : ''}`}>
                {/* Step icon */}
                <div className={`
                  flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${isCurrent
                    ? 'bg-blue-500 text-white'
                    : isDone
                    ? 'bg-green-700 text-white'
                    : 'bg-gray-700 text-gray-400'}
                `}>
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate ${
                    isCurrent ? 'text-blue-200' : isDone ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {step.title || `Step ${stepNum}`}
                  </p>
                </div>

                {/* Current badge */}
                {isCurrent && (
                  <span className="flex-shrink-0 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>

              {/* Expanded description for current step */}
              {isCurrent && (
                <div className="px-4 pb-4 pt-1 border-t border-blue-800/50">
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {step.description}
                  </p>
                  {step.warning && (
                    <div className="mt-3 flex gap-2 bg-yellow-900/30 border border-yellow-700/50 rounded-lg px-3 py-2">
                      <svg className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-yellow-300 text-xs">{step.warning}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {total === 0 && (
          <div className="text-center text-gray-600 py-8">
            <p className="text-sm">No steps loaded</p>
          </div>
        )}
      </div>
    </div>
  );
}
