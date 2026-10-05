import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/court.dart';
import '../models/booking.dart';
import '../models/addon_item.dart';
import '../models/time_slot.dart';
import '../data/dummy_data.dart';

class BookingProvider with ChangeNotifier {
  late List<Court> courts;
  late List<TimeSlot> allSlots;
  late List<AddonItem> allAddons;
  late List<Booking> bookings;

  // Maintenance map: "${courtId}_yyyy-MM-dd" -> ["08:00 - 09:00", "10:00 - 11:00"]
  Map<String, List<String>> maintenanceSlots = {};

  String _selectedSport = 'Futsal';
  String get selectedSport => _selectedSport;

  Court? _selectedCourt;
  Court? get selectedCourt => _selectedCourt;

  DateTime _selectedDate = DateTime.now();
  DateTime get selectedDate => _selectedDate;

  final List<String> _selectedSlots = [];
  List<String> get selectedSlots => _selectedSlots;

  final Map<String, int> _addonQuantities = {};
  Map<String, int> get addonQuantities => _addonQuantities;

  String? _voucherCode;
  int _discount = 0;

  bool _isAdmin = false;
  bool get isAdmin => _isAdmin;

  Timer? _expiryTimer;

  BookingProvider() {
    _initData();
    _startExpiryTimer();
  }

  void _initData() {
    courts = DummyData.getInitialCourts();
    allSlots = DummyData.getInitialSlots();
    allAddons = DummyData.getInitialAddons();
    bookings = DummyData.getInitialBookings();

    // Default initial maintenance matching screenshot:
    final todayStr = DateFormat('yyyy-MM-dd').format(DateTime.now());
    maintenanceSlots = {
      'futsal-a_$todayStr': ['08:00 - 09:00', '10:00 - 11:00'],
    };
  }

