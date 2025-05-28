package ch.zhaw.text_to_sql.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.text_to_sql.service.BenchmarkResultService;

/*
 * This is the ResultController for handling all requests related to benchmark results.
 * All of the methods are get requests only, as they are used to retrieve data from the database.
 * The ResultController is a RestController and can be accessed via HTTP requests over Postman.
 */

@RestController
@RequestMapping("/benchmark")
public class ResultController {

    private BenchmarkResultService benchmarkResultService;

    public ResultController(BenchmarkResultService benchmarkResultService) {
        this.benchmarkResultService = benchmarkResultService;
    }

    @RequestMapping("/getResults/{runNumber}")
    public List<Map<String, Object>> getBenchmarkResults(@PathVariable int runNumber) {
        return benchmarkResultService.getBenchmarkResults(runNumber);
    }

    @RequestMapping("/case/{id}")
    public List<Map<String, Object>> getBenchmarkCase(@PathVariable int id) {
        return benchmarkResultService.getBenchmarkCase(id);
    }

    @RequestMapping("/caseResult/{id}")
    @ResponseBody
    public List<Map<String, Object>> getBenchmarkCaseResult(@PathVariable int id, @RequestParam int runNumber) {
        return benchmarkResultService.getBenchmarkCaseResult(id, runNumber);
    }

    @RequestMapping("/totalCorrect")
    public List<Map<String, Object>> getTotalCorrect() {
        return benchmarkResultService.getTotalCorrect();
    }

    @RequestMapping("/getResponsetime")
    public List<Map<String, Object>> requestMethodName() {
        return benchmarkResultService.getResponsetime();
    }

    @RequestMapping("/getFastestAndSlowestResponsetime")
    public List<Map<String, Object>> getFastestAndSlowestResponsetime() {
        return benchmarkResultService.getFastestAndSlowestResponsetime();
    }

    @RequestMapping("/getCorrectionCount")
    public List<Map<String, Object>> getCorrectionCount() {
        return benchmarkResultService.getCorrectionCount();
    }

    @RequestMapping("/getResponseTimeTrueFalse")
    public List<Map<String, Object>> getResponseTimeTrueFalse() {
        return benchmarkResultService.getResponseTimeTrueFalse();
    }

    @RequestMapping("/getCountFalseIssueTypes")
    public List<Map<String, Object>> getCountFalseIssueTypes() {
        return benchmarkResultService.getCountFalseIssueTypes();
    }
    
    @RequestMapping("/getCountTrueIssueTypes")
    public List<Map<String, Object>> getCountTrueIssueTypes() {
        return benchmarkResultService.getCountTrueIssueTypes();
    }

    @RequestMapping("getTotalStats")
    public Map<String, Object> getTotalStats() {
        return benchmarkResultService.getTotalStats();
    }
}

