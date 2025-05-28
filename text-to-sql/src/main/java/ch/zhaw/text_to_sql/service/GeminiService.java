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

import ch.zhaw.text_to_sql.util.QueryExtractor;

@Service
public class GeminiService {

    @Autowired
    private PromptBuildService promptBuildService;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    /**
     * Generates a response from the Gemini model based on the provided prompt.
     *
     * @param prompt The input prompt for the model.
     * @param userFeedbackLoop Indicates if user feedback is enabled.
     * @param isFirstQuery Indicates if this is the first query.
     * @param response The previous response from the model, if any.
     * @param queryResult The result of the previous query, if any.
     * @return The formatted response from the model.
     */
    public String getResponse(String prompt, boolean userFeedbackLoop, boolean isFirstQuery, String response, List<Map<String, Object>> queryResult) {

        // Decide which prompt should be built based on whether it's the first query or a retry
        if (isFirstQuery) {
            prompt = promptBuildService.buildPrompt(prompt, userFeedbackLoop);
        } else {
            prompt = promptBuildService.buildRetryPrompt(prompt, response, queryResult);
        }

        ObjectMapper objectMapper = new ObjectMapper();
        String escapedPrompt;
        try {
            escapedPrompt = objectMapper.writeValueAsString(prompt); 
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }

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

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiApiKey;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpClient client = HttpClient.newHttpClient();
        try {
            HttpResponse<String> httpResponse = client.send(request, HttpResponse.BodyHandlers.ofString());
            return QueryExtractor.extractSqlQuery(httpResponse.body());
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            return null;
        }
    }
    
}
