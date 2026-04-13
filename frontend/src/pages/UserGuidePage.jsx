import { BookOpen, Download, ExternalLink } from 'lucide-react';

export default function UserGuidePage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-500 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Manual de Usuario</h1>
        </div>
        <p className="text-teal-100 text-lg">
          Guia completa de MAGEAM &mdash; 18 secciones cubriendo todos los modulos
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <a
          href="/manual-usuario.html"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors shadow-lg"
        >
          <ExternalLink className="w-5 h-5" />
          Abrir Manual Completo
        </a>
        <button
          onClick={() => {
            const w = window.open('/manual-usuario.html', '_blank');
            setTimeout(() => { w.print(); }, 1500);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors shadow-lg cursor-pointer"
        >
          <Download className="w-5 h-5" />
          Descargar PDF
        </button>
      </div>

      {/* Embedded preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <iframe
          src="/manual-usuario.html"
          title="Manual de Usuario AMS"
          className="w-full border-0"
          style={{ height: 'calc(100vh - 280px)', minHeight: '600px' }}
        />
      </div>
    </div>
  );
}
