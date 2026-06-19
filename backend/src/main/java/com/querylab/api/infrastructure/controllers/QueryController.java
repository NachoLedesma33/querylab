package com.querylab.api.infrastructure.controllers;

import com.querylab.api.application.usecases.ExecuteSqlQueryUseCase;
import com.querylab.api.domain.models.QueryResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/query")
public class QueryController {

    private final ExecuteSqlQueryUseCase executeSqlQueryUseCase;

    public QueryController(ExecuteSqlQueryUseCase executeSqlQueryUseCase) {
        this.executeSqlQueryUseCase = executeSqlQueryUseCase;
    }

    @PostMapping("/execute")
    public ResponseEntity<?> execute(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        try {
            QueryResponse response = executeSqlQueryUseCase.execute(query);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }
}
