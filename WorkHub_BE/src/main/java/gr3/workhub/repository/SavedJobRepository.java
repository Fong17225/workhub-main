package gr3.workhub.repository;

import gr3.workhub.entity.SavedJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedJobRepository extends JpaRepository<SavedJob, Integer> {
    List<SavedJob> findByCandidateId(Integer candidateId);
    Optional<SavedJob> findByCandidateIdAndJobId(Integer candidateId, Integer jobId);
}