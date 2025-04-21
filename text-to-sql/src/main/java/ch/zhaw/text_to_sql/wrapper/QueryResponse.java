package ch.zhaw.text_to_sql.wrapper;

import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class QueryResponse {
        private String executedQuery;
        private int retries;
        private boolean improved;
        private List<Map<String, Object>> result;
    


        public QueryResponse(String executedQuery, int retries, boolean improved, List<Map<String, Object>> result) {
            this.executedQuery = executedQuery;
            this.retries = retries;
            this.improved = improved;
            this.result = result;
        }
    
        public String getExecutedQuery() {
            return executedQuery;
        }

        public int getRetries() {
            return retries;
        }

    }

