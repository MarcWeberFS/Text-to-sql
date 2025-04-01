package ch.zhaw.text_to_sql.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import ch.zhaw.text_to_sql.wrapper.QueryResponse;

@Service
public class QueryExecutionService {
    
    private int i = 0;
    private String response = null;
    private List<Map<String, Object>> queryResult = new ArrayList<>();

    private ChatGPTService chatGPTService;
    private GeminiService geminiService;
    private ClaudeService claudeService;
    private QueryService queryService;

    public QueryExecutionService(ChatGPTService chatGPTService, QueryService queryService, GeminiService geminiService, ClaudeService claudeService) {
        this.chatGPTService = chatGPTService;
        this.queryService = queryService;
        this.geminiService = geminiService;
        this.claudeService = claudeService;
    }
    

    public QueryResponse handleQuery (String prompt, boolean userFeedbackLoop, boolean syntaxFeedbackLoop, boolean allowEmptyResponse, String model) {

        response = sendQueryToLLM(model, prompt, userFeedbackLoop, true, response, queryResult);

        queryResult = queryService.executeQuery(response);

        if (allowEmptyResponse && queryResult.isEmpty()) {
            queryResult.add(Map.of("Info", "You have selected no data to be returned, please uncheck the checkbox 'Allow empty response' to get a response."));
        }

        // Retry loop
        while ((queryResult.isEmpty() || queryResult.get(0).containsKey("error")) && i < 5 && syntaxFeedbackLoop) {
            response = sendQueryToLLM(model, prompt, userFeedbackLoop, false, response, queryResult);
            queryResult = queryService.executeQuery(response);
            i++;
        }
        
        return new QueryResponse(response, i, i > 0, queryResult);  

    }

    private String sendQueryToLLM(String model, String prompt, boolean userFeedbackLoop, boolean isFirstQuery, String response, List<Map<String, Object>> queryResult) {
        if (model.contains("chatgpt")) {
            response = chatGPTService.getResponse(prompt, userFeedbackLoop, isFirstQuery, response, queryResult);
        } else if (model.contains("gemini")) {
            response = geminiService.getResponse(prompt, userFeedbackLoop, isFirstQuery, response, queryResult);
        } else if (model.contains("claude")) {
            response = claudeService.getResponse(prompt, userFeedbackLoop, isFirstQuery, response, queryResult);
        }
        return response;
    }

}
