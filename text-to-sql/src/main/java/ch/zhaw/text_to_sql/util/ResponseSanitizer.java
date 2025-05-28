package ch.zhaw.text_to_sql.util;

import java.util.List;
import java.util.Map;

public class ResponseSanitizer {

    /**
     * Sanitizes the result by ensuring that all values in the maps are of type
     * String, Number, Boolean, or null.
     * If a value is of an unsupported type, it is converted to a String.
     *
     * @param input List of maps containing the result data
     * @return Sanitized list of maps
     */
    public List<Map<String, Object>> sanitizeResult(List<Map<String, Object>> input) {
        for (Map<String, Object> map : input) {
            for (Map.Entry<String, Object> entry : map.entrySet()) {
                Object value = entry.getValue();
                if (!(value == null || value instanceof String || value instanceof Number
                        || value instanceof Boolean)) {
                    entry.setValue(value.toString()); // fallback to String
                }
            }
        }
        return input;
    }

}
