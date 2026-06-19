package com.querylab.api.infrastructure.executors;

import com.querylab.api.domain.models.QueryResponse;
import com.querylab.api.domain.ports.QueryExecutor;
import com.querylab.api.infrastructure.config.QueryValidator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class GraphqlQueryExecutor implements QueryExecutor {

    private final JdbcTemplate jdbcTemplate;
    private final QueryValidator validator;

    public GraphqlQueryExecutor(JdbcTemplate jdbcTemplate, QueryValidator validator) {
        this.jdbcTemplate = jdbcTemplate;
        this.validator = validator;
    }

    @Override
    public QueryResponse execute(String query) {
        ParsedGraphQL parsed = parse(query);
        String sql = buildSql(parsed);

        validator.validate(sql);

        long start = System.currentTimeMillis();

        List<Map<String, Object>> rows;
        try {
            rows = jdbcTemplate.queryForList(sql);
        } catch (Exception e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("timeout")) {
                throw new IllegalArgumentException(
                    "Query timed out. Try selecting fewer fields or adding filters."
                );
            }
            throw new IllegalArgumentException(
                "Error executing GraphQL query: " + (msg != null ? msg : "Unknown error")
            );
        }

        long elapsed = System.currentTimeMillis() - start;

        List<String> tables = List.of(parsed.tableName);
        List<String> columns = parsed.fields;

        if (!rows.isEmpty()) {
            columns = new ArrayList<>(rows.get(0).keySet());
        }

        return new QueryResponse(rows, tables, columns, rows.size(), elapsed, "GraphQL");
    }

    static ParsedGraphQL parse(String query) {
        String trimmed = query.trim();

        Pattern queryPattern = Pattern.compile(
            "\\{\\s*(\\w+)\\s*" +
            "(?:\\(([^)]+)\\))?" +
            "\\s*\\{([^}]+)\\}\\s*\\}",
            Pattern.DOTALL
        );
        Matcher matcher = queryPattern.matcher(trimmed);
        if (!matcher.matches()) {
            throw new IllegalArgumentException(
                "Invalid GraphQL query format.\n\n" +
                "Expected: { tableName { field1 field2 } }\n" +
                "Example: { movies { title year } }\n" +
                "With filter: { users(id: 1) { name email } }"
            );
        }

        String tableName = matcher.group(1);
        String argsPart = matcher.group(2);
        String fieldsPart = matcher.group(3).trim();

        List<String> fields = new ArrayList<>();
        Map<String, String> args = new HashMap<>();

        for (String token : fieldsPart.split("\\s+")) {
            String cleaned = token.trim();
            if (!cleaned.isEmpty()) {
                fields.add(cleaned);
            }
        }

        if (argsPart != null && !argsPart.trim().isEmpty()) {
            String[] pairs = argsPart.split(",");
            for (String pair : pairs) {
                String[] kv = pair.split(":");
                if (kv.length == 2) {
                    String key = kv[0].trim();
                    String value = kv[1].trim().replaceAll("[\"']", "");
                    args.put(key, value);
                }
            }
        }

        return new ParsedGraphQL(tableName, fields, args);
    }

    static String buildSql(ParsedGraphQL parsed) {
        String cols = String.join(", ", parsed.fields);
        String sql = "SELECT " + cols + " FROM " + parsed.tableName;

        if (!parsed.args.isEmpty()) {
            List<String> conditions = new ArrayList<>();
            for (Map.Entry<String, String> entry : parsed.args.entrySet()) {
                conditions.add(entry.getKey() + " = " + entry.getValue());
            }
            sql += " WHERE " + String.join(" AND ", conditions);
        }

        return sql;
    }

    static record ParsedGraphQL(String tableName, List<String> fields, Map<String, String> args) {}
}
