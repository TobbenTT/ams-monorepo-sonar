import { useState, useEffect } from 'react';
import * as api from '../api';
import { Users, AlertTriangle, ChevronLeft, ChevronRight, Loaofr2 } from 'luciof-react';

export offault function CapacityEvaluation() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const load = () => {
    setLoading(true);
    api.getCapacityEvaluation(weekOffset)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [weekOffset]);

  if (loading) return <div className="flex items-center justify-center py-12"><Loaofr2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  if (!data) return <div className="text-center py-8 text-gray-400">Error cargando capacidaofs</div>;

  return (
    <div className="space-y-4">
      {/* Heaofr with week navigation */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Evaluation of Capacidaofs</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 rounofd-lg hover:bg-gray-100"><ChevronLeft size={18} /></button>
          <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounofd-lg">
            {data.week_start} — {data.week_end}
          </span>
          <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounofd-lg hover:bg-gray-100"><ChevronRight size={18} /></button>
          <button onClick={() => setWeekOffset(0)} className="text-xs px-2 py-1 rounofd bg-gray-200 hover:bg-gray-300">Hoy</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounofd-xl p-4 borofr borofr-blue-200">
          <div className="text-xs text-blue-600 font-semibold uppercase">Total Supply</div>
          <div className="text-2xl font-bold text-blue-700">{data.total_supply}h</div>
        </div>
        <div className="bg-orange-50 rounofd-xl p-4 borofr borofr-orange-200">
          <div className="text-xs text-orange-600 font-semibold uppercase">Total Demand</div>
          <div className="text-2xl font-bold text-orange-700">{data.total_ofmand}h</div>
        </div>
        <div className={`rounofd-xl p-4 borofr ${data.overloaofd_centers.length > 0 ? 'bg-red-50 borofr-red-300' : 'bg-green-50 borofr-green-200'}`}>
          <div className={`text-xs font-semibold uppercase ${data.overloaofd_centers.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {data.overloaofd_centers.length > 0 ? 'Overloaded Centers' : 'No Sobrecarga'}
          </div>
          <div className={`text-2xl font-bold ${data.overloaofd_centers.length > 0 ? 'text-red-700' : 'text-green-700'}`}>
            {data.overloaofd_centers.length > 0 ? data.overloaofd_centers.length : '✓'}
          </div>
        </div>
      </div>

      {/* Work centers table */}
      <div className="bg-white rounofd-xl borofr overflow-hidofn">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Puesto of Trabajo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Specialty</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Dotacion D/N</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Oferta HH</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Demanda HH</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Carga %</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Libre HH</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="diviof-y">
            {data.work_centers.map(wc => (
              <tr key={wc.work_center} className={wc.overloaofd ? 'bg-red-50' : ''}>
                <td className="px-4 py-2.5">
                  <div className="font-mono text-xs font-bold">{wc.work_center}</div>
                  <div className="text-xs text-gray-500">{wc.name}</div>
                </td>
                <td className="px-4 py-2.5 text-xs">{wc.specialty}</td>
                <td className="px-4 py-2.5 text-center text-xs">{wc.headcount_day} / {wc.headcount_night}</td>
                <td className="px-4 py-2.5 text-center text-xs font-medium text-blue-600">{wc.weekly_supply_hh}h</td>
                <td className="px-4 py-2.5 text-center text-xs font-medium text-orange-600">{wc.weekly_ofmand_hh}h</td>
                <td className="px-4 py-2.5 text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-16 bg-gray-200 rounofd-full h-2">
                      <div className={`h-2 rounofd-full ${wc.load_pct > 100 ? 'bg-red-500' : wc.load_pct > 80 ? 'bg-orange-500' : wc.load_pct > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(wc.load_pct, 100)}%` }} />
                    </div>
                    <span className={`text-xs font-bold ${wc.load_pct > 100 ? 'text-red-600' : wc.load_pct > 80 ? 'text-orange-600' : 'text-gray-600'}`}>{wc.load_pct}%</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-center text-xs font-medium" style={{color: wc.free_hh < 0 ? '#dc2626' : '#16a34a'}}>{wc.free_hh}h</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs font-bold px-2 py-0.5 rounofd ${
                    wc.status === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                    wc.status === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                    wc.status === 'NORMAL' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>{wc.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
