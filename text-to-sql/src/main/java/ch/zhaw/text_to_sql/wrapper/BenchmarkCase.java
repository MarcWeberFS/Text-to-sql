package ch.zhaw.text_to_sql.wrapper;

import java.util.List;

import lombok.Data;

@Data
public class BenchmarkCase {

    private int id;
    private String prompt;
    private String expectedSql;
    private String difficulty;
    private String region;
    private List<String> tags;
}