import React, { useState } from 'react';
import { useReservation } from '../context/ReservationContext';
import { INITIAL_ADDONS } from '../data/initialData';
import { formatDateIndo, formatRupiah } from '../utils/formatters';
import {
  Calendar,
  Clock,
  Tag,
  ArrowRight,
  Sparkles,
  Check,
  Flame,
  Info,
} from 'lucide-react';

interface BookingSummaryCardProps {
  onProceedToPayment: (voucherCode: string) => void;
}

export const BookingSummaryCard: React.FC<BookingSummaryCardProps> = ({ onProceedToPayment }) => {
  const {
    currentCourt,
    selectedDate,
    selectedSlots,
    selectedAddons,
    calculatePricing,
  } = useReservation();

  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState('');
  const [voucherError, setVoucherError] = useState('');

  const pricing = calculatePricing(selectedSlots, selectedAddons, appliedVoucher);

  const handleApplyVoucher = (codeToApply?: string) => {
    const code = (codeToApply || voucherInput).trim().toUpperCase();
    if (!code) return;

    if (code === 'MAHASISWAJUARA' || code === 'DOSENKEREN' || code === 'SMART50') {
      setAppliedVoucher(code);
      setVoucherInput(code);
      setVoucherError('');
    } else {
      setVoucherError('Kode voucher tidak valid');
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher('');
    setVoucherInput('');
    setVoucherError('');
  };

  if (!currentCourt) return null;

  const hasSelectedSlots = selectedSlots.length > 0;

  return (
    <>
      <div
        id="booking-summary-section"
        className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 backdrop-blur-md shadow-2xl lg:sticky lg:top-24 space-y-4 sm:space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Ringkasan Reservasi</span>
          </h3>
          <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
            Step 4 of 4
          </span>
        </div>

        {/* Selected Court & Date Mini Info */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
          <div className="flex items-start gap-3">
            <img
              src={currentCourt.image}
              alt={currentCourt.name}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-slate-700 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                {currentCourt.sport.toUpperCase()}
              </span>
              <h4 className="font-bold text-xs sm:text-sm text-white truncate leading-tight">
                {currentCourt.name}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">{currentCourt.location}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-1.5 min-w-0">
              <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{formatDateIndo(selectedDate)}</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-emerald-400 shrink-0">
              <Clock className="w-3.5 h-3.5" />
              <span>{selectedSlots.length} Jam</span>
            </div>
          </div>
        </div>

        {/* Slots Breakdown */}
        <div>
          <label className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Slot Jam yang Dipilih:
          </label>
          {selectedSlots.length === 0 ? (
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-400">
              Silakan klik slot jam di jadwal lapangan (Tersedia) untuk melanjutkan.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-36 sm:max-h-40 overflow-y-auto pr-1">
              {pricing.slotBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-950/60 border border-slate-800"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-semibold text-white truncate">{item.slotTime}</span>
                    {item.isPrimeTime && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 flex items-center gap-0.5 shrink-0">
                        <Flame className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        Prime
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-slate-200 shrink-0">{formatRupiah(item.price)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add-ons Breakdown */}
        {Object.keys(selectedAddons).length > 0 && (
          <div>
            <label className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Sewa Alat & Layanan:
            </label>
            <div className="space-y-1.5 max-h-32 sm:max-h-36 overflow-y-auto pr-1">
              {Object.entries(selectedAddons).map(([addonId, qty]) => {
                const addon = INITIAL_ADDONS.find((a) => a.id === addonId);
                if (!addon || qty <= 0) return null;
                return (
                  <div
                    key={addonId}
                    className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-950/60 border border-slate-800"
                  >
                    <div className="truncate pr-2 min-w-0">
                      <span className="font-medium text-white block truncate">{addon.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {qty} × {formatRupiah(addon.price)}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-400 shrink-0">
                      {formatRupiah(addon.price * qty)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Voucher Promo */}
        <div className="pt-2 border-t border-slate-800">
          <label className="text-xs font-semibold text-slate-400 flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              Kupon Diskon / Promo
            </span>
            {appliedVoucher && (
              <button
                type="button"
                onClick={handleRemoveVoucher}
                className="text-[11px] text-rose-400 hover:underline cursor-pointer"
              >
                Hapus
              </button>
            )}
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="MAHASISWAJUARA"
              value={voucherInput}
              onChange={(e) => setVoucherInput(e.target.value)}
              disabled={!!appliedVoucher}
              className="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => handleApplyVoucher()}
              disabled={!!appliedVoucher || !voucherInput.trim()}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
            >
              Terapkan
            </button>
          </div>

          {voucherError && (
            <p className="text-[11px] text-rose-400 mt-1">{voucherError}</p>
          )}

          {!appliedVoucher && (
            <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400 flex-wrap">
              <span>Promo:</span>
              <button
                type="button"
                onClick={() => handleApplyVoucher('MAHASISWAJUARA')}
                className="text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                MAHASISWAJUARA
              </button>
              <span>/</span>
              <button
                type="button"
                onClick={() => handleApplyVoucher('DOSENKEREN')}
                className="text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                DOSENKEREN
              </button>
            </div>
          )}

          {appliedVoucher && (
            <div className="mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Kupon <strong>{appliedVoucher}</strong> aktif!</span>
            </div>
          )}
        </div>

        {/* Financial Breakdown */}
        <div className="space-y-1.5 sm:space-y-2 pt-2.5 border-t border-slate-800 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Sewa Lapangan ({selectedSlots.length} jam)</span>
            <span className="font-semibold text-white">{formatRupiah(pricing.courtSubtotal)}</span>
          </div>

          <div className="flex justify-between text-slate-300">
            <span>Add-ons & Peralatan</span>
            <span className="font-semibold text-white">{formatRupiah(pricing.addonsSubtotal)}</span>
          </div>

          <div className="flex justify-between text-slate-300">
            <span className="flex items-center gap-1">
              Biaya Layanan Sistem
              <span title="Biaya pemeliharaan server & konfirmasi instan" className="inline-flex">
                <Info className="w-3 h-3 text-slate-500" />
              </span>
            </span>
            <span className="font-semibold text-white">
              {selectedSlots.length > 0 ? formatRupiah(pricing.serviceFee) : 'Rp 0'}
            </span>
          </div>

          {pricing.discount > 0 && (
            <div className="flex justify-between text-emerald-400 font-medium">
              <span>Potongan Diskon</span>
              <span>- {formatRupiah(pricing.discount)}</span>
            </div>
          )}

          <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Total Pembayaran:</span>
              <span className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {formatRupiah(pricing.grandTotal)}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
              Konfirmasi Instan
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          type="button"
          disabled={!hasSelectedSlots || !currentCourt.isOperational}
          onClick={() => onProceedToPayment(appliedVoucher)}
          className={`w-full py-3 sm:py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            hasSelectedSlots && currentCourt.isOperational
              ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>Lanjut ke Pembayaran</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {!hasSelectedSlots && (
          <p className="text-center text-[11px] text-amber-400/90 font-medium">
            Pilih minimal 1 slot jam di jadwal lapangan untuk melanjutkan.
          </p>
        )}
      </div>

      {/* Floating Sticky Bottom Bar on Mobile when slots are chosen */}
      {hasSelectedSlots && currentCourt.isOperational && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 p-3 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl flex items-center justify-between gap-3 shadow-2xl">
          <div>
            <span className="text-[10px] text-slate-400 block">
              {selectedSlots.length} Jam • {currentCourt.name}
            </span>
            <span className="text-base font-extrabold text-white">
              {formatRupiah(pricing.grandTotal)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onProceedToPayment(appliedVoucher)}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 cursor-pointer shrink-0"
          >
            <span>Bayar Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
};
