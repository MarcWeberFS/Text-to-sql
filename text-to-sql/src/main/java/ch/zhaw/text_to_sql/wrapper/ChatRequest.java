package ch.zhaw.text_to_sql.wrapper;

import java.util.List;

import lombok.Data;

@Data
public class ChatRequest {
    private String model;
    private List<ChatMessage> messages;
    private boolean stream;
    private float temperature;

    public ChatRequest(String model, List<ChatMessage> messages, boolean stream) {
        this.model = model;
        this.messages = messages;
        this.stream = stream;
    }

    public ChatRequest(String model, List<ChatMessage> messages, boolean stream, float temperature) {
        this.model = model;
        this.messages = messages;
        this.stream = stream;
        this.temperature = temperature;
    }
}
