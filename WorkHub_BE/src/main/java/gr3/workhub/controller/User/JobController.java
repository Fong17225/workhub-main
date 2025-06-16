package gr3.workhub.controller.User;

import gr3.workhub.entity.Job;
import gr3.workhub.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "✅Job Management", description = "API quản lý bài đăng tuyển dụng (job)")
@RestController
@CrossOrigin

@RequestMapping("/workhub/api/v1/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @Operation(summary = "<EndPoint cho trang của ứng viên> Lấy tất cả công việc hoặc tìm kiếm/lọc", description = "Trả về danh sách toàn bộ công việc hoặc danh sách theo tiêu chí tìm kiếm/lọc")
    @GetMapping()
    public ResponseEntity<List<Job>> getAllJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Integer typeId,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Double minSalary,
            @RequestParam(required = false) Double maxSalary,
            @RequestParam(required = false) Integer positionId,
            @RequestParam(required = false) Integer skillId
    ) {
        List<Job> jobs = jobService.findJobs(
                null, categoryId, typeId, positionId, skillId, title, location, minSalary, maxSalary
        );
        return ResponseEntity.ok(jobs);
    }

    @Operation(summary = "Get job by jobId", description = "Return job details by jobId")
    @GetMapping("/detail/{jobId}")
    public ResponseEntity<Job> getJobById(
            @Parameter(description = "ID of the job") @PathVariable Integer jobId) {
        return ResponseEntity.ok(jobService.getJobById(jobId));
    }

    @Operation(summary = "<EndPoint cho trang của nhà tuyển dụng> Lấy danh sách công việc của nhà tuyển dụng theo id của nhà tuyển dụng", description = "Trả về danh sách job do recruiter đăng")
    @GetMapping("/recruiter/{userId}")
    public ResponseEntity<List<Job>> getJobsByRecruiter(
            @Parameter(description = "ID của recruiter") @PathVariable Integer userId) {
        return ResponseEntity.ok(jobService.getJobsByRecruiter(userId));
    }

    @Operation(summary = "<EndPoint cho trang của nhà tuyển dụng> Tạo job mới theo id của nhà tuyển dụng ( userid )", description = "Recruiter hoặc Admin tạo job mới")
    @PostMapping("/{userId}")
    public ResponseEntity<Job> createJob(
            @Parameter(description = "ID của người tạo (recruiter)") @PathVariable Integer userId,
            @RequestBody Job job) {
        return ResponseEntity.ok(jobService.createJobByUserId(userId, job));
    }

    @Operation(summary = "<EndPoint cho trang của ứng viên > Hiển thị tin theo postAt ( khu vực hiển thị tin )", description = "Trả về danh sách công việc theo postAt")
    @GetMapping("/postat/{postAt}")
    public ResponseEntity<List<Job>> getJobsByPostAt(
            @Parameter(description = "Vị trí hiển thị: proposal, urgent,standard") @PathVariable Job.PostAt postAt) {
        List<Job> jobs = jobService.getJobsByPostAt(postAt);
        return ResponseEntity.ok(jobs);
    }

    @Operation(summary = "<EndPoint cho trang của nhà tuyển dụng> Cập nhật công việc", description = "Cập nhật job đã đăng bởi recruiter hoặc admin")
    @PutMapping("/{userId}/{id}")
    public ResponseEntity<Job> updateJob(
            @Parameter(description = "ID của recruiter") @PathVariable Integer userId,
            @Parameter(description = "ID của công việc") @PathVariable Integer id,
            @RequestBody Job job) {
        Job updatedJob = jobService.updateJobByUserId(userId, id, job);
        return ResponseEntity.ok(updatedJob);
    }

    @Operation(summary = "<EndPoint cho trang của nhà tuyển dụng> Xóa công việc", description = "Xóa bài đăng công việc bởi recruiter hoặc admin")
    @DeleteMapping("/{userId}/{jobId}")
    public ResponseEntity<Void> deleteJobByUserId(
            @Parameter(description = "ID của recruiter") @PathVariable Integer userId,
            @Parameter(description = "ID của công việc") @PathVariable Integer jobId) {
        jobService.deleteJobByUserId(userId, jobId);
        return ResponseEntity.noContent().build();
    }
}
