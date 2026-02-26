'use client'

import { ChevronLeft } from 'lucide-react'

interface OnboardingHeaderProps {
  currentStep: number
  totalSteps: number
  stepTitle: string
  onBack?: () => void
  canGoBack: boolean
}

export function OnboardingHeader({
  currentStep,
  totalSteps,
  stepTitle,
  onBack,
  canGoBack,
}: OnboardingHeaderProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="bg-white border-b sticky top-0 z-10" data-testid="onboarding-header">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-sm font-medium text-gray-700"
              data-testid="onboarding-step-indicator"
            >
              Paso {currentStep} de {totalSteps}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div
            className="w-full bg-gray-200 rounded-full h-2"
            data-testid="onboarding-progress-bar"
          >
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step title with back button */}
        <div className="flex items-center gap-4">
          {canGoBack && onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Volver"
              data-testid="onboarding-back-button"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{stepTitle}</h1>
        </div>
      </div>
    </div>
  )
}
