package gr3.workhub.controller.User;

import gr3.workhub.entity.User;
import gr3.workhub.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/workhub/api/v1")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public Object login(@RequestParam String email, @RequestParam String password, HttpSession session) {
        Optional<User> userOpt = userService.login(email, password);
        if (userOpt.isPresent()) {
            session.setAttribute("userId", userOpt.get().getId());
            return userOpt.get(); // Return user info
        }
        return "Invalid credentials";
    }
    @GetMapping("/me")
    public Object getProfile(HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) return "Not logged in";
        return userService.findById(userId)
                .<Object>map(user -> user)
                .orElse("User not found");
    }
    @PostMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "Logged out";
    }
}