package ch.zhaw.text_to_sql.controller;

import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseEntity.BodyBuilder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.openai.client.okhttp.OkHttpClient;
import com.openai.models.ChatCompletion;

import ch.zhaw.text_to_sql.service.ChatGPTService;
import ch.zhaw.text_to_sql.service.FavoriteService;
import ch.zhaw.text_to_sql.service.QueryService;
import ch.zhaw.text_to_sql.wrapper.QueryResponse;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;




@RestController
public class MainController {

    private QueryService queryService;

    private ChatGPTService chatGPTService;

    private FavoriteService favoriteService;

    private String response;

    private List<Map<String, Object>> queryResult;

    public MainController(QueryService queryService, ChatGPTService chatGPTService, FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
        this.chatGPTService = chatGPTService;
        this.queryService = queryService;
    }
    
    @RequestMapping("/")
    @ResponseBody
    public String requestMethodName() {
        return "Hello";
    }
    
    @PostMapping("/query")
    public QueryResponse runQuery(@RequestBody Map<String, String> request) {
        int i = 0;
        String prompt = request.get("prompt");
        String model = request.get("model");
        boolean userFeedbackLoop = Boolean.parseBoolean(request.get("userFeedbackLoop"));
        boolean syntaxFeedbackLoop = Boolean.parseBoolean(request.get("syntaxFeedbackLoop"));
        boolean allowEmptyResponse = Boolean.parseBoolean(request.get("allowEmptyResponse"));
        boolean enablePromptBuilder = false;

        System.out.println("Request: " + request);

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

        boolean improved = i > 0;

        return new QueryResponse(response, i, improved, queryResult);
    }


    @RequestMapping("/favorite")
    public BodyBuilder saveFavorite(@RequestBody Map<String, String> request) {
        return favoriteService.addFavorite(request);
    }

    @RequestMapping("/removeFavorite")
    @ResponseBody
    public BodyBuilder removeFavorite(@RequestParam int index) {
        return favoriteService.removeFavorite(index);
    }

    @RequestMapping("/getFavorites")
    public List<Map<String, Object>> getFavorites() {
        return favoriteService.getFavorites();
    }
    
}
