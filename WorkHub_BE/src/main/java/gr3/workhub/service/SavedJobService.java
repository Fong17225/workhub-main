package gr3.workhub.service;

import gr3.workhub.dto.SavedJobDTO;
import gr3.workhub.entity.SavedJob;
import gr3.workhub.entity.User;
import gr3.workhub.entity.Job;
import gr3.workhub.repository.SavedJobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavedJobService {

    private final SavedJobRepository savedJobRepository;

    public SavedJob saveJob(Integer userId, Integer jobId) {
        SavedJob savedJob = new SavedJob();
        savedJob.setCandidate(new User(userId));
        savedJob.setJob(new Job(jobId));
        return savedJobRepository.save(savedJob);
    }

    public void deleteSavedJob(Integer userId, Integer jobId) {
        SavedJob savedJob = savedJobRepository.findByCandidateIdAndJobId(userId, jobId)
                .orElseThrow(() -> new IllegalArgumentException("Saved job not found"));
        savedJobRepository.delete(savedJob);
    }

    public List<SavedJobDTO> getSavedJobsForUser(Integer userId) {
        List<SavedJob> savedJobs = savedJobRepository.findByCandidateId(userId);
        
        return savedJobs.stream()
                .map(savedJob -> {
                    Job job = savedJob.getJob();
                    if (job != null) {
                         String companyName = null;
                         if (job.getRecruiter() != null && job.getRecruiter().getFullname() != null) {
                             companyName = job.getRecruiter().getFullname();
                         }

                         return new SavedJobDTO(
                            savedJob.getId(),
                            job.getId(),
                            job.getTitle(),
                            companyName,
                            job.getLocation(),
                            job.getSalaryRange(),
                            job.getCreatedAt() != null ? job.getCreatedAt().toString() : null
                        );
                    } else {
                         return null;
                    }
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }
}