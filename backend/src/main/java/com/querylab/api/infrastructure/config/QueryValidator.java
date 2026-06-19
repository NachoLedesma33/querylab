package com.querylab.api.infrastructure.config;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Pattern;

@Component
public class QueryValidator {

    private static final List<Pattern> FORBIDDEN_PATTERNS = List.of(
        Pattern.compile(
            "(?i)\\b(DROP|ALTER|CREATE|INSERT|UPDATE|DELETE|TRUNCATE|REPLACE|MERGE|LOAD)\\s",
            Pattern.CASE_INSENSITIVE
        ),
        Pattern.compile(
            "(?i)\\b(EXEC|EXECUTE|CALL|xp_cmdshell|sp_)\\b",
            Pattern.CASE_INSENSITIVE
        ),
        Pattern.compile(
            "(?i)\\bSELECT\\s+.*?\\s+INTO\\s+",
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL
        ),
        Pattern.compile(
            "(?i)\\b(INFORMATION_SCHEMA|PG_CATALOG|SQLITE_MASTER|SQLITE_SEQUENCE|SYS\\.|MYSQL\\.|PG_)",
            Pattern.CASE_INSENSITIVE
        ),
        Pattern.compile(
            "/\\*!.*?\\*/",
            Pattern.DOTALL
        ),
        Pattern.compile(
            "(?i)\\b(SHUTDOWN|BACKUP|RESTORE|GRANT|REVOKE|DENY|KILL|RECONFIGURE|DBCC)\\b",
            Pattern.CASE_INSENSITIVE
        )
    );

    public void validate(String query) {
        String trimmed = query.trim();
        String upper = trimmed.toUpperCase();

        if (!upper.startsWith("SELECT")) {
            throw new SecurityException(
                "Only SELECT queries are allowed. " +
                "Your query starts with \"" + trimmed.substring(0, Math.min(20, trimmed.length())) + "...\" " +
                "which is not permitted for security reasons."
            );
        }

        for (Pattern pattern : FORBIDDEN_PATTERNS) {
            if (pattern.matcher(trimmed).find()) {
                String matched = extractMatch(pattern, trimmed);
                throw new SecurityException(
                    "Forbidden operation detected: \"" + matched + "\". " +
                    "This query lab only allows read-only SELECT queries. " +
                    "Destructive operations like DROP, ALTER, INSERT, etc. are blocked."
                );
            }
        }

        if (trimmed.length() > 10_000) {
            throw new SecurityException(
                "Query too long (" + trimmed.length() + " characters). " +
                "Maximum allowed is 10,000 characters."
            );
        }
    }

    private String extractMatch(Pattern pattern, String input) {
        var matcher = pattern.matcher(input);
        if (matcher.find()) {
            String match = matcher.group().trim();
            return match.length() > 40 ? match.substring(0, 40) + "..." : match;
        }
        return "<unknown>";
    }
}
