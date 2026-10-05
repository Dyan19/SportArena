import React from 'react';
import { useReservation } from '../context/ReservationContext';
import { SportType, Court } from '../types/reservation';
import { formatRupiah } from '../utils/formatters';
import {
  Sparkles,
  Star,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Maximize2,
  MapPin,
} from 'lucide-react';

export const CourtSelector: React.FC = () => {
  const {
    courts,
    selectedSport,
    setSelectedSport,
    selectedCourtId,
    setSelectedCourtId,
  } = useReservation();

  const sportCategories: { type: SportType; label: string; icon: string; desc: string }[] = [
    { type: 'futsal', label: 'Futsal', icon: '⚽', desc: 'Interlock & Rumput Sintetis FIFA' },
    { type: 'badminton', label: 'Badminton', icon: '🏸', desc: 'Karpet BWF Pro & Kayu Parquet' },
    { type: 'tennis', label: 'Tenis Lapangan', icon: '🎾', desc: 'DecoTurf Hard Court & Clay' },
  ];

  const filteredCourts = courts.filter((c) => c.sport === selectedSport);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Sport Category Tabs */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs sm:text-sm font-extrabold flex items-center justify-center border border-emerald-500/30">
                1
              </span>
              <span>Pilih Cabang Olahraga</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pilih jenis olahraga favorit Anda untuk melihat ketersediaan lapangan berstandar internasional.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {sportCategories.map((cat) => {
            const isSelected = selectedSport === cat.type;
            const count = courts.filter((c) => c.sport === cat.type && c.isOperational).length;

            return (
              <button
                key={cat.type}
                type="button"
                onClick={() => setSelectedSport(cat.type)}
                className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all text-left relative overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-900 border-emerald-500/70 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-inner shrink-0 ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30 font-black'
                      : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className={`font-bold text-sm sm:text-base truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {cat.label}
                    </h3>
                    <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 shrink-0">
                      {count} Lap.
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">{cat.desc}</p>
                </div>
                {isSelected && (
                  <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Courts List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400">
            Daftar Lapangan {sportCategories.find((s) => s.type === selectedSport)?.label}
          </h3>
          <span className="text-[11px] sm:text-xs text-slate-400">
            Pilih lapangan di bawah
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCourts.map((court) => {
            const isSelected = selectedCourtId === court.id;
            return (
              <div
                key={court.id}
                onClick={() => setSelectedCourtId(court.id)}
                className={`group rounded-2xl border transition-all overflow-hidden flex flex-col cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/40'
                    : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Court Image Banner */}
                <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-slate-950">
                  <img
                    src={court.image}
                    alt={court.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 max-w-[65%] flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold bg-slate-950/85 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{court.courtType}</span>
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-slate-950/85 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-bold text-amber-300 border border-amber-500/30 shrink-0">
                    <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                    <span>{court.rating}</span>
                    <span className="text-slate-400 font-normal">({court.totalReviews})</span>
                  </div>

                  {/* Operational Status */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    {court.isOperational ? (
                      <span className="inline-flex px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-bold bg-emerald-500/90 text-slate-950 items-center gap-1 shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                        Tersedia untuk Booking
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-bold bg-rose-500/90 text-white items-center gap-1 shadow-md">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        Sedang Ditutup / Maintenance
                      </span>
                    )}
                  </div>
                </div>

                {/* Court Content */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {court.name}
                      </h4>
                      {isSelected && (
                        <span className="p-1 rounded-full bg-emerald-500 text-slate-950 shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                      <span className="flex items-center gap-1">
                        <Maximize2 className="w-3 h-3 text-slate-500" />
                        <span>{court.dimensions}</span>
                      </span>
                      <span className="text-slate-600 hidden xs:inline">•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{court.location}</span>
                      </span>
                    </div>
                  </div>

                  {/* Facilities Chips */}
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {court.facilities.slice(0, 3).map((facility, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        {facility}
                      </span>
                    ))}
                    {court.facilities.length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800/40 text-slate-400">
                        +{court.facilities.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Pricing Footer */}
                  <div className="pt-2.5 sm:pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">Tarif Reguler</span>
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {formatRupiah(court.hourlyRate)}
                        <span className="text-[10px] sm:text-xs font-normal text-slate-400">/jam</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] sm:text-[11px] text-amber-400/90 font-medium flex items-center justify-end gap-1">
                        <Flame className="w-3 h-3 text-amber-400" />
                        Prime-Time
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-amber-300">
                        {formatRupiah(court.primeTimeRate)}
                        <span className="text-[10px] sm:text-xs font-normal text-slate-400">/jam</span>
                      </span>
                    </div>
                  </div>

                  {/* Selection Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCourtId(court.id);
                    }}
                    className={`w-full py-2.5 sm:py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Lapangan Ini Terpilih</span>
                      </>
                    ) : (
                      <span>Pilih Lapangan Ini</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
