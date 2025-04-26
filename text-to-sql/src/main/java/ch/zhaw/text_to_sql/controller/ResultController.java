package ch.zhaw.text_to_sql.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.text_to_sql.service.BenchmarkResultService;


@RestController
@RequestMapping("/benchmark")
public class ResultController {

    private BenchmarkResultService benchmarkResultService;

    public ResultController(BenchmarkResultService benchmarkResultService) {
        this.benchmarkResultService = benchmarkResultService;
    }

    @RequestMapping("/getResults")
    public List<Map<String, Object>> getBenchmarkResults() {
        return benchmarkResultService.getBenchmarkResults();
    }

    @RequestMapping("/case/{id}")
    public List<Map<String, Object>> getBenchmarkCase(@PathVariable int id) {
        return benchmarkResultService.getBenchmarkCase(id);
    }

    @RequestMapping("/caseResult/{id}")
    public List<Map<String, Object>> getBenchmarkCaseResult(@PathVariable int id) {
        return benchmarkResultService.getBenchmarkCaseResult(id);
    }

    @RequestMapping("/getResponsetime")
    public List<Map<String, Object>> requestMethodName() {
        return benchmarkResultService.getResponsetime();
    }
    
}

