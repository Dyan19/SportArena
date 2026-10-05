import React from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  User,
  ShieldCheck,
  RefreshCw,
  FileSpreadsheet,
  Clock,
  Layers,
} from 'lucide-react';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartUserDemo: () => void;
  onStartAdminDemo: () => void;
}

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({
  isOpen,
  onClose,
  onStartUserDemo,
  onStartAdminDemo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/90 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-6 my-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Panduan Presentasi Dosen
              </span>
              <span className="text-xs text-slate-400">Siap Uji & Showcase</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">
              Alur Simulasi Smart Reservasi Lapangan
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Main Testing Scenarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* User Side */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <User className="w-4 h-4" />
              <span>1. Pengujian Sisi Penyewa (User)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Pilih jenis cabang: <strong>Futsal, Badminton, atau Tenis</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Klik slot jam (warna hijau). Slot terisi (merah) dan maintenance (kuning) otomatis tidak bisa dipilih.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Centang <strong>Add-ons Sewa Alat</strong> (bola, raket, wasit, video 4K), total harga langsung update otomatis.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Masukkan kupon promo: <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">MAHASISWAJUARA</code>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Simulasi bayar via <strong>QRIS dinamis / VA</strong> dengan <strong>Countdown Timer 15 Menit</strong> & cetak E-Tiket!</span>
              </li>
            </ul>

            <button
              onClick={() => {
                onStartUserDemo();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Uji Sisi Penyewa Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Admin Side */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>2. Pengujian Sisi Pengelola (Admin)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>Klik toggle mode <strong>Admin</strong> di pojok kanan atas.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>Amati kartu KPI: <strong>Total Pendapatan, Okupansi %, dan Jam Teramai (Prime-Time)</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>Tabel pesanan masuk otomatis tersinkronisasi saat ada booking baru.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>Fitur <strong>Setel Maintenance</strong>: klik slot jam untuk menutup sementara. Beralih ke sisi user untuk verifikasi!</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>Download rekap keuangan via tombol <strong>Export Rekap CSV</strong>.</span>
              </li>
            </ul>

            <button
              onClick={() => {
                onStartAdminDemo();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-600 text-white hover:bg-indigo-500 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Buka Panel Admin Pengelola</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Ingin mengulang simulasi dari awal? Gunakan tombol <strong>Reset (Icon Putar)</strong> di navbar atas.
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-300 font-bold hover:text-white underline cursor-pointer shrink-0 ml-3"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
