package com.querylab.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class QueryControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void executeSimpleSqlQuery() throws Exception {
        String body = """
            {
                "query": "SELECT * FROM movies LIMIT 5",
                "dialect": "SQL",
                "sqlDialect": "H2"
            }
            """;

        mockMvc.perform(post("/api/v1/query/execute")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.dialect").value("SQL"))
            .andExpect(jsonPath("$.tables[0]").value("movies"))
            .andExpect(jsonPath("$.result").isArray())
            .andExpect(jsonPath("$.rows").isNumber())
            .andExpect(jsonPath("$.executionTimeMs").isNumber());
    }

    @Test
    void executeGraphqlQuery() throws Exception {
        String body = """
            {
                "query": "{ movies { title rating } }",
                "dialect": "GraphQL"
            }
            """;

        mockMvc.perform(post("/api/v1/query/execute")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.dialect").value("GraphQL"))
            .andExpect(jsonPath("$.tables[0]").value("movies"))
            .andExpect(jsonPath("$.result").isArray());
    }

    @Test
    void executeWithLimitInjectsDefaultLimit() throws Exception {
        String body = """
            {
                "query": "SELECT * FROM users",
                "dialect": "SQL"
            }
            """;

        mockMvc.perform(post("/api/v1/query/execute")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.rows").value(12));
    }

    @Test
    void executeBlockedQueryReturnsBadRequest() throws Exception {
        String body = """
            {
                "query": "DROP TABLE movies",
                "dialect": "SQL"
            }
            """;

        mockMvc.perform(post("/api/v1/query/execute")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").isString())
            .andExpect(jsonPath("$.message").value(
                org.hamcrest.Matchers.startsWith("\u26A0 Seguridad:")));
    }

    @Test
    void executeEmptyQueryReturnsBadRequest() throws Exception {
        String body = """
            {
                "query": "",
                "dialect": "SQL"
            }
            """;

        mockMvc.perform(post("/api/v1/query/execute")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void executePostgresqlDialect() throws Exception {
        String body = """
            {
                "query": "SELECT * FROM movies LIMIT 5",
                "dialect": "SQL",
                "sqlDialect": "PostgreSQL"
            }
            """;

        mockMvc.perform(post("/api/v1/query/execute")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.rows").value(5));
    }

    @Test
    void executeWithColumnsResolved() throws Exception {
        String body = """
            {
                "query": "SELECT * FROM subscriptions",
                "dialect": "SQL"
            }
            """;

        mockMvc.perform(post("/api/v1/query/execute")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.columns.length()").isNumber())
            .andExpect(jsonPath("$.columns").isArray());
    }
}
