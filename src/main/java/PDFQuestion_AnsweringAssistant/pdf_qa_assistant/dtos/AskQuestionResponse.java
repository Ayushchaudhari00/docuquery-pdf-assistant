package PDFQuestion_AnsweringAssistant.pdf_qa_assistant.dtos;
import java.util.List;

public record AskQuestionResponse(
        String answer,
        List<String> sources
) {
}