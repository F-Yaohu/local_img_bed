package com.example.local_img_bed.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.nio.charset.StandardCharsets;
import java.util.logging.Logger;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger logger = Logger.getLogger(DatabaseInitializer.class.getName());

    private final JdbcTemplate jdbcTemplate;

    public DatabaseInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        // Check if the 'category' table exists to prevent re-initialization
        try {
            jdbcTemplate.queryForObject("SELECT 1 FROM category LIMIT 1", Integer.class);
            logger.info("Database already initialized. Skipping schema creation.");
        } catch (Exception e) {
            logger.info("Database not initialized. Creating schema...");
            // Read SQL script from classpath
            ClassPathResource resource = new ClassPathResource("db/init/initial_schema.sql");
            String sql = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);

            // Execute SQL script
            jdbcTemplate.execute(sql);
            logger.info("Database schema created successfully.");
        }
    }
}
