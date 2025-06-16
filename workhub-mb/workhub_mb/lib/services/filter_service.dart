import 'package:http/http.dart' as http;
import 'dart:convert';

class FilterService {
  static const String baseUrl = 'http://192.168.0.102:8080/workhub/api/v1';

  Future<List<dynamic>> getCategories() async {
    final response = await http.get(Uri.parse('$baseUrl/job-categories'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    return [];
  }

  Future<List<dynamic>> getTypes() async {
    final response = await http.get(Uri.parse('$baseUrl/job-types'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    return [];
  }

  Future<List<dynamic>> getPositions() async {
    final response = await http.get(Uri.parse('$baseUrl/job-positions'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    return [];
  }

  Future<List<dynamic>> getSkills() async {
    final response = await http.get(Uri.parse('$baseUrl/skill'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    return [];
  }
}
