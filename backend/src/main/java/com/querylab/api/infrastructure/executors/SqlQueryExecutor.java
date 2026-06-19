package com.querylab.api.infrastructure.executors;

import com.querylab.api.domain.models.QueryResponse;
import com.querylab.api.domain.ports.QueryExecutor;
import com.querylab.api.infrastructure.config.QueryValidator;
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
    private final QueryValidator validator;

    private static final int MAX_ROWS = 1000;
    private static final int QUERY_TIMEOUT_SECONDS = 10;

    private static final Pattern HAS_LIMIT = Pattern.compile(
        "\\bLIMIT\\s+\\d+", Pattern.CASE_INSENSITIVE
    );

    private static final Map<String, String> H2_MODES = Map.of(
        "MYSQL", "MySQL",
        "POSTGRESQL", "PostgreSQL",
        "SQLSERVER", "MSSQLServer",
        "ORACLE", "Oracle"
    );

    private String currentDialect = "H2";

    public SqlQueryExecutor(JdbcTemplate jdbcTemplate, QueryValidator validator) {
        this.jdbcTemplate = jdbcTemplate;
        this.validator = validator;
    }

    @Override
    public QueryResponse execute(String query) {
        return execute(query, "H2");
    }

    @Override
    public QueryResponse execute(String query, String sqlDialect) {
        String trimmed = query.trim();

        validator.validate(trimmed);

        applyDialect(sqlDialect);

        String safeQuery = enforceLimit(trimmed);

        long start = System.currentTimeMillis();

        List<Map<String, Object>> rows;
        try {
            rows = jdbcTemplate.queryForList(safeQuery);
        } catch (Exception e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("timeout")) {
                throw new IllegalArgumentException(
                    "La consulta agotó el tiempo de espera (" + QUERY_TIMEOUT_SECONDS + " segundos). " +
                    "Intentá simplificarla o agregar una cláusula LIMIT."
                );
            }
            throw new IllegalArgumentException(
                "Error al ejecutar la consulta SQL: " + (msg != null ? msg : "Error desconocido")
            );
        }

        long elapsed = System.currentTimeMillis() - start;

        List<String> tables = extractTables(trimmed);
        List<String> columns = extractColumns(trimmed);

        if (columns.size() == 1 && columns.get(0).equals("*") && !rows.isEmpty()) {
            columns = new ArrayList<>(rows.get(0).keySet());
        }

        return new QueryResponse(rows, tables, columns, rows.size(), elapsed, "SQL");
    }

    private void applyDialect(String sqlDialect) {
        if (sqlDialect == null) sqlDialect = "H2";
        String key = sqlDialect.toUpperCase();

        if (key.equals(currentDialect)) return;

        String h2Mode = H2_MODES.get(key);
        if (h2Mode != null) {
            jdbcTemplate.execute("SET MODE " + h2Mode);
        } else {
            jdbcTemplate.execute("SET MODE Regular");
        }
        currentDialect = key;
    }

    String enforceLimit(String sql) {
        if (HAS_LIMIT.matcher(sql).find()) {
            return sql;
        }
        if (sql.endsWith(";")) {
            sql = sql.substring(0, sql.length() - 1);
        }
        return sql + " LIMIT " + MAX_ROWS;
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
