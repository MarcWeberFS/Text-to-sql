package ch.zhaw.text_to_sql.service;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class QueryService {

    private final JdbcTemplate jdbcTemplate;

    public QueryService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> executeQuery(String sqlQuery) {
        try {
            return jdbcTemplate.queryForList(sqlQuery);
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of("error", "Error executing query: " + e.getMessage());
            return List.of(errorResponse);
        }
    }

    public int executeUpdate(String sql) {
        return jdbcTemplate.update(sql);
    }
}
