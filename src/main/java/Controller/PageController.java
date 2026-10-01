package Controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class PageController {

    @GetMapping("/")
    public String home() {
        return "redirect:/chat";
    }

    @GetMapping("/chat")
    public String chatPage(Model model) {
        return "chat";
    }

    @GetMapping("/chat/{sessionId}")
    public String chatWithSession(@PathVariable String sessionId, Model model) {
        model.addAttribute("sessionId", sessionId);
        return "chat";
    }
}