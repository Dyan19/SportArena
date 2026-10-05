import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/booking_provider.dart';
import 'checkout_screen.dart';

class BookingScreen extends StatelessWidget {
  const BookingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    var provider = Provider.of<BookingProvider>(context);
    if (provider.selectedCourt == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Pilih Jadwal Lapangan')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.sports_soccer, size: 70, color: Colors.grey),
              const SizedBox(height: 16),
              const Text(
                'Silakan pilih lapangan terlebih dahulu\ndari tab Beranda.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.indigo),
                onPressed: () {
                  DefaultTabController.of(context).animateTo(0);
                },
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                label: const Text('Ke Beranda', style: TextStyle(color: Colors.white)),
              )
            ],
          ),
        ),
      );
    }

    var court = provider.selectedCourt!;
    var formatCurrency = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);
    var dateFormat = DateFormat('EEEE, d MMMM yyyy', 'id_ID');
    var filteredAddons = provider.allAddons
        .where((a) => a.sportTypes.contains('all') || a.sportTypes.contains(court.sport))
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(court.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Banner Lapangan Tutup jika dinonaktifkan Admin
          if (!court.isOperational) ...[
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.red.shade900.withValues(alpha: 0.2),
                border: Border.all(color: Colors.red.shade700),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.error_outline, color: Colors.redAccent, size: 28),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Perhatian: Lapangan ini sementara ditutup oleh pihak pengelola untuk pemeliharaan rutin. Silakan pilih lapangan lainnya atau hubungi Admin.',
                      style: TextStyle(color: Colors.redAccent, fontSize: 12, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Info Lapangan Ringkas
          Card(
            clipBehavior: Clip.antiAlias,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Image.network(
                  court.imageUrl,
                  height: 140,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (c, e, s) => Container(height: 140, color: Colors.grey[300]),
                ),
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(court.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      const SizedBox(height: 4),
                      Text(court.location, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                      const SizedBox(height: 4),
                      Text(
                        'Reguler: ${formatCurrency.format(court.hourlyRate)}/jam • Prime: ${formatCurrency.format(court.primeTimeRate)}/jam',
                        style: const TextStyle(color: Colors.indigo, fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                    ],
                  ),
                )
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Pemilihan Tanggal
          const Text('Pilih Tanggal Main', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 8),
          InkWell(
            onTap: () async {
              DateTime? picked = await showDatePicker(
                context: context,
                initialDate: provider.selectedDate,
                firstDate: DateTime.now(),
                lastDate: DateTime.now().add(const Duration(days: 30)),
              );
              if (picked != null) provider.selectDate(picked);
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: Colors.indigo.shade200),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.calendar_month, color: Colors.indigo),
                      const SizedBox(width: 10),
                      Text(dateFormat.format(provider.selectedDate), style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const Text('Ubah', style: TextStyle(color: Colors.indigo, fontWeight: FontWeight.bold, fontSize: 13)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // INDIKATOR WARNA (Legend)
          const Text('Ketersediaan Slot Jam', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Wrap(
              spacing: 12,
              runSpacing: 6,
              children: [
                _buildLegendItem(Colors.green, 'Tersedia'),
                _buildLegendItem(Colors.indigo, 'Dipilih'),
                _buildLegendItem(Colors.amber.shade700, 'Terisi (Booking)'),
                _buildLegendItem(Colors.red.shade600, 'Perbaikan (Maint)'),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Grid Slot Jam (07:00 - 23:00)
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 2.4,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
            ),
            itemCount: provider.allSlots.length,
            itemBuilder: (c, i) {
              var slot = provider.allSlots[i];
              String status = provider.getSlotStatus(court.id, provider.selectedDate, slot.time);

              Color bgColor;
              Color borderColor;
              Color textColor;
              String statusLabel;
              IconData statusIcon;

              if (!court.isOperational) {
                bgColor = Colors.grey.shade200;
                borderColor = Colors.grey.shade400;
                textColor = Colors.grey.shade600;
                statusLabel = 'Tutup Total';
                statusIcon = Icons.lock_outline;
              } else if (status == 'selected') {
                bgColor = Colors.indigo;
                borderColor = Colors.indigo;
                textColor = Colors.white;
                statusLabel = 'Dipilih';
                statusIcon = Icons.check_circle;
              } else if (status == 'maintenance') {
                // Tanda Merah untuk Maintenance sesuai instruksi user
                bgColor = Colors.red.shade50;
                borderColor = Colors.red.shade600;
                textColor = Colors.red.shade700;
                statusLabel = 'Perbaikan';
                statusIcon = Icons.build_circle_outlined;
              } else if (status == 'booked') {
                // Tanda Kuning untuk Booking sesuai instruksi user
                bgColor = Colors.amber.shade50;
                borderColor = Colors.amber.shade600;
                textColor = Colors.amber.shade900;
                statusLabel = 'Terisi';
                statusIcon = Icons.block;
              } else {
                // Tersedia (Hijau)
                bgColor = Colors.green.shade50;
                borderColor = Colors.green.shade500;
                textColor = Colors.green.shade900;
                statusLabel = slot.isPrimeTime ? 'Prime' : 'Tersedia';
                statusIcon = Icons.sports;
              }

              return InkWell(
                borderRadius: BorderRadius.circular(10),
                onTap: () {
                  if (!court.isOperational) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Lapangan sedang tutup total oleh pengelola.')),
                    );
                    return;
                  }
                  if (status == 'maintenance') {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Slot ${slot.time} sedang dalam perbaikan (Maintenance).')),
                    );
                    return;
                  }
                  if (status == 'booked') {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Slot ${slot.time} sudah dipesan orang lain.')),
                    );
                    return;
                  }
                  provider.toggleSlot(slot.time);
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color: bgColor,
                    border: Border.all(color: borderColor, width: 1.5),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      Icon(statusIcon, size: 20, color: textColor),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              slot.time,
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: textColor),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              statusLabel,
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: textColor),
                            ),
                          ],
                        ),
                      )
                    ],
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 24),

          // Add-ons & Peralatan Tambahan
          const Text('Add-ons & Sewa Peralatan Tambahan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 8),
          ...filteredAddons.map((addon) {
            int qty = provider.addonQuantities[addon.id] ?? 0;
            bool isSelected = qty > 0;
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
                side: BorderSide(color: isSelected ? Colors.indigo : Colors.grey.shade200),
              ),
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(addon.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          const SizedBox(height: 2),
                          Text(addon.description, style: TextStyle(color: Colors.grey[600], fontSize: 11)),
                          const SizedBox(height: 4),
                          Text(
                            '${formatCurrency.format(addon.price)} / ${addon.unit}',
                            style: const TextStyle(color: Colors.indigo, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.remove_circle_outline, size: 22),
                          onPressed: qty > 0 ? () => provider.updateAddonQuantity(addon.id, -1) : null,
                        ),
                        Text('$qty', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        IconButton(
                          icon: const Icon(Icons.add_circle_outline, size: 22, color: Colors.indigo),
                          onPressed: () => provider.updateAddonQuantity(addon.id, 1),
                        ),
                      ],
                    )
                  ],
                ),
              ),
            );
          }),
          const SizedBox(height: 90),
        ],
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -2))],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${provider.selectedSlots.length} Slot Jam Terpilih',
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
                Text(
                  formatCurrency.format(provider.courtSubtotal + provider.addonsSubtotal),
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.indigo),
                ),
              ],
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.indigo,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onPressed: (!court.isOperational || provider.selectedSlots.isEmpty)
                  ? null
                  : () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const CheckoutScreen()),
                      );
                    },
              child: const Text('Lanjut Bayar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildLegendItem(Color color, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3)),
        ),
        const SizedBox(width: 5),
        Text(text, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
      ],
    );
  }
}
