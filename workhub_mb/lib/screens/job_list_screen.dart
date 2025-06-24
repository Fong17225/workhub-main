import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'job_detail_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

class JobListScreen extends StatefulWidget {
  const JobListScreen({Key? key}) : super(key: key);

  @override
  State<JobListScreen> createState() => _JobListScreenState();
}

class _JobListScreenState extends State<JobListScreen> {
  List<dynamic>? jobs;
  bool loading = true;
  String error = '';

  @override
  void initState() {
    super.initState();
    fetchJobs();
  }

  Future<void> fetchJobs() async {
    setState(() { loading = true; error = ''; });
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final data = await ApiService.getJobs(token: token);
      setState(() {
        jobs = data;
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
      appBar: AppBar(
        title: const Text('Danh sách việc làm'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person),
            tooltip: 'Hồ sơ cá nhân',
            onPressed: () {
              Navigator.pushNamed(context, '/profile');
            },
          ),
        ],
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : error.isNotEmpty
              ? Center(child: Text(error, style: const TextStyle(color: Colors.red)))
              : jobs == null || jobs!.isEmpty
                  ? const Center(child: Text('Không có việc làm nào'))
                  : RefreshIndicator(
                      onRefresh: fetchJobs,
                      child: ListView.builder(
                        itemCount: jobs!.length,
                        itemBuilder: (context, index) {
                          final job = jobs![index];
                          return Card(
                            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            elevation: 2,
                            child: ListTile(
                              contentPadding: const EdgeInsets.all(16),
                              title: Text(job['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (job['companyName'] != null)
                                    Text(job['companyName'], style: const TextStyle(color: Color(0xFF1967D2))),
                                  if (job['location'] != null)
                                    Row(
                                      children: [
                                        const Icon(Icons.location_on, size: 16, color: Color(0xFF7A7A7A)),
                                        const SizedBox(width: 4),
                                        Text(job['location'], style: const TextStyle(color: Color(0xFF7A7A7A))),
                                      ],
                                    ),
                                  if (job['salary'] != null)
                                    Row(
                                      children: [
                                        const Icon(Icons.monetization_on, size: 16, color: Color(0xFFFFB200)),
                                        const SizedBox(width: 4),
                                        Text(job['salary'].toString(), style: const TextStyle(color: Color(0xFFFFB200))),
                                      ],
                                    ),
                                ],
                              ),
                              trailing: const Icon(Icons.arrow_forward_ios, size: 18),
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => JobDetailScreen(jobId: job['id'].toString()),
                                  ),
                                );
                              },
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
