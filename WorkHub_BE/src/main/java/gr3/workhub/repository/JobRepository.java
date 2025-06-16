package gr3.workhub.repository;

import gr3.workhub.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Integer> {

    @Query("SELECT j FROM Job j " +
            "WHERE (:userId IS NULL OR j.recruiter.id = :userId) " +
            "AND (:categoryId IS NULL OR j.category.id = :categoryId) " +
            "AND (:typeId IS NULL OR j.type.id = :typeId) " +
            "AND (:positionId IS NULL OR j.position.id = :positionId) " +
            "AND (:skillId IS NULL OR :skillId IN (SELECT s.id FROM j.skills s))" +
            "AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%')))" +
            "AND (:title IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :title, '%')))")
    List<Job> findJobsByCriteria(@Param("userId") Integer userId,
                                 @Param("categoryId") Integer categoryId,
                                 @Param("typeId") Integer typeId,
                                 @Param("positionId") Integer positionId,
                                 @Param("skillId") Integer skillId,
                                 @Param("location") String location,
                                 @Param("title") String title);

    List<Job> findByPostAt(Job.PostAt postAt);
}