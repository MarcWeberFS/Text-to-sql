package ch.zhaw.text_to_sql.service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class GeminiService {

    @Autowired
    private PromptBuildService promptBuildService;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public String getResponse(String prompt, boolean userFeedbackLoop, boolean isFirstQuery, String response, List<Map<String, Object>> queryResult) {

        // 1. Build the final prompt
        if (isFirstQuery) {
            prompt = promptBuildService.buildPrompt(prompt, userFeedbackLoop);
        } else {
            prompt = promptBuildService.buildRetryPrompt(prompt, response, queryResult);
        }

        // 2. Escape prompt properly using Jackson
        ObjectMapper objectMapper = new ObjectMapper();
        String escapedPrompt;
        try {
            escapedPrompt = objectMapper.writeValueAsString(prompt); // includes quotes
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }

        // 3. Build request body
        String requestBody = """
            {
              "contents": [
                {
                  "parts": [
                    {
                      "text": %s
                    }
                  ]
                }
              ]
            }
        """.formatted(escapedPrompt);

        System.out.println("Sending request with body:");
        System.out.println(requestBody);

        // 4. Build and send HTTP request
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiApiKey;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpClient client = HttpClient.newHttpClient();
        try {
            HttpResponse<String> httpResponse = client.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("Response: " + httpResponse.body());
            return extractSqlFromResponse(httpResponse.body());
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            return null;
        }
    }

    //AI generated SQL extraction
    private String extractSqlFromResponse(String json) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            Map<?, ?> responseMap = objectMapper.readValue(json, Map.class);
    
            List<?> candidates = (List<?>) responseMap.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
                Map<?, ?> content = (Map<?, ?>) firstCandidate.get("content");
                List<?> parts = (List<?>) content.get("parts");
    
                if (parts != null && !parts.isEmpty()) {
                    Map<?, ?> part = (Map<?, ?>) parts.get(0);
                    String text = (String) part.get("text");
    
                    // Clean markdown ```sql block
                    return text
                        .replaceAll("(?i)```sql", "")
                        .replaceAll("```", "")
                        .trim();
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
    
}