  void _startExpiryTimer() {
    _expiryTimer?.cancel();
    _expiryTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      bool statusChanged = false;
      final now = DateTime.now();

      for (var b in bookings) {
        if (b.paymentStatus == 'menunggu_pembayaran' && b.expiredAt != null) {
          if (now.isAfter(b.expiredAt!)) {
            b.paymentStatus = 'dibatalkan';
            statusChanged = true;
          }
        }
      }

      // If any status changed, or there are active pending bookings, notify listeners for countdown UI updates
      if (statusChanged || bookings.any((b) => b.paymentStatus == 'menunggu_pembayaran')) {
        notifyListeners();
      }
    });
  }

  @override
  void dispose() {
    _expiryTimer?.cancel();
    super.dispose();
  }

  // Sport & Court Selection
  void selectSport(String sport) {
    _selectedSport = sport;
    _selectedCourt = null;
    _selectedSlots.clear();
    _addonQuantities.clear();
    notifyListeners();
  }

  void selectCourt(Court court) {
    _selectedCourt = court;
    _selectedSlots.clear();
    _addonQuantities.clear();
    notifyListeners();
  }

  void selectDate(DateTime date) {
    _selectedDate = date;
    _selectedSlots.clear();
    notifyListeners();
  }

  void toggleSlot(String slotTime) {
    if (_selectedSlots.contains(slotTime)) {
      _selectedSlots.remove(slotTime);
    } else {
      _selectedSlots.add(slotTime);
    }
    _calculateTotals();
    notifyListeners();
  }

  void updateAddonQuantity(String addonId, int delta) {
    int current = _addonQuantities[addonId] ?? 0;
    int newVal = current + delta;
    if (newVal < 0) newVal = 0;
    _addonQuantities[addonId] = newVal;
    _calculateTotals();
    notifyListeners();
  }

  // Price calculations
  int get courtSubtotal {
    if (_selectedCourt == null) return 0;
    int total = 0;
    for (var sTime in _selectedSlots) {
      var slot = allSlots.firstWhere((s) => s.time == sTime, orElse: () => allSlots.first);
      total += slot.isPrimeTime ? _selectedCourt!.primeTimeRate : _selectedCourt!.hourlyRate;
    }
    return total;
  }

  int get addonsSubtotal {
    int total = 0;
    _addonQuantities.forEach((id, qty) {
      if (qty > 0) {
        var addon = allAddons.firstWhere((a) => a.id == id, orElse: () => allAddons.first);
        total += (addon.price * qty);
      }
    });
    return total;
  }

  int get serviceFee => _selectedSlots.isNotEmpty ? 2500 : 0;
  int get discount => _discount;

  int get grandTotal {
    int total = courtSubtotal + addonsSubtotal + serviceFee - discount;
    return total < 0 ? 0 : total;
  }

  void _calculateTotals() {
    _applyVoucher(_voucherCode ?? '');
  }

  String applyVoucher(String code) {
    _voucherCode = code.trim().toUpperCase();
    String res = _applyVoucher(_voucherCode!);
    notifyListeners();
    return res;
  }

  String _applyVoucher(String code) {
    if (code.isEmpty) {
      _discount = 0;
      return '';
    }
    if (code == 'MAHASISWAJUARA' || code == 'DOSENKEREN') {
      _discount = 20000;
      return 'Voucher Rp 20.000 berhasil diterapkan!';
    } else if (code == 'SMART50') {
      double pct = 0.2 * courtSubtotal;
      if (pct > 50000) pct = 50000;
      _discount = pct.toInt();
      return 'Voucher diskon 20% (hingga Rp 50.000) berhasil diterapkan!';
    }
    _discount = 0;
    _voucherCode = null;
    return 'Kode voucher tidak valid!';
  }

  // Booking creation
  Booking createBooking({
    required String name,
    required String phone,
    required String email,
    required String team,
    required String paymentMethod,
    required String notes,
    bool isPending = true,
  }) {
    List<BookingAddon> bAddons = [];
    _addonQuantities.forEach((id, qty) {
      if (qty > 0) {
        var a = allAddons.firstWhere((x) => x.id == id);
        bAddons.add(BookingAddon(
          addonId: a.id,
          name: a.name,
          quantity: qty,
          pricePerUnit: a.price,
          totalPrice: a.price * qty,
        ));
      }
    });

    final now = DateTime.now();
    final bookingId = 'AS-2026-${now.millisecondsSinceEpoch.toString().substring(7)}';
    final checkInCode = 'CK-${now.millisecondsSinceEpoch.toString().substring(9)}';

    Booking b = Booking(
      id: bookingId,
      createdAt: now,
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      teamName: team.isEmpty ? 'Tim Mandiri' : team,
      courtId: _selectedCourt!.id,
      courtName: _selectedCourt!.name,
      sport: _selectedCourt!.sport,
      date: _selectedDate,
      slots: List.from(_selectedSlots),
      addons: bAddons,
      courtSubtotal: courtSubtotal,
      addonsSubtotal: addonsSubtotal,
      serviceFee: serviceFee,
      discount: discount,
      voucherCode: _voucherCode,
      grandTotal: grandTotal,
      paymentMethod: paymentMethod,
      paymentStatus: isPending ? 'menunggu_pembayaran' : 'lunas',
      notes: notes,
      checkInCode: checkInCode,
      paidAt: isPending ? null : now,
      expiredAt: isPending ? now.add(const Duration(minutes: 15)) : null,
    );

    bookings.insert(0, b);

    // reset active booking flow
    _selectedSlots.clear();
    _addonQuantities.clear();
    _voucherCode = null;
    _discount = 0;

    notifyListeners();
    return b;
  }

  // Status updates
  void updateBookingStatus(String id, String status) {
    var index = bookings.indexWhere((x) => x.id == id);
    if (index != -1) {
      bookings[index].paymentStatus = status;
      if (status == 'lunas') {
        bookings[index].paidAt = DateTime.now();
        bookings[index].expiredAt = null;
      }
      notifyListeners();
    }
  }

  void cancelBooking(String id) {
    updateBookingStatus(id, 'dibatalkan');
  }

  void deleteBooking(String id) {
    bookings.removeWhere((b) => b.id == id);
    notifyListeners();
  }

  // Slot & Maintenance Helpers
  bool isSlotUnderMaintenance(String courtId, DateTime date, String slotTime) {
    final key = '${courtId}_${DateFormat('yyyy-MM-dd').format(date)}';
    return maintenanceSlots[key]?.contains(slotTime) ?? false;
  }

  bool isSlotBooked(String courtId, DateTime date, String slotTime) {
    return bookings.any((b) =>
      b.courtId == courtId &&
      b.date.year == date.year &&
      b.date.month == date.month &&
      b.date.day == date.day &&
      b.slots.contains(slotTime) &&
      b.paymentStatus != 'dibatalkan');
  }

  String getSlotStatus(String courtId, DateTime date, String slotTime) {
    if (_selectedSlots.contains(slotTime)) return 'selected';
    if (isSlotUnderMaintenance(courtId, date, slotTime)) return 'maintenance';
    if (isSlotBooked(courtId, date, slotTime)) return 'booked';
    return 'available';
  }

  // Admin Operational & Maintenance Toggles
  void toggleCourtOperational(String courtId) {
    var index = courts.indexWhere((c) => c.id == courtId);
    if (index != -1) {
      courts[index].isOperational = !courts[index].isOperational;
      notifyListeners();
    }
  }

  void toggleSlotMaintenance(String courtId, DateTime date, String slotTime) {
    final key = '${courtId}_${DateFormat('yyyy-MM-dd').format(date)}';
    final list = List<String>.from(maintenanceSlots[key] ?? []);
    if (list.contains(slotTime)) {
      list.remove(slotTime);
    } else {
      list.add(slotTime);
    }
    maintenanceSlots[key] = list;
    notifyListeners();
  }

  // CSV Export
  String exportBookingsToCsv() {
    StringBuffer sb = StringBuffer();
    sb.writeln('ID Booking,Waktu Dibuat,Nama Pemesan,Nomor WA,Email,Nama Tim,Lapangan,Olahraga,Tanggal Main,Slot Waktu,Total Biaya,Metode Pembayaran,Status');
    for (var b in bookings) {
      sb.writeln('${b.id},"${DateFormat('yyyy-MM-dd HH:mm').format(b.createdAt)}","${b.customerName}","${b.customerPhone}","${b.customerEmail}","${b.teamName}","${b.courtName}",${b.sport},"${DateFormat('yyyy-MM-dd').format(b.date)}","${b.slots.join('; ')}",${b.grandTotal},"${b.paymentMethod}","${b.paymentStatus}"');
    }
    return sb.toString();
  }

  // Reset Data Demo
  void resetDemoData() {
    _initData();
    _selectedSlots.clear();
    _addonQuantities.clear();
    _voucherCode = null;
    _discount = 0;
    notifyListeners();
  }

  // Admin Auth
  bool adminLogin(String pin) {
    final clean = pin.trim().toLowerCase();
    if (clean == '1234' || clean == 'admin' || clean == 'admin123' || clean == '8888') {
      _isAdmin = true;
      notifyListeners();
      return true;
    }
    return false;
  }

  void adminLogout() {
    _isAdmin = false;
    notifyListeners();
  }
}
