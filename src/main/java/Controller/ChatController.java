package Controller;

import Entity.ChatMessageEntity;
import Repository.MessageRepository;
import Service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private MessageRepository messageRepository;

    // ✅ FIX: Returns a proper DTO with sessionId, content, and role
    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendMessage(@RequestBody ChatRequest request) {
        String sessionId = (request.getSessionId() != null && !request.getSessionId().isEmpty())
                ? request.getSessionId()
                : UUID.randomUUID().toString();

        // Save user message
        ChatMessageEntity userMsg = new ChatMessageEntity();
        userMsg.setSessionId(sessionId);
        userMsg.setRole("user");
        userMsg.setContent(request.getMessage());
        messageRepository.save(userMsg);

        // Get AI response
        String aiResponse = messageService.generateResponse(request.getMessage());

        // Save AI message
        ChatMessageEntity aiMsg = new ChatMessageEntity();
        aiMsg.setSessionId(sessionId);
        aiMsg.setRole("assistant");
        aiMsg.setContent(aiResponse);
        messageRepository.save(aiMsg);

        // ✅ FIX: Return sessionId + content so JS can read data.sessionId and data.content
        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", sessionId);
        response.put("content", aiResponse);
        response.put("role", "assistant");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history/{sessionId}")
    public ResponseEntity<List<ChatMessageEntity>> getHistory(@PathVariable String sessionId) {
        List<ChatMessageEntity> messages = messageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
        return ResponseEntity.ok(messages);
    }

    // ✅ FIX: Proper grouping — gets first user message per session as the title
    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSession>> getSessions() {
        List<ChatMessageEntity> allUserMessages = messageRepository.findAll()
                .stream()
                .filter(m -> "user".equals(m.getRole()))
                .collect(Collectors.toList());

        // Group by sessionId, take the first message of each session
        Map<String, ChatMessageEntity> sessionMap = new HashMap<>();
        for (ChatMessageEntity msg : allUserMessages) {
            sessionMap.putIfAbsent(msg.getSessionId(), msg);
        }

        List<ChatSession> sessions = sessionMap.values().stream()
                .map(m -> {
                    String title = m.getContent();
                    if (title.length() > 30) title = title.substring(0, 30) + "...";
                    return new ChatSession(m.getSessionId(), title);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(sessions);
    }

    // -------- Inner classes --------

    public static class ChatRequest {
        private String message;
        private String sessionId;

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    }

    public static class ChatSession {
        private String id;
        private String title;

        public ChatSession(String id, String title) {
            this.id = id;
            this.title = title;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
    }
}