package ch.zhaw.text_to_sql.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import ch.zhaw.text_to_sql.wrapper.QueryResponse;

@Service
public class QueryExecutionService {
    
    private ChatGPTService chatGPTService;
    private QueryService queryService;

    public QueryExecutionService(ChatGPTService chatGPTService, QueryService queryService) {
        this.chatGPTService = chatGPTService;
        this.queryService = queryService;
    }
    

    public QueryResponse handleQuery (String prompt, boolean userFeedbackLoop, boolean syntaxFeedbackLoop, boolean allowEmptyResponse, boolean enablePromptBuilder, String model) {
        int i = 0;

        String response = null;
        List<Map<String, Object>> queryResult = new ArrayList<>();

        if (model.contains("chatgpt")) {
            response = chatGPTService.getResponse(prompt, userFeedbackLoop, true);
        }

        queryResult = queryService.executeQuery(response);

        if (allowEmptyResponse && queryResult.isEmpty()) {
            queryResult.add(Map.of("Info", "You have selected no data to be returned, please uncheck the checkbox 'Allow empty response' to get a response."));
        }

        // Retry loop
        while ((queryResult.isEmpty() || queryResult.get(0).containsKey("error")) && i < 5 && syntaxFeedbackLoop) {
            String retryPrompt = """
                The last SQL query did not return any data or had an error.

                Original prompt: "%s"
                Last query: "%s"
                Query result: "%s"

                Try a different approach. Maybe rephrase the condition, loosen filters, or use an alternative spatial method. 
                Respond ONLY with valid SQL. No code blocks, no extra text.
            """.formatted(prompt, response, queryResult);

            response = chatGPTService.getResponse(retryPrompt, userFeedbackLoop, enablePromptBuilder);
            queryResult = queryService.executeQuery(response);
            i++;
        }
        
        return new QueryResponse(response, i, i > 0, queryResult);  

    }
}
