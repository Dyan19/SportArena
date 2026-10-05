import React from 'react';
import { useReservation } from '../context/ReservationContext';
import {
  CalendarDays,
  Ticket,
  ShieldCheck,
  Layers,
  LogOut,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    activeUserTab,
    setActiveUserTab,
    bookings,
    isAdminAuthenticated,
    logoutAdmin,
  } = useReservation();

  // Active user bookings count (menunggu_pembayaran or lunas)
  const activeBookingsCount = bookings.filter(
    (b) => b.paymentStatus === 'lunas' || b.paymentStatus === 'menunggu_pembayaran'
  ).length;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setViewMode('user');
                setActiveUserTab('booking');
              }}
              className="flex items-center gap-2.5 sm:gap-3 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform shrink-0">
                <Layers className="w-5 h-5 text-slate-950 font-black" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                    Arena<span className="text-emerald-400">Smart</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden xs:inline-block">
                    Official
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden md:block">
                  Smart Sports Facility & Court Booking Platform
                </p>
              </div>
            </button>
          </div>

          {/* Center Navigation for User Mode */}
          {viewMode === 'user' ? (
            <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl shadow-inner">
              <button
                onClick={() => setActiveUserTab('booking')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeUserTab === 'booking'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Pesan Lapangan</span>
              </button>

              <button
                onClick={() => setActiveUserTab('my-tickets')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all relative cursor-pointer ${
                  activeUserTab === 'my-tickets'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>Pesanan Saya</span>
                {activeBookingsCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                    {activeBookingsCount}
                  </span>
                )}
              </button>
            </nav>
          ) : (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Mode Pengelola (Admin Dashboard) Aktif</span>
            </div>
          )}

          {/* Right Area: Production Clean Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* If admin is currently authenticated */}
            {isAdminAuthenticated ? (
              viewMode === 'admin' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setViewMode('user');
                      setActiveUserTab('booking');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 transition cursor-pointer"
                  >
                    <span>Lihat Website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={logoutAdmin}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                    title="Keluar dari sesi admin"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Kunci & Keluar</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setViewMode('admin')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Dashboard Admin</span>
                </button>
              )
            ) : (
              /* Regular Visitor View: Clean status indicator */
              <div className="flex items-center gap-2 text-xs">
                <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Sistem Real-Time Online
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation bar if in User Mode */}
      {viewMode === 'user' && (
        <div className="md:hidden flex border-t border-slate-800/80 bg-slate-950 px-3 py-2 justify-around">
          <button
            onClick={() => setActiveUserTab('booking')}
            className={`flex items-center gap-2 py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeUserTab === 'booking'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-slate-400'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Pesan Lapangan</span>
          </button>
          <button
            onClick={() => setActiveUserTab('my-tickets')}
            className={`flex items-center gap-2 py-1.5 px-3 rounded-xl text-xs font-bold transition relative cursor-pointer ${
              activeUserTab === 'my-tickets'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-slate-400'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Pesanan Saya</span>
            {activeBookingsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                {activeBookingsCount}
              </span>
            )}
          </button>
        </div>
      )}
    </header>
  );
};
