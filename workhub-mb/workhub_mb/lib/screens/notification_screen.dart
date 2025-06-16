import 'package:flutter/material.dart';

class NotificationScreen extends StatelessWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Thông báo'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildNotificationItem(
            context,
            icon: Icons.campaign,
            title: 'Chào mừng bạn đến với WorkHub!',
            subtitle: 'Cảm ơn bạn đã sử dụng ứng dụng của chúng tôi.',
            time: '1 phút trước',
          ),
          _buildNotificationItem(
            context,
            icon: Icons.check_circle_outline,
            title: 'Ứng tuyển thành công',
            subtitle: 'Bạn đã ứng tuyển vào vị trí Lập trình viên Flutter.',
            time: '2 giờ trước',
          ),
          // Thêm các thông báo mẫu khác tại đây
        ],
      ),
    );
  }

  Widget _buildNotificationItem(BuildContext context, {required IconData icon, required String title, required String subtitle, required String time}) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 2,
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Theme.of(context).primaryColor.withOpacity(0.12),
          child: Icon(icon, color: Theme.of(context).primaryColor),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(subtitle),
        trailing: Text(time, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ),
    );
  }
}
