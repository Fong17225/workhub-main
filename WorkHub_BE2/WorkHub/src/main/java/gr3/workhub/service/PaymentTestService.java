package gr3.workhub.service;

import gr3.workhub.entity.*;
import gr3.workhub.repository.*;
import gr3.workhub.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentTestService {
    private final UserRepository userRepository;
    private final ServicePackageRepository servicePackageRepository;
    private final TransactionRepository transactionRepository;
    private final UserPackageRepository userPackageRepository;
    private final UserBenefitsRepository userBenefitsRepository;
    private final TokenService tokenService;
    private final ServicePackageService servicePackageService;


    public UserPackage simulatePayment(HttpServletRequest request, Integer packageId, double price, String description) {
        LocalDateTime now = LocalDateTime.now();
        Integer userId = tokenService.extractUserIdFromRequest(request);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        ServicePackage servicePackage = servicePackageRepository.findById(packageId)
                .orElseThrow(() -> new IllegalArgumentException("ServicePackage not found"));

        // Find main (renewable) package
        UserPackage mainPackage = userPackageRepository.findMainPackageByUserId(userId);

        // 1. If supplementary (non_renewable) package: must have a main (renewable) package
        if (servicePackage.getRenewalPolicy() == ServicePackage.RenewalPolicy.non_renewable) {
            if (mainPackage == null) {
                throw new IllegalStateException("You must own a main (renewable) package to purchase this supplementary package.");
            }
        }

        // 2. If main package: cannot buy if already have same or higher level
        if (servicePackage.isMainPackage()) {
            if (mainPackage != null) {
                int existingLevel = mainPackage.getServicePackage().getLevel();
                int newLevel = servicePackage.getLevel();
                if (existingLevel > newLevel) {
                    throw new IllegalStateException("You already own a higher-level main package.");
                } else if (existingLevel == newLevel) {
                    throw new IllegalStateException("You already own this main package.");
                }
            }
        }

        // 3. If jobPostLimit: only allow if current quota is 0
        if (servicePackage.isJobPostLimitPackage()) {
            Optional<UserBenefits> userBenefitsOpt = userBenefitsRepository.findByUserAndPostAt(user, UserBenefits.PostAt.valueOf(servicePackage.getPostAt().name()));
            if (userBenefitsOpt.isPresent() && userBenefitsOpt.get().getJobPostLimit() > 0) {
                throw new IllegalStateException("You can only purchase this jobPostLimit package when your current quota is 0.");
            }
        }

        // 4. If postAt: only allow if current benefit is lower
        if (servicePackage.isPostAtPackage()) {
            Optional<UserBenefits> userBenefitsOpt = userBenefitsRepository.findByUserAndPostAt(user, UserBenefits.PostAt.valueOf(servicePackage.getPostAt().name()));
            if (userBenefitsOpt.isPresent()) {
                UserBenefits userBenefits = userBenefitsOpt.get();
                if (userBenefits.getPostAt() != null && userBenefits.getPostAt().getLevel() >= servicePackage.getPostAt().getLevel()) {
                    throw new IllegalStateException("You already own a postAt benefit with equal or higher level.");
                }
            }
        }

        // 5. Save transaction
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setServicePackage(servicePackage);
        transaction.setAmount(price);
        transaction.setStatus(Transaction.Status.completed);
        transaction.setDescription(description);
        transaction = transactionRepository.save(transaction);

        // 6. Create new UserPackage
        LocalDateTime expirationDate;
        if (servicePackage.getRenewalPolicy() == ServicePackage.RenewalPolicy.non_renewable) {
            // Set expiration to main package's expiration
            expirationDate = mainPackage.getExpirationDate();
        } else {
            LocalDateTime purchaseDateAt2359 = LocalDate.now().atTime(23, 59);
            int duration = servicePackage.getDuration();
            expirationDate = purchaseDateAt2359.plusDays(duration).toLocalDate().atStartOfDay();
        }

        UserPackage userPackage = new UserPackage();
        userPackage.setUser(user);
        userPackage.setServicePackage(servicePackage);
        userPackage.setPrice(price);
        userPackage.setStatus(UserPackage.Status.active);
        userPackage.setDescription(description);
        userPackage.setExpirationDate(expirationDate);

        userPackage = userPackageRepository.save(userPackage);

        // 7. Update UserBenefits (always reference main package)
        UserPackage userPackageForBenefits = (servicePackage.getRenewalPolicy() == ServicePackage.RenewalPolicy.renewable) ? userPackage : mainPackage;
        if (userPackageForBenefits == null) {
            throw new IllegalStateException("No main package found for updating benefits.");
        }

        UserBenefits.PostAt postAt = UserBenefits.PostAt.valueOf(servicePackage.getPostAt().name());
        Optional<UserBenefits> userBenefitsOpt = userBenefitsRepository.findByUserAndPostAt(user, postAt);
        UserBenefits userBenefits = userBenefitsOpt.orElseGet(UserBenefits::new);

        userBenefits.setUser(user);
        userBenefits.setPostAt(postAt);
        userBenefits.setJobPostLimit(
                (userBenefits.getJobPostLimit() == null ? 0 : userBenefits.getJobPostLimit()) + servicePackage.getJobPostLimit()
        );
        userBenefits.setCvLimit(
                (userBenefits.getCvLimit() == null ? 0 : userBenefits.getCvLimit()) + servicePackage.getCvLimit()
        );
        // Update postAt if higher level
        ServicePackage.PostAt packagePostAt = servicePackage.getPostAt();
        if (userBenefits.getPostAt() == null || packagePostAt.getLevel() > userBenefits.getPostAt().getLevel()) {
            userBenefits.setPostAt(UserBenefits.PostAt.valueOf(packagePostAt.name()));
        }
        userBenefits.setUserPackage(userPackageForBenefits);
        userBenefits.setDescription(servicePackage.getDescription());
        userBenefits.setUpdatedAt(now);
        userBenefitsRepository.save(userBenefits);

        return userPackage;
    }

    public UserPackage renewUserPackage(HttpServletRequest request, Integer packageId, double price, String description) {
        LocalDateTime now = LocalDateTime.now();
        Integer userId = tokenService.extractUserIdFromRequest(request);

        // 1. Check if user has a package
        UserPackage userPackage = userPackageRepository.findByUserIdAndServicePackageId(userId, packageId)
                .orElseThrow(() -> new IllegalArgumentException("Bạn chưa mua gói này."));

        ServicePackage servicePackage = userPackage.getServicePackage();

        // 2. Allow renewal only for renewable packages
        if (servicePackage.getRenewalPolicy() == ServicePackage.RenewalPolicy.non_renewable) {
            throw new IllegalStateException("Gói này không hỗ trợ gia hạn, vui lòng mua lại.");
        }

        LocalDateTime expirationDate = userPackage.getExpirationDate();

        // 3. Check if renewal is within allowed time window
        if (expirationDate.isAfter(now) && expirationDate.minusDays(5).isAfter(now)) {
            throw new IllegalStateException("Gói này chưa gần hết hạn, bạn không thể gia hạn lúc này.");
        }
        if (expirationDate.isBefore(now.minusDays(5))) {
            throw new IllegalStateException("Đã hết thời gian cho phép gia hạn, vui lòng mua gói mới.");
        }

        // 4. Save renewal transaction
        User user = userPackage.getUser();
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setServicePackage(servicePackage);
        transaction.setAmount(price);
        transaction.setStatus(Transaction.Status.completed);
        transaction.setDescription("Gia hạn: " + description);
        transactionRepository.save(transaction);

        // 5. Update UserPackage
        int duration = servicePackage.getDuration();
        userPackage.setRenewalDate(now);
        userPackage.setExpirationDate(expirationDate.plusDays(duration));
        userPackage.setPrice(price);
        userPackage.setStatus(UserPackage.Status.active);
        userPackage.setDescription(description);
        userPackage = userPackageRepository.save(userPackage);

        // 6. Update UserBenefits (add new benefits)
        UserBenefits.PostAt postAt = UserBenefits.PostAt.valueOf(servicePackage.getPostAt().name());
        UserBenefits userBenefits = userBenefitsRepository
                .findByUserAndPostAt(user, postAt)
                .orElse(null);

        if (userBenefits == null) {
            userBenefits = new UserBenefits();
            userBenefits.setUser(user);
            userBenefits.setPostAt(postAt);
            userBenefits.setJobPostLimit(servicePackage.getJobPostLimit());
            userBenefits.setCvLimit(servicePackage.getCvLimit());
        } else {
            userBenefits.setJobPostLimit(userBenefits.getJobPostLimit() + servicePackage.getJobPostLimit());
            userBenefits.setCvLimit(userBenefits.getCvLimit() + servicePackage.getCvLimit());
            // Update postAt if higher level
            if (servicePackage.getPostAt().getLevel() > userBenefits.getPostAt().getLevel()) {
                userBenefits.setPostAt(UserBenefits.PostAt.valueOf(servicePackage.getPostAt().name()));
            }
        }

        userBenefits.setUserPackage(userPackage);
        userBenefits.setDescription(servicePackage.getDescription());
        userBenefits.setUpdatedAt(now);
        userBenefitsRepository.save(userBenefits);

        return userPackage;
    }
}