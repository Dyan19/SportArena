import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/booking_provider.dart';
import 'ticket_detail_screen.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  String selectedCourtId = 'futsal-a';
  DateTime maintenanceDate = DateTime.now();
  String searchKeyword = '';
  String statusFilter = 'all';

  @override
  Widget build(BuildContext context) {
    var p = Provider.of<BookingProvider>(context);
    var formatCurrency = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);
    var dateFormat = DateFormat('dd/MM/yyyy', 'id_ID');

    // Filter bookings
    final filteredBookings = p.bookings.where((b) {
      bool matchStatus = statusFilter == 'all' || b.paymentStatus == statusFilter;
      bool matchKeyword = searchKeyword.isEmpty ||
          b.customerName.toLowerCase().contains(searchKeyword.toLowerCase()) ||
          b.id.toLowerCase().contains(searchKeyword.toLowerCase()) ||
          b.customerPhone.contains(searchKeyword);
      return matchStatus && matchKeyword;
    }).toList();

    int totalRev = p.bookings
        .where((b) => b.paymentStatus == 'lunas' || b.paymentStatus == 'selesai')
        .fold(0, (sum, b) => sum + b.grandTotal);
    int totalBookings = p.bookings.length;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        title: const Row(
          children: [
            Icon(Icons.shield, color: Colors.indigoAccent, size: 20),
            SizedBox(width: 8),
            Text('Dashboard Pengelola Arena', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Export CSV',
            icon: const Icon(Icons.download, color: Colors.greenAccent),
            onPressed: () => _showExportCsvDialog(context, p),
          ),
          IconButton(
            tooltip: 'Reset Data',
            icon: const Icon(Icons.restart_alt, color: Colors.amberAccent),
            onPressed: () => _showResetConfirmDialog(context, p),
          ),
          TextButton.icon(
            style: TextButton.styleFrom(
              foregroundColor: Colors.redAccent,
              padding: const EdgeInsets.symmetric(horizontal: 10),
            ),
            icon: const Icon(Icons.lock_outline, size: 16, color: Colors.redAccent),
            label: const Text('Keluar', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 12)),
            onPressed: () => _handleExitAndGoHome(context, p),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Banner Top Panel Pengelola dengan tombol Kunci & Keluar
          Container(
            padding: const EdgeInsets.all(14),
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.indigo.shade900.withValues(alpha: 0.5), const Color(0xFF1E293B)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.indigo.shade500.withValues(alpha: 0.3)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.admin_panel_settings, color: Colors.indigoAccent, size: 16),
                          SizedBox(width: 6),
                          Text('PANEL PENGELOLA ARENA', style: TextStyle(color: Colors.indigoAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      SizedBox(height: 4),
                      Text('Kontrol Operasional & Kasir', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                    ],
                  ),
                ),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red.shade900.withValues(alpha: 0.4),
                    foregroundColor: Colors.redAccent,
                    side: const BorderSide(color: Colors.redAccent),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: () => _handleExitAndGoHome(context, p),
                  icon: const Icon(Icons.lock_outline, size: 15),
                  label: const Text('Kunci & Keluar', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
          // 4 Kartu KPI
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 1.6,
            children: [
              _buildKpiCard('TOTAL PENDAPATAN', formatCurrency.format(totalRev), Icons.attach_money, Colors.greenAccent),
              _buildKpiCard('TOTAL RESERVASI', '$totalBookings Sesi', Icons.calendar_month, Colors.cyanAccent),
              _buildKpiCard('JAM TERAMAI', '19:00 - 21:00', Icons.local_fire_department, Colors.orangeAccent),
              _buildKpiCard('OKUPANSI HARI INI', '75%', Icons.analytics, Colors.purpleAccent),
            ],
          ),
          const SizedBox(height: 20),

          // ========================================================
          // FITUR MAINTENANCE (MANAJEMEN STATUS & PEMELIHARAAN)
          // ========================================================
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.build_circle, color: Colors.amberAccent, size: 22),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Manajemen Status Lapangan & Pemeliharaan (Maintenance)',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                const Text(
                  'Tutup lapangan secara menyeluruh atau matikan slot jam spesifik untuk pembersihan/perbaikan rutin.',
                  style: TextStyle(color: Colors.white54, fontSize: 11),
                ),
                const SizedBox(height: 14),

                // Grid 6 Lapangan dengan Saklar Buka / Tutup
                ...p.courts.map((court) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(                       color: court.isOperational ? const Color(0xFF0F172A) : Colors.red.shade900.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: court.isOperational ? Colors.white12 : Colors.red.shade700),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                court.name,
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                court.isOperational ? '● Status: Buka / Beroperasi' : '○ Status: Tutup Total (Maintenance)',
                                style: TextStyle(
                                  color: court.isOperational ? Colors.greenAccent : Colors.redAccent,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: court.isOperational ? Colors.greenAccent.shade700 : Colors.redAccent.shade700,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          onPressed: () => p.toggleCourtOperational(court.id),
                          icon: Icon(court.isOperational ? Icons.check : Icons.lock, size: 14),
                          label: Text(court.isOperational ? 'Aktif' : 'Tutup', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        )
                      ],
                    ),
                  );
                }),
                const SizedBox(height: 16),
                const Divider(color: Colors.white12),
                const SizedBox(height: 10),

                // Sub-bagian: Setel Slot Jam Tertentu Sebagai Maintenance
                const Row(
                  children: [
                    Icon(Icons.tune, color: Colors.amberAccent, size: 18),
                    SizedBox(width: 8),
                    Text(
                      'Setel Slot Jam Tertentu Sebagai Maintenance (Tutup Sementara)',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                const Text(
                  'Klik slot jam di bawah untuk menandai Maintenance (Merah). Slot tersebut langsung tidak bisa dibooking oleh penyewa.',
                  style: TextStyle(color: Colors.white54, fontSize: 11),
                ),
                const SizedBox(height: 12),

                // Dropdown Pilih Lapangan & Datepicker
                Row(
                  children: [
                    Expanded(
                      flex: 3,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.white24),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: selectedCourtId,
                            dropdownColor: const Color(0xFF1E293B),
                            style: const TextStyle(color: Colors.white, fontSize: 12),
                            isExpanded: true,
                            items: p.courts.map((c) {
                              return DropdownMenuItem(value: c.id, child: Text(c.name, overflow: TextOverflow.ellipsis));
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) setState(() => selectedCourtId = val);
                            },
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      flex: 2,
                      child: InkWell(
                        onTap: () async {
                          DateTime? picked = await showDatePicker(
                            context: context,
                            initialDate: maintenanceDate,
                            firstDate: DateTime.now().subtract(const Duration(days: 30)),
                            lastDate: DateTime.now().add(const Duration(days: 30)),
                          );
                          if (picked != null) setState(() => maintenanceDate = picked);
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F172A),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.white24),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(dateFormat.format(maintenanceDate), style: const TextStyle(color: Colors.white, fontSize: 12)),
                              const Icon(Icons.calendar_today, size: 14, color: Colors.white70),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // 16 Tombol Slot Jam (Toggle Maintenance)
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 2.8,
                    crossAxisSpacing: 8,
                    mainAxisSpacing: 8,
                  ),
                  itemCount: p.allSlots.length,
                  itemBuilder: (c, i) {
                    var slot = p.allSlots[i];
                    bool isMaint = p.isSlotUnderMaintenance(selectedCourtId, maintenanceDate, slot.time);

                    return InkWell(
                      borderRadius: BorderRadius.circular(8),
                      onTap: () => p.toggleSlotMaintenance(selectedCourtId, maintenanceDate, slot.time),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(                           color: isMaint ? Colors.red.shade900.withValues(alpha: 0.35) : const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: isMaint ? Colors.redAccent : Colors.white12, width: isMaint ? 1.5 : 1),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(slot.time, style: TextStyle(color: isMaint ? Colors.redAccent : Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
                            const SizedBox(height: 2),
                            Text(
                              isMaint ? 'Maintenance' : '✓ Normal',
                              style: TextStyle(color: isMaint ? Colors.redAccent : Colors.greenAccent, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // ========================================================
          // DAFTAR PESANAN REAL-TIME DENGAN STATUS & CHECK-IN
          // ========================================================
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.sync, color: Colors.greenAccent, size: 20),
                        SizedBox(width: 8),
                        Text('Daftar Pesanan Masuk (Real-Time)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                      ],
                    ),
                    Text('${filteredBookings.length} Pesanan', style: const TextStyle(color: Colors.white54, fontSize: 12)),
                  ],
                ),
                const SizedBox(height: 12),

                // Search & Filter Dropdown
                Row(
                  children: [
                    Expanded(
                      flex: 3,
                      child: TextField(
                        style: const TextStyle(color: Colors.white, fontSize: 12),
                        decoration: InputDecoration(
                          hintText: 'Cari pemesan, ID, telepon...',
                          hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
                          prefixIcon: const Icon(Icons.search, color: Colors.white38, size: 18),
                          filled: true,
                          fillColor: const Color(0xFF0F172A),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Colors.white12)),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Colors.white12)),
                        ),
                        onChanged: (val) => setState(() => searchKeyword = val),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      flex: 2,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.white12),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: statusFilter,
                            dropdownColor: const Color(0xFF1E293B),
                            style: const TextStyle(color: Colors.white, fontSize: 11),
                            isExpanded: true,
                            items: const [
                              DropdownMenuItem(value: 'all', child: Text('Semua Status')),
                              DropdownMenuItem(value: 'menunggu_pembayaran', child: Text('Menunggu Bayar')),
                              DropdownMenuItem(value: 'lunas', child: Text('Lunas')),
                              DropdownMenuItem(value: 'selesai', child: Text('Selesai')),
                              DropdownMenuItem(value: 'dibatalkan', child: Text('Dibatalkan')),
                            ],
                            onChanged: (val) {
                              if (val != null) setState(() => statusFilter = val);
                            },
                          ),
                        ),
                      ),
                    )
                  ],
                ),
                const SizedBox(height: 14),

                // List Pesanan
                if (filteredBookings.isEmpty)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 24),
                    child: Center(
                      child: Text('Tidak ada pesanan yang cocok.', style: TextStyle(color: Colors.white54, fontSize: 12)),
                    ),
                  )
                else
                  ...filteredBookings.map((b) {
                    bool isPending = b.paymentStatus == 'menunggu_pembayaran';
                    bool isLunas = b.paymentStatus == 'lunas';
                    bool isSelesai = b.paymentStatus == 'selesai';
                    bool isBatal = b.paymentStatus == 'dibatalkan';

                    Color statusColor = isLunas
                        ? Colors.greenAccent
                        : (isPending ? Colors.amberAccent : (isSelesai ? Colors.lightBlueAccent : Colors.redAccent));

                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.white12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // ID & Status
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(b.id, style: const TextStyle(color: Colors.indigoAccent, fontWeight: FontWeight.bold, fontSize: 12)),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(                                   color: statusColor.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(color: statusColor),
                                ),
                                child: Text(
                                  b.paymentStatus.toUpperCase(),
                                  style: TextStyle(color: statusColor, fontSize: 9, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),

                          // Customer & Court
                          Text('${b.customerName} (${b.teamName})', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                          Text('${b.courtName} • ${b.slots.join(', ')}', style: const TextStyle(color: Colors.white70, fontSize: 11)),
                          const SizedBox(height: 4),
                          Text(
                            'Total: ${formatCurrency.format(b.grandTotal)} • ${b.paymentMethod}',
                            style: const TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                          const SizedBox(height: 10),
                          const Divider(color: Colors.white12, height: 1),
                          const SizedBox(height: 8),

                          // Action Buttons (Rules: Pending tidak bisa check-in; Lunas bisa check-in; bisa batalkan)
                          Wrap(
                            spacing: 8,
                            runSpacing: 6,
                            children: [
                              // Tombol Set Lunas jika pending
                              if (isPending)
                                ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.greenAccent.shade700,
                                    foregroundColor: Colors.black,
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                    minimumSize: Size.zero,
                                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                  ),
                                  onPressed: () {
                                    p.updateBookingStatus(b.id, 'lunas');
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text('Pesanan ${b.id} dikonfirmasi LUNAS!')),
                                    );
                                  },
                                  icon: const Icon(Icons.check_circle, size: 14),
                                  label: const Text('Set Lunas', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                ),

                              // Tombol Check-In (Sesuai Permintaan: Kalau pending ga bisa check-in; Kalau lunas baru bisa)
                              ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: isLunas ? Colors.blueAccent.shade700 : Colors.grey.shade800,
                                  foregroundColor: isLunas ? Colors.white : Colors.white38,
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  minimumSize: Size.zero,
                                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                ),
                                onPressed: isLunas
                                    ? () {
                                        p.updateBookingStatus(b.id, 'selesai');
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(content: Text('Tamu ${b.customerName} berhasil Check-In!')),
                                        );
                                      }
                                    : () {
                                        // Peringatan jika pending / bukan lunas
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(
                                            content: Text(isPending
                                                ? 'Pembayaran masih PENDING! Harap konfirmasi lunas terlebih dahulu sebelum check-in.'
                                                : (isSelesai ? 'Tamu sudah selesai check-in.' : 'Pesanan sudah dibatalkan.')),
                                          ),
                                        );
                                      },
                                icon: Icon(Icons.login, size: 14, color: isLunas ? Colors.white : Colors.white38),
                                label: Text(
                                  isSelesai ? 'Sudah Check-In' : 'Check-In',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: isLunas ? Colors.white : Colors.white38,
                                  ),
                                ),
                              ),

                              // Tombol Batalkan Booking
                              if (!isBatal && !isSelesai)
                                OutlinedButton.icon(
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: Colors.redAccent,
                                    side: const BorderSide(color: Colors.redAccent),
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                    minimumSize: Size.zero,
                                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                  ),
                                  onPressed: () {
                                    p.cancelBooking(b.id);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text('Pesanan ${b.id} telah dibatalkan.')),
                                    );
                                  },
                                  icon: const Icon(Icons.cancel_outlined, size: 14),
                                  label: const Text('Batalkan', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                ),

                              // Tombol Lihat Tiket
                              OutlinedButton.icon(
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.white70,
                                  side: const BorderSide(color: Colors.white24),
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  minimumSize: Size.zero,
                                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                ),
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (_) => TicketDetailScreen(booking: b)),
                                  );
                                },
                                icon: const Icon(Icons.confirmation_number_outlined, size: 14),
                                label: const Text('Lihat Tiket', style: TextStyle(fontSize: 11)),
                              ),
                            ],
                          )
                        ],
                      ),
                    );
                  }),
              ],
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildKpiCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(14),         border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
              Icon(icon, color: color, size: 18),
            ],
          ),
          const SizedBox(height: 6),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  void _showExportCsvDialog(BuildContext context, BookingProvider p) {
    String csvData = p.exportBookingsToCsv();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Row(
          children: [
            Icon(Icons.download, color: Colors.greenAccent),
            SizedBox(width: 8),
            Text('Export Data ke CSV', style: TextStyle(color: Colors.white, fontSize: 16)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Seluruh data transaksi pemesanan telah dikonversi ke format CSV.',
              style: TextStyle(color: Colors.white70, fontSize: 12),
            ),
            const SizedBox(height: 12),
            Container(
              height: 140,
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(8)),
              child: SingleChildScrollView(
                child: Text(csvData, style: const TextStyle(color: Colors.white60, fontSize: 10, fontFamily: 'monospace')),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Tutup', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.greenAccent.shade700, foregroundColor: Colors.black),
            onPressed: () {
              Clipboard.setData(ClipboardData(text: csvData));
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Data CSV berhasil disalin ke Clipboard! Siap di-paste ke Excel.')),
              );
            },
            icon: const Icon(Icons.copy, size: 16),
            label: const Text('Salin Data CSV', style: TextStyle(fontWeight: FontWeight.bold)),
          )
        ],
      ),
    );
  }

  void _showResetConfirmDialog(BuildContext context, BookingProvider p) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: Colors.amberAccent),
            SizedBox(width: 8),
            Text('Reset Data Demo?', style: TextStyle(color: Colors.white, fontSize: 16)),
          ],
        ),
        content: const Text(
          'Tindakan ini akan mengembalikan data lapangan, booking contoh, dan status maintenance ke konfigurasi awal untuk keperluan presentasi.',
          style: TextStyle(color: Colors.white70, fontSize: 12),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.amberAccent.shade700, foregroundColor: Colors.black),
            onPressed: () {
              p.resetDemoData();
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Data simulasi berhasil di-reset ke kondisi awal!')),
              );
            },
            child: const Text('Ya, Reset Data', style: TextStyle(fontWeight: FontWeight.bold)),
          )
        ],
      ),
    );
  }

  void _handleExitAndGoHome(BuildContext context, BookingProvider p) {
    p.adminLogout();
    DefaultTabController.maybeOf(context)?.animateTo(0);
    if (Navigator.canPop(context)) {
      Navigator.pop(context);
    }
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Sesi admin dikunci. Kembali ke Beranda.'),
        duration: Duration(seconds: 2),
      ),
    );
  }
}
