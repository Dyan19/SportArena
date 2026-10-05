import React from 'react';
import { useReservation } from '../context/ReservationContext';
import { INITIAL_ADDONS } from '../data/initialData';
import { formatRupiah } from '../utils/formatters';
import {
  Plus,
  Minus,
  Check,
  CircleDot,
  Shirt,
  Trophy,
  Flame,
  Target,
  Disc,
  UserCheck,
  Video,
  Droplets,
  PackagePlus,
} from 'lucide-react';

export const AddonsSelector: React.FC = () => {
  const {
    selectedSport,
    selectedAddons,
    updateAddonQuantity,
    clearAddons,
  } = useReservation();

  // Filter addons relevant to current sport or universal ('all')
  const availableAddons = INITIAL_ADDONS.filter(
    (addon) => addon.sportTypes === 'all' || (Array.isArray(addon.sportTypes) && addon.sportTypes.includes(selectedSport))
  );

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'CircleDot':
        return <CircleDot className="w-5 h-5 text-emerald-400" />;
      case 'Shirt':
        return <Shirt className="w-5 h-5 text-cyan-400" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'Target':
        return <Target className="w-5 h-5 text-violet-400" />;
      case 'Disc':
        return <Disc className="w-5 h-5 text-lime-400" />;
      case 'UserCheck':
        return <UserCheck className="w-5 h-5 text-blue-400" />;
      case 'Video':
        return <Video className="w-5 h-5 text-rose-400" />;
      case 'Droplets':
        return <Droplets className="w-5 h-5 text-teal-400" />;
      default:
        return <PackagePlus className="w-5 h-5 text-emerald-400" />;
    }
  };

  const selectedCount = Object.keys(selectedAddons).length;

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-5 sm:p-7 backdrop-blur-sm space-y-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              3
            </span>
            <h2 className="text-xl font-bold text-white">
              Add-ons & Sewa Peralatan Tambahan
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Centang dan tentukan jumlah peralatan yang ingin Anda sewa. Total harga akan otomatis dihitung secara real-time.
          </p>
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {selectedCount} Layanan Ditambahkan
            </span>
            <button
              onClick={clearAddons}
              className="text-xs text-rose-400 hover:text-rose-300 underline cursor-pointer"
            >
              Hapus Semua
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {availableAddons.map((addon) => {
          const qty = selectedAddons[addon.id] || 0;
          const isSelected = qty > 0;

          return (
            <div
              key={addon.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500/80 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/60 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox trigger */}
                <button
                  type="button"
                  onClick={() => updateAddonQuantity(addon.id, isSelected ? 0 : 1)}
                  className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-sm'
                      : 'border-slate-600 bg-slate-800 hover:border-emerald-400'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                {/* Icon & Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 shrink-0">
                      {getIcon(addon.iconName)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white leading-tight">
                        {addon.name}
                      </h4>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {formatRupiah(addon.price)} / {addon.unit}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {addon.description}
                  </p>
                </div>
              </div>

              {/* Quantity Stepper & Subtotal */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <div className="text-xs">
                  {isSelected ? (
                    <span className="text-emerald-400 font-bold">
                      Subtotal: {formatRupiah(addon.price * qty)}
                    </span>
                  ) : (
                    <span className="text-slate-500">Belum dipilih</span>
                  )}
                </div>

                <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => updateAddonQuantity(addon.id, Math.max(0, qty - 1))}
                    disabled={qty === 0}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                    title="Kurangi"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 text-center font-bold text-xs text-white">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateAddonQuantity(addon.id, qty + 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                    title="Tambah"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
