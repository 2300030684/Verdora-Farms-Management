package com.dairycare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class DairyCareApplication {

	public static void main(String[] args) {
		SpringApplication.run(DairyCareApplication.class, args);
	}

    @Bean
    public CommandLineRunner run(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(255)");
                System.out.println("Successfully altered users role column to VARCHAR(255)");
            } catch (Exception e) {
                System.out.println("Failed to alter users role column: " + e.getMessage());
            }
        };
    }

}
