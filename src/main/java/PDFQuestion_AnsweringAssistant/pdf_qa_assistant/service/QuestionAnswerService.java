package PDFQuestion_AnsweringAssistant.pdf_qa_assistant.service;

import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.entity.PdfDocument;
import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.repository.PdfDocumentRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionAnswerService {

    private final PdfDocumentRepository pdfDocumentRepository;
    private final VectorStore vectorStore;
    private final ChatClient chatClient;

    public QuestionAnswerService(
            PdfDocumentRepository pdfDocumentRepository,
            VectorStore vectorStore,
            ChatClient.Builder chatClientBuilder) {

        this.pdfDocumentRepository = pdfDocumentRepository;
        this.vectorStore = vectorStore;
        this.chatClient = chatClientBuilder.build();
    }


    public Flux<String> askStream(
            Long documentId,
            Long ownerId,
            String question) {
        List<Document> matches = findMatches(documentId, ownerId, question);
        if (matches.isEmpty()) {
            return Flux.just(
                    "I couldn't find an answer to that in this PDF."
            );
        }
        String context = buildContext(matches);
        return chatClient.prompt()
                .system("""
                        Answer using only the supplied PDF context.
                        If the context does not contain the answer, say so.
                        """)
                .user(user -> user
                        .text("""
                                PDF context:
                                {context}

                                Question:
                                {question}
                                """)
                        .param("context", context)
                        .param("question", question))
                .stream()
                .content();
    }

    private List<Document> findMatches(
            Long documentId,
            Long ownerId,
            String question) {

        PdfDocument pdf = pdfDocumentRepository
                .findByIdAndOwnerId(documentId, ownerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "PDF not found"
                ));

        FilterExpressionBuilder filters = new FilterExpressionBuilder();

        var filter = filters.and(
                filters.eq("documentId", pdf.getId()),
                filters.eq("ownerId", ownerId)
        ).build();

        return vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(question)
                        .topK(5)
                        .filterExpression(filter)
                        .build()
        );
    }

    private String buildContext(List<Document> matches) {
        return matches.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n"));
    }

    private String sourceLabel(Document document) {
        Object fileName = document.getMetadata().get("originalFileName");
        Object page = document.getMetadata().get("startPageNumber");

        String source = fileName == null ? "PDF" : fileName.toString();

        if (page != null) {
            source += " (page " + page + ")";
        }

        return source;
    }
}