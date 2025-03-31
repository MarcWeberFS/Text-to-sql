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

    public String getResponse(String prompt, boolean userFeedbackLoop, boolean promptBuilderEnabled, String response, List<Map<String, Object>> queryResult) {

        if (promptBuilderEnabled) {
            prompt = promptBuildService.buildPrompt(prompt, userFeedbackLoop);
        } else {
            prompt = promptBuildService.buildRetryPrompt(prompt, response, queryResult);
        }
        
        ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
            .addUserMessage(prompt)
            .model(ChatModel.GPT_4O)
            .build();
        ChatCompletion chatCompletion = openAIClient.chat().completions().create(params);

        formattedChatGPTResponse = chatCompletion.choices().get(0).message().content().toString();

        formattedChatGPTResponse = formattedChatGPTResponse.replace("Optional[", "").replace("]", "").replace("```sql", "").replace("```", "");

        return formattedChatGPTResponse;
    }

}
