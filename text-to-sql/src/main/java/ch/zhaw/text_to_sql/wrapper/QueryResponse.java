package ch.zhaw.text_to_sql.wrapper;

import java.util.List;
import java.util.Map;

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

        public void setExecutedQuery(String executedQuery) {
            this.executedQuery = executedQuery;
        }

        public int getRetries() {
            return retries;
        }

        public void setRetries(int retries) {
            this.retries = retries;
        }

        public boolean isImproved() {
            return improved;
        }

        public void setImproved(boolean improved) {
            this.improved = improved;
        }

        public List<Map<String, Object>> getResult() {
            return result;
        }

        public void setResult(List<Map<String, Object>> result) {
            this.result = result;
        }

    }

