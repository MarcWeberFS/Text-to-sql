package ch.zhaw.text_to_sql.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseEntity.BodyBuilder;
import org.springframework.stereotype.Service;

@Service
public class FavoriteService {

    private QueryService queryService;

    public FavoriteService(QueryService queryService) {
        this.queryService = queryService;
    }

    public BodyBuilder addFavorite(Map<String, String> request) {
        String queryText = request.get("query").replace("'", "''");
        String sqlText = request.get("sql").replace("'", "''");

        String insertQuery = "INSERT INTO favorites (query, sql) VALUES ('" 
            + queryText + "', '" 
            + sqlText + "')";

        try {
            queryService.executeUpdate(insertQuery);
            return ResponseEntity.ok();
        } catch (Exception e) {
            System.out.println("Error inserting favorite: " + e.getMessage());
            return ResponseEntity.status(500);
        }
    }

    public BodyBuilder removeFavorite(int index) {
        try {
            queryService.executeQuery("DELETE FROM favorites WHERE id = " + index);
            return ResponseEntity.ok();
        } catch (Exception e) {
            System.out.println("Error removing favorite: " + e.getMessage());
            return ResponseEntity.status(500);
        }
    }

    public List<Map<String, Object>> getFavorites() {
        return queryService.executeQuery("SELECT * FROM favorites");
    }
    
}
