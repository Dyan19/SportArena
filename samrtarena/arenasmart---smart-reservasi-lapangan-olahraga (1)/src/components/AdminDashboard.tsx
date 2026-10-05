import React, { useState } from 'react';
import { useReservation } from '../context/ReservationContext';
import { Booking, BookingStatus } from '../types/reservation';
import { TIME_SLOTS, getTodayDateString } from '../data/initialData';
import { formatDateIndo, formatRupiah, formatTimeAgo } from '../utils/formatters';
import {
  TrendingUp,
  DollarSign,
  CalendarCheck,
  Flame,
  Activity,
  Search,
  Filter,
  Download,
  Plus,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Wrench,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  Sliders,
  Trash2,
  ExternalLink,
  LogOut,
  RotateCcw,
  Info,
} from 'lucide-react';

interface AdminDashboardProps {
  onViewTicket: (booking: Booking) => void;
  onOpenDemoGuide?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onViewTicket, onOpenDemoGuide }) => {
  const {
    adminStats,
    bookings,
    courts,
    updateBookingStatus,
    deleteBooking,
    toggleMaintenance,
    toggleCourtOperational,
    addManualWalkInBooking,
    maintenanceSlots,
    logoutAdmin,
    resetDemoData,
  } = useReservation();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [courtFilter, setCourtFilter] = useState<string>('all');

  // Maintenance manager drawer/modal state
  const [maintenanceCourtId, setMaintenanceCourtId] = useState<string>(courts[0]?.id || 'futsal-a');
  const [maintenanceDate, setMaintenanceDate] = useState<string>(getTodayDateString(0));
  const [showWalkInModal, setShowWalkInModal] = useState<boolean>(false);

  // Walk-in form state
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('081299991111');
  const [walkInTeam, setWalkInTeam] = useState('Tamu Offline');
  const [walkInCourtId, setWalkInCourtId] = useState(courts[0]?.id || 'futsal-a');
  const [walkInDate, setWalkInDate] = useState(getTodayDateString(0));
  const [walkInSlot, setWalkInSlot] = useState('16:00 - 17:00');

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchStatus = statusFilter === 'all' || b.paymentStatus === statusFilter;
    const matchCourt = courtFilter === 'all' || b.courtId === courtFilter;
    const matchSearch =
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerPhone.includes(searchTerm) ||
      (b.teamName && b.teamName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchStatus && matchCourt && matchSearch;
  });

  // Export CSV Helper
  const handleExportCSV = () => {
    const headers = ['ID Booking', 'Waktu Dibuat', 'Pemesan', 'Telepon', 'Tim', 'Lapangan', 'Tanggal', 'Slot Jam', 'Total Bayar', 'Metode', 'Status'];
    const rows = filteredBookings.map((b) => [
      b.id,
      b.createdAt,
      `"${b.customerName}"`,
      b.customerPhone,
      `"${b.teamName || ''}"`,
      `"${b.courtName}"`,
      b.date,
      `"${b.slots.join(', ')}"`,
      b.grandTotal,
      b.paymentMethod,
      b.paymentStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap-reservasi-arenasmart-${getTodayDateString(0)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    const court = courts.find((c) => c.id === walkInCourtId);
    if (!court) return;

    addManualWalkInBooking({
      customerName: walkInName || 'Tamu Kasir Offline',
      customerPhone: walkInPhone,
      teamName: walkInTeam,
      courtId: court.id,
      courtName: court.name,
      sport: court.sport,
      date: walkInDate,
      slots: [walkInSlot],
      grandTotal: court.hourlyRate,
      courtSubtotal: court.hourlyRate,
    });

    setShowWalkInModal(false);
    setWalkInName('');
  };

  const currentMaintenanceCourt = courts.find((c) => c.id === maintenanceCourtId);
  const maintenanceKey = `${maintenanceCourtId}_${maintenanceDate}`;
  const activeMaintenanceList = maintenanceSlots[maintenanceKey] || [];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 p-6 rounded-3xl border border-indigo-500/30">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Panel Pengelola & Owner Arena</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Dashboard Analitik & Kontrol Operasional
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitoring rekapitulasi keuangan real-time, manajemen slot perawatan lapangan, dan daftar pemesanan masuk.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowWalkInModal(true)}
            className="px-3.5 py-2 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Booking Kasir</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
            title="Download Rekap CSV untuk Laporan"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {onOpenDemoGuide && (
            <button
              onClick={onOpenDemoGuide}
              className="px-3 py-2 rounded-xl font-semibold text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition flex items-center gap-1.5 cursor-pointer"
              title="Panduan Alur Pengujian Dosen"
            >
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Panduan Uji</span>
            </button>
          )}

          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 border border-slate-700 transition cursor-pointer"
            title="Reset Data Demo ke Kondisi Awal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={logoutAdmin}
            className="px-3.5 py-2 rounded-xl font-bold text-xs bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition flex items-center gap-1.5 cursor-pointer"
            title="Kunci dashboard dan kembali ke tampilan pengguna umum"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Kunci & Keluar</span>
          </button>
        </div>
      </div>

      {/* 4 STATISTIC CARDS (REKAPITULASI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pendapatan */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Pendapatan
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white block tracking-tight">
              {formatRupiah(adminStats.totalRevenue)}
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Hari Ini: {formatRupiah(adminStats.todayRevenue)}</span>
            </span>
          </div>
        </div>

        {/* Total Booking */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Reservasi
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white block tracking-tight">
              {adminStats.totalBookings} <span className="text-sm font-medium text-slate-400">Sesi</span>
            </span>
            <span className="text-xs text-cyan-400 font-semibold flex items-center gap-1 mt-1">
              <span>{adminStats.todayBookings} Booking Masuk Hari Ini</span>
            </span>
          </div>
        </div>

        {/* Jam Teramai (Prime-Time Peak) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group hover:border-amber-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Jam Teramai (Peak-Time)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white block tracking-tight">
              {adminStats.peakHour}
            </span>
            <span className="text-xs text-amber-400 font-semibold flex items-center gap-1 mt-1">
              <span>Tingkat Kepadatan Tertinggi</span>
            </span>
          </div>
        </div>

        {/* Tingkat Okupansi Lapangan */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group hover:border-indigo-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Okupansi Hari Ini
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white block tracking-tight">
                {adminStats.occupancyRate}%
              </span>
              <span className="text-xs text-slate-400 font-normal">Kapasitas</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full"
                style={{ width: `${adminStats.occupancyRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* COURT STATUS & MAINTENANCE MANAGER */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-400" />
              <span>Manajemen Status Lapangan & Pemeliharaan (Maintenance)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Tutup lapangan secara menyeluruh atau matikan slot jam spesifik untuk pembersihan/perbaikan rutin.
            </p>
          </div>
        </div>

        {/* Lapangan Operational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {courts.map((court) => (
            <div
              key={court.id}
              className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                court.isOperational
                  ? 'bg-slate-950/70 border-slate-800'
                  : 'bg-rose-950/20 border-rose-900/50 text-rose-200'
              }`}
            >
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  {court.sport}
                </span>
                <h4 className="font-bold text-sm text-white truncate">{court.name}</h4>
                <span className="text-xs text-slate-400 block mt-0.5">
                  {court.isOperational ? '● Status: Buka / Beroperasi' : '○ Status: Tutup Total'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => toggleCourtOperational(court.id)}
                className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  court.isOperational
                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40'
                }`}
                title={court.isOperational ? 'Klik untuk menutup lapangan' : 'Klik untuk membuka kembali'}
              >
                {court.isOperational ? (
                  <>
                    <ToggleRight className="w-4 h-4 text-emerald-400" />
                    <span>Aktif</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4 text-rose-400" />
                    <span>Tutup</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Slot Maintenance Quick Toggler */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Setel Slot Jam Tertentu Sebagai Maintenance (Tutup Sementara)</span>
            </span>

            <div className="flex items-center gap-2">
              <select
                value={maintenanceCourtId}
                onChange={(e) => setMaintenanceCourtId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
              >
                {courts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={maintenanceDate}
                onChange={(e) => setMaintenanceDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Klik slot jam di bawah untuk menandai <strong className="text-amber-400">Maintenance (Kuning)</strong>. Slot tersebut langsung tidak bisa dibooking oleh penyewa.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 pt-2">
            {TIME_SLOTS.map((slot) => {
              const isUnderMaintenance = activeMaintenanceList.includes(slot.time);
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => toggleMaintenance(maintenanceCourtId, maintenanceDate, slot.time)}
                  className={`p-2 rounded-xl text-center border text-xs font-semibold transition cursor-pointer ${
                    isUnderMaintenance
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="block text-[11px] font-bold">{slot.time}</span>
                  <span className="text-[10px] block opacity-80 mt-0.5">
                    {isUnderMaintenance ? '⚠️ Maintenance' : '✓ Normal'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* REAL-TIME INCOMING BOOKINGS TABLE */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-lg font-bold text-white">
                Daftar Pesanan Masuk (Real-Time Synchronized)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Setiap pemesanan dari sisi user langsung masuk ke tabel ini secara instan beserta audit status pembayaran.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pemesan, ID, telepon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="lunas">Lunas</option>
              <option value="menunggu_pembayaran">Menunggu</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>

            <select
              value={courtFilter}
              onChange={(e) => setCourtFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Lapangan</option>
              {courts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">ID & Pemesan</th>
                <th className="py-3.5 px-4">Lapangan & Olahraga</th>
                <th className="py-3.5 px-4">Jadwal Main</th>
                <th className="py-3.5 px-4">Add-ons</th>
                <th className="py-3.5 px-4">Total Biaya</th>
                <th className="py-3.5 px-4">Status & Kanal</th>
                <th className="py-3.5 px-4 text-right">Aksi Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada transaksi pemesanan yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition">
                    {/* ID & Customer */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-emerald-400 block">{b.id}</span>
                      <strong className="text-white font-semibold block mt-0.5">{b.customerName}</strong>
                      <span className="text-[11px] text-slate-400 block">{b.customerPhone}</span>
                      {b.teamName && (
                        <span className="text-[10px] text-indigo-400 font-medium">{b.teamName}</span>
                      )}
                    </td>

                    {/* Court */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white block">{b.courtName}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {b.sport} • Tiket: {b.checkInCode}
                      </span>
                    </td>

                    {/* Date & Slots */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-200 block">{formatDateIndo(b.date)}</span>
                      <span className="text-[11px] font-bold text-emerald-400 block mt-0.5">
                        {b.slots.join(', ')}
                      </span>
                      <span className="text-[10px] text-slate-400">{b.slots.length} Jam Sesi</span>
                    </td>

                    {/* Add-ons */}
                    <td className="py-3 px-4">
                      {b.addons.length > 0 ? (
                        <ul className="text-[11px] text-slate-300 space-y-0.5">
                          {b.addons.map((a, i) => (
                            <li key={i}>
                              {a.name} ({a.quantity}x)
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-slate-500 text-[11px]">- Tanpa alat -</span>
                      )}
                    </td>

                    {/* Total */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-white text-sm block">
                        {formatRupiah(b.grandTotal)}
                      </span>
                      <span className="text-[10px] text-slate-400 block uppercase">
                        {b.paymentMethod.replace('va_', 'VA ')}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {b.paymentStatus === 'lunas' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Lunas
                        </span>
                      )}
                      {b.paymentStatus === 'menunggu_pembayaran' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Menunggu
                        </span>
                      )}
                      {b.paymentStatus === 'selesai' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 inline-flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Selesai
                        </span>
                      )}
                      {b.paymentStatus === 'dibatalkan' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Dibatalkan
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Ticket button */}
                        <button
                          type="button"
                          onClick={() => onViewTicket(b)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                          title="Lihat E-Tiket"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* If pending, admin can manually mark paid */}
                        {b.paymentStatus === 'menunggu_pembayaran' && (
                          <button
                            type="button"
                            onClick={() => updateBookingStatus(b.id, 'lunas')}
                            className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-[11px] transition cursor-pointer"
                            title="Konfirmasi Pembayaran Diterima"
                          >
                            Set Lunas
                          </button>
                        )}

                        {/* If lunas, admin can check-in customer */}
                        {b.paymentStatus === 'lunas' && (
                          <button
                            type="button"
                            onClick={() => updateBookingStatus(b.id, 'selesai')}
                            className="px-2 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-semibold text-[11px] transition cursor-pointer"
                            title="Check-in pemesan di lapangan"
                          >
                            Check-In
                          </button>
                        )}

                        {/* Cancel */}
                        {b.paymentStatus !== 'dibatalkan' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Batalkan pesanan ${b.id}?`)) {
                                updateBookingStatus(b.id, 'dibatalkan');
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Batalkan Booking"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete permanently */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus permanen data booking ${b.id}?`)) {
                              deleteBooking(b.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition cursor-pointer"
                          title="Hapus Data"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* WALK-IN MANUAL BOOKING MODAL */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Input Booking Walk-in (Kasir Offline)</span>
              </h3>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWalkIn} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Tamu / Pelanggan</label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="Contoh: Bpk. Bambang"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Tim</label>
                  <input
                    type="text"
                    value={walkInTeam}
                    onChange={(e) => setWalkInTeam(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pilih Lapangan</label>
                <select
                  value={walkInCourtId}
                  onChange={(e) => setWalkInCourtId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  {courts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({formatRupiah(c.hourlyRate)}/jam)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={walkInDate}
                    onChange={(e) => setWalkInDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Slot Jam</label>
                  <select
                    value={walkInSlot}
                    onChange={(e) => setWalkInSlot(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {TIME_SLOTS.map((s) => (
                      <option key={s.id} value={s.time}>
                        {s.time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 cursor-pointer shadow-md"
                >
                  Simpan Booking Kasir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              Reset Data Simulasi?
            </h3>
            <p className="text-sm text-slate-300 mb-5 leading-relaxed">
              Tindakan ini akan mengembalikan data lapangan, booking contoh, dan status maintenance ke konfigurasi awal untuk keperluan presentasi ulang.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition cursor-pointer"
              >
                Ya, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
