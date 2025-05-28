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
    private DeepseekService deepseekService;
    private GrokService grokService;
    private QueryService queryService;

    public QueryExecutionService(ChatGPTService chatGPTService, QueryService queryService, GeminiService geminiService,
            ClaudeService claudeService, DeepseekService deepseekService, GrokService grokService) {
        this.grokService = grokService;
        this.deepseekService = deepseekService;
        this.chatGPTService = chatGPTService;
        this.queryService = queryService;
        this.geminiService = geminiService;
        this.claudeService = claudeService;
    }

    /**
     * Handles the query execution process, including sending the query to the LLM
     * and executing it against the database.
     * 
     * @param prompt             The natural language prompt to be processed.
     * @param userFeedbackLoop   Indicates if user feedback should be incorporated
     *                           in the query generation.
     * @param syntaxFeedbackLoop Indicates if syntax feedback should be incorporated
     *                           in the query generation.
     * @param allowEmptyResponse Indicates if an empty response is allowed.
     * @param model              The model to be used for processing the query
     *                           (e.g., chatgpt, gemini, claude, deepseek, grok).
     * @return A QueryResponse object containing the executed query, number of
     *         retries, whether it improved, and the result set.
     */
    public QueryResponse handleQuery(String prompt, boolean userFeedbackLoop, boolean syntaxFeedbackLoop,
            boolean allowEmptyResponse, String model) {

        response = sendQueryToLLM(model, prompt, userFeedbackLoop, true, response, queryResult);

        queryResult = queryService.executeQuery(response);

        if (allowEmptyResponse && queryResult.isEmpty()) {
            queryResult.add(Map.of("Info",
                    "You have selected no data to be returned, please uncheck the checkbox 'Allow empty response' to get a response."));
        }

        // Retry loop
        while ((queryResult.isEmpty() || queryResult.get(0).containsKey("error")) && i < 5 && syntaxFeedbackLoop) {
            response = sendQueryToLLM(model, prompt, userFeedbackLoop, false, response, queryResult);
            queryResult = queryService.executeQuery(response);
            i++;
        }

        return new QueryResponse(response, i, i > 0, queryResult);

    }

    /**
     * Sends the query to the specified LLM and retrieves the response.
     * 
     * @param model            The model to be used for processing the query.
     * @param prompt           The natural language prompt to be processed.
     * @param userFeedbackLoop Indicates if user feedback should be incorporated in
     *                         the query generation.
     * @param isFirstQuery     Indicates if this is the first query being sent.
     * @param response         The previous response from the model, if any.
     * @param queryResult      The result of the previous query, if any.
     * @return The response from the LLM after processing the prompt.
     */
    private String sendQueryToLLM(String model, String prompt, boolean userFeedbackLoop, boolean isFirstQuery,
            String response, List<Map<String, Object>> queryResult) {
        if (model.contains("chatgpt")) {
            response = chatGPTService.getResponse(prompt, userFeedbackLoop, isFirstQuery, response, queryResult);
        } else if (model.contains("gemini")) {
            response = geminiService.getResponse(prompt, userFeedbackLoop, isFirstQuery, response, queryResult);
        } else if (model.contains("claude")) {
            response = claudeService.getResponse(prompt, userFeedbackLoop, isFirstQuery, response, queryResult);
        } else if (model.contains("deepseek")) {
            response = deepseekService.getResponse(prompt, userFeedbackLoop, isFirstQuery, response, queryResult);
        } else if (model.contains("grok")) {
            response = grokService.getResponse(prompt, userFeedbackLoop, isFirstQuery, response, queryResult);
        } else {
            throw new IllegalArgumentException("Invalid model specified: " + model);
        }

        return response;
    }

}
