import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Court,
  SportType,
  Booking,
  BookingStatus,
  TimeSlot,
  SlotStatus,
  AdminStats,
} from '../types/reservation';
import {
  INITIAL_COURTS,
  INITIAL_BOOKINGS,
  INITIAL_ADDONS,
  TIME_SLOTS,
  getTodayDateString,
} from '../data/initialData';

interface ReservationContextType {
  // Navigation & Modes
  viewMode: 'user' | 'admin';
  setViewMode: (mode: 'user' | 'admin') => void;
  activeUserTab: 'booking' | 'my-tickets' | 'schedule-view';
  setActiveUserTab: (tab: 'booking' | 'my-tickets' | 'schedule-view') => void;

  // Sports & Court Selection
  courts: Court[];
  selectedSport: SportType;
  setSelectedSport: (sport: SportType) => void;
  selectedCourtId: string;
  setSelectedCourtId: (courtId: string) => void;
  currentCourt: Court | undefined;

  // Date & Time Slots Selection
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedSlots: string[];
  toggleSlot: (slotTime: string) => void;
  clearSlots: () => void;

  // Addons
  selectedAddons: { [addonId: string]: number };
  updateAddonQuantity: (addonId: string, quantity: number) => void;
  clearAddons: () => void;

  // Bookings & Maintenance Data
  bookings: Booking[];
  maintenanceSlots: { [courtDateKey: string]: string[] };
  createBooking: (newBooking: Booking) => void;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  cancelBooking: (bookingId: string) => void;
  deleteBooking: (bookingId: string) => void;

  // Admin Controls
  isAdminAuthenticated: boolean;
  loginAdmin: (credential: string) => boolean;
  logoutAdmin: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  toggleMaintenance: (courtId: string, date: string, slotTime: string) => void;
  toggleCourtOperational: (courtId: string) => void;
  addManualWalkInBooking: (data: Partial<Booking>) => Booking;
  resetDemoData: () => void;

  // Helpers
  getSlotStatus: (courtId: string, date: string, slotTime: string) => SlotStatus;
  getSlotBookerInfo: (courtId: string, date: string, slotTime: string) => Booking | undefined;
  calculatePricing: (customSlots?: string[], customAddons?: { [addonId: string]: number }, customVoucher?: string) => {
    courtSubtotal: number;
    addonsSubtotal: number;
    serviceFee: number;
    discount: number;
    grandTotal: number;
    slotBreakdown: { slotTime: string; isPrimeTime: boolean; price: number }[];
  };
  adminStats: AdminStats;

  // Active highlighted ticket modal
  viewingTicketId: string | null;
  setViewingTicketId: (id: string | null) => void;
}

const STORAGE_KEYS = {
  COURTS: 'arena_smart_courts_v1',
  BOOKINGS: 'arena_smart_bookings_v1',
  MAINTENANCE: 'arena_smart_maintenance_v1',
};

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

// Baca localStorage dengan aman: data rusak / bukan JSON tidak boleh membuat aplikasi crash saat startup.
function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : (parsed as T);
  } catch (e) {
    console.warn(`Gagal membaca ${key}, memakai data default.`, e);
    return fallback;
  }
}

