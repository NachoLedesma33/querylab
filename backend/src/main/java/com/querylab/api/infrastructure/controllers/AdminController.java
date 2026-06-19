package com.querylab.api.infrastructure.controllers;

import com.querylab.api.infrastructure.config.RateLimitInterceptor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final DataSource dataSource;
    private final RateLimitInterceptor rateLimiter;

    public AdminController(DataSource dataSource, RateLimitInterceptor rateLimiter) {
        this.dataSource = dataSource;
        this.rateLimiter = rateLimiter;
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetDatabase() {
        try (var conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);

            ScriptUtils.executeSqlScript(conn, new ClassPathResource("schema.sql"));
            ScriptUtils.executeSqlScript(conn, new ClassPathResource("data.sql"));

            conn.commit();

            rateLimiter.reset();

            return ResponseEntity.ok(Map.of(
                "message", "Database reset successful! All schema and seed data have been restored."
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "message", "Failed to reset database: " + e.getMessage()
            ));
        }
    }
}
