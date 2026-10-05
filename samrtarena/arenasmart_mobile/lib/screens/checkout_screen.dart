import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/booking_provider.dart';
import '../models/booking.dart';
import 'ticket_detail_screen.dart';

class CheckoutScreen extends StatefulWidget {
  final Booking? pendingBooking; // If passing an existing pending booking to continue paying

  const CheckoutScreen({super.key, this.pendingBooking});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  String name = 'Ibnu Hazib';
  String phone = '081234567890';
  String email = 'ibnu.fadillah@kampus.ac.id';
  String team = 'Tim Juara Teknik';
  String notes = '';
  final TextEditingController voucherController = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.pendingBooking != null) {
      // If continuing pending booking, immediately show payment dialog
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _showPaymentInstructionsModal(context, widget.pendingBooking!);
      });
    }
  }

  @override
  void dispose() {
    voucherController.dispose();
    super.dispose();
  }

  void _showPaymentInstructionsModal(BuildContext context, Booking booking) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      isDismissible: false,
      builder: (ctx) => _PaymentInstructionsSheet(
        booking: booking,
        onPaidSuccess: () {
          Navigator.pop(ctx); // close bottom sheet
          if (mounted) {
            Navigator.pop(context); // close checkout screen
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => TicketDetailScreen(booking: booking)),
            );
          }
        },
        onPayLater: () {
          Navigator.pop(ctx); // close bottom sheet
          if (mounted) {
            Navigator.pop(context); // close checkout screen
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Pesanan disimpan dengan status Menunggu Pembayaran. Anda dapat melanjutkan pembayaran di tab Pesanan.'),
                duration: Duration(seconds: 4),
              ),
            );
            DefaultTabController.of(context).animateTo(2); // Jump to "Pesanan" tab!
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    var provider = Provider.of<BookingProvider>(context);
    var formatCurrency = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

    return Scaffold(
      appBar: AppBar(title: const Text('Checkout & Data Pemesan')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text('Informasi Pemesan & Tim', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            TextFormField(
              initialValue: name,
              decoration: const InputDecoration(labelText: 'Nama Lengkap Pemesan *', border: OutlineInputBorder()),
              validator: (v) => v!.isEmpty ? 'Wajib diisi' : null,
              onSaved: (v) => name = v!,
            ),
            const SizedBox(height: 12),
            TextFormField(
              initialValue: phone,
              decoration: const InputDecoration(labelText: 'Nomor WhatsApp *', border: OutlineInputBorder()),
              keyboardType: TextInputType.phone,
              validator: (v) => (v == null || v.length < 8) ? 'Nomor WhatsApp valid diperlukan' : null,
              onSaved: (v) => phone = v!,
            ),
            const SizedBox(height: 12),
            TextFormField(
              initialValue: email,
              decoration: const InputDecoration(labelText: 'Email Notifikasi E-Tiket *', border: OutlineInputBorder()),
              keyboardType: TextInputType.emailAddress,
              validator: (v) => (v == null || !v.contains('@')) ? 'Email valid diperlukan' : null,
              onSaved: (v) => email = v ?? '',
            ),
            const SizedBox(height: 12),
            TextFormField(
              initialValue: team,
              decoration: const InputDecoration(labelText: 'Nama Klub / Komunitas (Opsional)', border: OutlineInputBorder()),
              onSaved: (v) => team = v ?? '',
            ),
            const SizedBox(height: 12),
            TextFormField(
              initialValue: notes,
              decoration: const InputDecoration(labelText: 'Catatan untuk Pengelola (Opsional)', border: OutlineInputBorder()),
              onSaved: (v) => notes = v ?? '',
            ),
            const SizedBox(height: 20),

            // Kode Voucher
            const Text('Kode Voucher Promo', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: voucherController,
                    textCapitalization: TextCapitalization.characters,
                    decoration: const InputDecoration(
                      hintText: 'Contoh: MAHASISWAJUARA',
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.indigo,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  ),
                  onPressed: () {
                    String msg = provider.applyVoucher(voucherController.text);
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
                  },
                  child: const Text('Terapkan', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                )
              ],
            ),
            const SizedBox(height: 20),

            // Ringkasan Pembayaran
            const Text('Rincian Pembayaran', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 6),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Sewa Lapangan:'),
                        Text(formatCurrency.format(provider.courtSubtotal), style: const TextStyle(fontWeight: FontWeight.w600)),
                      ],
                    ),
                    if (provider.addonsSubtotal > 0) ...[
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Sewa Peralatan (Add-ons):'),
                          Text(formatCurrency.format(provider.addonsSubtotal), style: const TextStyle(fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ],
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Biaya Layanan Sistem:'),
                        Text(formatCurrency.format(provider.serviceFee), style: const TextStyle(fontWeight: FontWeight.w600)),
                      ],
                    ),
                    if (provider.discount > 0) ...[
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Diskon Voucher:'),
                          Text('-${formatCurrency.format(provider.discount)}', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ],
                    const Divider(height: 18),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total Tagihan:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        Text(
                          formatCurrency.format(provider.grandTotal),
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.indigo),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.indigo,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () {
                if (_formKey.currentState!.validate()) {
                  _formKey.currentState!.save();

                  // Create initial booking with status 'menunggu_pembayaran'
                  var booking = provider.createBooking(
                    name: name,
                    phone: phone,
                    email: email,
                    team: team,
                    paymentMethod: 'QRIS',
                    notes: notes,
                    isPending: true,
                  );

                  _showPaymentInstructionsModal(context, booking);
                }
              },
              child: const Text('Pilih Metode Pembayaran', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}

// Modal Instruksi Pembayaran (QRIS, VA, E-Wallet) dengan Timer 15 Menit & Bayar Nanti
class _PaymentInstructionsSheet extends StatefulWidget {
  final Booking booking;
  final VoidCallback onPaidSuccess;
  final VoidCallback onPayLater;

  const _PaymentInstructionsSheet({
    required this.booking,
    required this.onPaidSuccess,
    required this.onPayLater,
  });

  @override
  State<_PaymentInstructionsSheet> createState() => _PaymentInstructionsSheetState();
}

class _PaymentInstructionsSheetState extends State<_PaymentInstructionsSheet> {
  String selectedChannel = 'qris';
  Timer? _localTimer;
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _localTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {});
        if (widget.booking.isExpired) {
          timer.cancel();
          _showExpiredAlert();
        }
      }
    });
  }

  @override
  void dispose() {
    _localTimer?.cancel();
    super.dispose();
  }

  void _showExpiredAlert() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.timer_off, color: Colors.red),
            SizedBox(width: 8),
            Text('Waktu Habis'),
          ],
        ),
        content: const Text('Batas waktu pembayaran 15 menit telah berakhir. Pemesanan ini telah otomatis dibatalkan.'),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              widget.onPayLater();
            },
            child: const Text('Mengerti'),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    var formatCurrency = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);
    final booking = widget.booking;
    final remainingStr = booking.remainingTimeString;
    final totalSeconds = 900;
    final currentSeconds = booking.remainingTime.inSeconds;
    final progress = (currentSeconds / totalSeconds).clamp(0.0, 1.0);

    return Container(
      height: MediaQuery.of(context).size.height * 0.88,
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.shield_outlined, color: Colors.greenAccent, size: 20),
                    SizedBox(width: 8),
                    Text('Instruksi Pembayaran', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white70),
                  onPressed: widget.onPayLater,
                )
              ],
            ),
          ),
          const Divider(color: Colors.white12, height: 1),

          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Timer Banner (Selesaikan Pembayaran Dalam: 14:55)
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white12),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.access_time, color: Colors.greenAccent, size: 18),
                              SizedBox(width: 6),
                              Text('SELESAIKAN PEMBAYARAN DALAM', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          Text(
                            remainingStr,
                            style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      LinearProgressIndicator(
                        value: progress,
                        backgroundColor: Colors.white12,
                        valueColor: const AlwaysStoppedAnimation<Color>(Colors.greenAccent),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Slot jam lapangan terkunci otomatis selama waktu di atas.',
                        style: TextStyle(color: Colors.white54, fontSize: 11),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Channel Selector
                const Text('PILIH KANAL PEMBAYARAN:', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _buildChannelButton('qris', 'QRIS', 'Semua E-Wallet & Bank', Icons.qr_code),
                    const SizedBox(width: 8),
                    _buildChannelButton('va', 'Virtual Account', 'BCA, Mandiri, BRI', Icons.account_balance),
                    const SizedBox(width: 8),
                    _buildChannelButton('ewallet', 'E-Wallet Direct', 'GoPay, ShopeePay', Icons.smartphone),
                  ],
                ),
                const SizedBox(height: 16),

                // Detail Kanal
                if (selectedChannel == 'qris') ...[
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(color: Colors.red.shade700, borderRadius: BorderRadius.circular(4)),
                          child: const Text('QRIS Standar Pembayaran Nasional (GPN)', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                        const SizedBox(height: 12),
                        const Icon(Icons.qr_code_2, size: 160, color: Colors.black87),
                        const SizedBox(height: 8),
                        const Text(
                          'Buka BCA Mobile, Livin, GoPay, OVO, atau DANA lalu scan QR di atas.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.black87, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                ] else if (selectedChannel == 'va') ...[
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Nomor Virtual Account BCA:', style: TextStyle(color: Colors.white70, fontSize: 12)),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('8077708123456789', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 1)),
                            IconButton(
                              icon: const Icon(Icons.copy, color: Colors.greenAccent),
                              onPressed: () {
                                Clipboard.setData(const ClipboardData(text: '8077708123456789'));
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Nomor VA disalin!')));
                              },
                            )
                          ],
                        ),
                        const Text('Buka m-BCA > Transfer > Virtual Account, masukkan nomor di atas.', style: TextStyle(color: Colors.white54, fontSize: 11)),
                      ],
                    ),
                  ),
                ] else ...[
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Nomor Terdaftar Akun GoPay / DANA:', style: TextStyle(color: Colors.white70, fontSize: 12)),
                        const SizedBox(height: 4),
                        Text(booking.customerPhone, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        const Text('Permintaan pembayaran instan akan dikirimkan ke aplikasi E-Wallet Anda.', style: TextStyle(color: Colors.white54, fontSize: 11)),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 16),

                // Total
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total yang harus dibayar:', style: TextStyle(color: Colors.white70, fontSize: 13)),
                    Text(
                      formatCurrency.format(booking.grandTotal),
                      style: const TextStyle(color: Colors.greenAccent, fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Tombol Simulasi Berhasil
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.greenAccent.shade700,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: _isProcessing
                      ? null
                      : () {
                          setState(() => _isProcessing = true);
                          Future.delayed(const Duration(milliseconds: 800), () {
                            Provider.of<BookingProvider>(context, listen: false).updateBookingStatus(booking.id, 'lunas');
                            widget.onPaidSuccess();
                          });
                        },
                  icon: _isProcessing
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Icon(Icons.check_circle_outline),
                  label: Text(
                    _isProcessing ? 'Memverifikasi...' : 'Simulasikan Pembayaran Berhasil (Demo Dosen)',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: 10),

                // Tombol Bayar Nanti
                TextButton(
                  onPressed: widget.onPayLater,
                  child: const Text('Bayar Nanti (Simpan di Pesanan Saya)', style: TextStyle(color: Colors.white60)),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildChannelButton(String key, String title, String subtitle, IconData icon) {
    bool isSelected = selectedChannel == key;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => selectedChannel = key),
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
          decoration: BoxDecoration(
            color: isSelected ? Colors.greenAccent.withValues(alpha: 0.15) : const Color(0xFF1E293B),
            border: Border.all(color: isSelected ? Colors.greenAccent : Colors.white12),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Column(
            children: [
              Icon(icon, color: isSelected ? Colors.greenAccent : Colors.white70, size: 22),
              const SizedBox(height: 4),
              Text(title, style: TextStyle(color: isSelected ? Colors.greenAccent : Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
              const SizedBox(height: 2),
              Text(subtitle, textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white54, fontSize: 9)),
            ],
          ),
        ),
      ),
    );
  }
}
