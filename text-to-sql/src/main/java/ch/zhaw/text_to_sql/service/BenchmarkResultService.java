package ch.zhaw.text_to_sql.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

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

    public List<Map<String, Object>> getResponsetime() {
        return queryService.executeQuery("SELECT\n" + 
                        " llm,\n" + 
                        " AVG(response_time_ms) AS avg_response_time_ms\n" + 
                        "FROM benchmark_results\n" + 
                        "WHERE run_number = 1\n" +
                        "GROUP BY llm\n" + 
                        "ORDER BY avg_response_time_ms ASC;");
    }

    public List<Map<String, Object>> getFastestAndSlowestResponsetime() {
        return queryService.executeQuery(
            "( " +
            "SELECT 'fastest' AS type, llm, response_time_ms " +
            "FROM benchmark_results " +
            "WHERE run_number = 1 " +
            "ORDER BY response_time_ms ASC " +
            "LIMIT 1 " +
            ") " +
            "UNION ALL " +
            "( " +
            "SELECT 'slowest' AS type, llm, response_time_ms " +
            "FROM benchmark_results " +
            "WHERE run_number = 1 " +
            "ORDER BY response_time_ms DESC " +
            "LIMIT 1 " +
            ");"
        );
    }

    public List<Map<String, Object>> getCorrectionCount() {
        return queryService.executeQuery("""
        SELECT
          is_correct,
          human_correction,
          COUNT(*) AS count
        FROM benchmark_results
        WHERE run_number = 1
        GROUP BY is_correct, human_correction
        ORDER BY human_correction DESC, is_correct DESC
        """);
    }

    public List<Map<String, Object>> getResponseTimeTrueFalse() {
        return queryService.executeQuery("""
        SELECT is_correct, AVG(response_time_ms) AS avg_response_time_ms
        FROM benchmark_results
        WHERE run_number = 1
        GROUP BY is_correct;
        """);
    }

    
    public List<Map<String, Object>> getCountFalseIssueTypes() {
        return queryService.executeQuery("""
        SELECT issue_type, COUNT(*) AS count
        FROM benchmark_results
        WHERE issue_type IS NOT NULL AND issue_type != '' and issue_type != 'Structural Simplicity' and issue_type != 'Performance Issue' and issue_type != 'Encoding Artifact' and run_number = 1
        GROUP BY issue_type
        ORDER BY count DESC;
        """);
    }
    
    public List<Map<String, Object>> getCountTrueIssueTypes() {
        return queryService.executeQuery("""
        SELECT issue_type, COUNT(*) AS count
        FROM benchmark_results
        WHERE issue_type IS NOT NULL AND issue_type != '' and issue_type != 'Spatial Context Misuse' and issue_type != 'Tag Loss' and issue_type != 'Syntax' and issue_type != 'Wrong Tags'
        GROUP BY issue_type
        ORDER BY count DESC;
        """);
    }
}
