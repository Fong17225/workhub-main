import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class JobDetailScreen extends StatefulWidget {
  final String jobId;
  const JobDetailScreen({Key? key, required this.jobId}) : super(key: key);

  @override
  State<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends State<JobDetailScreen> {
  Map<String, dynamic>? job;
  bool loading = true;
  String error = '';
  bool applying = false;
  String applyResult = '';

  List<dynamic>? resumes;
  String selectedResumeId = '';
  bool loadingResumes = true;

  @override
  void initState() {
    super.initState();
    fetchJobDetail();
    fetchResumes();
  }

  Future<void> fetchJobDetail() async {
    setState(() { loading = true; error = ''; });
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final data = await ApiService.getJobById(widget.jobId, token: token);
      print('DEBUG job data: ' + data.toString()); // Thêm debug để xem dữ liệu thực tế
      setState(() {
        job = data;
        loading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        loading = false;
      });
    }
  }

  Future<void> fetchResumes() async {
    setState(() { loadingResumes = true; });
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final data = await ApiService.getUserResumes(token: token);
      setState(() {
        resumes = data;
        loadingResumes = false;
        if (resumes != null && resumes!.isNotEmpty) {
          selectedResumeId = resumes!.first['id'].toString();
        }
      });
    } catch (e) {
      setState(() { resumes = []; loadingResumes = false; });
    }
  }

  Future<void> applyJob() async {
    if (selectedResumeId.isEmpty) {
      setState(() { applyResult = 'Vui lòng chọn CV để nộp đơn!'; });
      return;
    }
    setState(() { applying = true; applyResult = ''; });
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final result = await ApiService.applyJob(widget.jobId, selectedResumeId, token: token);
      setState(() {
        applyResult = result ?? 'Nộp đơn thành công!';
        applying = false;
      });
    } catch (e) {
      setState(() {
        applyResult = e.toString();
        applying = false;
      });
    }
  }

  // Helper function to safely get name as String
  String getName(dynamic obj) {
    if (obj == null) return '';
    if (obj is Map && obj['name'] != null) {
      return obj['name'] is String ? obj['name'] : obj['name'].toString();
    }
    return obj.toString();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Chi tiết việc làm')),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : error.isNotEmpty
              ? Center(child: Text(error, style: const TextStyle(color: Colors.red)))
              : job == null
                  ? const Center(child: Text('Không tìm thấy việc làm'))
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Header: Logo, title, company, info
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (job!['recruiter'] != null && job!['recruiter']['company'] != null && job!['recruiter']['company']['logoUrl'] != null)
                                Container(
                                  width: 64,
                                  height: 64,
                                  margin: const EdgeInsets.only(right: 16),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: const Color(0xFF1967D2), width: 1),
                                    image: DecorationImage(
                                      image: NetworkImage(job!['recruiter']['company']['logoUrl']),
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                ),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(job!['title'] ?? '', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                                    const SizedBox(height: 4),
                                    if (job!['recruiter'] != null && job!['recruiter']['companyName'] != null)
                                      Text(job!['recruiter']['companyName'].toString(), style: const TextStyle(color: Color(0xFF1967D2), fontSize: 16)),
                                    const SizedBox(height: 4),
                                    Wrap(
                                      spacing: 8,
                                      runSpacing: 4,
                                      children: [
                                        if (job!['location'] != null)
                                          Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              const Icon(Icons.location_on, size: 16, color: Color(0xFF7A7A7A)),
                                              const SizedBox(width: 2),
                                              Text(job!['location'], style: const TextStyle(color: Color(0xFF7A7A7A))),
                                            ],
                                          ),
                                        if (job!['type'] != null)
                                          Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              const Icon(Icons.work_outline, size: 16, color: Color(0xFF7A7A7A)),
                                              const SizedBox(width: 2),
                                              Text(job!['type'].toString(), style: const TextStyle(color: Color(0xFF7A7A7A))),
                                            ],
                                          ),
                                        if (job!['createdAt'] != null)
                                          Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              const Icon(Icons.calendar_today, size: 16, color: Color(0xFF7A7A7A)),
                                              const SizedBox(width: 2),
                                              Text('Đăng: ' + (job!['createdAt'] ?? '')), 
                                            ],
                                          ),
                                        if (job!['deadline'] != null)
                                          Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              const Icon(Icons.hourglass_bottom, size: 16, color: Color(0xFF7A7A7A)),
                                              const SizedBox(width: 2),
                                              Text('Hạn: ' + (job!['deadline'] ?? '')),
                                            ],
                                          ),
                                      ],
                                    ),
                                    if (job!['skills'] != null && job!['skills'] is List && job!['skills'].isNotEmpty)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 6),
                                        child: Wrap(
                                          spacing: 6,
                                          children: [
                                            const Text('Kỹ năng:', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1967D2))),
                                            ...job!['skills'].map<Widget>((skill) => Chip(label: Text(getName(skill)), backgroundColor: const Color(0xFFe3edfa), labelStyle: const TextStyle(color: Color(0xFF1967D2)))).toList(),
                                          ],
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          if (job!['category'] != null)
                            Text('Ngành nghề: ${job!['category'].toString()}', style: const TextStyle(fontWeight: FontWeight.w500)),
                          if (job!['position'] != null)
                            Text('Vị trí: ${job!['position'].toString()}', style: const TextStyle(fontWeight: FontWeight.w500)),
                          if (job!['experience'] != null)
                            Text('Kinh nghiệm: ${job!['experience']}', style: const TextStyle(fontWeight: FontWeight.w500)),
                          const SizedBox(height: 16),
                          if (job!['requirements'] != null)
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Yêu cầu công việc', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1967D2))),
                                const SizedBox(height: 4),
                                Text(job!['requirements'], style: const TextStyle(fontSize: 16)),
                              ],
                            ),
                          const SizedBox(height: 16),
                          if (job!['benefits'] != null)
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Quyền lợi', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1967D2))),
                                const SizedBox(height: 4),
                                Text(job!['benefits'], style: const TextStyle(fontSize: 16)),
                              ],
                            ),
                          const SizedBox(height: 16),
                          if (job!['description'] != null)
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Mô tả công việc', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1967D2))),
                                const SizedBox(height: 4),
                                Text(job!['description'], style: const TextStyle(fontSize: 16)),
                              ],
                            ),
                          const SizedBox(height: 24),
                          if (job!['recruiter'] != null && job!['recruiter']['company'] != null)
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Thông tin công ty', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1967D2))),
                                const SizedBox(height: 8),
                                if (job!['recruiter']['company']['name'] != null)
                                  Text(getName(job!['recruiter']['company']), style: const TextStyle(fontWeight: FontWeight.bold)),
                                if (job!['recruiter']['company']['industry'] != null)
                                  Text('Ngành: ${job!['recruiter']['company']['industry']}'),
                                if (job!['recruiter']['company']['location'] != null)
                                  Text('Địa chỉ: ${job!['recruiter']['company']['location']}'),
                                if (job!['recruiter']['company']['description'] != null)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 4),
                                    child: Text(job!['recruiter']['company']['description']),
                                  ),
                              ],
                            ),
                          const SizedBox(height: 24),
                          if (applyResult.isNotEmpty)
                            Text(applyResult, style: TextStyle(color: applyResult.contains('thành công') ? Colors.green : Colors.red)),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: applying ? null : applyJob,
                              child: applying ? const CircularProgressIndicator() : const Text('Nộp đơn ứng tuyển'),
                            ),
                          ),
                          const SizedBox(height: 24),
                          if (loadingResumes)
                            const Center(child: CircularProgressIndicator()),
                          if (!loadingResumes && (resumes == null || resumes!.isEmpty))
                            const Text('Bạn chưa có CV nào, hãy tạo CV trước khi nộp đơn!', style: TextStyle(color: Colors.red)),
                          if (!loadingResumes && resumes != null && resumes!.isNotEmpty)
                            DropdownButtonFormField<String>(
                              value: selectedResumeId,
                              decoration: const InputDecoration(labelText: 'Chọn CV để nộp đơn'),
                              items: resumes!.map<DropdownMenuItem<String>>((cv) => DropdownMenuItem(
                                value: cv['id'].toString(),
                                child: Text(cv['title'] ?? 'CV'),
                              )).toList(),
                              onChanged: (v) {
                                setState(() { selectedResumeId = v ?? ''; });
                              },
                            ),
                        ],
                      ),
                    ),
    );
  }
}
