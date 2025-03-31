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
import ch.zhaw.text_to_sql.service.QueryExecutionService;
import ch.zhaw.text_to_sql.service.QueryService;
import ch.zhaw.text_to_sql.wrapper.QueryResponse;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;




@RestController
public class MainController {

    private QueryExecutionService queryExecutionService;

    private FavoriteService favoriteService;

    public MainController(QueryExecutionService queryExecutionService, FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
        this.queryExecutionService = queryExecutionService;
    }
    
    @RequestMapping("/")
    @ResponseBody
    public String requestMethodName() {
        return "Hello";
    }
    
    @PostMapping("/query")
    public QueryResponse runQuery(@RequestBody Map<String, String> request) {
        return queryExecutionService.handleQuery(
            request.get("prompt"),
            Boolean.parseBoolean(request.get("userFeedbackLoop")),
            Boolean.parseBoolean(request.get("syntaxFeedbackLoop")),
            Boolean.parseBoolean(request.get("allowEmptyResponse")),
            request.get("model")
        );
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
