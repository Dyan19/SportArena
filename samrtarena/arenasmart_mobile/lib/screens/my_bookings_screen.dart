import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/booking_provider.dart';
import '../models/booking.dart';
import 'ticket_detail_screen.dart';
import 'checkout_screen.dart';

class MyBookingsScreen extends StatefulWidget {
  const MyBookingsScreen({super.key});

  @override
  State<MyBookingsScreen> createState() => _MyBookingsScreenState();
}

class _MyBookingsScreenState extends State<MyBookingsScreen> {
  String selectedFilter = 'all';

  @override
  Widget build(BuildContext context) {
    var provider = Provider.of<BookingProvider>(context);
    var formatCurrency = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);
    var dateFormat = DateFormat('EEEE, d MMM yyyy', 'id_ID');

    List<Booking> filteredList = provider.bookings.where((b) {
      if (selectedFilter == 'all') return true;
      return b.paymentStatus == selectedFilter;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Riwayat Pesanan & E-Tiket Saya', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
      ),
      body: Column(
        children: [
          // Filter status chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: [
                _buildFilterChip('all', 'Semua Tiket'),
                _buildFilterChip('menunggu_pembayaran', 'Menunggu Bayar'),
                _buildFilterChip('lunas', 'Lunas'),
                _buildFilterChip('selesai', 'Selesai'),
                _buildFilterChip('dibatalkan', 'Dibatalkan'),
              ],
            ),
          ),

          Expanded(
            child: filteredList.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.receipt_long_outlined, size: 70, color: Colors.grey),
                        const SizedBox(height: 12),
                        const Text('Tidak ada reservasi ditemukan', style: TextStyle(fontSize: 16, color: Colors.grey, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        const Text('Coba sesuaikan filter atau buat reservasi baru.', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.indigo),
                          onPressed: () {
                            DefaultTabController.of(context).animateTo(0);
                          },
                          child: const Text('Pesan Lapangan Sekarang', style: TextStyle(color: Colors.white)),
                        )
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filteredList.length,
                    itemBuilder: (c, i) {
                      var b = filteredList[i];
                      bool isPending = b.paymentStatus == 'menunggu_pembayaran';
                      bool isLunas = b.paymentStatus == 'lunas';
                      bool isSelesai = b.paymentStatus == 'selesai';

                      Color badgeBg;
                      Color badgeText;
                      String statusText;

                      if (isLunas) {
                        badgeBg = Colors.green.shade100;
                        badgeText = Colors.green.shade800;
                        statusText = 'LUNAS / CONFIRMED';
                      } else if (isPending) {
                        badgeBg = Colors.amber.shade100;
                        badgeText = Colors.amber.shade900;
                        statusText = 'MENUNGGU BAYAR';
                      } else if (isSelesai) {
                        badgeBg = Colors.blue.shade100;
                        badgeText = Colors.blue.shade800;
                        statusText = 'SELESAI (CHECKED-IN)';
                      } else {
                        badgeBg = Colors.red.shade100;
                        badgeText = Colors.red.shade800;
                        statusText = 'DIBATALKAN';
                      }

                      return Card(
                        margin: const EdgeInsets.only(bottom: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                          side: BorderSide(color: isPending ? Colors.amber.shade400 : Colors.grey.shade200, width: isPending ? 1.5 : 1),
                        ),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(14),
                          onTap: () {
                            if (isPending) {
                              // If pending, user can click to continue payment!
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => CheckoutScreen(pendingBooking: b)),
                              );
                            } else {
                              // If lunas or selesai or canceled, open ticket
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => TicketDetailScreen(booking: b)),
                              );
                            }
                          },
                          child: Padding(
                            padding: const EdgeInsets.all(14),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Top row: Booking ID & Status Badge
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(b.id, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.indigo)),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(color: badgeBg, borderRadius: BorderRadius.circular(6)),
                                      child: Text(statusText, style: TextStyle(color: badgeText, fontSize: 10, fontWeight: FontWeight.bold)),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),

                                // Court Name
                                Text(b.courtName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                const SizedBox(height: 4),

                                // Date & Slots
                                Row(
                                  children: [
                                    const Icon(Icons.calendar_today, size: 14, color: Colors.grey),
                                    const SizedBox(width: 6),
                                    Text(dateFormat.format(b.date), style: const TextStyle(color: Colors.black87, fontSize: 12)),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(Icons.access_time, size: 14, color: Colors.grey),
                                    const SizedBox(width: 6),
                                    Text(b.slots.join(', '), style: const TextStyle(color: Colors.indigo, fontSize: 12, fontWeight: FontWeight.w600)),
                                  ],
                                ),
                                const SizedBox(height: 8),

                                // If pending: show countdown timer & button to pay
                                if (isPending) ...[
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: Colors.amber.shade50,
                                      border: Border.all(color: Colors.amber.shade300),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Row(
                                          children: [
                                            const Icon(Icons.timer_outlined, size: 16, color: Colors.amber),
                                            const SizedBox(width: 6),
                                            Text(
                                              'Batas Bayar: ${b.remainingTimeString}',
                                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.amber.shade900),
                                            ),
                                          ],
                                        ),
                                        ElevatedButton(
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: Colors.amber.shade700,
                                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                            minimumSize: Size.zero,
                                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                          ),
                                          onPressed: () {
                                            Navigator.push(
                                              context,
                                              MaterialPageRoute(builder: (_) => CheckoutScreen(pendingBooking: b)),
                                            );
                                          },
                                          child: const Text('Bayar Sekarang', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                ],

                                // Bottom row: Grand Total & Chevron
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      formatCurrency.format(b.grandTotal),
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.indigo),
                                    ),
                                    Row(
                                      children: [
                                        Text(isPending ? 'Lanjutkan Pembayaran' : 'Lihat E-Tiket', style: const TextStyle(fontSize: 11, color: Colors.indigo, fontWeight: FontWeight.bold)),
                                        const Icon(Icons.chevron_right, size: 18, color: Colors.indigo),
                                      ],
                                    )
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          )
        ],
      ),
    );
  }

  Widget _buildFilterChip(String key, String label) {
    bool isSelected = selectedFilter == key;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (val) {
          setState(() {
            selectedFilter = key;
          });
        },
        selectedColor: Colors.indigo.shade100,
        checkmarkColor: Colors.indigo,
        labelStyle: TextStyle(
          color: isSelected ? Colors.indigo : Colors.black87,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          fontSize: 12,
        ),
      ),
    );
  }
}
