import React from 'react';

interface Step {
  key: string;
  label: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: string;
}

const StepProgress: React.FC<StepProgressProps> = ({ steps, currentStep }) => {
  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  return (
    <>
      {/* Mobile stepper (dots) */}
      <div className="sm:hidden">
        <nav className="flex justify-center" aria-label="Progress">
          <ol className="flex items-center space-x-5">
            {steps.map((step) => (
              <li key={step.key}>
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    currentStep === step.key 
                      ? 'bg-indigo-600' 
                      : currentStepIndex > steps.findIndex(s => s.key === step.key) 
                        ? 'bg-indigo-600' 
                        : 'bg-gray-300'
                  }`}
                  aria-current={currentStep === step.key ? 'step' : undefined}
                >
                  <span className="sr-only">{step.label}</span>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Desktop stepper */}
      <div className="hidden sm:block">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li key={step.key} className={stepIdx !== steps.length - 1 ? 'flex-1' : ''}>
                <div className="group flex items-center">
                  <span className="flex items-center">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        currentStep === step.key
                          ? 'bg-indigo-600 text-white'
                          : currentStepIndex > steps.findIndex(s => s.key === step.key)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-500'
                      }`}
                    >
                      {currentStepIndex > steps.findIndex(s => s.key === step.key) ? (
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <span>{stepIdx + 1}</span>
                      )}
                    </span>
                    <span
                      className={`ml-4 text-sm font-medium ${
                        currentStep === step.key
                          ? 'text-indigo-600'
                          : currentStepIndex > steps.findIndex(s => s.key === step.key)
                            ? 'text-indigo-600'
                            : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </span>
                  {stepIdx !== steps.length - 1 ? (
                    <div
                      className={`flex-1 ml-4 ${
                        currentStepIndex > stepIdx ? 'bg-indigo-600' : 'bg-gray-200'
                      } h-0.5`}
                    ></div>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </>
  );
};

export default StepProgress;