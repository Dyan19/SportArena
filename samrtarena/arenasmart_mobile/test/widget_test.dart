// Smoke test for the ArenaSmart mobile app.
//
// MyApp reads BookingProvider via Consumer<> (it is normally supplied in
// main()), so the test has to provide it here as well.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:provider/provider.dart';

import 'package:arenasmart_mobile/main.dart';
import 'package:arenasmart_mobile/providers/booking_provider.dart';

void main() {
  testWidgets('App renders smoke test', (WidgetTester tester) async {
    await initializeDateFormatting('id_ID');

    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => BookingProvider(),
        child: const MyApp(),
      ),
    );

    // BookingProvider keeps a 1-second periodic timer alive, so use bounded
    // pumps instead of pumpAndSettle (which would never settle).
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 400));

    // Verify that ArenaSmart title exists.
    expect(find.text('ArenaSmart'), findsWidgets);

    // Tear down the provider so its periodic timer is cancelled before the
    // test ends.
    await tester.pumpWidget(const SizedBox());
  });
}
