package ch.zhaw.text_to_sql.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.Model;

import ch.zhaw.text_to_sql.util.QueryExtractor;
import jakarta.annotation.PostConstruct;

@Service
public class ClaudeService {

    @Value("${claude.api.key}")
    private String apiKey;

    private PromptBuildService promptBuildService;

    private AnthropicClient client;

    private String query;

    @PostConstruct
    public void init() {
        this.client = AnthropicOkHttpClient.builder().apiKey(apiKey).build();
    }


    public ClaudeService(PromptBuildService promptBuildService) {
        this.promptBuildService = promptBuildService;
    }

    public String getResponse (String prompt, boolean userFeedbackLoop, boolean isFirstQuery, String response, List<Map<String, Object>> queryResult) {

        System.out.println(apiKey);

        if (isFirstQuery) {
            prompt = promptBuildService.buildPrompt(prompt, userFeedbackLoop);
        } else {
            prompt = promptBuildService.buildRetryPrompt(prompt, response, queryResult);
        }

        MessageCreateParams params = MessageCreateParams.builder()
                .model(Model.CLAUDE_3_7_SONNET_20250219)
                .maxTokens(1000)
                .temperature(1.0)
                .system("You are a world-class SQL engineer with a focus on PostgreSQL with the PostGIS extion. Respond only with SQL queries in text format")
                .addUserMessage(prompt)
                .build();

        Message message = client.messages().create(params);
        System.out.println(message.content());
        query = QueryExtractor.extractSqlQuery(message.content().toString());
        return query;
    } 
}
