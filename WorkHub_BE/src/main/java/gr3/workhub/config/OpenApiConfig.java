package gr3.workhub.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@OpenAPIDefinition(
        info = @Info(
                title = "WorkHub API",
                version = "v1",
                description = "Hệ thống tuyển dụng với các API cho ứng viên, nhà tuyển dụng và admin",
                contact = @Contact(name = "Dev Team", email = "support@workhub.vn")
        ),
        servers = @Server(url = "http://localhost:8080", description = "Local Dev Server")
)
@Configuration
public class OpenApiConfig {
}
