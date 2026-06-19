package com.querylab.api.infrastructure.controllers;

import com.querylab.api.domain.models.QueryResponse;
import com.querylab.api.domain.ports.QueryExecutor;
import com.querylab.api.infrastructure.executors.GraphqlQueryExecutor;
import com.querylab.api.infrastructure.executors.SqlQueryExecutor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/query")
public class QueryController {

    private final SqlQueryExecutor sqlExecutor;
    private final GraphqlQueryExecutor graphqlExecutor;

    public QueryController(SqlQueryExecutor sqlExecutor, GraphqlQueryExecutor graphqlExecutor) {
        this.sqlExecutor = sqlExecutor;
        this.graphqlExecutor = graphqlExecutor;
    }

    @PostMapping("/execute")
    public ResponseEntity<?> execute(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        String dialect = request.getOrDefault("dialect", "SQL");

        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Query must not be empty"));
        }

        try {
            QueryExecutor executor = switch (dialect.toUpperCase()) {
                case "GRAPHQL" -> graphqlExecutor;
                default -> sqlExecutor;
            };
            QueryResponse response = executor.execute(query.trim());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }
}
