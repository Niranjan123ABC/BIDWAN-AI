package Bidyan_AI;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {
    "Bidyan_AI", "Controller", "Service", "Entity", "Repository"
})
@EnableJpaRepositories(basePackages = "Repository")
@EntityScan(basePackages = "Entity")
public class BidyanAiApplication {
    public static void main(String[] args) {
        SpringApplication.run(BidyanAiApplication.class, args);
    }
}