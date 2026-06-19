package com.querylab.api.domain.ports;

import com.querylab.api.domain.models.QueryResponse;

public interface QueryExecutor {
    QueryResponse execute(String query);
}
