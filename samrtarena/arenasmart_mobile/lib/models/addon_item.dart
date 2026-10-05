class AddonItem {
  final String id;
  final String name;
  final String category; // 'gear', 'service', 'beverage'
  final int price;
  final String unit;
  final List<String> sportTypes; // or ['all']
  final String description;

  AddonItem({
    required this.id,
    required this.name,
    required this.category,
    required this.price,
    required this.unit,
    required this.sportTypes,
    required this.description,
  });
}
