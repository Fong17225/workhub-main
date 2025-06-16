//package gr3.workhub.service;
//
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.mail.MailException;
//import org.springframework.mail.javamail.JavaMailSender;
//import org.springframework.mail.SimpleMailMessage;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//@Service
//public class EmailService {
//    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
//
//    @Autowired
//    private JavaMailSender mailSender;
//
//    public void sendActivationEmail(String to, String token) {
//        try {
//            SimpleMailMessage message = new SimpleMailMessage();
//            message.setTo(to);
//            message.setSubject("Account Activation");
//            message.setText("Click the link to activate: http://localhost:8080/workhub/api/v1/activate?token=" + token);
//            mailSender.send(message);
//            logger.info("Activation email sent to {}", to);
//        } catch (MailException e) {
//            logger.error("Failed to send activation email to {}: {}", to, e.getMessage());
//            // Optionally rethrow or handle as needed
//        }
//    }
//    public void sendResetPasswordEmail(String to, String token) {
//        try {
//            SimpleMailMessage message = new SimpleMailMessage();
//            message.setTo(to);
//            message.setSubject("Password Reset");
//            message.setText("Click the link to reset your password: http://localhost:8080/workhub/api/v1/reset-password?token=" + token);
//            mailSender.send(message);
//            logger.info("Password reset email sent to {}", to);
//        } catch (MailException e) {
//            logger.error("Failed to send password reset email to {}: {}", to, e.getMessage());
//        }
//    }
//}