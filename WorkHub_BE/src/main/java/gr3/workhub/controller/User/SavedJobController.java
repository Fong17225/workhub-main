package gr3.workhub.controller.User;

import gr3.workhub.entity.SavedJob;
import gr3.workhub.service.SavedJobService;
import gr3.workhub.dto.SavedJobDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(
        name = "✅ Saved Jobs",
        description = " API cho phép người dùng (ứng viên) lưu và truy xuất danh sách các công việc yêu thích đã lưu."
)
@RestController
@CrossOrigin

@RequestMapping("/workhub/api/v1/saved-jobs")
@RequiredArgsConstructor
public class SavedJobController {

    private final SavedJobService savedJobService;

    @Operation(
            summary = "<EndPoint cho trang của ứng viên > Lưu công việc",
            description = "Cho phép người dùng lưu một công việc vào danh sách đã lưu của họ."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lưu công việc thành công"),
            @ApiResponse(responseCode = "400", description = "Tham số đầu vào không hợp lệ"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy người dùng hoặc công việc")
    })
    @PostMapping
    public ResponseEntity<SavedJob> saveJob(
            @Parameter(description = "ID của người dùng (ứng viên)", required = true)
            @RequestParam Integer userId,

            @Parameter(description = "ID của công việc cần lưu", required = true)
            @RequestParam Integer jobId) {

        return ResponseEntity.ok(savedJobService.saveJob(userId, jobId));
    }

    @Operation(
            summary = "<EndPoint cho trang của ứng viên > Xóa công việc đã lưu",
            description = "Cho phép người dùng xóa một công việc khỏi danh sách đã lưu của họ."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Xóa công việc đã lưu thành công"),
            @ApiResponse(responseCode = "400", description = "Tham số đầu vào không hợp lệ"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy công việc đã lưu")
    })
    @DeleteMapping
    public ResponseEntity<Void> deleteSavedJob(
            @Parameter(description = "ID của người dùng (ứng viên)", required = true)
            @RequestParam Integer userId,

            @Parameter(description = "ID của công việc cần xóa khỏi danh sách đã lưu", required = true)
            @RequestParam Integer jobId) {

        savedJobService.deleteSavedJob(userId, jobId);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "<EndPoint cho trang của ứng viên >Lấy danh sách công việc đã lưu",
            description = "Truy xuất toàn bộ danh sách các công việc mà người dùng đã lưu."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách công việc đã lưu thành công"),
            @ApiResponse(responseCode = "400", description = "Tham số đầu vào không hợp lệ"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy người dùng")
    })
    @GetMapping
    public ResponseEntity<List<SavedJobDTO>> getSavedJobsForUser(
            @Parameter(description = "ID của người dùng cần lấy danh sách công việc đã lưu", required = true)
            @RequestParam Integer userId) {

        return ResponseEntity.ok(savedJobService.getSavedJobsForUser(userId));
    }
}
