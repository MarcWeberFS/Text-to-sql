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

    public String getResponse(String prompt, boolean userFeedbackLoop, boolean isFirstQuery, String response, List<Map<String, Object>> queryResult) {
        if (isFirstQuery) {
            prompt = promptBuildService.buildPrompt(prompt, userFeedbackLoop);
        } else {
            prompt = promptBuildService.buildRetryPrompt(prompt, response, queryResult);
        }
    
        List<Map<String, String>> messages = List.of(
            Map.of("role", "system", "content", "You are a helpful assistant."),
            Map.of("role", "user", "content", prompt)
        );
    
        Map<String, Object> requestBody = Map.of(
            "model", "deepseek-chat",
            "messages", messages,
            "temperature", 0.2
        );
    
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
