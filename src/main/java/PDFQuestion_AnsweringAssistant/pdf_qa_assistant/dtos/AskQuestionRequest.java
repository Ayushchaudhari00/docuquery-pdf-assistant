package PDFQuestion_AnsweringAssistant.pdf_qa_assistant.dtos;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AskQuestionRequest(
        @NotBlank
        @Size(max = 2000)
        String question
) {
}