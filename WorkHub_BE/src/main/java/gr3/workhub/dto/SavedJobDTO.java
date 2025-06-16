package gr3.workhub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO để truyền thông tin công việc đã lưu về frontend
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SavedJobDTO {

    private Integer savedJobId; // ID của SavedJob object
    private Integer jobId;      // ID của công việc
    private String jobTitle;    // Tiêu đề công việc
    private String companyName; // Tên công ty
    private String location;    // Địa điểm
    // Có thể thêm các trường khác nếu cần từ entity Job, ví dụ: salaryRange, createdAt
    private String salaryRange;
    private String createdAt; // hoặc Date type nếu cần xử lý ngày tháng ở frontend

    // Constructor hoặc static method để convert từ SavedJob entity sang DTO
    // (Sẽ thêm logic mapping trong service)
} 