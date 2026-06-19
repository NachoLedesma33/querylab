package com.querylab.api.infrastructure.executors;

import com.querylab.api.domain.models.QueryResponse;
import com.querylab.api.domain.ports.QueryExecutor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class SqlQueryExecutor implements QueryExecutor {

    private final JdbcTemplate jdbcTemplate;

    public SqlQueryExecutor(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public QueryResponse execute(String query) {
        String trimmed = query.trim();
        if (!trimmed.toUpperCase().startsWith("SELECT")) {
            throw new IllegalArgumentException("Only SELECT queries are allowed");
        }

        long start = System.currentTimeMillis();

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(trimmed);

        long elapsed = System.currentTimeMillis() - start;

        List<String> tables = extractTables(trimmed);
        List<String> columns = extractColumns(trimmed);

        return new QueryResponse(rows, tables, columns, rows.size(), elapsed, "SQL");
    }

    List<String> extractTables(String sql) {
        List<String> tables = new ArrayList<>();
        Pattern pattern = Pattern.compile(
            "(?:FROM|JOIN|INTO|UPDATE|TABLE)\\s+([\"`]?\\w+[\"`]?(?:\\s+\\w+)?)",
            Pattern.CASE_INSENSITIVE
        );
        Matcher matcher = pattern.matcher(sql);
        while (matcher.find()) {
            String match = matcher.group(1).trim();
            String[] parts = match.split("\\s+");
            String table = parts[0].replaceAll("[\"`]", "");
            if (!tables.contains(table)) {
                tables.add(table);
            }
        }
        return tables;
    }

    List<String> extractColumns(String sql) {
        List<String> columns = new ArrayList<>();
        Pattern selectPattern = Pattern.compile(
            "SELECT\\s+(.+?)\\s+FROM",
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL
        );
        Matcher matcher = selectPattern.matcher(sql);
        if (matcher.find()) {
            String selectClause = matcher.group(1).trim();
            if (selectClause.equals("*")) {
                columns.add("*");
            } else {
                for (String col : selectClause.split(",")) {
                    String cleaned = col.trim().replaceAll("\\s+AS\\s+.*", "")
                        .replaceAll("(?i)\\s+as\\s+.*", "")
                        .replaceAll("[\"`]", "")
                        .trim();
                    if (!cleaned.isEmpty()) {
                        columns.add(cleaned);
                    }
                }
            }
        }
        return columns;
    }
}
