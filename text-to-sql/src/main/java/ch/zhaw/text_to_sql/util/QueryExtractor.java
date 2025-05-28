package ch.zhaw.text_to_sql.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class QueryExtractor {

    private QueryExtractor() {

    }

    /*
     * Extracts the SQL query from a raw response string.
     */
    public static String extractSqlQuery(String rawResponse) {
        String startMarker = "```sql";
        String endMarker = "```";

        int start = rawResponse.indexOf(startMarker);
        int end = rawResponse.lastIndexOf(endMarker);

        if (start != -1 && end != -1 && end > start) {
            String sqlBlock = rawResponse.substring(start + startMarker.length(), end);
            return sqlBlock.replace("\\n", "\n").trim();
        }

        Pattern sqlPattern = Pattern.compile("SELECT.*?;", Pattern.DOTALL | Pattern.CASE_INSENSITIVE);
        Matcher matcher = sqlPattern.matcher(rawResponse);
        if (matcher.find()) {
            return matcher.group().replace("\\n", "\n").trim();
        }

        return null;
    }
}
