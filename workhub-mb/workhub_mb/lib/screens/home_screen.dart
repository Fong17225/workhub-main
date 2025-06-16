import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:workhub_mb/widgets/job_card.dart';
import 'package:workhub_mb/widgets/bottom_nav_bar.dart';
import 'package:workhub_mb/providers/language_provider.dart';
import 'package:workhub_mb/utils/language_constants.dart';
import 'package:workhub_mb/theme/app_theme.dart';
import 'package:workhub_mb/services/api_service.dart';
import 'package:workhub_mb/utils/auth_utils.dart';
import 'package:workhub_mb/screens/notification_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<dynamic> jobs = [];
  bool isLoading = true;
  bool isLoggedIn = false;

  @override
  void initState() {
    super.initState();
    fetchJobs();
    checkLogin();
  }

  Future<void> fetchJobs() async {
    final api = ApiService();
    final result = await api.getJobs();
    setState(() {
      jobs = result ?? [];
      isLoading = false;
    });
  }

  Future<void> checkLogin() async {
    final loggedIn = await AuthUtils.isLoggedIn();
    setState(() {
      isLoggedIn = loggedIn;
    });
  }

  @override
  Widget build(BuildContext context) {
    final languageProvider = Provider.of<LanguageProvider>(context);
    final currentLanguage = languageProvider.currentLanguage;

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: Text(LanguageConstants.getText('home', currentLanguage)),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) => const NotificationScreen()),
              );
            },
          ),
          isLoggedIn
              ? IconButton(
                  icon: const Icon(Icons.person_outline),
                  onPressed: () {
                    Navigator.pushNamed(context, '/profile');
                  },
                )
              : IconButton(
                  icon: const Icon(Icons.login),
                  onPressed: () {
                    Navigator.pushNamed(context, '/login');
                  },
                ),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 8),
                    Text(
                      LanguageConstants.getText('featured_jobs', currentLanguage),
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 16),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: jobs.length,
                      itemBuilder: (context, index) {
                        final job = jobs[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16.0),
                          child: JobCard(
                            title: job['title'] ?? '',
                            company: job['recruiter']?['fullName'] ?? '',
                            location: job['location'] ?? '',
                            type: job['type']?['name'] ?? '',
                            salary: job['salaryRange'] ?? '',
                            description: job['description'] ?? '',
                            jobId: job['id'],
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
      bottomNavigationBar: BottomNavBar(currentIndex: 0, isLoggedIn: isLoggedIn),
    );
  }
}