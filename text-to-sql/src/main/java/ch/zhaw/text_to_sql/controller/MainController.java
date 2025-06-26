package ch.zhaw.text_to_sql.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.text_to_sql.service.BenchmarkService;
import ch.zhaw.text_to_sql.service.FavoriteService;
import ch.zhaw.text_to_sql.service.QueryExecutionService;
import ch.zhaw.text_to_sql.wrapper.QueryResponse;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

/*
 * This is the main controller for handling all logical operations of the application.
 * It handles requests for running queries, saving and removing favorites, running benchmarks, and retrieving benchmark results.
 * The MainController is a RestController and can be accessed via HTTP requests over Postman.
 */
@RestController
public class MainController {

    private QueryExecutionService queryExecutionService;

    private FavoriteService favoriteService;

    private BenchmarkService benchmarkService;

    public MainController(QueryExecutionService queryExecutionService, FavoriteService favoriteService,
            BenchmarkService benchmarkService) {
        this.favoriteService = favoriteService;
        this.benchmarkService = benchmarkService;
        this.queryExecutionService = queryExecutionService;
    }

    @PostMapping("/query")
    public QueryResponse runQuery(@RequestBody Map<String, String> request) {
        return queryExecutionService.handleQuery(
                request.get("prompt"),
                Boolean.parseBoolean(request.get("userFeedbackLoop")),
                Boolean.parseBoolean(request.get("syntaxFeedbackLoop")),
                Boolean.parseBoolean(request.get("allowEmptyResponse")),
                request.get("model"));
    }

    @RequestMapping("/favorite")
    public ResponseEntity<Map<String, String>> saveFavorite(@RequestBody Map<String, String> request) {
        favoriteService.addFavorite(request);

        return ResponseEntity.ok(Map.of("message", "Favorite saved"));
    }

    @RequestMapping("/removeFavorite")
    public ResponseEntity<String> removeFavorite(@RequestParam int index) {
        favoriteService.removeFavorite(index);
        return ResponseEntity.ok("Favorite removed successfully");
    }

    @RequestMapping("/getFavorites")
    public List<Map<String, Object>> getFavorites() {
        return favoriteService.getFavorites();
    }

    /* Disabled benchmark, application is live and should not be used for benchmarking anymore.
    @GetMapping("/benchmark/test")
    public String runFirstBenchmarkTest(@RequestBody Map<String, String> request) {
        benchmarkService.runFirstBenchmarkCaseOnce(
                Boolean.parseBoolean(request.get("userFeedbackLoop")),
                Boolean.parseBoolean(request.get("syntaxFeedbackLoop")));
        return "First benchmark test executed for all LLMs.";
    }

    @GetMapping("/benchmark")
    @ResponseBody
    public String runBenchmark(@RequestBody Map<String, String> request) {
        benchmarkService.runAllBenchmarks(
                Boolean.parseBoolean(request.get("userFeedbackLoop")),
                Boolean.parseBoolean(request.get("syntaxFeedbackLoop")),
                Integer.parseInt(request.get("runNumber")));
        return "Running all benchmarks for all LLMs.";
    }
    */
}
