import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'providers/booking_provider.dart';
import 'screens/home_screen.dart';
import 'screens/booking_screen.dart';
import 'screens/my_bookings_screen.dart';
import 'screens/admin_login_screen.dart';
import 'screens/admin_dashboard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('id_ID', null);
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => BookingProvider()),
      ],
      child: MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ArenaSmart',
      theme: ThemeData(
        primarySwatch: Colors.indigo,
        scaffoldBackgroundColor: Colors.grey[50],
      ),
      home: const MainScreen(),
    );
  }
}

class MainScreen extends StatelessWidget {
  const MainScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 4,
      child: Scaffold(
        body: TabBarView(
          physics: NeverScrollableScrollPhysics(),
          children: [
            HomeScreen(),
            BookingScreen(),
            MyBookingsScreen(),
            Consumer<BookingProvider>(
              builder: (ctx, p, child) => p.isAdmin ? AdminDashboardScreen() : AdminLoginScreen(),
            ),
          ],
        ),
        bottomNavigationBar: Container(
          color: Colors.white,
          child: TabBar(
            labelColor: Colors.indigo,
            unselectedLabelColor: Colors.grey,
            indicatorColor: Colors.indigo,
            tabs: [
              Tab(icon: Icon(Icons.home), text: 'Beranda'),
              Tab(icon: Icon(Icons.schedule), text: 'Pesan'),
              Tab(icon: Icon(Icons.receipt), text: 'Pesanan'),
              Tab(icon: Icon(Icons.admin_panel_settings), text: 'Admin'),
            ],
          ),
        ),
      ),
    );
  }
}
