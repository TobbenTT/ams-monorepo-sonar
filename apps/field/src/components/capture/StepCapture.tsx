/**
 * StepCapture.tsx — Wizard step 2: Capture data via text, voice, or image.
 */
import { useState } from 'react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useCamera } from '../../hooks/useCamera';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { transcribeAudio, analyzeImage } from '../../api/media-api';
import type { Language } from '../../i18n';
import { t } from '../../i18n';
import type { TranscriptionResult, ImageAnalysisResult } from '../../db/local-db';

type CaptureType = 'TEXT' | 'VOICE' | 'IMAGE';

export interface CaptureData {
  rawText: string;
  audioBlob: Blob | null;
  imageBlob: Blob | null;
  imageThumbnail: string | null;
  transcriptionResult: TranscriptionResult | null;
  imageAnalysisResult: ImageAnalysisResult | null;
}

interface Props {
  captureType: CaptureType;
  language: string;
  equipmentTag: string;
  data: CaptureData;
  onChange: (data: CaptureData) => void;
  lang: Language;
}

const SEVERITY_COLORS: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
};

export default function StepCapture({ captureType, language, equipmentTag, data, onChange, lang }: Props) {
  const { isOnline } = useOnlineStatus();
  const recorder = useAudioRecorder();
  const camera = useCamera();
  const [transcribing, setTranscribing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // ─── TEXT Mode ──────────────────────────────────────────────────────────
  if (captureType === 'TEXT') {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {t('capture.description', lang)} *
        </label>
        <textarea
          value={data.rawText}
          onChange={(e) => onChange({ ...data, rawText: e.target.value })}
          rows={5}
          placeholder="..."
          className="w-full border border-gray-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
        />
        <p className="text-xs text-gray-400 text-right">{data.rawText.length}</p>
      </div>
    );
  }

  // ─── VOICE Mode ─────────────────────────────────────────────────────────
  if (captureType === 'VOICE') {
    const handleTranscribe = async () => {
      if (!data.audioBlob) return;
      setTranscribing(true);
      try {
        const result = await transcribeAudio(data.audioBlob, language);
        onChange({
          ...data,
          rawText: result.text,
          transcriptionResult: {
            text: result.text,
            language_detected: result.language_detected,
            duration_seconds: result.duration_seconds,
          },
        });
      } catch (err) {
        console.error('Transcription error:', err);
      } finally {
        setTranscribing(false);
      }
    };

    // Sync recorder blob to capture data
    const handleStopAndSave = () => {
      recorder.stopRecording();
      // audioBlob will be set after recorder.onstop fires
    };

    // Update data when recorder produces a blob
    if (recorder.audioBlob && recorder.audioBlob !== data.audioBlob) {
      // Use setTimeout to avoid setState-during-render
      setTimeout(() => onChange({ ...data, audioBlob: recorder.audioBlob }), 0);
    }

    if (!recorder.isSupported) {
      return (
        <div className="text-center py-8">
          <p className="text-sm text-red-600">{t('capture.voice.not_supported', lang)}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Record button */}
        <div className="flex flex-col items-center gap-3">
          {!recorder.isRecording && !data.audioBlob && (
            <button
              type="button"
              onClick={recorder.startRecording}
              className="w-20 h-20 rounded-full bg-red-500 text-white text-2xl font-bold active:scale-95 transition-all shadow-lg hover:bg-red-600 flex items-center justify-center"
              aria-label={t('capture.voice.record', lang)}
            >
              <span className="text-3xl">&#9679;</span>
            </button>
          )}
          {recorder.isRecording && (
            <>
              <button
                type="button"
                onClick={handleStopAndSave}
                className="w-20 h-20 rounded-full bg-red-600 text-white text-2xl font-bold active:scale-95 transition-all shadow-lg animate-pulse flex items-center justify-center"
                aria-label={t('capture.voice.stop', lang)}
              >
                <span className="text-3xl">&#9632;</span>
              </button>
              <p className="text-sm font-medium text-red-600">
                {t('capture.voice.recording', lang, { seconds: recorder.duration })}
              </p>
            </>
          )}
          {!recorder.isRecording && !data.audioBlob && (
            <p className="text-sm text-gray-500">{t('capture.voice.record', lang)}</p>
          )}
        </div>

        {/* Playback */}
        {data.audioBlob && recorder.audioUrl && (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600 mb-2">{t('capture.voice.playback', lang)}</p>
              <audio controls src={recorder.audioUrl} className="w-full" />
            </div>

            {/* Transcribe button */}
            {isOnline && !data.transcriptionResult && (
              <button
                type="button"
                onClick={handleTranscribe}
                disabled={transcribing}
                className="w-full min-h-[44px] bg-blue-600 text-white font-medium py-2 rounded-lg active:scale-95 transition-all disabled:opacity-50"
              >
                {transcribing ? t('capture.voice.transcribing', lang) : t('capture.voice.transcribe', lang)}
              </button>
            )}
            {!isOnline && !data.transcriptionResult && (
              <p className="text-xs text-orange-600 text-center">{t('capture.voice.offline_hint', lang)}</p>
            )}

            {/* Transcription result */}
            {data.transcriptionResult && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-green-700">
                  {t('capture.voice.transcribed', lang, { language: data.transcriptionResult.language_detected })}
                </p>
                <p className="text-xs text-gray-500">{t('capture.voice.edit_hint', lang)}</p>
                <textarea
                  value={data.rawText}
                  onChange={(e) => onChange({ ...data, rawText: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                />
              </div>
            )}

            {/* Re-record */}
            <button
              type="button"
              onClick={() => {
                recorder.clearRecording();
                onChange({ ...data, audioBlob: null, transcriptionResult: null, rawText: '' });
              }}
              className="w-full min-h-[44px] border border-gray-300 text-gray-700 font-medium py-2 rounded-lg active:scale-95 transition-all"
            >
              {t('capture.voice.record', lang)}
            </button>
          </div>
        )}

        {recorder.error && (
          <p className="text-sm text-red-600 text-center">{recorder.error}</p>
        )}
      </div>
    );
  }

  // ─── IMAGE Mode ─────────────────────────────────────────────────────────
  if (captureType === 'IMAGE') {
    const handleAnalyze = async () => {
      if (!data.imageBlob) return;
      setAnalyzing(true);
      try {
        const result = await analyzeImage(data.imageBlob, equipmentTag);
        onChange({
          ...data,
          imageAnalysisResult: {
            component_identified: result.component_identified,
            anomalies_detected: result.anomalies_detected,
            severity_visual: result.severity_visual,
          },
        });
      } catch (err) {
        console.error('Image analysis error:', err);
      } finally {
        setAnalyzing(false);
      }
    };

    // Sync camera blob to capture data
    if (camera.capturedImage && camera.capturedImage !== data.imageBlob) {
      setTimeout(() => onChange({
        ...data,
        imageBlob: camera.capturedImage,
        imageThumbnail: camera.thumbnail,
      }), 0);
    }

    if (!camera.isSupported) {
      return (
        <div className="text-center py-8">
          <p className="text-sm text-red-600">{t('capture.image.not_supported', lang)}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Capture buttons */}
        {!data.imageBlob && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={camera.captureFromCamera}
              disabled={camera.isCapturing}
              className="min-h-[56px] bg-green-700 text-white font-medium rounded-lg active:scale-95 transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-1 py-3"
            >
              <span className="text-xl">&#128247;</span>
              <span className="text-xs">{t('capture.image.take_photo', lang)}</span>
            </button>
            <button
              type="button"
              onClick={camera.captureFromGallery}
              disabled={camera.isCapturing}
              className="min-h-[56px] bg-gray-100 text-gray-700 border border-gray-300 font-medium rounded-lg active:scale-95 transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-1 py-3"
            >
              <span className="text-xl">&#128193;</span>
              <span className="text-xs">{t('capture.image.from_gallery', lang)}</span>
            </button>
          </div>
        )}

        {/* Image preview */}
        {data.imageThumbnail && (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <img
                src={data.imageThumbnail}
                alt="Captured"
                className="max-w-full max-h-48 rounded-md mx-auto"
              />
            </div>

            {/* Analyze button */}
            {isOnline && !data.imageAnalysisResult && (
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full min-h-[44px] bg-blue-600 text-white font-medium py-2 rounded-lg active:scale-95 transition-all disabled:opacity-50"
              >
                {analyzing ? t('capture.image.analyzing', lang) : t('capture.image.analyze', lang)}
              </button>
            )}
            {!isOnline && !data.imageAnalysisResult && (
              <p className="text-xs text-orange-600 text-center">{t('capture.image.offline_hint', lang)}</p>
            )}

            {/* Analysis results */}
            {data.imageAnalysisResult && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                {data.imageAnalysisResult.component_identified && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600">{t('capture.image.component', lang)}:</span>
                    <span className="text-sm font-semibold">{data.imageAnalysisResult.component_identified}</span>
                  </div>
                )}
                {data.imageAnalysisResult.anomalies_detected.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-gray-600">{t('capture.image.anomalies', lang)}:</span>
                    <ul className="mt-1 space-y-0.5">
                      {data.imageAnalysisResult.anomalies_detected.map((a, i) => (
                        <li key={i} className="text-xs text-gray-700 pl-2">- {a}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600">{t('capture.image.severity', lang)}:</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SEVERITY_COLORS[data.imageAnalysisResult.severity_visual] || 'bg-gray-100'}`}>
                    {data.imageAnalysisResult.severity_visual}
                  </span>
                </div>
              </div>
            )}

            {/* Description (optional text alongside image) */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t('capture.description', lang)}
              </label>
              <textarea
                value={data.rawText}
                onChange={(e) => onChange({ ...data, rawText: e.target.value })}
                rows={3}
                placeholder="..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
              />
            </div>

            {/* Re-capture */}
            <button
              type="button"
              onClick={() => {
                camera.clearImage();
                onChange({ ...data, imageBlob: null, imageThumbnail: null, imageAnalysisResult: null });
              }}
              className="w-full min-h-[44px] border border-gray-300 text-gray-700 font-medium py-2 rounded-lg active:scale-95 transition-all"
            >
              {t('capture.image.take_photo', lang)}
            </button>
          </div>
        )}

        {camera.error && (
          <p className="text-sm text-red-600 text-center">{camera.error}</p>
        )}
      </div>
    );
  }

  return null;
}
