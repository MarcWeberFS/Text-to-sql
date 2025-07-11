package ch.zhaw.text_to_sql.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import ch.zhaw.text_to_sql.util.QueryExtractor;
import ch.zhaw.text_to_sql.wrapper.ChatMessage;
import ch.zhaw.text_to_sql.wrapper.ChatRequest;

import java.util.List;
import java.util.Map;

@Service
public class GrokService {

    @Value("${grok.api.key}")
    private String apiKey;

    private final WebClient webClient;
    private final PromptBuildService promptBuildService;

    public GrokService(PromptBuildService promptBuildService) {
        this.promptBuildService = promptBuildService;
        this.webClient = WebClient.builder()
                .baseUrl("https://api.x.ai/v1")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    /**
     * Generates a response from the Grok model based on the provided prompt.
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

        List<ChatMessage> messages = List.of(
                new ChatMessage("system", "You are a helpful assistant."),
                new ChatMessage("user", prompt));

        ChatRequest request = new ChatRequest("grok-2-latest", messages, false, 0.0f);

        String result = webClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return QueryExtractor.extractSqlQuery(result);
    }
}
