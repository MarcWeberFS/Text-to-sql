package ch.zhaw.text_to_sql.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.ChatCompletion;
import com.openai.models.ChatCompletionCreateParams;
import com.openai.models.ChatModel;
import com.openai.models.CompletionCreateParams.Prompt;

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

    public String getResponse(String prompt) {

        prompt = promptBuildService.buildPrompt(prompt);

        System.out.println("Prompt: " + prompt);
        
        ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
            .addUserMessage(prompt)
            .model(ChatModel.CHATGPT_4O_LATEST)
            .build();
        ChatCompletion chatCompletion = openAIClient.chat().completions().create(params);

        formattedChatGPTResponse = chatCompletion.choices().get(0).message().content().toString();

        formattedChatGPTResponse = formattedChatGPTResponse.replace("Optional[", "").replace("]", "");

        return formattedChatGPTResponse;
    }

}
