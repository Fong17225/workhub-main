import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:workhub_mb/services/api_service.dart';
import 'package:workhub_mb/widgets/job_card.dart';

class JobDetailScreen extends StatefulWidget {
  final int jobId;
  const JobDetailScreen({super.key, required this.jobId});

  @override
  State<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends State<JobDetailScreen> {
  Map<String, dynamic>? job;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchJobDetail();
  }

  Future<void> fetchJobDetail() async {
    final api = ApiService();
    final result = await api.getJobById(widget.jobId);
    setState(() {
      job = result;
      isLoading = false;
    });
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return '';
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('dd/MM/yyyy').format(date);
    } catch (_) {
      return dateStr;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Chi tiết công việc')),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : job == null
              ? const Center(child: Text('Không tìm thấy công việc'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: Theme.of(context).primaryColor.withOpacity(0.10),
                              blurRadius: 18,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                CircleAvatar(
                                  radius: 32,
                                  backgroundColor: Theme.of(context).primaryColor.withOpacity(0.12),
                                  child: Icon(Icons.business, color: Theme.of(context).primaryColor, size: 36),
                                ),
                                const SizedBox(width: 18),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        job!['title'] ?? '',
                                        style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        job!['recruiter']?['fullName'] ?? '',
                                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Theme.of(context).primaryColor),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 18),
                            Row(
                              children: [
                                Icon(Icons.location_on, color: Theme.of(context).primaryColor, size: 20),
                                const SizedBox(width: 4),
                                Text(job!['location'] ?? '', style: Theme.of(context).textTheme.bodyMedium),
                                const SizedBox(width: 16),
                                Icon(Icons.work, color: Theme.of(context).primaryColor, size: 20),
                                const SizedBox(width: 4),
                                Text(job!['type']?['name'] ?? '', style: Theme.of(context).textTheme.bodyMedium),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Row(
                              children: [
                                Icon(Icons.attach_money, color: Theme.of(context).primaryColor, size: 20),
                                const SizedBox(width: 4),
                                Text(job!['salaryRange'] ?? '', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
                              ],
                            ),
                            const SizedBox(height: 18),
                            Text(
                              job!['description'] ?? '',
                              style: Theme.of(context).textTheme.bodyLarge,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(18),
                          boxShadow: [
                            BoxShadow(
                              color: Theme.of(context).primaryColor.withOpacity(0.06),
                              blurRadius: 10,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.category, color: Theme.of(context).primaryColor, size: 18),
                                const SizedBox(width: 6),
                                Text('Ngành nghề: ', style: Theme.of(context).textTheme.bodyMedium),
                                Text(job!['category']?['name'] ?? '', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Icon(Icons.badge_outlined, color: Theme.of(context).primaryColor, size: 18),
                                const SizedBox(width: 6),
                                Text('Vị trí: ', style: Theme.of(context).textTheme.bodyMedium),
                                Text(job!['position']?['name'] ?? '', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Icon(Icons.star_outline, color: Theme.of(context).primaryColor, size: 18),
                                const SizedBox(width: 6),
                                Text('Kỹ năng: ', style: Theme.of(context).textTheme.bodyMedium),
                                Expanded(
                                  child: Text(
                                    (job!['skills'] as List?)?.map((e) => e['name']).join(', ') ?? '',
                                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Icon(Icons.calendar_today, color: Theme.of(context).primaryColor, size: 18),
                                const SizedBox(width: 6),
                                Text('Đăng ngày: ', style: Theme.of(context).textTheme.bodyMedium),
                                Text(_formatDate(job!['createdAt']), style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
                              ],
                            ),
                            if (job!['deadline'] != null) ...[
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(Icons.hourglass_bottom, color: Theme.of(context).primaryColor, size: 18),
                                  const SizedBox(width: 6),
                                  Text('Hạn nộp: ', style: Theme.of(context).textTheme.bodyMedium),
                                  Text(_formatDate(job!['deadline']), style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(height: 32),
                      Center(
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Theme.of(context).primaryColor,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            elevation: 4,
                          ),
                          icon: const Icon(Icons.send),
                          label: const Text('Ứng tuyển ngay', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          onPressed: () {
                            // TODO: Thêm logic ứng tuyển
                          },
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }
}
