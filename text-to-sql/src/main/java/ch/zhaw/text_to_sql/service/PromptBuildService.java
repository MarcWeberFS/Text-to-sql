package ch.zhaw.text_to_sql.service;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.core.io.Resource;

@Service
public class PromptBuildService {

    private Resource instruction;
    private Resource goldenTables;
    private Resource goldenQueries;
    StringBuilder prompt = new StringBuilder();

    public PromptBuildService(ResourceLoader resourceLoader) {
        this.instruction = resourceLoader.getResource("classpath:/templates/Instructions.txt");
        this.goldenTables = resourceLoader.getResource("classpath:/templates/GoldenTables.json");
        this.goldenQueries = resourceLoader.getResource("classpath:/templates/GoldenQueries.json");
    }

    public String buildPrompt(String userInput) {

        prompt.append(readFileContent(instruction)).append("\n\n")
              .append("Golden Tables: ").append(readFileContent(goldenTables)).append("\n\n")
              .append("Golden Queries: ").append(readFileContent(goldenQueries)).append("\n\n")
              .append("User Input: ").append(userInput).append("\n\n");

        return prompt.toString();
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
