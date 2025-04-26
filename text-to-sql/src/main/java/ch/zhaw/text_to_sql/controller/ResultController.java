package ch.zhaw.text_to_sql.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.text_to_sql.service.BenchmarkResultService;

@RestController
public class ResultController {

    private BenchmarkResultService benchmarkResultService;

    public ResultController(BenchmarkResultService benchmarkResultService) {
        this.benchmarkResultService = benchmarkResultService;
    }
    
    @RequestMapping("/getBenchmarkResults")
    public List<Map<String, Object>> getBenchmarkResults() {
        return benchmarkResultService.getBenchmarkResults();
    }

    @RequestMapping("/case/{id}")
    public List<Map<String, Object>> getBenchmarkCase(@RequestParam int id) {
        return benchmarkResultService.getBenchmarkCase(id);
    }

    @RequestMapping("/caseResult/{id}")
    public List<Map<String, Object>> getBenchmarkCaseResult(@RequestParam int id) {
        return benchmarkResultService.getBenchmarkCaseResult(id);
    }
}
