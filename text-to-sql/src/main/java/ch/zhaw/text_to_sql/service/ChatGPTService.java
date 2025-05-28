package ch.zhaw.text_to_sql.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.ChatCompletion;
import com.openai.models.ChatCompletionCreateParams;
import com.openai.models.ChatModel;

@Service
public class ChatGPTService {

    @Value("${openai.api.key}")
    private String apiKey;

    @Autowired
    private PromptBuildService promptBuildService;

    private String formattedChatGPTResponse;

    OpenAIClient openAIClient;

    public ChatGPTService(PromptBuildService promptBuildService,
            @Value("${openai.api.key}") String apiKey) {

        this.promptBuildService = promptBuildService;

        this.openAIClient = OpenAIOkHttpClient.builder()
                .apiKey(apiKey)
                .build();
    }

    /**
     * Generates a response from the OpenAI ChatGPT model based on the provided
     * prompt.
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

        ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
                .addUserMessage(prompt)
                .model(ChatModel.GPT_4O_MINI)
                .build();
        ChatCompletion chatCompletion = openAIClient.chat().completions().create(params);

        formattedChatGPTResponse = chatCompletion.choices().get(0).message().content().toString();

        formattedChatGPTResponse = formattedChatGPTResponse.replace("Optional[", "").replace("]", "")
                .replace("```sql", "").replace("```", "");

        return formattedChatGPTResponse;
    }

}
