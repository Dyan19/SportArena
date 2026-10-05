import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/booking_provider.dart';

class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var provider = Provider.of<BookingProvider>(context);
    var filteredCourts = provider.courts.where((c) => c.sport == provider.selectedSport).toList();
    var formatCurrency = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200,
            actions: [
              IconButton(
                tooltip: 'Portal Petugas / Admin',
                icon: const Icon(Icons.lock_outline, color: Colors.white),
                onPressed: () {
                  DefaultTabController.maybeOf(context)?.animateTo(3);
                },
              )
            ],
            flexibleSpace: FlexibleSpaceBar(
              title: Text('ArenaSmart', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: [Colors.indigo, Colors.blue], begin: Alignment.topLeft, end: Alignment.bottomRight),
                ),
                child: Center(child: Text('Temukan & Pesan Lapangan Favoritmu!', style: TextStyle(color: Colors.white70, fontSize: 16))),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: ['Futsal', 'Badminton', 'Tennis'].map((sport) {
                    bool isSelected = provider.selectedSport == sport;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: ChoiceChip(
                        label: Text(sport),
                        selected: isSelected,
                        onSelected: (val) {
                          if (val) provider.selectSport(sport);
                        },
                        selectedColor: Colors.indigo.withValues(alpha: 0.2),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
          ),
          SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                var court = filteredCourts[index];
                return Card(
                  margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  clipBehavior: Clip.antiAlias,
                  child: InkWell(
                    onTap: () {
                      provider.selectCourt(court);
                      DefaultTabController.of(context).animateTo(1);
                    },
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Image.network(court.imageUrl, height: 150, width: double.infinity, fit: BoxFit.cover, errorBuilder: (c, e, s) => Container(height: 150, color: Colors.grey[300])),
                        Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(court.name, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                              SizedBox(height: 4),
                              Row(
                                children: [
                                  Icon(Icons.star, color: Colors.amber, size: 16),
                                  Text(' ${court.rating} (${court.totalReviews} ulasan)'),
                                ],
                              ),
                              SizedBox(height: 8),
                              Text('${formatCurrency.format(court.hourlyRate)} / jam', style: TextStyle(color: Colors.indigo, fontWeight: FontWeight.bold)),
                              SizedBox(height: 8),
                              Text('Fasilitas: ${court.facilities.join(", ")}', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                );
              },
              childCount: filteredCourts.length,
            ),
          )
        ],
      ),
    );
  }
}
