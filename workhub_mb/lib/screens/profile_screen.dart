import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? user;
  bool loading = true;
  String error = '';

  @override
  void initState() {
    super.initState();
    fetchProfile();
  }

  Future<void> fetchProfile() async {
    setState(() { loading = true; error = ''; });
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      // Giả sử có ApiService.getProfile(token)
      final data = await ApiService.getProfile(token: token);
      setState(() {
        user = data;
        loading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Hồ sơ cá nhân')),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : error.isNotEmpty
              ? Center(child: Text(error, style: const TextStyle(color: Colors.red)))
              : user == null
                  ? const Center(child: Text('Không tìm thấy thông tin người dùng'))
                  : Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          CircleAvatar(
                            radius: 48,
                            backgroundImage: user!['avatarUrl'] != null
                                ? NetworkImage(user!['avatarUrl'])
                                : null,
                            child: user!['avatarUrl'] == null ? const Icon(Icons.person, size: 48) : null,
                          ),
                          const SizedBox(height: 16),
                          Text(user!['fullname'] ?? '', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          Text(user!['email'] ?? '', style: const TextStyle(fontSize: 16)),
                          if (user!['phone'] != null) ...[
                            const SizedBox(height: 8),
                            Text(user!['phone'], style: const TextStyle(fontSize: 16)),
                          ],
                          // Thêm các thông tin khác nếu có
                        ],
                      ),
                    ),
    );
  }
}
