package ch.zhaw.text_to_sql.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import ch.zhaw.text_to_sql.util.QueryExtractor;

import java.util.List;
import java.util.Map;

@Service
public class DeepseekService {

    @Value("${deepseek.api.key}")
    private String apiKey;

    private PromptBuildService promptBuildService;

    private final WebClient webClient;

    public DeepseekService(PromptBuildService promptBuildService) {
        this.promptBuildService = promptBuildService;
        this.webClient = WebClient.builder()
                .baseUrl("https://api.deepseek.com/v1")
                .defaultHeader("Content-Type", "application/json")
                .build();

    }

    /**
     * Generates a response from the DeepSeek model based on the provided prompt.
     *
     * @param prompt           The input prompt for the model.
     * @param userFeedbackLoop Indicates if user feedback is enabled.
     * @param isFirstQuery     Indicates if this is the first query.
     * @param response         The previous response from the model, if any.
     * @param queryResult      The result of the previous query, if any.
     * @return The formatted response from the model.
     */
    public String getResponse(String prompt, boolean userFeedbackLoop, boolean isFirstQuery, String response,
            List<Map<String, Object>> queryResult) {

        // Decide which prompt should be built based on whether it's the first query or
        // a retry
        if (isFirstQuery) {
            prompt = promptBuildService.buildPrompt(prompt, userFeedbackLoop);
        } else {
            prompt = promptBuildService.buildRetryPrompt(prompt, response, queryResult);
        }

        List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content", "You are a helpful assistant."),
                Map.of("role", "user", "content", prompt));

        Map<String, Object> requestBody = Map.of(
                "model", "deepseek-chat",
                "messages", messages,
                "temperature", 0.2);

        try {
            String result = webClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            System.out.println("DeepSeek raw response: " + result);
            return QueryExtractor.extractSqlQuery(result);

        } catch (Exception e) {
            System.err.println(" DeepSeek API call failed: " + e.getMessage());
            return null;
        }
    }

}
