package ch.zhaw.text_to_sql.wrapper;

import lombok.Data;

@Data
public class ChatMessage {
    private String role;
    private String content;

    public ChatMessage(String role, String content) {
        this.role = role;
        this.content = content;
    }
}
