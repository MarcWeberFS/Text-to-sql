package ch.zhaw.text_to_sql.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class BenchmarkResultService {
    private QueryService queryService;

    public BenchmarkResultService(QueryService queryService) {
        this.queryService = queryService;
    }

    public List<Map<String, Object>> getBenchmarkResults() {
        return queryService.executeQuery("select id, is_correct, llm, human_correction, benchmark_case_id from benchmark_results where run_number = 1 order by benchmark_case_id, llm");
    }

    public List<Map<String, Object>> getBenchmarkCase(int id) {
        return queryService.executeQuery("select * from benchmark_cases where id = " + id);
    }

    public List<Map<String, Object>> getBenchmarkCaseResult(int id) {
        return queryService.executeQuery("select * from benchmark_results where run_number = 1 and benchmark_case_id = " + id);
    }
}
