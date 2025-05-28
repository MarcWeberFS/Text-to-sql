package ch.zhaw.text_to_sql.service;

import org.springframework.stereotype.Service;

import ch.zhaw.text_to_sql.wrapper.BenchmarkCase;
import ch.zhaw.text_to_sql.wrapper.QueryResponse;

import java.util.*;

@Service
public class BenchmarkService {

    private final QueryService queryService;
    private QueryExecutionService queryExecutionService;

    public BenchmarkService(QueryService queryService, QueryExecutionService queryExecutionService) {
        this.queryService = queryService;
        this.queryExecutionService = queryExecutionService;
    }

    /**
     * Runs all benchmark cases for all LLMs.
     * This method will skip cases that have already been run in the specified run
     * number.
     * 
     * @param user_feedback_loop   whether to enable user feedback loop
     * @param syntax_feedback_loop whether to enable syntax feedback loop
     * @param runNumber            the run number to check against existing results
     * 
     */
    public void runAllBenchmarks(boolean user_feedback_loop, boolean syntax_feedback_loop, int runNumber) {
        String fetchSql = "SELECT * FROM benchmark_cases ORDER BY id ASC";
        List<BenchmarkCase> benchmarkCases = fetchBenchmarkCases(fetchSql);

        List<String> llms = List.of("chatgpt", "claude", "grok", "deepseek", "gemini");

        for (String llm : llms) {
            for (BenchmarkCase testCase : benchmarkCases) {
                String checkSql = String.format(
                        "SELECT COUNT(*) AS count FROM benchmark_results WHERE benchmark_case_id = %d AND llm = '%s' AND run_number = %d",
                        testCase.getId(),
                        llm,
                        runNumber);
                List<Map<String, Object>> checkResult = queryService.executeQuery(checkSql);
                long alreadyExists = ((Number) checkResult.get(0).get("count")).longValue();

                if (alreadyExists > 0) {
                    System.out.printf("Skipping benchmark case ID %d for LLM '%s' (already stored)%n", testCase.getId(),
                            llm);
                    continue;
                }

                try {
                    System.out.printf("Running benchmark ID %d for LLM '%s'%n", testCase.getId(), llm);
                    long startTime = System.currentTimeMillis();

                    QueryResponse response = queryExecutionService.handleQuery(
                            testCase.getPrompt(),
                            user_feedback_loop,
                            syntax_feedback_loop,
                            true,
                            llm);

                    String generatedSql = response.getExecutedQuery();
                    if (generatedSql == null || generatedSql.isBlank()) {
                        System.out.printf(" No SQL returned by %s for ID %d%n", llm, testCase.getId());
                        continue;
                    }

                    List<Map<String, Object>> expectedResult = queryService.executeQuery(testCase.getExpectedSql());
                    List<Map<String, Object>> llmResult = queryService.executeQuery(generatedSql);

                    long endTime = System.currentTimeMillis();
                    long duration = endTime - startTime;

                    boolean success = normalizeResult(expectedResult).equals(normalizeResult(llmResult)); // Compare
                                                                                                          // result
                                                                                                          // objects,
                                                                                                          // ignoring
                                                                                                          // order

                    String insert = String.format(
                            "INSERT INTO benchmark_results (benchmark_case_id, is_correct, query, result, response_time_ms, run_number, retry_number, llm, user_feedback_loop, syntax_feedback_loop, human_correction) "
                                    +
                                    "VALUES (%d, %b, $$%s$$, $$%s$$, %d, %d, %d, '%s', %b, %b, %b)",
                            testCase.getId(),
                            success,
                            generatedSql.replace("$", "\\$"),
                            null,
                            duration,
                            runNumber,
                            response.getRetries(),
                            llm,
                            user_feedback_loop,
                            syntax_feedback_loop,
                            success // initialize human_correction as the same as success
                    );

                    queryService.executeUpdate(insert); // Storing the result in the database under benchmark_results.
                    System.out.printf("Stored result for benchmark ID %d using LLM: %s%n", testCase.getId(), llm);

                    System.out.println("Sleeping 60 seconds to respect rate limits...");
                    Thread.sleep(60000);

                } catch (Exception e) {
                    System.err.printf("Error during benchmark ID %d for LLM %s: %s%n", testCase.getId(), llm,
                            e.getMessage());
                }
            }
        }
    }

