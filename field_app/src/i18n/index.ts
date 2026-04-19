/**
 * i18n/index.ts — Lightweight translation system for the field PWA.
 * Supports FR (primary), EN, ES, AR. RTL handled via data-dir attribute.
 */

export type Language = 'fr' | 'en' | 'es' | 'ar';

export const SUPPORTED_LANGUAGES: { code: Language; label: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'es', label: 'Español', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
];

// ─── Translation dictionary ────────────────────────────────────────────────

const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Navigation
    'nav.capture': 'Capture',
    'nav.program': 'Programme',
    'nav.checklist': 'Checklist',

    // Connection status
    'status.online': 'En ligne',
    'status.offline': 'Hors ligne',
    'status.pending': '{count} en attente',
    'status.syncing': 'Synchronisation…',
    'status.last_sync': 'Dernière synchro: {time}',
    'status.local_cache': 'Cache local',
    'status.sync_now': '↻ Synchroniser',

    // Field Capture page
    'capture.title': 'Capture terrain',
    'capture.technician': 'Technicien',
    'capture.equipment': 'Équipement',
    'capture.location': 'Localisation',
    'capture.type': 'Type',
    'capture.type.text': 'Texte',
    'capture.type.voice': 'Voix',
    'capture.type.image': 'Image',
    'capture.description': 'Description',
    'capture.submit_offline': '💾 Enregistrer (hors ligne)',
    'capture.submit_online': '📤 Soumettre',
    'capture.recent': 'Captures récentes',
    'capture.no_equipment_cache': 'Aucun équipement en cache. Synchronisez pour charger.',
    'capture.required': 'Champ obligatoire',

    // Voice capture
    'capture.voice.record': 'Enregistrer',
    'capture.voice.stop': 'Arrêter',
    'capture.voice.recording': 'Enregistrement… {seconds}s',
    'capture.voice.playback': 'Réécouter',
    'capture.voice.transcribe': 'Transcrire',
    'capture.voice.transcribing': 'Transcription en cours…',
    'capture.voice.transcribed': 'Transcrit ({language})',
    'capture.voice.offline_hint': 'Sera transcrit à la reconnexion.',
    'capture.voice.not_supported': 'Microphone non disponible.',
    'capture.voice.permission_denied': 'Accès micro refusé.',
    'capture.voice.edit_hint': 'Corrigez si nécessaire :',

    // Image capture
    'capture.image.take_photo': 'Prendre une photo',
    'capture.image.from_gallery': 'Galerie',
    'capture.image.analyze': 'Analyser (IA)',
    'capture.image.analyzing': 'Analyse en cours…',
    'capture.image.component': 'Composant',
    'capture.image.anomalies': 'Anomalies',
    'capture.image.severity': 'Sévérité',
    'capture.image.offline_hint': 'Sera analysé à la reconnexion.',
    'capture.image.not_supported': 'Caméra non disponible.',
    'capture.image.permission_denied': 'Accès caméra refusé.',

    // GPS
    'capture.gps.locate': 'Localiser (GPS)',
    'capture.gps.locating': 'Recherche de position…',
    'capture.gps.found': '{lat}°N, {lon}°W (±{accuracy}m)',
    'capture.gps.nearby': '{count} équipement(s) à proximité',
    'capture.gps.not_supported': 'GPS non disponible.',
    'capture.gps.permission_denied': 'Accès localisation refusé.',

    // Wizard steps
    'capture.step.identify': 'Identifier',
    'capture.step.capture': 'Capturer',
    'capture.step.review': 'Confirmer',
    'capture.step.next': 'Suivant',
    'capture.step.back': 'Retour',

    // Media processing
    'capture.media.pending': 'Média en attente',
    'capture.media.processing': 'Traitement…',
    'capture.media.complete': 'Traitement terminé',
    'capture.media.failed': 'Échec du traitement',

    // Work Program page
    'program.title': 'Programme de travail',
    'program.today': "Aujourd'hui",
    'program.prev_day': 'Jour précédent',
    'program.next_day': 'Jour suivant',
    'program.no_orders': 'Aucun ordre pour cette date.',
    'program.total_hours': '{n}h total',
    'program.orders_count': '{n} ordre(s)',
    'program.urgent': 'URGENT',
    'program.planned': 'PLANIFIÉ',
    'program.deferred': 'DIFFÉRÉ',
    'program.start_checklist': 'Checklist →',

    // Checklist page
    'checklist.title': 'Liste de contrôle',
    'checklist.back': '← Programme',
    'checklist.steps': '{done}/{total} étapes',
    'checklist.gate': 'PORTE',
    'checklist.confirm': '✅ Confirmer',
    'checklist.non_conform': '❌ Non conforme',
    'checklist.undo': 'Annuler cette étape',
    'checklist.notes': 'Notes / observations',
    'checklist.notes_placeholder': 'Saisir vos observations…',
    'checklist.measurement': 'Mesure ({unit})',
    'checklist.range': 'Plage: {min}–{max} {unit}',
    'checklist.out_of_range': '✗ Hors plage',
    'checklist.in_range': '✓ OK',
    'checklist.photo_required': '📷 Photo recommandée pour cette étape',
    'checklist.saving': '💾 Enregistrement…',
    'checklist.complete': 'Checklist complète!',
    'checklist.complete_hint': 'Synchronisez pour envoyer les résultats au serveur.',
    'checklist.no_order': "Sélectionnez un ordre depuis le Programme",
    'checklist.not_found': 'Ordre non trouvé en cache local.',
    'checklist.go_to_program': 'Voir le Programme →',
  },

  en: {
    // Navigation
    'nav.capture': 'Capture',
    'nav.program': 'Program',
    'nav.checklist': 'Checklist',

    // Connection status
    'status.online': 'Online',
    'status.offline': 'Offline',
    'status.pending': '{count} pending',
    'status.syncing': 'Syncing…',
    'status.last_sync': 'Last sync: {time}',
    'status.local_cache': 'Local cache',
    'status.sync_now': '↻ Sync',

    // Field Capture
    'capture.title': 'Field Capture',
    'capture.technician': 'Technician',
    'capture.equipment': 'Equipment',
    'capture.location': 'Location',
    'capture.type': 'Type',
    'capture.type.text': 'Text',
    'capture.type.voice': 'Voice',
    'capture.type.image': 'Image',
    'capture.description': 'Description',
    'capture.submit_offline': '💾 Save (offline)',
    'capture.submit_online': '📤 Submit',
    'capture.recent': 'Recent Captures',
    'capture.no_equipment_cache': 'No equipment cached. Sync to load.',
    'capture.required': 'Required field',

    // Voice capture
    'capture.voice.record': 'Record',
    'capture.voice.stop': 'Stop',
    'capture.voice.recording': 'Recording… {seconds}s',
    'capture.voice.playback': 'Play back',
    'capture.voice.transcribe': 'Transcribe',
    'capture.voice.transcribing': 'Transcribing…',
    'capture.voice.transcribed': 'Transcribed ({language})',
    'capture.voice.offline_hint': 'Will be transcribed on reconnect.',
    'capture.voice.not_supported': 'Microphone not available.',
    'capture.voice.permission_denied': 'Microphone permission denied.',
    'capture.voice.edit_hint': 'Edit if needed:',

    // Image capture
    'capture.image.take_photo': 'Take photo',
    'capture.image.from_gallery': 'Gallery',
    'capture.image.analyze': 'Analyze (AI)',
    'capture.image.analyzing': 'Analyzing…',
    'capture.image.component': 'Component',
    'capture.image.anomalies': 'Anomalies',
    'capture.image.severity': 'Severity',
    'capture.image.offline_hint': 'Will be analyzed on reconnect.',
    'capture.image.not_supported': 'Camera not available.',
    'capture.image.permission_denied': 'Camera permission denied.',

    // GPS
    'capture.gps.locate': 'Locate (GPS)',
    'capture.gps.locating': 'Getting position…',
    'capture.gps.found': '{lat}°N, {lon}°W (±{accuracy}m)',
    'capture.gps.nearby': '{count} equipment nearby',
    'capture.gps.not_supported': 'GPS not available.',
    'capture.gps.permission_denied': 'Location permission denied.',

    // Wizard steps
    'capture.step.identify': 'Identify',
    'capture.step.capture': 'Capture',
    'capture.step.review': 'Review',
    'capture.step.next': 'Next',
    'capture.step.back': 'Back',

    // Media processing
    'capture.media.pending': 'Media pending',
    'capture.media.processing': 'Processing…',
    'capture.media.complete': 'Processing complete',
    'capture.media.failed': 'Processing failed',

    // Work Program
    'program.title': 'Work Program',
    'program.today': 'Today',
    'program.prev_day': 'Previous day',
    'program.next_day': 'Next day',
    'program.no_orders': 'No orders for this date.',
    'program.total_hours': '{n}h total',
    'program.orders_count': '{n} order(s)',
    'program.urgent': 'URGENT',
    'program.planned': 'PLANNED',
    'program.deferred': 'DEFERRED',
    'program.start_checklist': 'Checklist →',

    // Checklist
    'checklist.title': 'Checklist',
    'checklist.back': '← Program',
    'checklist.steps': '{done}/{total} steps',
    'checklist.gate': 'GATE',
    'checklist.confirm': '✅ Confirm',
    'checklist.non_conform': '❌ Non-conforming',
    'checklist.undo': 'Undo this step',
    'checklist.notes': 'Notes / observations',
    'checklist.notes_placeholder': 'Enter observations…',
    'checklist.measurement': 'Measurement ({unit})',
    'checklist.range': 'Range: {min}–{max} {unit}',
    'checklist.out_of_range': '✗ Out of range',
    'checklist.in_range': '✓ OK',
    'checklist.photo_required': '📷 Photo recommended for this step',
    'checklist.saving': '💾 Saving…',
    'checklist.complete': 'Checklist complete!',
    'checklist.complete_hint': 'Sync to upload results to the server.',
    'checklist.no_order': 'Select a work order from the Program',
    'checklist.not_found': 'Order not found in local cache.',
    'checklist.go_to_program': 'Go to Program →',
  },

  es: {
    // Navigation
    'nav.capture': 'Captura',
    'nav.program': 'Programa',
    'nav.checklist': 'Lista de control',

    // Connection status
    'status.online': 'En línea',
    'status.offline': 'Sin conexión',
    'status.pending': '{count} pendiente(s)',
    'status.syncing': 'Sincronizando…',
    'status.last_sync': 'Última sincronía: {time}',
    'status.local_cache': 'Caché local',
    'status.sync_now': '↻ Sincronizar',

    // Field Capture
    'capture.title': 'Captura de campo',
    'capture.technician': 'Técnico',
    'capture.equipment': 'Equipo',
    'capture.location': 'Localización',
    'capture.type': 'Tipo',
    'capture.type.text': 'Texto',
    'capture.type.voice': 'Voz',
    'capture.type.image': 'Imagen',
    'capture.description': 'Descripción',
    'capture.submit_offline': '💾 Guardar (sin conexión)',
    'capture.submit_online': '📤 Enviar',
    'capture.recent': 'Capturas recientes',
    'capture.no_equipment_cache': 'Sin equipos en caché. Sincronice para cargar.',
    'capture.required': 'Campo requerido',

    // Voice capture
    'capture.voice.record': 'Grabar',
    'capture.voice.stop': 'Detener',
    'capture.voice.recording': 'Grabando… {seconds}s',
    'capture.voice.playback': 'Reproducir',
    'capture.voice.transcribe': 'Transcribir',
    'capture.voice.transcribing': 'Transcribiendo…',
    'capture.voice.transcribed': 'Transcrito ({language})',
    'capture.voice.offline_hint': 'Se transcribirá al reconectar.',
    'capture.voice.not_supported': 'Micrófono no disponible.',
    'capture.voice.permission_denied': 'Permiso de micrófono denegado.',
    'capture.voice.edit_hint': 'Corrija si es necesario:',

    // Image capture
    'capture.image.take_photo': 'Tomar foto',
    'capture.image.from_gallery': 'Galería',
    'capture.image.analyze': 'Analizar (IA)',
    'capture.image.analyzing': 'Analizando…',
    'capture.image.component': 'Componente',
    'capture.image.anomalies': 'Anomalías',
    'capture.image.severity': 'Severidad',
    'capture.image.offline_hint': 'Se analizará al reconectar.',
    'capture.image.not_supported': 'Cámara no disponible.',
    'capture.image.permission_denied': 'Permiso de cámara denegado.',

    // GPS
    'capture.gps.locate': 'Localizar (GPS)',
    'capture.gps.locating': 'Buscando posición…',
    'capture.gps.found': '{lat}°N, {lon}°W (±{accuracy}m)',
    'capture.gps.nearby': '{count} equipo(s) cercano(s)',
    'capture.gps.not_supported': 'GPS no disponible.',
    'capture.gps.permission_denied': 'Permiso de ubicación denegado.',

    // Wizard steps
    'capture.step.identify': 'Identificar',
    'capture.step.capture': 'Capturar',
    'capture.step.review': 'Revisar',
    'capture.step.next': 'Siguiente',
    'capture.step.back': 'Atrás',

    // Media processing
    'capture.media.pending': 'Medios pendientes',
    'capture.media.processing': 'Procesando…',
    'capture.media.complete': 'Procesamiento completo',
    'capture.media.failed': 'Procesamiento fallido',

    // Work Program
    'program.title': 'Programa de trabajo',
    'program.today': 'Hoy',
    'program.prev_day': 'Día anterior',
    'program.next_day': 'Día siguiente',
    'program.no_orders': 'Sin órdenes para esta fecha.',
    'program.total_hours': '{n}h total',
    'program.orders_count': '{n} orden(es)',
    'program.urgent': 'URGENTE',
    'program.planned': 'PLANIFICADO',
    'program.deferred': 'DIFERIDO',
    'program.start_checklist': 'Lista →',

    // Checklist
    'checklist.title': 'Lista de control',
    'checklist.back': '← Programa',
    'checklist.steps': '{done}/{total} pasos',
    'checklist.gate': 'CONTROL',
    'checklist.confirm': '✅ Confirmar',
    'checklist.non_conform': '❌ No conforme',
    'checklist.undo': 'Deshacer este paso',
    'checklist.notes': 'Notas / observaciones',
    'checklist.notes_placeholder': 'Ingresar observaciones…',
    'checklist.measurement': 'Medición ({unit})',
    'checklist.range': 'Rango: {min}–{max} {unit}',
    'checklist.out_of_range': '✗ Fuera de rango',
    'checklist.in_range': '✓ OK',
    'checklist.photo_required': '📷 Foto recomendada para este paso',
    'checklist.saving': '💾 Guardando…',
    'checklist.complete': '¡Lista de control completa!',
    'checklist.complete_hint': 'Sincronice para enviar resultados al servidor.',
    'checklist.no_order': 'Seleccione una orden desde el Programa',
    'checklist.not_found': 'Orden no encontrada en caché local.',
    'checklist.go_to_program': 'Ver Programa →',
  },

  ar: {
    // Navigation
    'nav.capture': 'تسجيل',
    'nav.program': 'البرنامج',
    'nav.checklist': 'قائمة المراجعة',

    // Connection status
    'status.online': 'متصل',
    'status.offline': 'غير متصل',
    'status.pending': '{count} معلق',
    'status.syncing': 'جارٍ المزامنة…',
    'status.last_sync': 'آخر مزامنة: {time}',
    'status.local_cache': 'الذاكرة المحلية',
    'status.sync_now': '↻ مزامنة',

    // Field Capture
    'capture.title': 'تسجيل ميداني',
    'capture.technician': 'الفني',
    'capture.equipment': 'المعدة',
    'capture.location': 'الموقع',
    'capture.type': 'النوع',
    'capture.type.text': 'نص',
    'capture.type.voice': 'صوت',
    'capture.type.image': 'صورة',
    'capture.description': 'الوصف',
    'capture.submit_offline': '💾 حفظ (بلا اتصال)',
    'capture.submit_online': '📤 إرسال',
    'capture.recent': 'التسجيلات الأخيرة',
    'capture.no_equipment_cache': 'لا توجد معدات محفوظة. قم بالمزامنة للتحميل.',
    'capture.required': 'حقل مطلوب',

    // Voice capture
    'capture.voice.record': 'تسجيل',
    'capture.voice.stop': 'إيقاف',
    'capture.voice.recording': 'جارٍ التسجيل… {seconds}ث',
    'capture.voice.playback': 'إعادة التشغيل',
    'capture.voice.transcribe': 'نسخ صوتي',
    'capture.voice.transcribing': 'جارٍ النسخ…',
    'capture.voice.transcribed': 'تم النسخ ({language})',
    'capture.voice.offline_hint': 'سيتم النسخ عند إعادة الاتصال.',
    'capture.voice.not_supported': 'الميكروفون غير متاح.',
    'capture.voice.permission_denied': 'تم رفض إذن الميكروفون.',
    'capture.voice.edit_hint': 'عدّل إذا لزم:',

    // Image capture
    'capture.image.take_photo': 'التقاط صورة',
    'capture.image.from_gallery': 'المعرض',
    'capture.image.analyze': 'تحليل (ذكاء اصطناعي)',
    'capture.image.analyzing': 'جارٍ التحليل…',
    'capture.image.component': 'المكوّن',
    'capture.image.anomalies': 'الشذوذات',
    'capture.image.severity': 'الخطورة',
    'capture.image.offline_hint': 'سيتم التحليل عند إعادة الاتصال.',
    'capture.image.not_supported': 'الكاميرا غير متاحة.',
    'capture.image.permission_denied': 'تم رفض إذن الكاميرا.',

    // GPS
    'capture.gps.locate': 'تحديد الموقع (GPS)',
    'capture.gps.locating': 'جارٍ البحث عن الموقع…',
    'capture.gps.found': '{lat}°ش, {lon}°غ (±{accuracy}م)',
    'capture.gps.nearby': '{count} معدة قريبة',
    'capture.gps.not_supported': 'GPS غير متاح.',
    'capture.gps.permission_denied': 'تم رفض إذن الموقع.',

    // Wizard steps
    'capture.step.identify': 'تحديد',
    'capture.step.capture': 'تسجيل',
    'capture.step.review': 'مراجعة',
    'capture.step.next': 'التالي',
    'capture.step.back': 'رجوع',

    // Media processing
    'capture.media.pending': 'وسائط معلقة',
    'capture.media.processing': 'جارٍ المعالجة…',
    'capture.media.complete': 'اكتملت المعالجة',
    'capture.media.failed': 'فشلت المعالجة',

    // Work Program
    'program.title': 'برنامج العمل',
    'program.today': 'اليوم',
    'program.prev_day': 'اليوم السابق',
    'program.next_day': 'اليوم التالي',
    'program.no_orders': 'لا توجد أوامر لهذا التاريخ.',
    'program.total_hours': 'إجمالي: {n} ساعة',
    'program.orders_count': '{n} أمر (أوامر)',
    'program.urgent': 'عاجل',
    'program.planned': 'مخطط',
    'program.deferred': 'مؤجل',
    'program.start_checklist': 'القائمة ←',

    // Checklist
    'checklist.title': 'قائمة المراجعة',
    'checklist.back': '← البرنامج',
    'checklist.steps': '{done}/{total} خطوة',
    'checklist.gate': 'بوابة',
    'checklist.confirm': '✅ تأكيد',
    'checklist.non_conform': '❌ غير مطابق',
    'checklist.undo': 'التراجع عن هذه الخطوة',
    'checklist.notes': 'ملاحظات',
    'checklist.notes_placeholder': 'أدخل ملاحظاتك…',
    'checklist.measurement': 'القياس ({unit})',
    'checklist.range': 'النطاق: {min}–{max} {unit}',
    'checklist.out_of_range': '✗ خارج النطاق',
    'checklist.in_range': '✓ مناسب',
    'checklist.photo_required': '📷 صورة موصى بها لهذه الخطوة',
    'checklist.saving': '💾 جارٍ الحفظ…',
    'checklist.complete': 'اكتملت قائمة المراجعة!',
    'checklist.complete_hint': 'قم بالمزامنة لإرسال النتائج إلى الخادم.',
    'checklist.no_order': 'اختر أمر عمل من البرنامج',
    'checklist.not_found': 'الأمر غير موجود في الذاكرة المحلية.',
    'checklist.go_to_program': 'انتقل إلى البرنامج ←',
  },
};

// ─── Translation function ──────────────────────────────────────────────────

/**
 * Translate a key into the given language, with optional variable substitution.
 * Falls back to French, then the key itself.
 */
export function t(
  key: string,
  lang: Language = 'fr',
  vars?: Record<string, string | number>,
): string {
  const text =
    translations[lang]?.[key] ?? translations.fr?.[key] ?? key;
  if (!vars) return text;
  return Object.entries(vars).reduce<string>(
    (s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
    text,
  );
}

// ─── Language state (localStorage-backed) ─────────────────────────────────

const LANG_KEY = 'ams-field-lang';

export function getStoredLanguage(): Language {
  const stored = localStorage.getItem(LANG_KEY);
  if (stored && (SUPPORTED_LANGUAGES as { code: string }[]).some((l) => l.code === stored)) {
    return stored as Language;
  }
  return 'fr'; // OCP default
}

export function setStoredLanguage(lang: Language): void {
  localStorage.setItem(LANG_KEY, lang);
  // Apply RTL direction
  const config = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
  document.documentElement.setAttribute('dir', config?.dir ?? 'ltr');
  document.documentElement.setAttribute('lang', lang);
}

// Apply direction on module load
setStoredLanguage(getStoredLanguage());
