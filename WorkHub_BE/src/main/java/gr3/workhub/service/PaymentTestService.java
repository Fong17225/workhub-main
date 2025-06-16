// src/main/java/gr3/workhub/service/PaymentTestService.java
package gr3.workhub.service;

import gr3.workhub.entity.*;
import gr3.workhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentTestService {
    private final UserRepository userRepository;
    private final ServicePackageRepository servicePackageRepository;
    private final TransactionRepository transactionRepository;
    private final UserPackageRepository userPackageRepository;

    public UserPackage simulatePayment(Integer userId, Integer packageId, double price, String description) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        ServicePackage servicePackage = servicePackageRepository.findById(packageId)
                .orElseThrow(() -> new IllegalArgumentException("ServicePackage not found"));

        // 1. Save transaction with status completed
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setServicePackage(servicePackage);
        transaction.setAmount(price);
        transaction.setStatus(Transaction.Status.completed);
        transaction.setDescription(description);
        transaction = transactionRepository.save(transaction);

        // 2. Only after transaction is completed, save UserPackage
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiration = now.plusDays(servicePackage.getDuration());

        UserPackage userPackage = new UserPackage();
        userPackage.setUser(user);
        userPackage.setServicePackage(servicePackage);
        userPackage.setPrice(price);
        userPackage.setStatus(UserPackage.Status.active);
        userPackage.setDescription(description);
        userPackage.setRenewalDate(now);
        userPackage.setExpirationDate(expiration);

        return userPackageRepository.save(userPackage);
    }
}