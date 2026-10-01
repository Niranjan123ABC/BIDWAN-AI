package Service;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.Map;
import java.util.HashMap;

@Service
public class OllamaService {

    @Value("${ollama.api.url}")
    private String ollamaUrl;

    @Value("${ollama.model}")
    private String ollamaModel;

    private final RestTemplate restTemplate = new RestTemplate();

    public String chat(String userMessage) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", ollamaModel);
            requestBody.put("prompt", userMessage);
            requestBody.put("stream", false);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(ollamaUrl, request, Map.class);

            if (response.getBody() != null) {
                return response.getBody().get("response").toString();
            } else {
                return "No response from AI.";
            }

        } catch (Exception e) {
            return "⚠️ Error connecting to Ollama: " + e.getMessage();
        }
    }
}
