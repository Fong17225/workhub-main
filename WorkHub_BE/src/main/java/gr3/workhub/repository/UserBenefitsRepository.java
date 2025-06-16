 package gr3.workhub.repository;

import gr3.workhub.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserBenefitsRepository extends JpaRepository<UserBenefits, Integer> {
    Optional<UserBenefits> findByUserAndUserPackage(User user, UserPackage userPackage);
}