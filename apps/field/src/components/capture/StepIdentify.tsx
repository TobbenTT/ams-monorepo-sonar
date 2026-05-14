/**
 * StepIdentify.tsx — Wizard step 1: Identify equipment via tag, GPS, or location hint.
 */
import { useState, useEffect } from 'react';
import { db } from '../../db/local-db';
import type { EquipmentCache } from '../../db/local-db';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { findNearbyEquipment } from '../../api/media-api';
import type { NearbyEquipment } from '../../api/media-api';
import type { Language } from '../../i18n';
import { t } from '../../i18n';

type CaptureType = 'TEXT' | 'VOICE' | 'IMAGE';

export interface IdentifyData {
  technicianId: string;
  equipmentTag: string;
  locationHint: string;
  language: string;
  captureType: CaptureType;
  gpsLat?: number;
  gpsLon?: number;
  gpsAccuracy?: number;
}

interface Props {
  data: IdentifyData;
  onChange: (data: IdentifyData) => void;
  lang: Language;
}

const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'es', label: 'Español' },
];

export default function StepIdentify({ data, onChange, lang }: Props) {
  const { isOnline } = useOnlineStatus();
  const geo = useGeolocation();
  const [equipment, setEquipment] = useState<EquipmentCache[]>([]);
  const [search, setSearch] = useState('');
  const [nearbyResults, setNearbyResults] = useState<NearbyEquipment[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  useEffect(() => {
    db.equipment.toArray().then(setEquipment).catch(console.error);
  }, []);

  // When GPS position acquired, look up nearby equipment
  useEffect(() => {
    if (!geo.position || !isOnline) return;
    setNearbyLoading(true);
    findNearbyEquipment(geo.position.lat, geo.position.lon)
      .then((results) => setNearbyResults(results))
      .catch(console.error)
      .finally(() => setNearbyLoading(false));
  }, [geo.position, isOnline]);

  const set = (field: keyof IdentifyData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleGps = async () => {
    await geo.getPosition();
    if (geo.position) {
      onChange({
        ...data,
        gpsLat: geo.position.lat,
        gpsLon: geo.position.lon,
        gpsAccuracy: geo.position.accuracy,
      });
    }
  };

  // Apply GPS result to data when position changes
  useEffect(() => {
    if (geo.position && (data.gpsLat !== geo.position.lat || data.gpsLon !== geo.position.lon)) {
      onChange({
        ...data,
        gpsLat: geo.position.lat,
        gpsLon: geo.position.lon,
        gpsAccuracy: geo.position.accuracy,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.position]);

  const filtered = search
    ? equipment.filter(
        (e) =>
          e.tag.toLowerCase().includes(search.toLowerCase()) ||
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.nameFr.toLowerCase().includes(search.toLowerCase()),
      )
    : equipment;

  return (
    <div className="space-y-4">
      {/* Technician */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('capture.technician', lang)} *
        </label>
        <input
          type="text"
          value={data.technicianId}
          onChange={(e) => set('technicianId', e.target.value)}
          placeholder="ex: TECH-001"
          className="w-full border border-gray-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

      {/* GPS */}
      {geo.isSupported && (
        <div>
          <button
            type="button"
            onClick={handleGps}
            disabled={geo.isLocating}
            className="w-full min-h-[44px] bg-blue-50 text-blue-700 border border-blue-200 font-medium py-2 px-4 rounded-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {geo.isLocating
              ? t('capture.gps.locating', lang)
              : t('capture.gps.locate', lang)}
          </button>
          {geo.position && (
            <p className="text-xs text-green-700 mt-1">
              {t('capture.gps.found', lang, {
                lat: geo.position.lat.toFixed(4),
                lon: geo.position.lon.toFixed(4),
                accuracy: Math.round(geo.position.accuracy),
              })}
            </p>
          )}
          {geo.error && (
            <p className="text-xs text-red-600 mt-1">{geo.error}</p>
          )}
          {/* Nearby equipment suggestions */}
          {nearbyLoading && (
            <p className="text-xs text-gray-500 mt-1">{t('capture.gps.locating', lang)}</p>
          )}
          {nearbyResults.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-xs font-medium text-gray-600">
                {t('capture.gps.nearby', lang, { count: nearbyResults.length })}
              </p>
              {nearbyResults.slice(0, 5).map((eq) => (
                <button
                  type="button"
                  key={eq.equipment_tag}
                  onClick={() => onChange({ ...data, equipmentTag: eq.equipment_tag })}
                  className={`w-full text-left text-xs px-3 py-2 rounded border active:scale-95 transition-all ${
                    data.equipmentTag === eq.equipment_tag
                      ? 'bg-green-100 border-green-400'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <span className="font-medium">{eq.equipment_tag}</span>
                  <span className="text-gray-500 ml-2">{Math.round(eq.distance_m)}m</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Equipment Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('capture.equipment', lang)}
        </label>
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        {equipment.length === 0 ? (
          <p className="text-xs text-gray-400 italic px-1 mt-1">
            {t('capture.no_equipment_cache', lang)}
          </p>
        ) : (
          <select
            value={data.equipmentTag}
            onChange={(e) => set('equipmentTag', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 mt-1"
            size={Math.min(filtered.length + 1, 5)}
          >
            <option value="">-- {t('capture.equipment', lang)} --</option>
            {filtered.map((e) => (
              <option key={e.nodeId} value={e.tag}>
                {e.tag} — {e.nameFr || e.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Location hint */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('capture.location', lang)}
        </label>
        <input
          type="text"
          value={data.locationHint}
          onChange={(e) => set('locationHint', e.target.value)}
          placeholder="ex: Zone Broyage, Niveau 2"
          className="w-full border border-gray-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

      {/* Language + Type */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
          <select
            value={data.language}
            onChange={(e) => set('language', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('capture.type', lang)}
          </label>
          <select
            value={data.captureType}
            onChange={(e) => set('captureType', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="TEXT">{t('capture.type.text', lang)}</option>
            <option value="VOICE">{t('capture.type.voice', lang)}</option>
            <option value="IMAGE">{t('capture.type.image', lang)}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
