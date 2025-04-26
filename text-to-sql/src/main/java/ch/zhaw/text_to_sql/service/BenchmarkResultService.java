package ch.zhaw.text_to_sql.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.anthropic.models.beta.messages.batches.BatchListPage.Response;

import ch.zhaw.text_to_sql.util.ResponseSanitizer;

@Service
public class BenchmarkResultService {
    private QueryService queryService;
    private ResponseSanitizer responseSanitizer = new ResponseSanitizer();

    public BenchmarkResultService(QueryService queryService) {
        this.queryService = queryService;
    }

    public List<Map<String, Object>> getBenchmarkResults() {
        return queryService.executeQuery("select id, is_correct, llm, human_correction, benchmark_case_id from benchmark_results where run_number = 1 order by benchmark_case_id, llm");
    }

    public List<Map<String, Object>> getBenchmarkCase(int id) {
        return responseSanitizer.sanitizeResult(queryService.executeQuery("select * from benchmark_cases where id = " + id));
    }

    public List<Map<String, Object>> getBenchmarkCaseResult(int id) {
        return  responseSanitizer.sanitizeResult(queryService.executeQuery("select * from benchmark_results where run_number = 1 and benchmark_case_id = " + id));
    }
}
