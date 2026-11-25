package PDFQuestion_AnsweringAssistant.pdf_qa_assistant.service;

import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.Config.SecurityConfig;
import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.dtos.RegisterRequest;
import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.entity.User;
import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepo;
    private final SecurityConfig securityConfig;

    public UserService(UserRepository userRepo, SecurityConfig securityConfig) {
        this.userRepo = userRepo;
        this.securityConfig = securityConfig;
    }


    public void register(RegisterRequest request) {
        if (userRepo.findByEmail(request.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(securityConfig.passwordEncoder().encode(request.password()));
        userRepo.save(user);
    }
}
