class Court {
  final String id;
  final String name;
  final String sport;
  final String courtType;
  final int hourlyRate;
  final int primeTimeRate;
  final String imageUrl;
  final double rating;
  final int totalReviews;
  final String location;
  final List<String> facilities;
  final String dimensions;
  bool isOperational;

  Court({
    required this.id,
    required this.name,
    required this.sport,
    required this.courtType,
    required this.hourlyRate,
    required this.primeTimeRate,
    required this.imageUrl,
    required this.rating,
    required this.totalReviews,
    required this.location,
    required this.facilities,
    required this.dimensions,
    required this.isOperational,
  });
}
