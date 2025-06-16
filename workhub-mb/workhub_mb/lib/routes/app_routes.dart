import 'package:flutter/material.dart';
import 'package:workhub_mb/screens/home_screen.dart';
import 'package:workhub_mb/screens/search_screen.dart';
import 'package:workhub_mb/screens/saved_jobs_screen.dart';
import 'package:workhub_mb/screens/profile_screen.dart';
import 'package:workhub_mb/screens/settings_screen.dart';
import 'package:workhub_mb/screens/job_detail_screen.dart';
import 'package:workhub_mb/screens/login_screen.dart';

class AppRoutes {
  static const String home = '/';
  static const String search = '/search';
  static const String savedJobs = '/saved-jobs';
  static const String profile = '/profile';
  static const String settings = '/settings';
  static const String jobDetail = '/job-detail';
  static const String login = '/login';

  static Map<String, WidgetBuilder> get routes => {
    home: (context) => const HomeScreen(),
    search: (context) => const SearchScreen(),
    savedJobs: (context) => const SavedJobsScreen(),
    profile: (context) => const ProfileScreen(),
    settings: (context) => const SettingsScreen(),
    jobDetail: (context) {
      final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
      return JobDetailScreen(jobId: args['jobId']);
    },
    login: (context) => const LoginScreen(),
  };
}