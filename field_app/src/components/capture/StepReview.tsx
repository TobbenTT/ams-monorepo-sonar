/**
 * StepReview.tsx — Wizard step 3: Review and submit the capture.
 */
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import type { Language } from '../../i18n';
import { t } from '../../i18n';
import type { IdentifyData } from './StepIdentify';
import type { CaptureData } from './StepCapture';

interface Props {
  identify: IdentifyData;
  capture: CaptureData;
  submitting: boolean;
  onSubmit: () => void;
  lang: Language;
}

const SEVERITY_COLORS: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
};

export default function StepReview({ identify, capture, submitting, onSubmit, lang }: Props) {
  const { isOnline } = useOnlineStatus();

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
        {/* Equipment */}
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">{t('capture.equipment', lang)}</span>
          <span className="text-sm font-medium">{identify.equipmentTag || '—'}</span>
        </div>

        {/* Location */}
        {identify.locationHint && (
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">{t('capture.location', lang)}</span>
            <span className="text-sm">{identify.locationHint}</span>
          </div>
        )}

        {/* GPS */}
        {identify.gpsLat != null && identify.gpsLon != null && (
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">GPS</span>
            <span className="text-xs text-green-700">
              {identify.gpsLat.toFixed(4)}, {identify.gpsLon.toFixed(4)}
              {identify.gpsAccuracy != null && ` (±${Math.round(identify.gpsAccuracy)}m)`}
            </span>
          </div>
        )}

        {/* Type + Language */}
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">{t('capture.type', lang)}</span>
          <span className="text-sm">{t(`capture.type.${identify.captureType.toLowerCase()}`, lang)}</span>
        </div>

        {/* Technician */}
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">{t('capture.technician', lang)}</span>
          <span className="text-sm">{identify.technicianId}</span>
        </div>
      </div>

      {/* Media preview */}
      {capture.imageThumbnail && (
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <img
            src={capture.imageThumbnail}
            alt="Captured"
            className="max-w-full max-h-32 rounded-md mx-auto"
          />
        </div>
      )}

      {/* Image analysis */}
      {capture.imageAnalysisResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
          {capture.imageAnalysisResult.component_identified && (
            <p className="text-xs">
              <span className="font-medium text-gray-600">{t('capture.image.component', lang)}:</span>{' '}
              {capture.imageAnalysisResult.component_identified}
            </p>
          )}
          {capture.imageAnalysisResult.anomalies_detected.length > 0 && (
            <p className="text-xs">
              <span className="font-medium text-gray-600">{t('capture.image.anomalies', lang)}:</span>{' '}
              {capture.imageAnalysisResult.anomalies_detected.join(', ')}
            </p>
          )}
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${SEVERITY_COLORS[capture.imageAnalysisResult.severity_visual] || 'bg-gray-100'}`}>
            {capture.imageAnalysisResult.severity_visual}
          </span>
        </div>
      )}

      {/* Transcription */}
      {capture.transcriptionResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs font-medium text-green-700 mb-1">
            {t('capture.voice.transcribed', lang, { language: capture.transcriptionResult.language_detected })}
          </p>
          <p className="text-sm text-gray-800">{capture.rawText}</p>
        </div>
      )}

      {/* Text description */}
      {!capture.transcriptionResult && capture.rawText && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs font-medium text-gray-600 mb-1">{t('capture.description', lang)}</p>
          <p className="text-sm text-gray-800">{capture.rawText}</p>
        </div>
      )}

      {/* Media processing hint */}
      {!isOnline && (capture.audioBlob || capture.imageBlob) && !capture.transcriptionResult && !capture.imageAnalysisResult && (
        <p className="text-xs text-orange-600 text-center">
          {capture.audioBlob ? t('capture.voice.offline_hint', lang) : t('capture.image.offline_hint', lang)}
        </p>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="w-full min-h-[48px] bg-green-700 text-white font-semibold py-3 rounded-lg active:scale-95 transition-all disabled:opacity-50"
      >
        {submitting
          ? '...'
          : isOnline
            ? t('capture.submit_online', lang)
            : t('capture.submit_offline', lang)}
      </button>
    </div>
  );
}
