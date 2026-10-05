import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useReservation } from '../context/ReservationContext';
import { PaymentMethodType, Booking } from '../types/reservation';
import { INITIAL_ADDONS } from '../data/initialData';
import { formatRupiah, generateBookingId, generateCheckInCode } from '../utils/formatters';
import {
  X,
  Clock,
  QrCode,
  CreditCard,
  Smartphone,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  DollarSign,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherCode?: string;
  onSuccess: (booking: Booking) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  voucherCode = '',
  onSuccess,
}) => {
  const {
    currentCourt,
    selectedSport,
    selectedDate,
    selectedSlots,
    selectedAddons,
    calculatePricing,
    createBooking,
  } = useReservation();

  // Step 1: Customer Form, Step 2: Payment Gateway Simulation
  const [step, setStep] = useState<'form' | 'payment'>('form');

  // Customer Form State
  const [customerName, setCustomerName] = useState('Ibnu Hazib Fadillah');
  const [customerPhone, setCustomerPhone] = useState('081234567890');
  const [customerEmail, setCustomerEmail] = useState('ibnu.fadillah@kampus.ac.id');
  const [teamName, setTeamName] = useState('Tim Juara Teknik');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('qris');
  const [copied, setCopied] = useState(false);

  // 15-Minute Countdown Timer (900 seconds)
  const TOTAL_SECONDS = 900;
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_SECONDS);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Reset timer when opened
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setTimeLeft(TOTAL_SECONDS);
      setIsExpired(false);
      setIsProcessing(false);
      setCopied(false);
    }
  }, [isOpen]);

  // Timer Tick
  useEffect(() => {
    if (!isOpen || step !== 'payment' || isExpired) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, step, isExpired]);

  if (!isOpen || !currentCourt) return null;

  const pricing = calculatePricing(selectedSlots, selectedAddons, voucherCode);

  // Format time mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = ((TOTAL_SECONDS - timeLeft) / TOTAL_SECONDS) * 100;

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!customerName.trim()) errors.customerName = 'Nama pemesan wajib diisi';
    if (!customerPhone.trim() || customerPhone.length < 8) errors.customerPhone = 'Nomor WhatsApp valid diperlukan';
    if (!customerEmail.trim() || !customerEmail.includes('@')) errors.customerEmail = 'Email valid diperlukan untuk e-tiket';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep('payment');
    }
  };

  // Virtual Account number simulator based on method
  const getVANumber = () => {
    switch (paymentMethod) {
      case 'va_bca':
        return '80777' + customerPhone.replace(/\D/g, '').slice(-9);
      case 'va_mandiri':
        return '88908' + customerPhone.replace(/\D/g, '').slice(-9);
      case 'va_bri':
        return '12888' + customerPhone.replace(/\D/g, '').slice(-9);
      default:
        return '80777081234567890';
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulate Payment Success
  const handleSimulateSuccess = () => {
    setIsProcessing(true);

    setTimeout(() => {
      // Confetti burst
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#6366f1', '#f59e0b'],
      });

      // Prepare Addons structure
      const finalAddons = Object.entries(selectedAddons)
        .map(([addonId, qty]) => {
          const item = INITIAL_ADDONS.find((a) => a.id === addonId);
          if (!item || qty <= 0) return null;
          return {
            addonId,
            name: item.name,
            quantity: qty,
            pricePerUnit: item.price,
            totalPrice: item.price * qty,
          };
        })
        .filter(Boolean) as Booking['addons'];

      const newBooking: Booking = {
        id: generateBookingId(),
        createdAt: new Date().toISOString(),
        customerName,
        customerPhone,
        customerEmail,
        teamName: teamName || 'Tim Pribadi',
        courtId: currentCourt.id,
        courtName: currentCourt.name,
        sport: selectedSport,
        date: selectedDate,
        slots: selectedSlots,
        addons: finalAddons,
        courtSubtotal: pricing.courtSubtotal,
        addonsSubtotal: pricing.addonsSubtotal,
        serviceFee: pricing.serviceFee,
        discount: pricing.discount,
        voucherCode: voucherCode || undefined,
        grandTotal: pricing.grandTotal,
        paymentMethod,
        paymentStatus: 'lunas',
        notes,
        checkInCode: generateCheckInCode(),
        paidAt: new Date().toISOString(),
      };

      createBooking(newBooking);
      setIsProcessing(false);
      onSuccess(newBooking);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-6">
        {/* Header with Step indicator */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step === 'payment' && (
              <button
                type="button"
                onClick={() => setStep('form')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                title="Kembali ke formulir"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>
                  {step === 'form' ? 'Informasi Pemesan & Tim' : 'Instruksi Pembayaran'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {step === 'form'
                  ? 'Isi identitas Anda untuk penerbitan E-Tiket resmi'
                  : 'Selesaikan pembayaran sebelum batas waktu berakhir'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: FORMULIR PEMESAN */}
        {step === 'form' && (
          <form onSubmit={handleProceedToPaymentMethod} className="p-6 space-y-4">
            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">Total Tagihan:</span>
                <span className="text-lg font-extrabold text-white">
                  {formatRupiah(pricing.grandTotal)}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                {selectedSlots.length} Jam Lapangan
              </span>
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Lengkap Pemesan <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                className={`w-full bg-slate-950 border ${
                  formErrors.customerName ? 'border-rose-500' : 'border-slate-800'
                } rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              />
              {formErrors.customerName && (
                <p className="text-[11px] text-rose-400 mt-1">{formErrors.customerName}</p>
              )}
            </div>

            {/* No WhatsApp & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nomor WhatsApp <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="08123456789"
                  className={`w-full bg-slate-950 border ${
                    formErrors.customerPhone ? 'border-rose-500' : 'border-slate-800'
                  } rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                />
                {formErrors.customerPhone && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.customerPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Notifikasi <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="email@domain.com"
                  className={`w-full bg-slate-950 border ${
                    formErrors.customerEmail ? 'border-rose-500' : 'border-slate-800'
                  } rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                />
                {formErrors.customerEmail && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.customerEmail}</p>
                )}
              </div>
            </div>

            {/* Nama Tim & Catatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Klub / Komunitas (Opsional)
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Contoh: FC Kampus United"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan untuk Pengelola (Opsional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Titip kunci ganti"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Submit to Step 2 */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Pilih Metode Pembayaran
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: METODE BAYAR & COUNTDOWN TIMER */}
        {step === 'payment' && (
          <div className="p-6 space-y-5">
            {/* 15-Minute Countdown Timer Banner */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isExpired
                  ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                  : timeLeft < 120
                  ? 'bg-amber-950/40 border-amber-800 text-amber-200 animate-pulse'
                  : 'bg-slate-950/80 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${isExpired ? 'text-rose-400' : 'text-emerald-400'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {isExpired ? 'Batas Waktu Habis' : 'Selesaikan Pembayaran Dalam'}
                  </span>
                </div>
                <span className="text-xl font-black font-mono tracking-wider text-white">
                  {formattedTime}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    isExpired ? 'bg-rose-500' : timeLeft < 120 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${100 - progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Slot jam lapangan terkunci otomatis selama waktu di atas.
              </p>
            </div>

            {/* Payment Method Selector Tabs */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Pilih Kanal Pembayaran:
              </label>

              <div className="grid grid-cols-3 gap-2">
                {/* QRIS */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qris')}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                    paymentMethod === 'qris'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <QrCode className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-bold block">QRIS</span>
                  <span className="text-[10px] text-slate-400 block">Semua E-Wallet & Bank</span>
                </button>

                {/* Virtual Account */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('va_bca')}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                    paymentMethod.startsWith('va_')
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-bold block">Virtual Account</span>
                  <span className="text-[10px] text-slate-400 block">BCA, Mandiri, BRI</span>
                </button>

                {/* E-Wallet */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('gopay')}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                    ['gopay', 'dana', 'shopeepay'].includes(paymentMethod)
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-bold block">E-Wallet Direct</span>
                  <span className="text-[10px] text-slate-400 block">GoPay, OVO, DANA</span>
                </button>
              </div>
            </div>

            {/* Payment Details Container */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              {/* QRIS View */}
              {paymentMethod === 'qris' && (
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-600 font-black text-[10px] text-white tracking-widest">
                      QRIS
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      Standar Pembayaran Nasional (GPN)
                    </span>
                  </div>

                  {/* QR Code Graphic */}
                  <div className="p-3 bg-white rounded-2xl shadow-lg border-2 border-slate-300">
                    <svg
                      viewBox="0 0 200 200"
                      className="w-44 h-44"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="200" height="200" fill="white" />
                      {/* Corner Position Markers */}
                      {/* Top-Left */}
                      <rect x="15" y="15" width="45" height="45" fill="black" />
                      <rect x="22" y="22" width="31" height="31" fill="white" />
                      <rect x="28" y="28" width="19" height="19" fill="black" />
                      {/* Top-Right */}
                      <rect x="140" y="15" width="45" height="45" fill="black" />
                      <rect x="147" y="22" width="31" height="31" fill="white" />
                      <rect x="153" y="28" width="19" height="19" fill="black" />
                      {/* Bottom-Left */}
                      <rect x="15" y="140" width="45" height="45" fill="black" />
                      <rect x="22" y="147" width="31" height="31" fill="white" />
                      <rect x="28" y="153" width="19" height="19" fill="black" />

                      {/* Simulated QR data matrix dots */}
                      <rect x="75" y="18" width="12" height="12" fill="black" />
                      <rect x="100" y="25" width="12" height="8" fill="black" />
                      <rect x="120" y="18" width="8" height="15" fill="black" />
                      <rect x="75" y="45" width="10" height="14" fill="black" />
                      <rect x="105" y="50" width="18" height="12" fill="black" />

                      <rect x="20" y="75" width="15" height="10" fill="black" />
                      <rect x="45" y="85" width="10" height="12" fill="black" />
                      <rect x="70" y="80" width="12" height="18" fill="black" />
                      <rect x="95" y="75" width="18" height="14" fill="black" />
                      <rect x="130" y="80" width="14" height="16" fill="black" />
                      <rect x="160" y="75" width="20" height="12" fill="black" />

                      <rect x="75" y="110" width="18" height="15" fill="black" />
                      <rect x="105" y="105" width="15" height="16" fill="black" />
                      <rect x="130" y="115" width="22" height="12" fill="black" />
                      <rect x="165" y="110" width="15" height="20" fill="black" />

                      <rect x="75" y="145" width="14" height="25" fill="black" />
                      <rect x="100" y="150" width="25" height="12" fill="black" />
                      <rect x="140" y="145" width="18" height="15" fill="black" />
                      <rect x="165" y="160" width="20" height="20" fill="black" />

                      {/* Center Brand Badge */}
                      <rect x="82" y="82" width="36" height="36" rx="6" fill="#0f172a" />
                      <text x="100" y="104" fill="#10b981" fontSize="16" fontWeight="bold" textAnchor="middle">
                        AS
                      </text>
                    </svg>
                  </div>

                  <p className="text-xs text-slate-300">
                    Buka BCA Mobile, Livin, GoPay, OVO, atau DANA lalu scan QR di atas.
                  </p>
                </div>
              )}

              {/* Virtual Account View */}
              {paymentMethod.startsWith('va_') && (
                <div className="space-y-3">
                  {/* Bank Switcher */}
                  <div className="flex gap-2">
                    {[
                      { id: 'va_bca', label: 'BCA' },
                      { id: 'va_mandiri', label: 'Mandiri' },
                      { id: 'va_bri', label: 'BRI' },
                    ].map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setPaymentMethod(bank.id as PaymentMethodType)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          paymentMethod === bank.id
                            ? 'bg-slate-800 text-emerald-400 border border-emerald-500/50'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {bank.label}
                      </button>
                    ))}
                  </div>

                  {/* VA Number Display */}
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Nomor Virtual Account {paymentMethod.replace('va_', '').toUpperCase()}
                      </span>
                      <span className="font-mono text-base font-bold text-white tracking-wider">
                        {getVANumber()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(getVANumber())}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Disalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Buka m-Banking Anda, pilih Transfer &gt; Virtual Account, lalu masukkan nomor di atas.
                  </p>
                </div>
              )}

              {/* Direct E-Wallet View */}
              {['gopay', 'dana', 'shopeepay'].includes(paymentMethod) && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {[
                      { id: 'gopay', label: 'GoPay' },
                      { id: 'dana', label: 'DANA' },
                      { id: 'shopeepay', label: 'ShopeePay' },
                    ].map((wallet) => (
                      <button
                        key={wallet.id}
                        type="button"
                        onClick={() => setPaymentMethod(wallet.id as PaymentMethodType)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          paymentMethod === wallet.id
                            ? 'bg-slate-800 text-emerald-400 border border-emerald-500/50'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {wallet.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Nomor Akun Terdaftar
                    </span>
                    <span className="font-mono text-sm font-bold text-white">
                      {customerPhone} ({customerName})
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Permintaan otorisasi pembayaran instan akan dikirim ke aplikasi {paymentMethod.toUpperCase()} Anda.
                    </p>
                  </div>
                </div>
              )}

              {/* Total Amount in Gateway */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total yang harus dibayar:</span>
                <span className="text-base font-extrabold text-emerald-400">
                  {formatRupiah(pricing.grandTotal)}
                </span>
              </div>
            </div>

            {/* Simulated Payment Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={isExpired || isProcessing}
                onClick={handleSimulateSuccess}
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                  isProcessing
                    ? 'bg-emerald-600 text-white cursor-wait'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25'
                }`}
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Memverifikasi Pembayaran Otomatis...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Simulasikan Pembayaran Berhasil (Demo Dosen)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                Bayar Nanti (Simpan di Pesanan Saya)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
