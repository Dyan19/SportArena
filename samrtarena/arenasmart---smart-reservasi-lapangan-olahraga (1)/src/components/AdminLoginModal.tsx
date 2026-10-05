import React, { useState } from 'react';
import { useReservation } from '../context/ReservationContext';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  X,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Info,
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginAdmin } = useReservation();
  const [credential, setCredential] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!credential.trim()) {
      setErrorMsg('Masukkan PIN atau Sandi Pengelola');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const ok = loginAdmin(credential.trim());
      setIsLoading(false);
      if (ok) {
        setCredential('');
        setErrorMsg('');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg('PIN atau kata sandi tidak valid. Coba PIN: 1234');
      }
    }, 300);
  };

  const handleQuickFill = () => {
    setCredential('1234');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition cursor-pointer"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Portal Petugas / Admin
            </h3>
            <p className="text-xs text-slate-400">
              Otentikasi Pengelola Fasilitas ArenaSmart
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-5 leading-relaxed bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
          Halaman ini khusus untuk staf pengelola arena (manajemen jadwal lapangan, pemeliharaan, rekap pendapatan kasir, dan ekspor data). Pengunjung umum dapat memesan langsung tanpa login.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              PIN Akses / Kata Sandi Pengelola
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                autoFocus
                placeholder="Ketik PIN (contoh: 1234)"
                value={credential}
                onChange={(e) => {
                  setCredential(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none placeholder-slate-500"
              />
            </div>
            {errorMsg && (
              <div className="flex items-center gap-1.5 mt-2 text-rose-400 text-xs">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Quick autofill helper for easy academic test */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Uji Cepat Presentasi:</span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
            >
              Gunakan PIN Default (1234)
            </button>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <span>Buka Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <span className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Keamanan Lokal & Cloud-Ready • Sesi Terisolasi
          </span>
        </div>
      </div>
    </div>
  );
};
