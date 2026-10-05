class BookingAddon {
  final String addonId;
  final String name;
  final int quantity;
  final int pricePerUnit;
  final int totalPrice;

  BookingAddon({
    required this.addonId,
    required this.name,
    required this.quantity,
    required this.pricePerUnit,
    required this.totalPrice,
  });
}

class Booking {
  final String id;
  final DateTime createdAt;
  final String customerName;
  final String customerPhone;
  final String customerEmail;
  final String teamName;
  final String courtId;
  final String courtName;
  final String sport;
  final DateTime date;
  final List<String> slots;
  final List<BookingAddon> addons;
  final int courtSubtotal;
  final int addonsSubtotal;
  final int serviceFee;
  final int discount;
  final String? voucherCode;
  final int grandTotal;
  String paymentMethod;
  String paymentStatus; // menunggu_pembayaran / lunas / selesai / dibatalkan
  final String notes;
  final String checkInCode;
  DateTime? paidAt;
  DateTime? expiredAt;

  Booking({
    required this.id,
    required this.createdAt,
    required this.customerName,
    required this.customerPhone,
    required this.customerEmail,
    required this.teamName,
    required this.courtId,
    required this.courtName,
    required this.sport,
    required this.date,
    required this.slots,
    required this.addons,
    required this.courtSubtotal,
    required this.addonsSubtotal,
    required this.serviceFee,
    required this.discount,
    this.voucherCode,
    required this.grandTotal,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.notes,
    required this.checkInCode,
    this.paidAt,
    this.expiredAt,
  });

  bool get isExpired {
    if (paymentStatus != 'menunggu_pembayaran' || expiredAt == null) return false;
    return DateTime.now().isAfter(expiredAt!);
  }

  Duration get remainingTime {
    if (expiredAt == null) return Duration.zero;
    final diff = expiredAt!.difference(DateTime.now());
    return diff.isNegative ? Duration.zero : diff;
  }

  String get remainingTimeString {
    final rem = remainingTime;
    final minutes = rem.inMinutes;
    final seconds = rem.inSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }
}
