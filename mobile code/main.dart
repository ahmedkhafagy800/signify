import 'package:flutter/material.dart';
import 'camera_screen.dart';
import 'main_page.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "Signfy",
      home: main_page(), // Directly open camera
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Color(0xFF415f91)),
        // scaffoldBackgroundColor: Color(0xFF8991A2),
        useMaterial3: true,
        // appBarTheme: AppBarTheme(
        //   color: Color(0xFF415f91)
        // )
      ),
      locale: const Locale('ar'),
      supportedLocales: const[Locale('ar')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
    );
  }
}