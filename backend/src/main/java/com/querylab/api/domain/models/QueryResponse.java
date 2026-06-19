package com.querylab.api.domain.models;

import java.util.List;
import java.util.Map;

public record QueryResponse(
    List<Map<String, Object>> result,
    List<String> tables,
    List<String> columns,
    int rows,
    long executionTimeMs,
    String dialect
) {}
