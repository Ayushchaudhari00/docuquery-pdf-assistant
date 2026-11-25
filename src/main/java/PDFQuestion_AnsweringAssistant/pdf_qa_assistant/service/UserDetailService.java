package PDFQuestion_AnsweringAssistant.pdf_qa_assistant.service;

import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.Config.CustomUserDetails;
import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.entity.User;
import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailService implements UserDetailsService {
    private final UserRepository userRepository;

    public UserDetailService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(()->
                        new UsernameNotFoundException("USER WITH THIS EMAIL IS NOT EXISTS"+email));

        return new CustomUserDetails(user);
    }
}
