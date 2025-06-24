import 'package:flutter/material.dart';
import '../services/api_service.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({Key? key}) : super(key: key);

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  String fullname = '';
  String email = '';
  String password = '';
  String confirmPassword = '';
  String error = '';
  bool loading = false;

  void _register() async {
    if (!_formKey.currentState!.validate()) return;
    if (password != confirmPassword) {
      setState(() { error = 'Mật khẩu xác nhận không khớp!'; });
      return;
    }
    setState(() { loading = true; error = ''; });
    final err = await ApiService.registerCandidate(fullname, email, password);
    setState(() { loading = false; });
    if (err == null) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Thành công'),
          content: const Text('Đăng ký thành công! Vui lòng đăng nhập.'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pushReplacementNamed(context, '/login');
              },
              child: const Text('OK'),
            ),
          ],
        ),
      );
    } else {
      setState(() { error = err; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Đăng ký')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextFormField(
                decoration: const InputDecoration(labelText: 'Họ và tên'),
                onChanged: (v) => fullname = v,
                validator: (v) => v == null || v.isEmpty ? 'Nhập họ tên' : null,
              ),
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
              TextFormField(
                decoration: const InputDecoration(labelText: 'Xác nhận mật khẩu'),
                obscureText: true,
                onChanged: (v) => confirmPassword = v,
                validator: (v) => v == null || v.isEmpty ? 'Nhập lại mật khẩu' : null,
              ),
              const SizedBox(height: 16),
              if (error.isNotEmpty)
                Text(error, style: const TextStyle(color: Colors.red)),
              ElevatedButton(
                onPressed: loading ? null : _register,
                child: loading ? const CircularProgressIndicator() : const Text('Đăng ký'),
              ),
              TextButton(
                onPressed: () => Navigator.pushNamed(context, '/login'),
                child: const Text('Đã có tài khoản? Đăng nhập'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
