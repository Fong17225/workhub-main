import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:workhub_mb/providers/language_provider.dart';
import 'package:workhub_mb/routes/app_routes.dart';
import 'package:workhub_mb/theme/app_theme.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (context) => LanguageProvider(),
      child: MaterialApp(
        title: 'WorkHub',
        theme: AppTheme.lightTheme,
        initialRoute: '/',
        routes: AppRoutes.routes,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
