import React, { useState } from 'react';
import { ReservationProvider, useReservation } from './context/ReservationContext';
import { Navbar } from './components/Navbar';
import { CourtSelector } from './components/CourtSelector';
import { ScheduleGrid } from './components/ScheduleGrid';
import { AddonsSelector } from './components/AddonsSelector';
import { BookingSummaryCard } from './components/BookingSummaryCard';
import { PaymentModal } from './components/PaymentModal';
import { TicketModal } from './components/TicketModal';
import { MyBookings } from './components/MyBookings';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { DemoGuideModal } from './components/DemoGuideModal';
import { Booking } from './types/reservation';
import {
  Zap,
  CheckCircle2,
  Lock,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    activeUserTab,
    setActiveUserTab,
    isAdminAuthenticated,
  } = useReservation();

  // Modals state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState('');
  const [activeTicket, setActiveTicket] = useState<Booking | null>(null);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Handle Checkout click from BookingSummaryCard
  const handleProceedToPayment = (voucher: string) => {
    setAppliedVoucher(voucher);
    setIsPaymentOpen(true);
  };

  // When payment succeeds
  const handlePaymentSuccess = (newBooking: Booking) => {
    setIsPaymentOpen(false);
    setActiveTicket(newBooking);
  };

  const handleOpenAdminPortal = () => {
    if (isAdminAuthenticated) {
      setViewMode('admin');
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white pb-16 lg:pb-0">
      {/* Navigation */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
        {/* =========================================================================
            USER (PENYEWA) MODE - Bebas Akses Tanpa Perlu Login
            ========================================================================= */}
        {viewMode === 'user' && (
          <>
            {activeUserTab === 'booking' && (
              <>
                {/* Hero Header Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 p-5 sm:p-8 shadow-2xl">
                  <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />

                  <div className="max-w-2xl relative z-10 space-y-2.5 sm:space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] sm:text-xs font-bold">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Smart Booking Engine • Konfirmasi Instan Real-Time</span>
                    </div>

                    <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                      Reservasi Lapangan Olahraga <br />
                      <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                        Modern, Cepat & Terintegrasi
                      </span>
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Sewa lapangan Futsal, Badminton, dan Tenis berstandar internasional. Pantau ketersediaan slot jam interaktif secara live, sewa perlengkapan, dan dapatkan E-Tiket resmi seketika tanpa perlu login.
                    </p>

                    {/* Features Quick Highlight Pills */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px] sm:text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Slot Terkunci Otomatis</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>QRIS & Virtual Account</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Add-ons Peralatan & Wasit</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2-Column Booking Flow */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                  {/* Left Column: Steps 1, 2, 3 */}
                  <div className="lg:col-span-8 space-y-6 sm:space-y-8 min-w-0">
                    {/* Step 1: Court Selector */}
                    <CourtSelector />

                    {/* Step 2: Interactive Schedule Grid */}
                    <ScheduleGrid />

                    {/* Step 3: Add-ons & Equipment Rental */}
                    <AddonsSelector />
                  </div>

                  {/* Right Column: Step 4 Summary & Checkout */}
                  <div className="lg:col-span-4 min-w-0">
                    <BookingSummaryCard onProceedToPayment={handleProceedToPayment} />
                  </div>
                </div>
              </>
            )}

            {/* Tab: Pesanan Saya */}
            {activeUserTab === 'my-tickets' && (
              <MyBookings
                onViewTicket={(booking) => setActiveTicket(booking)}
                onNewBookingClick={() => setActiveUserTab('booking')}
              />
            )}
          </>
        )}

        {/* =========================================================================
            ADMIN (PENGELOLA) MODE - Terproteksi Login PIN / Kata Sandi
            ========================================================================= */}
        {viewMode === 'admin' && (
          isAdminAuthenticated ? (
            <AdminDashboard
              onViewTicket={(booking) => setActiveTicket(booking)}
              onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
            />
          ) : (
            <div className="min-h-[50vh] flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white">
                    Akses Khusus Pengelola Arena
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Halaman ini memerlukan verifikasi identitas staf atau pemilik fasilitas olahraga.
                  </p>
                </div>
                <button
                  onClick={() => setIsAdminLoginOpen(true)}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Buka Dialog Login Admin</span>
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-extrabold text-white">ArenaSmart</span>
              <span>• Integrated Sports Court Reservation & Facility Operations</span>
            </div>
            <p className="text-[11px] text-slate-600">
              © 2026 ArenaSmart Indonesia. Hak cipta dilindungi. Pengunjung bebas memesan tanpa akun.
            </p>
          </div>

          {/* Discreet Admin Portal Link & Presentation Guide */}
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsDemoGuideOpen(true)}
              className="text-slate-600 hover:text-slate-400 transition cursor-pointer"
            >
              Panduan Sistem
            </button>
            <span className="text-slate-800">•</span>
            <button
              onClick={handleOpenAdminPortal}
              className="text-slate-500 hover:text-indigo-400 transition flex items-center gap-1.5 cursor-pointer"
              title="Khusus petugas dan pengelola lapangan"
            >
              <Lock className="w-3 h-3 text-slate-600 group-hover:text-indigo-400" />
              <span>Portal Petugas</span>
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setViewMode('admin');
        }}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        voucherCode={appliedVoucher}
        onSuccess={handlePaymentSuccess}
      />

      <TicketModal
        booking={activeTicket}
        onClose={() => setActiveTicket(null)}
      />

      <DemoGuideModal
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onStartUserDemo={() => {
          setViewMode('user');
          setActiveUserTab('booking');
        }}
        onStartAdminDemo={() => {
          handleOpenAdminPortal();
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <ReservationProvider>
      <AppContent />
    </ReservationProvider>
  );
}
