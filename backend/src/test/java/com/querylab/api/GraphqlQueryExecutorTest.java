package com.querylab.api;

import com.querylab.api.infrastructure.executors.GraphqlQueryExecutor;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class GraphqlQueryExecutorTest {

    @Test
    void parseSimpleQuery() {
        var parsed = GraphqlQueryExecutor.parse("{ movies { title year rating } }");
        assertEquals("movies", parsed.tableName());
        assertEquals(List.of("title", "year", "rating"), parsed.fields());
        assertTrue(parsed.args().isEmpty());
    }

    @Test
    void parseQueryWithArgs() {
        var parsed = GraphqlQueryExecutor.parse("{ users(id: 1) { name email } }");
        assertEquals("users", parsed.tableName());
        assertEquals(List.of("name", "email"), parsed.fields());
        assertEquals(Map.of("id", "1"), parsed.args());
    }

    @Test
    void parseQueryWithMultipleArgs() {
        var parsed = GraphqlQueryExecutor.parse("{ movies(genre: \"Action\", year: 2024) { title rating } }");
        assertEquals("movies", parsed.tableName());
        assertEquals(List.of("title", "rating"), parsed.fields());
        assertEquals(Map.of("genre", "Action", "year", "2024"), parsed.args());
    }

    @Test
    void parseQueryWithSingleField() {
        var parsed = GraphqlQueryExecutor.parse("{ subscriptions { plan } }");
        assertEquals("subscriptions", parsed.tableName());
        assertEquals(List.of("plan"), parsed.fields());
    }

    @Test
    void parseInvalidFormatThrows() {
        var ex = assertThrows(IllegalArgumentException.class,
            () -> GraphqlQueryExecutor.parse("SELECT * FROM movies"));
        assertTrue(ex.getMessage().contains("Formato de consulta GraphQL inválido"));
    }

    @Test
    void parseEmptyStringThrows() {
        assertThrows(IllegalArgumentException.class,
            () -> GraphqlQueryExecutor.parse("{}"));
    }

    @Test
    void parseExtraSpaces() {
        var parsed = GraphqlQueryExecutor.parse("  {  users  {  name  email  }  } ");
        assertEquals("users", parsed.tableName());
        assertEquals(List.of("name", "email"), parsed.fields());
    }

    @Test
    void buildSqlSimple() {
        var parsed = new GraphqlQueryExecutor.ParsedGraphQL("movies", List.of("title", "rating"), Map.of());
        String sql = GraphqlQueryExecutor.buildSql(parsed);
        assertEquals("SELECT title, rating FROM movies", sql);
    }

    @Test
    void buildSqlWithArgs() {
        var parsed = new GraphqlQueryExecutor.ParsedGraphQL("users", List.of("name", "email"), Map.of("id", "1"));
        String sql = GraphqlQueryExecutor.buildSql(parsed);
        assertEquals("SELECT name, email FROM users WHERE id = 1", sql);
    }

    @Test
    void buildSqlWithMultipleArgs() {
        var parsed = new GraphqlQueryExecutor.ParsedGraphQL("watch_history", List.of("movie_id", "progress_seconds"),
            Map.of("user_id", "5", "completed", "true"));
        String sql = GraphqlQueryExecutor.buildSql(parsed);
        assertTrue(sql.startsWith("SELECT movie_id, progress_seconds FROM watch_history WHERE "));
        assertTrue(sql.contains("user_id = 5"));
        assertTrue(sql.contains("completed = true"));
        assertTrue(sql.contains(" AND "));
    }
}
