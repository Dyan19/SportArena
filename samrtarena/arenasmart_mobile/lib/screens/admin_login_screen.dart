import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/booking_provider.dart';

class AdminLoginScreen extends StatefulWidget {
  const AdminLoginScreen({super.key});

  @override
  State<AdminLoginScreen> createState() => _AdminLoginScreenState();
}

class _AdminLoginScreenState extends State<AdminLoginScreen> {
  final TextEditingController pinController = TextEditingController();
  String errorMsg = '';
  bool isLoading = false;

  void _login() {
    setState(() => errorMsg = '');
    final pin = pinController.text.trim();
    if (pin.isEmpty) {
      setState(() => errorMsg = 'Masukkan PIN atau Sandi Pengelola');
      return;
    }

    setState(() => isLoading = true);
    Future.delayed(const Duration(milliseconds: 300), () {
      if (!mounted) return;
      var p = Provider.of<BookingProvider>(context, listen: false);
      if (p.adminLogin(pin)) {
        pinController.clear();
        setState(() {
          errorMsg = '';
          isLoading = false;
        });
        if (Navigator.canPop(context)) {
          Navigator.pop(context);
        }
      } else {
        setState(() {
          isLoading = false;
          errorMsg = 'PIN atau kata sandi tidak valid. Coba PIN: 1234';
        });
      }
    });
  }

  void _backToHome() {
    DefaultTabController.maybeOf(context)?.animateTo(0);
    if (Navigator.canPop(context)) {
      Navigator.pop(context);
    }
  }

  @override
  void dispose() {
    pinController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Portal Petugas / Admin', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white70),
          onPressed: _backToHome,
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 400),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white12),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: Colors.indigo.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.indigo.withValues(alpha: 0.4)),
                  ),
                  child: const Icon(Icons.lock_person_outlined, size: 32, color: Colors.indigoAccent),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Akses Khusus Pengelola',
                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Otentikasi Pengelola Fasilitas ArenaSmart',
                  style: TextStyle(color: Colors.white54, fontSize: 12),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: const Text(
                    'Halaman ini khusus untuk staf pengelola (manajemen jadwal lapangan, pemeliharaan maintenance, rekap pendapatan kasir, dan ekspor data). Pengunjung umum bebas memesan tanpa login.',
                    style: TextStyle(color: Colors.white70, fontSize: 11, height: 1.4),
                  ),
                ),
                const SizedBox(height: 20),

                // Input PIN
                TextField(
                  controller: pinController,
                  obscureText: true,
                  style: const TextStyle(color: Colors.white, fontSize: 16, letterSpacing: 2),
                  decoration: InputDecoration(
                    labelText: 'PIN / Sandi Pengelola',
                    labelStyle: const TextStyle(color: Colors.white70, fontSize: 13),
                    prefixIcon: const Icon(Icons.key, color: Colors.indigoAccent),
                    hintText: 'Ketik PIN (contoh: 1234)',
                    hintStyle: const TextStyle(color: Colors.white24, fontSize: 13, letterSpacing: 0),
                    filled: true,
                    fillColor: const Color(0xFF0F172A),
                    errorText: errorMsg.isNotEmpty ? errorMsg : null,
                    errorStyle: const TextStyle(color: Colors.redAccent, fontSize: 11),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.white12)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.white12)),
                  ),
                  onSubmitted: (_) => _login(),
                ),
                const SizedBox(height: 10),

                // Quick Fill
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Uji Cepat Presentasi:', style: TextStyle(color: Colors.white38, fontSize: 11)),
                    TextButton(
                      onPressed: () {
                        pinController.text = '1234';
                        setState(() => errorMsg = '');
                      },
                      child: const Text('Gunakan PIN (1234)', style: TextStyle(color: Colors.indigoAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                    )
                  ],
                ),
                const SizedBox(height: 16),

                // Tombol Buka Dashboard
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.indigoAccent,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: isLoading ? null : _login,
                    child: isLoading
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text('Buka Dashboard', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                              SizedBox(width: 8),
                              Icon(Icons.arrow_forward, size: 18, color: Colors.white),
                            ],
                          ),
                  ),
                ),
                const SizedBox(height: 8),

                // Tombol Kembali ke Beranda
                TextButton.icon(
                  onPressed: _backToHome,
                  icon: const Icon(Icons.home_outlined, size: 16, color: Colors.white60),
                  label: const Text('Kembali ke Halaman Beranda', style: TextStyle(color: Colors.white60, fontSize: 12)),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}
