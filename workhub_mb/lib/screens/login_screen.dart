import 'package:flutter/material.dart';
import '../services/api_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  String email = '';
  String password = '';
  String error = '';
  bool loading = false;

  void _login() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { loading = true; error = ''; });
    final err = await ApiService.login(email, password);
    setState(() { loading = false; });
    if (err == null) {
      Navigator.pushReplacementNamed(context, '/');
    } else {
      setState(() { error = err; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Đăng nhập')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextFormField(
                decoration: const InputDecoration(labelText: 'Email'),
                onChanged: (v) => email = v,
                validator: (v) => v == null || v.isEmpty ? 'Nhập email' : null,
              ),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Mật khẩu'),
                obscureText: true,
                onChanged: (v) => password = v,
                validator: (v) => v == null || v.isEmpty ? 'Nhập mật khẩu' : null,
              ),
              const SizedBox(height: 16),
              if (error.isNotEmpty)
                Text(error, style: const TextStyle(color: Colors.red)),
              ElevatedButton(
                onPressed: loading ? null : _login,
                child: loading ? const CircularProgressIndicator() : const Text('Đăng nhập'),
              ),
              TextButton(
                onPressed: () => Navigator.pushNamed(context, '/register'),
                child: const Text('Chưa có tài khoản? Đăng ký'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
