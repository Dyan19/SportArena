import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/booking.dart';

class TicketDetailScreen extends StatelessWidget {
  final Booking booking;

  const TicketDetailScreen({super.key, required this.booking});

  @override
  Widget build(BuildContext context) {
    var formatCurrency = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);
    var dateFormat = DateFormat('EEEE, d MMMM yyyy', 'id_ID');

    return Scaffold(
      backgroundColor: Colors.indigo,
      appBar: AppBar(title: Text('E-Ticket', style: TextStyle(color: Colors.white)), backgroundColor: Colors.indigo, elevation: 0, iconTheme: IconThemeData(color: Colors.white)),
      body: Center(
        child: Container(
          margin: EdgeInsets.all(16),
          padding: EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(booking.sport, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: booking.paymentStatus == 'lunas' || booking.paymentStatus == 'selesai' ? Colors.green[100] : Colors.orange[100],
                        borderRadius: BorderRadius.circular(4)
                      ),
                      child: Text(booking.paymentStatus.toUpperCase(), style: TextStyle(color: booking.paymentStatus == 'lunas' || booking.paymentStatus == 'selesai' ? Colors.green : Colors.orange, fontWeight: FontWeight.bold)),
                    )
                  ],
                ),
                SizedBox(height: 16),
                Text(booking.courtName, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                Text('Booking ID: ${booking.id}', style: TextStyle(color: Colors.grey)),
                Divider(height: 32),
                ListTile(
                  leading: Icon(Icons.calendar_today),
                  title: Text(dateFormat.format(booking.date)),
                  subtitle: Text('Slots: ${booking.slots.join(", ")}'),
                  contentPadding: EdgeInsets.zero,
                ),
                ListTile(
                  leading: Icon(Icons.person),
                  title: Text(booking.customerName),
                  subtitle: Text('${booking.customerPhone} | ${booking.teamName}'),
                  contentPadding: EdgeInsets.zero,
                ),
                if (booking.addons.isNotEmpty)
                  ListTile(
                    leading: Icon(Icons.add_shopping_cart),
                    title: Text('Tambahan:'),
                    subtitle: Text(booking.addons.map((a) => '${a.name} x${a.quantity}').join(', ')),
                    contentPadding: EdgeInsets.zero,
                  ),
                Divider(height: 32),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Total Dibayar', style: TextStyle(color: Colors.grey)),
                    Text(formatCurrency.format(booking.grandTotal), style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ],
                ),
                SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Metode Pembayaran', style: TextStyle(color: Colors.grey)),
                    Text(booking.paymentMethod, style: TextStyle(fontWeight: FontWeight.bold)),
                  ],
                ),
                SizedBox(height: 24),
                Text('- - - - - - - - - - - - - - - - - - - - - - - - - - -', style: TextStyle(color: Colors.grey), maxLines: 1),
                SizedBox(height: 24),
                Text('Kode Check-In', style: TextStyle(color: Colors.grey)),
                SizedBox(height: 8),
                Text(booking.checkInCode, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: 2, fontFamily: 'monospace')),
                SizedBox(height: 16),
                Icon(Icons.qr_code_2, size: 100),
                SizedBox(height: 16),
                Text('Tunjukkan kode ini kepada petugas lapangan', style: TextStyle(fontSize: 12, color: Colors.grey), textAlign: TextAlign.center),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