    /**
     * Runs the first benchmark case once for all LLMs.
     * This is useful for testing and debugging purposes.
     *
     * @param user_feedback_loop   whether to enable user feedback loop
     * @param syntax_feedback_loop whether to enable syntax feedback loop
     */
    public void runFirstBenchmarkCaseOnce(boolean user_feedback_loop, boolean syntax_feedback_loop) {
        String fetchSql = "SELECT id, prompt, expected_sql, difficulty, region, tags FROM benchmark_cases ORDER BY id ASC LIMIT 1";
        List<BenchmarkCase> benchmarkCases = fetchBenchmarkCases(fetchSql);

        if (benchmarkCases.isEmpty()) {
            System.out.println("No benchmark cases found.");
            return;
        }

        BenchmarkCase testCase = benchmarkCases.get(0);
        List<String> llms = List.of("chatgpt", "claude", "grok", "deepseek", "gemini");

        for (String llm : llms) {
            try {
                System.out.printf("▶️ Running first benchmark for LLM: %s | Prompt ID: %d%n", llm, testCase.getId());

                long startTime = System.currentTimeMillis();

                // Run prompt through LLM to get SQL
                QueryResponse queryResponse = queryExecutionService.handleQuery(
                        testCase.getPrompt(),
                        user_feedback_loop,
                        syntax_feedback_loop,
                        false,
                        llm);

                String generatedSql = queryResponse.getExecutedQuery();
                if (generatedSql == null || generatedSql.isBlank()) {
                    System.out.printf("⚠️ No SQL generated by LLM %s for prompt ID %d%n", llm, testCase.getId());
                    continue;
                }

                // Execute both expected and generated queries
                List<Map<String, Object>> expectedResult = queryService.executeQuery(testCase.getExpectedSql());
                List<Map<String, Object>> llmResult = queryService.executeQuery(generatedSql);

                long endTime = System.currentTimeMillis();
                long duration = endTime - startTime;

                boolean success = normalizeResult(expectedResult).equals(normalizeResult(llmResult));

                String insert = String.format(
                        "INSERT INTO benchmark_results (is_correct, query, result, response_time_ms, run_number, retry_number, llm, user_feedback_loop, syntax_feedback_loop) "
                                +
                                "VALUES (%b, $$%s$$, $$%s$$, %d, %d, %d, '%s', %b, %b)",
                        success,
                        generatedSql.replace("$", "\\$"),
                        llmResult.toString().replace("$", "\\$"),
                        duration,
                        queryResponse.getRetries(),
                        0,
                        llm,
                        user_feedback_loop,
                        syntax_feedback_loop);

                queryService.executeUpdate(insert);
                System.out.printf("✅ Stored first test for LLM: %s%n", llm);

            } catch (Exception e) {
                System.err.printf("❌ Error during first test for LLM %s: %s%n", llm, e.getMessage());
            }
        }
    }

    /**
     * Fetches all benchmark cases from the database.
     * 
     * @param sql the SQL query to fetch benchmark cases
     * @return a list of BenchmarkCase objects
     */
    private List<BenchmarkCase> fetchBenchmarkCases(String sql) {
        List<Map<String, Object>> rows = queryService.executeQuery(sql);
        List<BenchmarkCase> cases = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            BenchmarkCase c = new BenchmarkCase();
            c.setId((Integer) row.get("id"));
            c.setPrompt((String) row.get("prompt"));
            c.setExpectedSql((String) row.get("expected_sql"));
            c.setDifficulty((String) row.get("difficulty"));
            c.setRegion((String) row.get("region"));
            c.setTags(row.get("tags") instanceof String[]
                    ? Arrays.asList((String[]) row.get("tags"))
                    : new ArrayList<>());
            cases.add(c);
        }
        return cases;
    }

    /**
     * Normalizes the result by converting all values to lowercase, trimming
     * whitespace,
     * sorting the values within each row, and sorting the rows themselves.
     * This ensures that the comparison is order-independent.
     *
     * @param result the result set to normalize
     * @return a list of normalized strings representing each row
     */
    private List<String> normalizeResult(List<Map<String, Object>> result) {
        List<String> normalized = new ArrayList<>();

        for (Map<String, Object> row : result) {
            List<String> valueList = new ArrayList<>();

            for (Object value : row.values()) {
                valueList.add(String.valueOf(value).toLowerCase().trim());
            }

            Collections.sort(valueList); // ensures values are order-independent
            normalized.add(String.join(",", valueList));
        }

        Collections.sort(normalized); // ensures row order doesn't affect comparison
        return normalized;
    }

}
