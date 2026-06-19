package com.querylab.api.application.usecases;

import com.querylab.api.domain.models.QueryResponse;
import com.querylab.api.domain.ports.QueryExecutor;
import org.springframework.stereotype.Service;

@Service
public class ExecuteSqlQueryUseCase {

    private final QueryExecutor queryExecutor;

    public ExecuteSqlQueryUseCase(QueryExecutor queryExecutor) {
        this.queryExecutor = queryExecutor;
    }

    public QueryResponse execute(String query) {
        if (query == null || query.trim().isEmpty()) {
            throw new IllegalArgumentException("Query must not be empty");
        }
        return queryExecutor.execute(query.trim());
    }
}
