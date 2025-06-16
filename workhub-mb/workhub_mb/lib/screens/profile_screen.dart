import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:workhub_mb/widgets/bottom_nav_bar.dart';
import 'package:workhub_mb/providers/language_provider.dart';
import 'package:workhub_mb/utils/language_constants.dart';
import 'package:workhub_mb/utils/auth_utils.dart';
import 'package:workhub_mb/services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? user;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchUserProfile();
  }

  Future<void> fetchUserProfile() async {
    final api = ApiService();
    final result = await api.getUserProfile();
    setState(() {
      user = result;
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final languageProvider = Provider.of<LanguageProvider>(context);
    final currentLanguage = languageProvider.currentLanguage;

    return Scaffold(
      appBar: AppBar(
        title: Text(LanguageConstants.getText('profile', currentLanguage)),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : user == null
              ? const Center(child: Text('Không tìm thấy thông tin user'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Column(
                          children: [
                            CircleAvatar(
                              radius: 50,
                              backgroundImage: user!['avatar'] != null && user!['avatar'].toString().isNotEmpty
                                  ? NetworkImage(user!['avatar'])
                                  : const NetworkImage('https://via.placeholder.com/100'),
                            ),
                            const SizedBox(height: 16),
                            Text(user!['fullname'] ?? '', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                            Text(user!['email'] ?? '', style: const TextStyle(fontSize: 16)),
                            if (user!['phone'] != null) Text('SĐT: ${user!['phone']}'),
                            if (user!['role'] != null) Text('Vai trò: ${user!['role']}'),
                            if (user!['status'] != null) Text('Trạng thái: ${user!['status']}'),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: () async {
                                await AuthUtils.clearToken();
                                Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
                              },
                              child: const Text('Đăng xuất'),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 32),
                      _buildSectionTitle(
                        context,
                        LanguageConstants.getText('personal_info', currentLanguage),
                      ),
                      _buildInfoCard(context, [
                        _buildInfoRow(
                          context,
                          Icons.email_outlined,
                          LanguageConstants.getText('email', currentLanguage),
                          user!['email'] ?? '',
                        ),
                        _buildInfoRow(
                          context,
                          Icons.phone_outlined,
                          LanguageConstants.getText('phone', currentLanguage),
                          user!['phone'] ?? '',
                        ),
                      ]),
                      const SizedBox(height: 24),
                      _buildSectionTitle(
                        context,
                        LanguageConstants.getText('professional_info', currentLanguage),
                      ),
                      _buildInfoCard(context, [
                        _buildInfoRow(
                          context,
                          Icons.work_outline,
                          LanguageConstants.getText('experience', currentLanguage),
                          '5 years',
                        ),
                        _buildInfoRow(
                          context,
                          Icons.school_outlined,
                          LanguageConstants.getText('education', currentLanguage),
                          'Bachelor of Computer Science',
                        ),
                        _buildInfoRow(
                          context,
                          Icons.language_outlined,
                          LanguageConstants.getText('languages', currentLanguage),
                          'English, Vietnamese',
                        ),
                      ]),
                      const SizedBox(height: 24),
                      _buildSectionTitle(
                        context,
                        LanguageConstants.getText('preferences', currentLanguage),
                      ),
                      _buildInfoCard(context, [
                        _buildInfoRow(
                          context,
                          Icons.notifications_outlined,
                          LanguageConstants.getText('job_alerts', currentLanguage),
                          LanguageConstants.getText('enabled', currentLanguage),
                        ),
                        _buildInfoRow(
                          context,
                          Icons.visibility_outlined,
                          LanguageConstants.getText('profile_visibility', currentLanguage),
                          LanguageConstants.getText('public', currentLanguage),
                        ),
                      ]),
                      const SizedBox(height: 32),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {},
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: Text(LanguageConstants.getText('edit_profile', currentLanguage)),
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildInfoCard(BuildContext context, List<Widget> children) {
    return Container(
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
    );
  }

  Widget _buildInfoRow(
    BuildContext context,
    IconData icon,
    String label,
    String value,
  ) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Icon(icon, color: Colors.grey[600]),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}