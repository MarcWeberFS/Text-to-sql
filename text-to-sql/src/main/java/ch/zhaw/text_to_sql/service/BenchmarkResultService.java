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

    public List<Map<String, Object>> getBenchmarkResults(int runNumber) {
        return queryService.executeQuery("select id, is_correct, llm, human_correction, benchmark_case_id from benchmark_results where run_number = "+ runNumber + " order by benchmark_case_id, llm");
    }

    public List<Map<String, Object>> getBenchmarkCase(int id) {
        return responseSanitizer.sanitizeResult(queryService.executeQuery("select * from benchmark_cases where id = " + id));
    }

    public List<Map<String, Object>> getBenchmarkCaseResult(int id, int runNumber) {
        return  responseSanitizer.sanitizeResult(queryService.executeQuery("select * from benchmark_results where run_number = " + runNumber +" and benchmark_case_id = " + id));
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
        WHERE issue_type IS NOT NULL AND issue_type != '' and issue_type != 'Spatial Context Misuse' and issue_type != 'Tag Loss' and issue_type != 'Syntax' and issue_type != 'Wrong Tags' and run_number = 1
        GROUP BY issue_type
        ORDER BY count DESC;
        """);
    }


    public Map<String, Object> getTotalStats() {
        Map<String, Object> stats = queryService.executeQuery("""
            SELECT
            COUNT(*) AS total_cases,
            SUM(CASE WHEN human_correction THEN 1 ELSE 0 END) AS correct_cases,
            SUM(CASE WHEN NOT human_correction THEN 1 ELSE 0 END) AS incorrect_cases,
            ROUND(100.0 * SUM(CASE WHEN human_correction THEN 1 ELSE 0 END) / COUNT(*), 1) AS correctness_percentage,
            ROUND(AVG(response_time_ms) / 1000.0, 1) AS avg_response_time_seconds
          FROM benchmark_results
          WHERE run_number = 1
                  """
        ).get(0);
    
        // This was tracked manually
        stats.put("total_cost_chf", 6.79);
        return stats;
    }

    public List<Map<String, Object>> getTotalCorrect() {
         return queryService.executeQuery("""
                SELECT
                    (SUM(CASE WHEN run_number = 1 AND is_correct = true THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN run_number = 1 THEN 1 ELSE 0 END)) AS run1_is_correct_percentage,
                    (SUM(CASE WHEN run_number = 1 AND human_correction = true THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN run_number = 1 THEN 1 ELSE 0 END)) AS run1_human_correction_percentage,
                    (SUM(CASE WHEN run_number = 2 AND is_correct = true THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN run_number = 2 THEN 1 ELSE 0 END)) AS run2_is_correct_percentage,
                    (SUM(CASE WHEN run_number = 3 AND is_correct = true THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN run_number = 3 THEN 1 ELSE 0 END)) AS run3_is_correct_percentage
                    FROM benchmark_results;
                """);
    }
        
    
}
