import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  static const String baseUrl = 'http://192.168.0.102:8080/workhub/api/v1';

  // Example: Get user profile
  Future<Map<String, dynamic>?> getUserProfile() async {
    final response = await http.get(
      Uri.parse('$baseUrl/me'),
      headers: {'Accept': 'application/json'},
    );
    if (response.statusCode == 200) {
      try {
        return json.decode(response.body);
      } catch (_) {
        return null;
      }
    }
    return null;
  }

  // Example: Login
  Future<Map<String, dynamic>?> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/login'),
      headers: {'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json'},
      body: {'email': email, 'password': password},
    );
    if (response.statusCode == 200) {
      try {
        return json.decode(response.body);
      } catch (_) {
        return null;
      }
    }
    return null;
  }

  // Lấy danh sách jobs
  Future<List<dynamic>?> getJobs() async {
    final response = await http.get(Uri.parse('$baseUrl/jobs'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    return null;
  }

  // Tìm kiếm jobs với query, location, type
  Future<List<dynamic>?> searchJobs({String? query, String? location, String? type}) async {
    final params = <String, String>{};
    if (query != null && query.isNotEmpty) params['title'] = query;
    if (location != null && location != 'All Locations') params['location'] = location;
    if (type != null && type != 'All Types') params['typeId'] = type; // cần map type sang id nếu có
    final uri = Uri.parse('$baseUrl/jobs').replace(queryParameters: params);
    final response = await http.get(uri);
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    return null;
  }

  // Lấy chi tiết job theo id
  Future<Map<String, dynamic>?> getJobById(int jobId) async {
    final response = await http.get(Uri.parse('$baseUrl/jobs/detail/$jobId'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    return null;
  }

  // Add more methods for other endpoints as needed
}
