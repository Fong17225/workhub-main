import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:workhub_mb/widgets/job_card.dart';
import 'package:workhub_mb/widgets/bottom_nav_bar.dart';
import 'package:workhub_mb/providers/language_provider.dart';
import 'package:workhub_mb/utils/language_constants.dart';
import 'package:workhub_mb/services/api_service.dart';
import 'package:workhub_mb/services/filter_service.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  String? _selectedTypeId;
  List<dynamic> jobs = [];
  List<dynamic> categories = [];
  List<dynamic> types = [];
  List<dynamic> positions = [];
  List<dynamic> skills = [];
  bool isLoading = false;
  bool _showFilters = false;

  String? _selectedCategory;
  String? _selectedPosition;
  String? _selectedSkill;

  @override
  void initState() {
    super.initState();
    fetchFilters();
    fetchJobs();
  }

  Future<void> fetchFilters() async {
    final filterService = FilterService();
    final results = await Future.wait([
      filterService.getCategories(),
      filterService.getTypes(),
      filterService.getPositions(),
      filterService.getSkills(),
    ]);
    setState(() {
      categories = results[0];
      types = results[1];
      positions = results[2];
      skills = results[3];
    });
  }

  Future<void> fetchJobs() async {
    setState(() { isLoading = true; });
    final api = ApiService();
    final result = await api.searchJobs(
      query: _searchController.text,
      type: _selectedTypeId,
    );
    setState(() {
      jobs = result ?? [];
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final languageProvider = Provider.of<LanguageProvider>(context);
    final currentLanguage = languageProvider.currentLanguage;

    return Scaffold(
      appBar: AppBar(
        title: Text(LanguageConstants.getText('search_jobs', currentLanguage)),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Column(
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: Theme.of(context).primaryColor.withOpacity(0.08),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: LanguageConstants.getText('search_jobs', currentLanguage),
                      prefixIcon: Icon(Icons.search, color: Theme.of(context).primaryColor),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    ),
                    onSubmitted: (_) => fetchJobs(),
                  ),
                ),
                const SizedBox(height: 10),
                GestureDetector(
                  onTap: () {
                    setState(() {
                      _showFilters = !_showFilters;
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                    decoration: BoxDecoration(
                      color: Theme.of(context).primaryColor.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(_showFilters ? Icons.expand_less : Icons.expand_more, color: Theme.of(context).primaryColor),
                        const SizedBox(width: 8),
                        Text(
                          'Bộ lọc tìm kiếm',
                          style: TextStyle(
                            color: Theme.of(context).primaryColor,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                AnimatedCrossFade(
                  firstChild: const SizedBox.shrink(),
                  secondChild: Column(
                    children: [
                      const SizedBox(height: 10),
                      _buildCompactDropdown(
                        icon: Icons.category,
                        value: _selectedCategory,
                        hint: 'Ngành nghề',
                        items: [
                          const DropdownMenuItem(value: null, child: Text('Tất cả ngành nghề')),
                          ...categories.map((cat) => DropdownMenuItem(
                                value: cat['id'].toString(),
                                child: Text(cat['name']),
                              ))
                        ],
                        onChanged: (value) {
                          setState(() { _selectedCategory = value; });
                          fetchJobs();
                        },
                      ),
                      const SizedBox(height: 8),
                      _buildCompactDropdown(
                        icon: Icons.work_outline,
                        value: _selectedTypeId,
                        hint: 'Loại',
                        items: [
                          const DropdownMenuItem(value: null, child: Text('Tất cả loại công việc')),
                          ...types.map((type) => DropdownMenuItem(
                                value: type['id'].toString(),
                                child: Text(type['name']),
                              ))
                        ],
                        onChanged: (value) {
                          setState(() { _selectedTypeId = value; });
                          fetchJobs();
                        },
                      ),
                      const SizedBox(height: 8),
                      _buildCompactDropdown(
                        icon: Icons.badge_outlined,
                        value: _selectedPosition,
                        hint: 'Vị trí',
                        items: [
                          const DropdownMenuItem(value: null, child: Text('Tất cả vị trí')),
                          ...positions.map((pos) => DropdownMenuItem(
                                value: pos['id'].toString(),
                                child: Text(pos['name']),
                              ))
                        ],
                        onChanged: (value) {
                          setState(() { _selectedPosition = value; });
                          fetchJobs();
                        },
                      ),
                      const SizedBox(height: 8),
                      _buildCompactDropdown(
                        icon: Icons.star_outline,
                        value: _selectedSkill,
                        hint: 'Kỹ năng',
                        items: [
                          const DropdownMenuItem(value: null, child: Text('Tất cả kỹ năng')),
                          ...skills.map((skill) => DropdownMenuItem(
                                value: skill['id'].toString(),
                                child: Text(skill['name']),
                              ))
                        ],
                        onChanged: (value) {
                          setState(() { _selectedSkill = value; });
                          fetchJobs();
                        },
                      ),
                    ],
                  ),
                  crossFadeState: _showFilters ? CrossFadeState.showSecond : CrossFadeState.showFirst,
                  duration: const Duration(milliseconds: 250),
                ),
              ],
            ),
          ),
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
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
          ),
        ],
      ),
      bottomNavigationBar: const BottomNavBar(currentIndex: 1),
    );
  }

  Widget _buildCompactDropdown({
    required IconData icon,
    required String? value,
    required String hint,
    required List<DropdownMenuItem<String?>> items,
    required ValueChanged<String?> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Theme.of(context).primaryColor.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: Theme.of(context).primaryColor),
          const SizedBox(width: 4),
          DropdownButtonHideUnderline(
            child: DropdownButton<String?>(
              value: value,
              hint: Text(hint, style: const TextStyle(fontSize: 13)),
              items: items,
              onChanged: onChanged,
              style: const TextStyle(fontSize: 13, color: Colors.black),
              icon: const Icon(Icons.arrow_drop_down, size: 18),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}