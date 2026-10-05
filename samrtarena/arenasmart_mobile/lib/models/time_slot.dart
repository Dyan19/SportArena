class TimeSlot {
  final String id;
  final String time;
  final int hour;
  final bool isPrimeTime;
  final double priceMultiplier;

  TimeSlot({
    required this.id,
    required this.time,
    required this.hour,
    required this.isPrimeTime,
    required this.priceMultiplier,
  });
}
