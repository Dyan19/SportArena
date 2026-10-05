export type SportType = 'futsal' | 'badminton' | 'tennis';

export type SlotStatus = 'available' | 'booked' | 'maintenance' | 'selected';

export interface TimeSlot {
  id: string; // e.g. "08:00"
  time: string; // "08:00 - 09:00"
  hour: number;
  isPrimeTime: boolean; // e.g. 18:00 - 22:00
  priceMultiplier: number;
}

export interface Court {
  id: string;
  name: string;
  sport: SportType;
  courtType: string; // e.g. "Interlock Futsal Pro", "Vinyl Mat Standard BWF", "DecoTurf Hard Court"
  hourlyRate: number; // Base price in IDR
  primeTimeRate: number; // Prime time price in IDR
  image: string;
  rating: number;
  totalReviews: number;
  location: string;
  facilities: string[];
  dimensions: string;
  isOperational: boolean;
}

export interface AddonItem {
  id: string;
  name: string;
  category: 'gear' | 'service' | 'beverage';
  price: number;
  unit: string;
  sportTypes: SportType[] | 'all';
  iconName: string;
  description: string;
}

export interface SelectedAddon {
  addonId: string;
  quantity: number;
}

export type PaymentMethodType = 'qris' | 'va_bca' | 'va_mandiri' | 'va_bri' | 'gopay' | 'dana' | 'shopeepay' | 'tunai_offline';

export type BookingStatus = 'menunggu_pembayaran' | 'lunas' | 'selesai' | 'dibatalkan';

export interface Booking {
  id: string; // e.g. "AS-2026-9812"
  createdAt: string; // ISO date
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  teamName?: string;
  courtId: string;
  courtName: string;
  sport: SportType;
  date: string; // YYYY-MM-DD
  slots: string[]; // array of slot times, e.g. ["19:00 - 20:00", "20:00 - 21:00"]
  addons: {
    addonId: string;
    name: string;
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
  }[];
  courtSubtotal: number;
  addonsSubtotal: number;
  serviceFee: number;
  discount: number;
  voucherCode?: string;
  grandTotal: number;
  paymentMethod: PaymentMethodType;
  paymentStatus: BookingStatus;
  notes?: string;
  checkInCode: string;
  paidAt?: string;
}

export interface DayCourtSchedule {
  date: string; // YYYY-MM-DD
  courtId: string;
  bookedSlots: { [slotTime: string]: string }; // slotTime -> bookingId or customerName
  maintenanceSlots: string[]; // array of slotTimes under maintenance
}

export interface AdminStats {
  totalRevenue: number;
  todayRevenue: number;
  totalBookings: number;
  todayBookings: number;
  activeCourts: number;
  peakHour: string;
  occupancyRate: number;
}
