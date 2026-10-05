import React, { useState } from 'react';
import { useReservation } from '../context/ReservationContext';
import { Booking, BookingStatus } from '../types/reservation';
import { formatDateIndo, formatRupiah, formatTimeAgo } from '../utils/formatters';
import {
  Ticket,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Clock3,
  XCircle,
  Eye,
  PlusCircle,
  RotateCcw,
} from 'lucide-react';

interface MyBookingsProps {
  onViewTicket: (booking: Booking) => void;
  onNewBookingClick: () => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({ onViewTicket, onNewBookingClick }) => {
  const { bookings, cancelBooking, updateBookingStatus } = useReservation();

  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'all' || b.paymentStatus === statusFilter;
    const matchesSearch =
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.teamName && b.teamName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'lunas':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Lunas / Terkonfirmasi
          </span>
        );
      case 'menunggu_pembayaran':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Clock3 className="w-3.5 h-3.5" />
            Menunggu Pembayaran
          </span>
        );
      case 'selesai':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Selesai Dipakai
          </span>
        );
      case 'dibatalkan':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Dibatalkan
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Ticket className="w-6 h-6 text-emerald-400" />
            <span>Riwayat Pesanan & E-Tiket Saya</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Semua reservasi lapangan olahraga yang telah Anda buat tersimpan di sini. Tunjukkan tiket saat check-in.
          </p>
        </div>

        <button
          onClick={onNewBookingClick}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Reservasi Baru</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'Semua Tiket' },
            { id: 'lunas', label: 'Lunas' },
            { id: 'menunggu_pembayaran', label: 'Menunggu Bayar' },
            { id: 'selesai', label: 'Selesai' },
            { id: 'dibatalkan', label: 'Dibatalkan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Cari ID / Lapangan / Tim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Ticket className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">Tidak ada reservasi ditemukan</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'Coba sesuaikan filter atau kata kunci pencarian Anda.'
              : 'Anda belum memiliki riwayat pemesanan lapangan. Silakan pesan slot lapangan pertama Anda sekarang!'}
          </p>
          <button
            onClick={onNewBookingClick}
            className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition cursor-pointer"
          >
            Pesan Lapangan Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {booking.id}
                    </span>
                    <span className="text-[10px] text-slate-400">• {formatTimeAgo(booking.createdAt)}</span>
                  </div>
                  <h4 className="font-bold text-base text-white mt-1 leading-snug">
                    {booking.courtName}
                  </h4>
                </div>
                {getStatusBadge(booking.paymentStatus)}
              </div>

              {/* Details */}
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-medium">{formatDateIndo(booking.date)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-white">{booking.slots.join(', ')}</span>
                  <span className="text-[11px] text-slate-400">({booking.slots.length} jam)</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Pemesan</span>
                    <span className="font-semibold text-white">{booking.customerName}</span>
                    {booking.teamName && (
                      <span className="text-[11px] text-emerald-400/90 block font-medium">
                        [{booking.teamName}]
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Total Bayar</span>
                    <span className="font-extrabold text-white text-sm">
                      {formatRupiah(booking.grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Addons preview if any */}
                {booking.addons.length > 0 && (
                  <p className="text-[11px] text-slate-400">
                    Add-ons: {booking.addons.map((a) => `${a.name} (${a.quantity}x)`).join(', ')}
                  </p>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-400 font-mono">
                  Kode: <strong className="text-white">{booking.checkInCode}</strong>
                </div>

                <div className="flex items-center gap-2">
                  {booking.paymentStatus === 'menunggu_pembayaran' && (
                    <button
                      type="button"
                      onClick={() => updateBookingStatus(booking.id, 'lunas')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer"
                    >
                      Bayar Sekarang
                    </button>
                  )}

                  {booking.paymentStatus === 'lunas' && (
                    <button
                      type="button"
                      onClick={() => onViewTicket(booking)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat E-Tiket</span>
                    </button>
                  )}

                  {booking.paymentStatus !== 'dibatalkan' && booking.paymentStatus !== 'selesai' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Apakah Anda yakin ingin membatalkan reservasi ${booking.id}?`)) {
                          cancelBooking(booking.id);
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    >
                      Batalkan
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
