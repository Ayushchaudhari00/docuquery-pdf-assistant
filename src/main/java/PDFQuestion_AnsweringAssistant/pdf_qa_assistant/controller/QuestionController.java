package PDFQuestion_AnsweringAssistant.pdf_qa_assistant.controller;

import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.Config.CustomUserDetails;
import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.dtos.AskQuestionRequest;
import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.dtos.AskQuestionResponse;
import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.service.QuestionAnswerService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/documents")
public class QuestionController {

    private final QuestionAnswerService questionAnswerService;

    public QuestionController(QuestionAnswerService questionAnswerService) {
        this.questionAnswerService = questionAnswerService;
    }


    @PostMapping(
            value = "/{documentId}/ask",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public Flux<String> ask(
            @PathVariable Long documentId,
            @Valid @RequestBody AskQuestionRequest request,
            Authentication authentication) {

        return questionAnswerService.askStream(
                documentId,
                userId(authentication),
                request.question()
        );
    }

    private Long userId(Authentication authentication) {
        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        return userDetails.getUser().getId();
    }
}