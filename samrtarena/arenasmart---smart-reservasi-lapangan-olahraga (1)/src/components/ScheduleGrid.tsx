import React from 'react';
import { useReservation } from '../context/ReservationContext';
import { TIME_SLOTS, getTodayDateString } from '../data/initialData';
import { formatDateIndo, formatRupiah } from '../utils/formatters';
import {
  Calendar,
  Clock,
  Flame,
  CheckCircle,
  XCircle,
  AlertOctagon,
  Info,
} from 'lucide-react';

export const ScheduleGrid: React.FC = () => {
  const {
    currentCourt,
    selectedDate,
    setSelectedDate,
    selectedSlots,
    toggleSlot,
    clearSlots,
    getSlotStatus,
    getSlotBookerInfo,
  } = useReservation();

  if (!currentCourt) return null;

  // Quick date shortcuts
  const today = getTodayDateString(0);
  const tomorrow = getTodayDateString(1);
  const dayAfter = getTodayDateString(2);

  const isCourtOperational = currentCourt.isOperational;

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-4 sm:p-7 backdrop-blur-sm space-y-5 sm:space-y-6 shadow-xl">
      {/* Header & Date Picker */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 sm:pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs sm:text-sm shrink-0">
              2
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Pilih Tanggal & Slot Jam
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Klik slot jam yang diinginkan pada {currentCourt.name}. Bisa pilih lebih dari 1 jam.
          </p>
        </div>

        {/* Date Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setSelectedDate(today)}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedDate === today
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate(tomorrow)}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedDate === tomorrow
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            Besok
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate(dayAfter)}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedDate === dayAfter
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            Lusa
          </button>

          {/* Native Date Input */}
          <div className="relative flex items-center">
            <input
              type="date"
              value={selectedDate}
              min={today}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer max-w-[140px] sm:max-w-none"
            />
          </div>
        </div>
      </div>

      {/* Selected Date Indicator Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/60 border border-slate-800 px-3.5 sm:px-4 py-2.5 rounded-xl">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300 min-w-0">
          <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">Jadwal: <strong className="text-white font-bold">{formatDateIndo(selectedDate)}</strong></span>
        </div>

        {/* Clear Selection button if any */}
        {selectedSlots.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] sm:text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {selectedSlots.length} Jam Dipilih
            </span>
            <button
              type="button"
              onClick={clearSlots}
              className="text-[11px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
            >
              Reset Pilihan
            </button>
          </div>
        )}
      </div>

      {/* Color Status Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs">
        <div className="font-semibold text-slate-300 text-[10px] sm:text-[11px] uppercase tracking-wider">
          Indikator:
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500 shrink-0" />
            <span className="text-slate-300">Hijau: Tersedia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-[9px] shrink-0">
              ✓
            </span>
            <span className="text-slate-300">Dipilih</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500 shrink-0" />
            <span className="text-slate-300">Merah: Terisi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500 shrink-0" />
            <span className="text-slate-300">Kuning: Maint.</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-300">Prime</span>
          </div>
        </div>
      </div>

      {/* Warning if court is closed */}
      {!isCourtOperational && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300">
          <AlertOctagon className="w-5 h-5 shrink-0 text-rose-400" />
          <p className="text-xs leading-relaxed">
            <strong>Perhatian:</strong> Lapangan ini sementara ditutup oleh pihak pengelola untuk pemeliharaan rutin. Silakan pilih lapangan lainnya atau hubungi Admin.
          </p>
        </div>
      )}

      {/* Time Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
        {TIME_SLOTS.map((slot) => {
          const status = getSlotStatus(currentCourt.id, selectedDate, slot.time);
          const isSelected = selectedSlots.includes(slot.time);
          const isPrime = slot.isPrimeTime;
          const slotPrice = isPrime ? currentCourt.primeTimeRate : currentCourt.hourlyRate;
          const booker = status === 'booked' ? getSlotBookerInfo(currentCourt.id, selectedDate, slot.time) : null;

          // Status-specific styles
          let cardBg = '';
          let badgeText = '';
          let badgeColor = '';
          let isClickable = true;

          if (!isCourtOperational) {
            cardBg = 'bg-slate-900/40 border-slate-800 opacity-40 cursor-not-allowed';
            badgeText = 'Tutup';
            badgeColor = 'text-slate-400';
            isClickable = false;
          } else if (status === 'selected') {
            cardBg = 'bg-gradient-to-br from-emerald-500 to-teal-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30 scale-[1.01] ring-2 ring-emerald-400';
            badgeText = 'Terpilih';
            badgeColor = 'bg-slate-950 text-emerald-300 font-bold';
          } else if (status === 'booked') {
            cardBg = 'bg-rose-950/20 border-rose-900/40 text-rose-300/80 cursor-not-allowed hover:border-rose-800';
            badgeText = 'Terisi (Booked)';
            badgeColor = 'text-rose-400 bg-rose-950/60 border border-rose-800/50';
            isClickable = false;
          } else if (status === 'maintenance') {
            cardBg = 'bg-amber-950/20 border-amber-900/40 text-amber-300/80 cursor-not-allowed hover:border-amber-800';
            badgeText = 'Maintenance';
            badgeColor = 'text-amber-400 bg-amber-950/60 border border-amber-800/50';
            isClickable = false;
          } else {
            // Available (Emerald Green)
            cardBg = 'bg-slate-950/70 hover:bg-slate-900 border-emerald-500/30 hover:border-emerald-500/70 text-slate-100 hover:shadow-md hover:shadow-emerald-500/10 cursor-pointer';
            badgeText = 'Tersedia';
            badgeColor = 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
          }

          return (
            <div
              key={slot.id}
              onClick={() => {
                if (isClickable && isCourtOperational) {
                  toggleSlot(slot.time);
                }
              }}
              title={
                status === 'booked'
                  ? `Sudah dibooking${booker?.customerName ? ` oleh: ${booker.customerName}` : ''}`
                  : status === 'maintenance'
                  ? 'Slot sedang dalam pemeliharaan berkala'
                  : `Klik untuk memilih slot jam ${slot.time}`
              }
              className={`p-2.5 sm:p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between select-none relative group ${cardBg}`}
            >
              {/* Top slot header: Time & Prime badge */}
              <div className="flex items-start justify-between gap-1 mb-1 sm:mb-2">
                <div className="flex items-center gap-1 font-bold text-xs sm:text-sm">
                  <Clock className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${status === 'selected' ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span className="truncate">{slot.time}</span>
                </div>
                {isPrime && (
                  <span
                    className={`text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded flex items-center gap-0.5 shrink-0 ${
                      status === 'selected'
                        ? 'bg-slate-950/40 text-amber-950'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    <Flame className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    <span className="hidden xs:inline">Prime</span>
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="my-1">
                <span
                  className={`text-[11px] sm:text-xs font-semibold ${
                    status === 'selected' ? 'text-slate-950 font-bold' : 'text-slate-200'
                  }`}
                >
                  {formatRupiah(slotPrice)}
                </span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between mt-1 sm:mt-2 pt-1.5 sm:pt-2 border-t border-slate-800/40 text-[10px] sm:text-[11px]">
                <span className={`px-1.5 sm:px-2 py-0.5 rounded-md font-semibold text-[9px] sm:text-[10px] truncate max-w-[85px] sm:max-w-none ${badgeColor}`}>
                  {badgeText}
                </span>

                {status === 'selected' && (
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 shrink-0" />
                )}
                {status === 'booked' && (
                  <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500 shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Helper text */}
      <div className="flex items-start sm:items-center gap-2 text-[11px] sm:text-xs text-slate-400 pt-1">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5 sm:mt-0" />
        <span>
          Tarif <strong>Prime-Time</strong> berlaku pukul 18:00 - 22:00 WIB (jam tersibuk dengan tata lampu stadium intensif).
        </span>
      </div>
    </div>
  );
};
