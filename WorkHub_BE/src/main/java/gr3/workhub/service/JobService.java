package gr3.workhub.service;

import gr3.workhub.entity.*;
import gr3.workhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.text.NumberFormat;
import java.text.ParseException;
import java.util.Locale;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
public class JobService {

    private static final Logger logger = Logger.getLogger(JobService.class.getName());

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final JobCategoryRepository jobCategoryRepository;
    private final JobTypeRepository jobTypeRepository;
    private final JobPositionRepository jobPositionRepository;
    private final SkillRepository skillRepository;

    // private final NumberFormat vietnamCurrencyFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN")); // Not used, can remove

    public List<Job> getAllJobs() {
        List<Job> jobs = jobRepository.findAll();
        jobs.forEach(job -> {
            Hibernate.initialize(job.getRecruiter());
            Hibernate.initialize(job.getCategory());
            Hibernate.initialize(job.getType());
            Hibernate.initialize(job.getPosition());
            Hibernate.initialize(job.getSkills());
        });
        return jobs;
    }
//
public Job getJobById(Integer jobId) {
    Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new IllegalArgumentException("Job not found"));
    Hibernate.initialize(job.getRecruiter());
    Hibernate.initialize(job.getCategory());
    Hibernate.initialize(job.getType());
    Hibernate.initialize(job.getPosition());
    Hibernate.initialize(job.getSkills());
    return job;
}

    // Get jobs by recruiter
    public List<Job> getJobsByRecruiter(Integer userId) {
        // Gọi findJobsByCriteria với đúng 7 tham số: userId, categoryId, typeId, positionId, skillId, location, title
        // userId, null, null, null, null, null, null
         return jobRepository.findJobsByCriteria(
            userId,           // Integer
            (Integer) null,   // categoryId (Integer)
            (Integer) null,   // typeId (Integer)
            (Integer) null,   // positionId (Integer)
            (Integer) null,   // skillId (Integer)
            (String) null,     // location (String)
            (String) null      // title (String)
        );
    }

    // Thêm phương thức tìm kiếm và lọc công việc
    public List<Job> findJobs(
            Integer userId,
            Integer categoryId,
            Integer typeId,
            Integer positionId,
            Integer skillId,
            String title, // Tham số title (hiện chưa dùng trong findJobsByCriteria)
            String location,
            Double minSalary,
            Double maxSalary
    ) {
        // Lấy danh sách jobs từ repository (lọc theo các tiêu chí trừ mức lương)
        // Gọi findJobsByCriteria với đúng 7 tham số: userId, categoryId, typeId, positionId, skillId, location, title
        List<Job> jobs = jobRepository.findJobsByCriteria(
                userId, categoryId, typeId, positionId, skillId, location, title
        );

        // Lọc kết quả theo mức lương sau khi lấy dữ liệu từ DB
        return jobs.stream()
                .filter(job -> {
                    if (minSalary == null && maxSalary == null) {
                        return true; // Không có bộ lọc mức lương
                    }
                    // Phân tích chuỗi mức lương
                    String salaryRangeStr = job.getSalaryRange();
                    if (salaryRangeStr == null || salaryRangeStr.trim().isEmpty() || salaryRangeStr.equals("Thương lượng")) {
                        return false; // Không có mức lương hoặc là 'Thương lượng', không khớp với lọc số
                    }

                    try {
                         // Remove VND and commas/dots, then split
                        String cleanedRange = salaryRangeStr.replace(" VND", "").replace(".", "").replace(",", "").trim();
                        String[] parts = cleanedRange.split("-");

                        double jobMinSalary = -1;
                        double jobMaxSalary = -1;

                        if (parts.length >= 1) { // Allow single number or range
                            try { jobMinSalary = Double.parseDouble(parts[0].trim()); } catch (NumberFormatException e) { /* ignore */ }
                             if (parts.length == 2) {
                                try { jobMaxSalary = Double.parseDouble(parts[1].trim()); } catch (NumberFormatException e) { /* ignore */ }
                             } else { // Single number, assume min salary with no upper bound
                                 jobMaxSalary = Double.MAX_VALUE;
                             }
                        } else {
                             // Không khớp định dạng mong muốn
                             return false;
                        }

                         // Logic lọc: Kiểm tra xem khoảng lương của job có giao với khoảng lọc không
                         // Khoảng job: [jobMin, jobMax] hoặc [jobMin, infinity] nếu jobMax = Double.MAX_VALUE
                         // Khoảng lọc: [minSalary, maxSalary]

                         // Hai khoảng giao nhau nếu KHÔNG (jobMin > maxSalary HOẶC jobMax < minSalary)
                         boolean overlaps = true;

                         // Check if job's min is greater than filter's max
                         if (maxSalary != null && jobMinSalary != -1 && jobMinSalary > maxSalary) {
                             overlaps = false;
                         }

                         // Check if job's max is less than filter's min
                         // Need to handle jobMaxSalary being Double.MAX_VALUE (infinity)
                         if (minSalary != null && jobMaxSalary != -1 && jobMaxSalary < minSalary) {
                              overlaps = false;
                         }

                         return overlaps;

                    } catch (NumberFormatException e) {
                        // Lỗi khi phân tích mức lương, bỏ qua job này
                         logger.log(Level.WARNING, "Error parsing salary range: " + salaryRangeStr, e);
                        return false;
                    } catch (Exception e) {
                         logger.log(Level.SEVERE, "Unexpected error during salary filtering for range: " + salaryRangeStr, e);
                         return false;
                    }
                })
                .collect(Collectors.toList());
    }

    // Create a job
    public Job createJobByUserId(Integer userId, Job job) {
        User recruiter = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Recruiter not found"));

        JobCategory category = jobCategoryRepository.findById(job.getCategory().getId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        JobType type = jobTypeRepository.findById(job.getType().getId())
                .orElseThrow(() -> new IllegalArgumentException("Type not found"));

        JobPosition position = jobPositionRepository.findById(job.getPosition().getId())
                .orElseThrow(() -> new IllegalArgumentException("Position not found"));

        List<Skill> skills = job.getSkills().stream()
                .map(skill -> skillRepository.findById(skill.getId())
                        .orElseThrow(() -> new IllegalArgumentException("Skill not found with ID: " + skill.getId())))
                .collect(Collectors.toList());

        job.setRecruiter(recruiter);
        job.setCategory(category);
        job.setType(type);
        job.setPosition(position);
        job.setSkills(skills);
        job.setPostAt(job.getPostAt() != null ? job.getPostAt() : Job.PostAt.standard);

        return jobRepository.save(job);
    }

    public Job updateJobByUserId(Integer userId, Integer jobId, Job job) {
        Job existingJob = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found"));

        if (!existingJob.getRecruiter().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to update this job");
        }

        JobCategory category = jobCategoryRepository.findById(job.getCategory().getId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        JobType type = jobTypeRepository.findById(job.getType().getId())
                .orElseThrow(() -> new IllegalArgumentException("Type not found"));

        JobPosition position = jobPositionRepository.findById(job.getPosition().getId())
                .orElseThrow(() -> new IllegalArgumentException("Position not found"));

        List<Skill> skills = job.getSkills().stream()
                .map(skill -> skillRepository.findById(skill.getId())
                        .orElseThrow(() -> new IllegalArgumentException("Skill not found with ID: " + skill.getId())))
                .collect(Collectors.toList());

        existingJob.setTitle(job.getTitle());
        existingJob.setDescription(job.getDescription());
        existingJob.setCategory(category);
        existingJob.setType(type);
        existingJob.setPosition(position);
        existingJob.setSalaryRange(job.getSalaryRange());
        existingJob.setSkills(skills);
        existingJob.setPostAt(job.getPostAt() != null ? job.getPostAt() : Job.PostAt.standard);

        return jobRepository.save(existingJob);
    }

    public List<Job> getJobsByPostAt(Job.PostAt postAt) {
        List<Job> jobs = jobRepository.findByPostAt(postAt);
        jobs.forEach(job -> {
            Hibernate.initialize(job.getRecruiter());
            Hibernate.initialize(job.getCategory());
            Hibernate.initialize(job.getType());
            Hibernate.initialize(job.getPosition());
            Hibernate.initialize(job.getSkills());
        });
        return jobs;
    }

    public void deleteJobByUserId(Integer userId, Integer jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found"));

        if (!job.getRecruiter().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to delete this job");
        }

        jobRepository.delete(job);
    }
}
