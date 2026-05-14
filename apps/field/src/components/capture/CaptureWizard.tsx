/**
 * CaptureWizard.tsx — 3-step wizard container: Identify → Capture → Review.
 */
import { useState, useCallback } from 'react';
import type { Language } from '../../i18n';
import { t } from '../../i18n';
import StepIdentify from './StepIdentify';
import type { IdentifyData } from './StepIdentify';
import StepCapture from './StepCapture';
import type { CaptureData } from './StepCapture';
import StepReview from './StepReview';

const STEPS = ['identify', 'capture', 'review'] as const;
type Step = (typeof STEPS)[number];

interface Props {
  onSubmit: (identify: IdentifyData, capture: CaptureData) => Promise<void>;
  lang: Language;
}

export default function CaptureWizard({ onSubmit, lang }: Props) {
  const [currentStep, setCurrentStep] = useState<Step>('identify');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [identify, setIdentify] = useState<IdentifyData>({
    technicianId: '',
    equipmentTag: '',
    locationHint: '',
    language: 'fr',
    captureType: 'TEXT',
  });

  const [capture, setCapture] = useState<CaptureData>({
    rawText: '',
    audioBlob: null,
    imageBlob: null,
    imageThumbnail: null,
    transcriptionResult: null,
    imageAnalysisResult: null,
  });

  const stepIndex = STEPS.indexOf(currentStep);

  const canGoNext = useCallback((): boolean => {
    if (currentStep === 'identify') {
      return identify.technicianId.trim().length > 0;
    }
    if (currentStep === 'capture') {
      if (identify.captureType === 'TEXT') return capture.rawText.trim().length > 0;
      if (identify.captureType === 'VOICE') return capture.audioBlob !== null;
      if (identify.captureType === 'IMAGE') return capture.imageBlob !== null;
    }
    return true;
  }, [currentStep, identify, capture]);

  const goNext = () => {
    setError('');
    if (!canGoNext()) return;
    const nextIndex = stepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const goBack = () => {
    setError('');
    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      await onSubmit(identify, capture);
      // Reset wizard
      setCurrentStep('identify');
      setIdentify({
        technicianId: identify.technicianId, // Keep technician for next capture
        equipmentTag: '',
        locationHint: '',
        language: identify.language,
        captureType: 'TEXT',
      });
      setCapture({
        rawText: '',
        audioBlob: null,
        imageBlob: null,
        imageThumbnail: null,
        transcriptionResult: null,
        imageAnalysisResult: null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-5">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  i < stepIndex
                    ? 'bg-green-600 text-white'
                    : i === stepIndex
                      ? 'bg-green-700 text-white ring-2 ring-green-300'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <span className="text-[10px] text-gray-500 mt-0.5">
                {t(`capture.step.${step}`, lang)}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 mb-4 ${i < stepIndex ? 'bg-green-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Step content */}
      {currentStep === 'identify' && (
        <StepIdentify data={identify} onChange={setIdentify} lang={lang} />
      )}
      {currentStep === 'capture' && (
        <StepCapture
          captureType={identify.captureType}
          language={identify.language}
          equipmentTag={identify.equipmentTag}
          data={capture}
          onChange={setCapture}
          lang={lang}
        />
      )}
      {currentStep === 'review' && (
        <StepReview
          identify={identify}
          capture={capture}
          submitting={submitting}
          onSubmit={handleSubmit}
          lang={lang}
        />
      )}

      {/* Navigation */}
      {currentStep !== 'review' && (
        <div className="flex gap-3">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="flex-1 min-h-[44px] border border-gray-300 text-gray-700 font-medium py-2 rounded-lg active:scale-95 transition-all"
            >
              {t('capture.step.back', lang)}
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext()}
            className={`${stepIndex > 0 ? 'flex-1' : 'w-full'} min-h-[44px] bg-green-700 text-white font-medium py-2 rounded-lg active:scale-95 transition-all disabled:opacity-50`}
          >
            {t('capture.step.next', lang)}
          </button>
        </div>
      )}
    </div>
  );
}
