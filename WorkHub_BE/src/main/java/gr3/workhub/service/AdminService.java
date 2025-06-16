//package gr3.workhub.service;
//
//import gr3.workhub.entity.Admin;
//import gr3.workhub.repository.AdminRepository;
//import gr3.workhub.security.JwtUtil;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//
//@Service
//public class AdminService {
//    @Autowired
//    private AdminRepository adminRepository;
//    @Autowired
//    private PasswordEncoder passwordEncoder;
//    @Autowired
//    private JwtUtil jwtUtil;
//
//    public String login(String email, String rawPassword) {
//        Admin admin = adminRepository.findByEmail(email)
//                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
//        if (!passwordEncoder.matches(rawPassword, admin.getPassword())) {
//            throw new RuntimeException("Invalid credentials");
//        }
//        return jwtUtil.generateToken(admin.getEmail(), admin.getRole().name());
//    }
//}