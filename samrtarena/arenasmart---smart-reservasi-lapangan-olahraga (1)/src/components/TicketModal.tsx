import React from 'react';
import { Booking } from '../types/reservation';
import { formatDateIndo, formatRupiah } from '../utils/formatters';
import {
  X,
  Printer,
  CheckCircle,
  Share2,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  ShieldCheck,
  User,
  Users,
  Download,
} from 'lucide-react';

interface TicketModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ booking, onClose }) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const getSportBadge = (sport: string) => {
    switch (sport) {
      case 'futsal':
        return '⚽ FUTSAL ARENA';
      case 'badminton':
        return '🏸 BADMINTON COURT';
      case 'tennis':
        return '🎾 TENNIS PRO';
      default:
        return 'SPORT ARENA';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-6">
        {/* Top bar */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>E-Tiket & Bukti Reservasi Sah</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer text-xs flex items-center gap-1"
              title="Cetak E-Tiket"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Boarding Pass E-Ticket Body */}
        <div className="p-6">
          <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl relative">
            {/* Header notch design */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 p-5 text-slate-950">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black tracking-widest uppercase bg-slate-950/20 px-2.5 py-0.5 rounded-full">
                  {getSportBadge(booking.sport)}
                </span>
                <span className="text-xs font-black tracking-wider uppercase bg-slate-950 text-emerald-400 px-3 py-1 rounded-full shadow-sm">
                  {booking.paymentStatus === 'lunas' ? 'LUNAS / CONFIRMED' : 'MENUNGGU VERIFIKASI'}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white mt-2 leading-tight">
                {booking.courtName}
              </h3>
              <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                ID Booking: <strong className="font-mono">{booking.id}</strong>
              </p>
            </div>

            {/* Ticket Info Grid */}
            <div className="p-5 space-y-4 text-xs">
              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium uppercase">Tanggal Main</span>
                  <div className="flex items-center gap-1.5 font-bold text-white mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{formatDateIndo(booking.date)}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-medium uppercase">Slot Waktu</span>
                  <div className="flex items-center gap-1.5 font-bold text-white mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{booking.slots.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Pemesan & Tim */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium uppercase">Nama Pemesan</span>
                  <span className="font-bold text-white block mt-0.5">{booking.customerName}</span>
                  <span className="text-[11px] text-slate-400">{booking.customerPhone}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-medium uppercase">Klub / Tim</span>
                  <span className="font-bold text-white block mt-0.5">{booking.teamName || '-'}</span>
                </div>
              </div>

              {/* Addons if any */}
              {booking.addons.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-medium uppercase mb-1">
                    Fasilitas & Sewa Alat Tambahan:
                  </span>
                  <div className="space-y-1">
                    {booking.addons.map((addon, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] text-slate-300">
                        <span>• {addon.name} ({addon.quantity}x)</span>
                        <span className="text-slate-200 font-semibold">{formatRupiah(addon.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial Totals */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Metode Pembayaran</span>
                  <span className="font-bold text-slate-200 uppercase">
                    {booking.paymentMethod.replace('va_', 'Virtual Account ').replace('_', ' ')}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Total Lunas</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    {formatRupiah(booking.grandTotal)}
                  </span>
                </div>
              </div>

              {/* Ticket Separation Perforation Line */}
              <div className="relative py-2">
                <div className="border-b-2 border-dashed border-slate-700" />
                <div className="absolute -left-7 top-0.5 w-4 h-4 rounded-full bg-slate-900 border border-slate-700" />
                <div className="absolute -right-7 top-0.5 w-4 h-4 rounded-full bg-slate-900 border border-slate-700" />
              </div>

              {/* Check-in QR code & Instruction */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Kode Check-In Kasir
                  </span>
                  <span className="font-mono text-xl font-black text-white tracking-widest">
                    {booking.checkInCode}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                    Tunjukkan tiket ini kepada petugas penjaga lapangan saat tiba di lokasi.
                  </p>
                </div>

                {/* Simulated Barcode / QR */}
                <div className="p-2 bg-white rounded-xl shadow-inner shrink-0">
                  <svg viewBox="0 0 100 100" className="w-18 h-18" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="100" fill="white" />
                    <rect x="5" y="5" width="25" height="25" fill="black" />
                    <rect x="10" y="10" width="15" height="15" fill="white" />
                    <rect x="13" y="13" width="9" height="9" fill="black" />

                    <rect x="70" y="5" width="25" height="25" fill="black" />
                    <rect x="75" y="10" width="15" height="15" fill="white" />
                    <rect x="78" y="13" width="9" height="9" fill="black" />

                    <rect x="5" y="70" width="25" height="25" fill="black" />
                    <rect x="10" y="75" width="15" height="15" fill="white" />
                    <rect x="13" y="78" width="9" height="9" fill="black" />

                    <rect x="35" y="10" width="8" height="15" fill="black" />
                    <rect x="50" y="12" width="12" height="6" fill="black" />
                    <rect x="40" y="40" width="20" height="20" fill="black" />
                    <rect x="10" y="40" width="15" height="8" fill="black" />
                    <rect x="70" y="45" width="15" height="15" fill="black" />
                    <rect x="40" y="75" width="10" height="15" fill="black" />
                    <rect x="60" y="75" width="25" height="8" fill="black" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-5 flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Cetak Bukti E-Tiket</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <span>Selesai & Tutup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
