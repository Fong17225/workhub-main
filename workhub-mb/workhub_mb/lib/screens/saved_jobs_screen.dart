import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:workhub_mb/widgets/job_card.dart';
import 'package:workhub_mb/widgets/bottom_nav_bar.dart';
import 'package:workhub_mb/providers/language_provider.dart';
import 'package:workhub_mb/utils/language_constants.dart';

class SavedJobsScreen extends StatelessWidget {
  const SavedJobsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final languageProvider = Provider.of<LanguageProvider>(context);
    final currentLanguage = languageProvider.currentLanguage;

    return Scaffold(
      appBar: AppBar(
        title: Text(LanguageConstants.getText('saved_jobs', currentLanguage)),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 5,
        itemBuilder: (context, index) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 16.0),
            child: JobCard(
              title: 'Job Title $index',
              company: 'Company Name $index',
              location: 'Location $index',
              type: 'Full-time',
              salary: '\$${(index + 1) * 1000}/month',
              description: 'This is a description for job $index.',
            ),
          );
        },
      ),
      bottomNavigationBar: const BottomNavBar(currentIndex: 2),
    );
  }
} 