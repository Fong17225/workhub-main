import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:workhub_mb/providers/language_provider.dart';
import 'package:workhub_mb/utils/language_constants.dart';
import 'package:workhub_mb/widgets/bottom_nav_bar.dart';
import 'package:workhub_mb/theme/app_theme.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<LanguageProvider>(
      builder: (context, languageProvider, child) {
        final currentLanguage = languageProvider.currentLanguage;

        return Scaffold(
          appBar: AppBar(
            title: Text(LanguageConstants.getText('settings', currentLanguage)),
          ),
          body: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildSection(
                context,
                LanguageConstants.getText('language', currentLanguage),
                [
                  _buildLanguageOption(
                    context,
                    'English',
                    'en',
                    currentLanguage,
                    languageProvider,
                  ),
                  _buildLanguageOption(
                    context,
                    'Tiếng Việt',
                    'vi',
                    currentLanguage,
                    languageProvider,
                  ),
                ],
              ),
              const SizedBox(height: 24),
              _buildSection(
                context,
                LanguageConstants.getText('notifications', currentLanguage),
                [
                  _buildSwitchTile(
                    context,
                    LanguageConstants.getText('job_alerts', currentLanguage),
                    true,
                    (value) {},
                  ),
                ],
              ),
              const SizedBox(height: 24),
              _buildSection(
                context,
                LanguageConstants.getText('profile_visibility', currentLanguage),
                [
                  _buildSwitchTile(
                    context,
                    LanguageConstants.getText('public', currentLanguage),
                    true,
                    (value) {},
                  ),
                ],
              ),
            ],
          ),
          bottomNavigationBar: const BottomNavBar(currentIndex: 4),
        );
      },
    );
  }

  Widget _buildSection(BuildContext context, String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 12),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.1),
                spreadRadius: 1,
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: children,
          ),
        ),
      ],
    );
  }

  Widget _buildLanguageOption(
    BuildContext context,
    String label,
    String languageCode,
    String currentLanguage,
    LanguageProvider languageProvider,
  ) {
    final isSelected = currentLanguage == languageCode;

    return ListTile(
      title: Text(label),
      trailing: isSelected
          ? Icon(Icons.check, color: AppTheme.primaryColor)
          : null,
      onTap: () async {
        await languageProvider.setLanguage(languageCode);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                languageCode == 'en'
                    ? 'Language changed to English'
                    : 'Đã chuyển sang tiếng Việt',
              ),
              duration: const Duration(seconds: 2),
              backgroundColor: AppTheme.primaryColor,
            ),
          );
        }
      },
    );
  }

  Widget _buildSwitchTile(
    BuildContext context,
    String title,
    bool value,
    ValueChanged<bool> onChanged,
  ) {
    return SwitchListTile(
      title: Text(title),
      value: value,
      onChanged: onChanged,
      activeColor: AppTheme.primaryColor,
    );
  }
} 