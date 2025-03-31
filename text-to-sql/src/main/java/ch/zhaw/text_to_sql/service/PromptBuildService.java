package ch.zhaw.text_to_sql.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.core.io.Resource;

@Service
public class PromptBuildService {

    private Resource instruction;
    private Resource goldenTables;
    private Resource retryInstructions;

    @Autowired
    private FavoriteService favoriteService;

    StringBuilder prompt = new StringBuilder();
    StringBuilder retryPrompt = new StringBuilder();

    public PromptBuildService(ResourceLoader resourceLoader) {
        this.instruction = resourceLoader.getResource("classpath:/templates/Instructions.txt");
        this.goldenTables = resourceLoader.getResource("classpath:/templates/GoldenTables.json");
        this.retryInstructions = resourceLoader.getResource("classpath:/templates/RetryInstructions.txt");
    }

    public String buildPrompt(String userInput, boolean userFeedbackLoop) {

        if (userFeedbackLoop) {
            prompt.append(readFileContent(instruction)).append("\n\n")
                .append("Golden Tables: ").append(readFileContent(goldenTables)).append("\n\n")
                .append("Golden Queries: ").append(favoriteService.getFavorites()).append("\n\n")
                .append("User Input: ").append(userInput).append("\n\n");
        } else {
            prompt.append(readFileContent(instruction)).append("\n\n")
                .append("Golden Tables: ").append(readFileContent(goldenTables)).append("\n\n")
                .append("User Input: ").append(userInput).append("\n\n");
        }

        return prompt.toString();
    }

    public String buildRetryPrompt (String prompt, String response, List<Map<String, Object>> queryResult) {
        retryPrompt.append(readFileContent(retryInstructions)).append("\n\n")
            .append("User Input: ").append(prompt).append("\n\n")
            .append("Response: ").append(response).append("\n\n")
            .append("Query Result: ").append(queryResult).append("\n\n");

        return retryPrompt.toString();
    }

    private String readFileContent(Resource resource) {
        try {
            return new String(resource.getInputStream().readAllBytes());
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}