export const ReservationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<'user' | 'admin'>('user');
  const [activeUserTab, setActiveUserTab] = useState<'booking' | 'my-tickets' | 'schedule-view'>('booking');

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('arena_smart_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const loginAdmin = (credential: string): boolean => {
    const clean = credential.trim().toLowerCase();
    // Accept PIN "1234", "admin", "admin123", or "8888"
    if (clean === '1234' || clean === 'admin' || clean === 'admin123' || clean === '8888') {
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem('arena_smart_admin_auth', 'true');
      } catch (e) {
        console.error(e);
      }
      setViewMode('admin');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('arena_smart_admin_auth');
    } catch (e) {
      console.error(e);
    }
    setViewMode('user');
    setActiveUserTab('booking');
  };

  // Load from localStorage or defaults
  const [courts, setCourts] = useState<Court[]>(() => {
    const saved = readStored<Court[]>(STORAGE_KEYS.COURTS, []);
    const stored = Array.isArray(saved) ? saved : [];
    // Data statis (nama, tarif, gambar, fasilitas) selalu diambil dari kode,
    // hanya status operasional yang diubah admin yang dipertahankan.
    // Dengan begitu perbaikan data di source ikut terpakai meski user sudah punya cache.
    return INITIAL_COURTS.map((base) => {
      const cached = stored.find((c) => c && c.id === base.id);
      return cached ? { ...base, isOperational: cached.isOperational } : base;
    });
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = readStored<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    return Array.isArray(saved) && saved.length > 0 ? saved : INITIAL_BOOKINGS;
  });

  // Maintenance map: "courtId_YYYY-MM-DD" -> ["14:00 - 15:00"]
  const [maintenanceSlots, setMaintenanceSlots] = useState<{ [key: string]: string[] }>(() => {
    const fallback = {
      [`futsal-b_${getTodayDateString(0)}`]: ['14:00 - 15:00', '15:00 - 16:00'], // Demo initial maintenance
    };
    const saved = readStored<{ [key: string]: string[] }>(STORAGE_KEYS.MAINTENANCE, fallback);
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : fallback;
  });

  const [selectedSport, setSelectedSport] = useState<SportType>('futsal');
  const [selectedCourtId, setSelectedCourtId] = useState<string>('futsal-a');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString(0));
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<{ [addonId: string]: number }>({});
  const [viewingTicketId, setViewingTicketId] = useState<string | null>(null);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURTS, JSON.stringify(courts));
  }, [courts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(maintenanceSlots));
  }, [maintenanceSlots]);

  // When selected sport changes, update selected court to the first available in that sport
  const handleSelectSport = (sport: SportType) => {
    setSelectedSport(sport);
    const courtsForSport = courts.filter((c) => c.sport === sport);
    if (courtsForSport.length > 0 && !courtsForSport.some((c) => c.id === selectedCourtId)) {
      setSelectedCourtId(courtsForSport[0].id);
    }
    setSelectedSlots([]);
  };

  const currentCourt = courts.find((c) => c.id === selectedCourtId) || courts[0];

  // Toggle slot selection
  const toggleSlot = (slotTime: string) => {
    setSelectedSlots((prev) => {
      if (prev.includes(slotTime)) {
        return prev.filter((s) => s !== slotTime);
      } else {
        // Sort chronologically based on TIME_SLOTS order
        const newSlots = [...prev, slotTime];
        return newSlots.sort((a, b) => {
          const indexA = TIME_SLOTS.findIndex((ts) => ts.time === a);
          const indexB = TIME_SLOTS.findIndex((ts) => ts.time === b);
          return indexA - indexB;
        });
      }
    });
  };

  const clearSlots = () => setSelectedSlots([]);

  const updateAddonQuantity = (addonId: string, quantity: number) => {
    setSelectedAddons((prev) => {
      const updated = { ...prev };
      if (quantity <= 0) {
        delete updated[addonId];
      } else {
        updated[addonId] = quantity;
      }
      return updated;
    });
  };

  const clearAddons = () => setSelectedAddons({});

  // Helper to check status of a slot
  const getSlotStatus = (courtId: string, date: string, slotTime: string): SlotStatus => {
    // 1. Check if user selected this in current session
    if (courtId === selectedCourtId && date === selectedDate && selectedSlots.includes(slotTime)) {
      return 'selected';
    }

    // 2. Check if maintenance
    const key = `${courtId}_${date}`;
    if (maintenanceSlots[key]?.includes(slotTime)) {
      return 'maintenance';
    }

    // 3. Check if booked by any non-cancelled booking
    const isBooked = bookings.some(
      (b) =>
        b.courtId === courtId &&
        b.date === date &&
        b.slots.includes(slotTime) &&
        b.paymentStatus !== 'dibatalkan'
    );

    if (isBooked) {
      return 'booked';
    }

    return 'available';
  };

  // Helper to get who booked the slot
  const getSlotBookerInfo = (courtId: string, date: string, slotTime: string): Booking | undefined => {
    return bookings.find(
      (b) =>
        b.courtId === courtId &&
        b.date === date &&
        b.slots.includes(slotTime) &&
        b.paymentStatus !== 'dibatalkan'
    );
  };

  // Pricing calculation
  const calculatePricing = (
    customSlots = selectedSlots,
    customAddons = selectedAddons,
    customVoucher = ''
  ) => {
    if (!currentCourt) {
      return {
        courtSubtotal: 0,
        addonsSubtotal: 0,
        serviceFee: 0,
        discount: 0,
        grandTotal: 0,
        slotBreakdown: [],
      };
    }

    let courtSubtotal = 0;
    const slotBreakdown = customSlots.map((slotTime) => {
      const slotDef = TIME_SLOTS.find((ts) => ts.time === slotTime);
      const isPrime = slotDef?.isPrimeTime || false;
      const price = isPrime ? currentCourt.primeTimeRate : currentCourt.hourlyRate;
      courtSubtotal += price;
      return { slotTime, isPrimeTime: isPrime, price };
    });

    let addonsSubtotal = 0;
    Object.entries(customAddons).forEach(([addonId, qty]) => {
      const addon = INITIAL_ADDONS.find((a) => a.id === addonId);
      if (addon && qty > 0) {
        addonsSubtotal += addon.price * qty;
      }
    });

    const serviceFee = customSlots.length > 0 ? 2500 : 0;
    let discount = 0;
    const cleanVoucher = customVoucher.trim().toUpperCase();
    if (cleanVoucher === 'MAHASISWAJUARA' || cleanVoucher === 'DOSENKEREN') {
      discount = 20000;
    } else if (cleanVoucher === 'SMART50') {
      discount = Math.min(50000, Math.round(courtSubtotal * 0.2));
    }

    const grandTotal = Math.max(0, courtSubtotal + addonsSubtotal + serviceFee - discount);

    return {
      courtSubtotal,
      addonsSubtotal,
      serviceFee,
      discount,
      grandTotal,
      slotBreakdown,
    };
  };

  // Create booking
  const createBooking = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    clearSlots();
    clearAddons();
  };

  // Update status
  const updateBookingStatus = (bookingId: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            paymentStatus: status,
            paidAt: status === 'lunas' || status === 'selesai' ? b.paidAt || new Date().toISOString() : b.paidAt,
          };
        }
        return b;
      })
    );
  };

  const cancelBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'dibatalkan');
  };

  const deleteBooking = (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  // Toggle maintenance for a specific slot
  const toggleMaintenance = (courtId: string, date: string, slotTime: string) => {
    const key = `${courtId}_${date}`;
    setMaintenanceSlots((prev) => {
      const currentList = prev[key] || [];
      const updated = currentList.includes(slotTime)
        ? currentList.filter((s) => s !== slotTime)
        : [...currentList, slotTime];
      return { ...prev, [key]: updated };
    });
  };

  // Toggle court overall operational status
  const toggleCourtOperational = (courtId: string) => {
    setCourts((prev) =>
      prev.map((c) => (c.id === courtId ? { ...c, isOperational: !c.isOperational } : c))
    );
  };

  // Add manual walk-in booking by Admin
  const addManualWalkInBooking = (data: Partial<Booking>): Booking => {
    const randomId = `AS-WALKIN-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullBooking: Booking = {
      id: randomId,
      createdAt: new Date().toISOString(),
      customerName: data.customerName || 'Tamu Walk-In (Kasir)',
      customerPhone: data.customerPhone || '081200000000',
      customerEmail: data.customerEmail || 'walkin@smartarena.id',
      teamName: data.teamName || 'Tim Lapangan',
      courtId: data.courtId || currentCourt?.id || 'futsal-a',
      courtName: data.courtName || currentCourt?.name || 'Lapangan Futsal A',
      sport: data.sport || selectedSport,
      date: data.date || selectedDate,
      slots: data.slots || ['15:00 - 16:00'],
      addons: data.addons || [],
      courtSubtotal: data.courtSubtotal || 150000,
      addonsSubtotal: data.addonsSubtotal || 0,
      serviceFee: 0,
      discount: 0,
      grandTotal: data.grandTotal || 150000,
      paymentMethod: 'tunai_offline',
      paymentStatus: 'lunas',
      notes: data.notes || 'Pembayaran tunai di meja resepsionis pengelola.',
      checkInCode: `WK-${Math.floor(100 + Math.random() * 900)}`,
      paidAt: new Date().toISOString(),
    };

    setBookings((prev) => [fullBooking, ...prev]);
    return fullBooking;
  };

  // Reset demo
  const resetDemoData = () => {
    setCourts(INITIAL_COURTS);
    setBookings(INITIAL_BOOKINGS);
    setMaintenanceSlots({
      [`futsal-b_${getTodayDateString(0)}`]: ['14:00 - 15:00', '15:00 - 16:00'],
    });
    setSelectedSlots([]);
    setSelectedAddons({});
    localStorage.removeItem(STORAGE_KEYS.COURTS);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.MAINTENANCE);
  };

  // Compute Admin Stats
  const todayStr = getTodayDateString(0);
  const paidOrCompletedBookings = bookings.filter(
    (b) => b.paymentStatus === 'lunas' || b.paymentStatus === 'selesai'
  );

  const totalRevenue = paidOrCompletedBookings.reduce((sum, b) => sum + b.grandTotal, 0);

  const todayBookingsList = bookings.filter((b) => b.date === todayStr);
  const todayRevenue = todayBookingsList
    .filter((b) => b.paymentStatus === 'lunas' || b.paymentStatus === 'selesai')
    .reduce((sum, b) => sum + b.grandTotal, 0);

  const activeCourts = courts.filter((c) => c.isOperational).length;

  // Calculate peak hour
  const slotCountMap: { [slotTime: string]: number } = {};
  bookings
    .filter((b) => b.paymentStatus !== 'dibatalkan')
    .forEach((b) => {
      b.slots.forEach((slot) => {
        slotCountMap[slot] = (slotCountMap[slot] || 0) + 1;
      });
    });

  let peakHour = '19:00 - 21:00';
  let maxCount = 0;
  Object.entries(slotCountMap).forEach(([slot, count]) => {
    if (count > maxCount) {
      maxCount = count;
      peakHour = slot;
    }
  });

  // Calculate today's occupancy rate
  const totalSlotsTodayPossible = courts.length * TIME_SLOTS.length;
  const bookedSlotsToday = todayBookingsList
    .filter((b) => b.paymentStatus !== 'dibatalkan')
    .reduce((acc, b) => acc + b.slots.length, 0);
  const occupancyRate = Math.min(100, Math.round((bookedSlotsToday / (totalSlotsTodayPossible || 1)) * 100));

  const adminStats: AdminStats = {
    totalRevenue,
    todayRevenue,
    totalBookings: bookings.length,
    todayBookings: todayBookingsList.length,
    activeCourts,
    peakHour,
    occupancyRate,
  };

  return (
    <ReservationContext.Provider
      value={{
        viewMode,
        setViewMode,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        isLoginModalOpen,
        setIsLoginModalOpen,
        activeUserTab,
        setActiveUserTab,
        courts,
        selectedSport,
        setSelectedSport: handleSelectSport,
        selectedCourtId,
        setSelectedCourtId,
        currentCourt,
        selectedDate,
        setSelectedDate,
        selectedSlots,
        toggleSlot,
        clearSlots,
        selectedAddons,
        updateAddonQuantity,
        clearAddons,
        bookings,
        maintenanceSlots,
        createBooking,
        updateBookingStatus,
        cancelBooking,
        deleteBooking,
        toggleMaintenance,
        toggleCourtOperational,
        addManualWalkInBooking,
        resetDemoData,
        getSlotStatus,
        getSlotBookerInfo,
        calculatePricing,
        adminStats,
        viewingTicketId,
        setViewingTicketId,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
};
