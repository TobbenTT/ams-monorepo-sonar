import { useState, useEffect } from 'react';
import { Factory, MapPin, ChevronRight, Database, HardDrive, Wrench } from 'lucide-react';
import { listPlants, getNodeStats } from '../api';

const PLANT_CONFIG = {
  'OCP-JFC1': {
    color: 'blue',
    gradient: 'from-blue-600 to-blue-800',
    hoverGradient: 'from-blue-500 to-blue-700',
    ring: 'ring-blue-400',
    icon: '🏭',
    tagline: 'Phosphate Processing Complex',
  },
  'GOLDFIELDS-SN': {
    color: 'green',
    gradient: 'from-emerald-600 to-emerald-800',
    hoverGradient: 'from-emerald-500 to-emerald-700',
    ring: 'ring-emerald-400',
    icon: '⛏️',
    tagline: 'Deep-Level Gold Mining',
  },
  'FLUOR-ALFA': {
    color: 'gray',
    gradient: 'from-slate-500 to-slate-700',
    hoverGradient: 'from-slate-400 to-slate-600',
    ring: 'ring-slate-400',
    icon: '🔧',
    tagline: 'Engineering & Construction',
  },
};

const DEFAULT_CONFIG = {
  color: 'indigo',
  gradient: 'from-indigo-600 to-indigo-800',
  hoverGradient: 'from-indigo-500 to-indigo-700',
  ring: 'ring-indigo-400',
  icon: '🏗️',
  tagline: 'Maintenance Project',
};

export default function ProjectSelector({ onSelect }) {
  const [plants, setPlants] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    listPlants()
      .then(async (data) => {
        setPlants(data);
        // Load stats for each plant in parallel
        const statResults = {};
        await Promise.allSettled(
          data.map(async (p) => {
            try {
              const s = await getNodeStats(p.plant_id);
              const total = Object.values(s).reduce((a, b) => a + b, 0);
              statResults[p.plant_id] = { ...s, total };
            } catch {
              statResults[p.plant_id] = { total: 0 };
            }
          })
        );
        setStats(statResults);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelect = (plantId) => {
    localStorage.setItem('selected_plant', plantId);
    onSelect(plantId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
            <Factory className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Asset Management
          </h1>
        </div>
        <p className="text-gray-400 text-lg">Select a project to continue</p>
      </div>

      {/* Plant Cards Grid */}
      {loading ? (
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-gray-500 border-t-white rounded-full animate-spin" />
          Loading projects...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
          {plants.map((plant) => {
            const cfg = PLANT_CONFIG[plant.plant_id] || DEFAULT_CONFIG;
            const plantStats = stats[plant.plant_id] || {};
            const isHovered = hoveredId === plant.plant_id;

            return (
              <button
                key={plant.plant_id}
                onClick={() => handleSelect(plant.plant_id)}
                onMouseEnter={() => setHoveredId(plant.plant_id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`
                  group relative overflow-hidden rounded-2xl
                  bg-gradient-to-br ${isHovered ? cfg.hoverGradient : cfg.gradient}
                  p-6 text-left transition-all duration-300 ease-out
                  hover:scale-[1.03] hover:shadow-2xl hover:shadow-${cfg.color}-500/20
                  focus:outline-none focus:ring-2 ${cfg.ring} focus:ring-offset-2 focus:ring-offset-gray-900
                `}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon + ID */}
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{cfg.icon}</span>
                    <span className="px-2.5 py-1 bg-white/15 backdrop-blur rounded-lg text-xs font-mono text-white/80">
                      {plant.plant_id}
                    </span>
                  </div>

                  {/* Name */}
                  <h2 className="text-xl font-bold text-white mb-1">
                    {plant.name}
                  </h2>
                  <p className="text-sm text-white/60 mb-4">{cfg.tagline}</p>

                  {/* Location */}
                  <div className="flex items-center gap-1.5 text-white/70 text-sm mb-5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{plant.location || 'No location set'}</span>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 pt-4 border-t border-white/15">
                    <div className="flex items-center gap-1.5 text-white/80 text-xs">
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>{plantStats.total || 0} assets</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/80 text-xs">
                      <Database className="w-3.5 h-3.5" />
                      <span>{plantStats.EQUIPMENT || 0} equipment</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className={`
                    absolute bottom-6 right-6 w-8 h-8 rounded-full bg-white/15
                    flex items-center justify-center transition-transform duration-300
                    ${isHovered ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}
                  `}>
                    <ChevronRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <p className="mt-12 text-gray-600 text-sm">
        AMS v2.0 — Multi-Plant Architecture
      </p>
    </div>
  );
}
