package ch.zhaw.text_to_sql.controller;

import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
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
        return "Hello my homie";
    }
    
    @PostMapping("/query")
    public List<Map<String, Object>> runQuery(@RequestBody Map<String, String> request) {

        System.out.println("Request: " + request);

        if (request.get("model").contains("chatgpt")) {
            response = chatGPTService.getResponse(request.get("prompt"));
        }

        System.out.println("Response from ChatGPT: " + response);

        queryResult = queryService.executeQuery(response);

        System.out.println("Query result: " + queryResult);

        return queryService.executeQuery(response);
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
