package gr3.workhub.repository;

import gr3.workhub.entity.UserPackage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserPackageRepository extends JpaRepository<UserPackage, Integer> {
    List<UserPackage> findByUserId(Integer userId);
}