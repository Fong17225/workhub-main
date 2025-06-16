import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:workhub_mb/providers/language_provider.dart';
import 'package:workhub_mb/routes/app_routes.dart';
import 'package:workhub_mb/theme/app_theme.dart';

class AppWrapper extends StatelessWidget {
  const AppWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<LanguageProvider>(
      builder: (context, languageProvider, child) {
        return MaterialApp(
          title: 'WorkHub',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.theme,
          initialRoute: AppRoutes.home,
          routes: AppRoutes.routes,
        );
      },
    );
  }
} 