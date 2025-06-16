package gr3.workhub.service;

import gr3.workhub.entity.User;
import gr3.workhub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Optional<User> login(String email, String rawPassword) {
        return userRepository.findByEmail(email)
                .filter(user -> {
                    String storedPassword = user.getPassword();
                    // Nếu mật khẩu bắt đầu bằng {noop}, bỏ prefix và so sánh trực tiếp
                    if (storedPassword.startsWith("{noop}")) {
                        return storedPassword.substring(6).equals(rawPassword);
                    }
                    // Nếu không, sử dụng PasswordEncoder
                    return passwordEncoder.matches(rawPassword, storedPassword);
                });
    }

    public Optional<User> findById(Integer id) {
        return userRepository.findById(id);
    }
}