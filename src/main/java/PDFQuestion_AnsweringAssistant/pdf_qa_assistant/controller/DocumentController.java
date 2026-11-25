package PDFQuestion_AnsweringAssistant.pdf_qa_assistant.controller;

import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.Config.CustomUserDetails;
import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.entity.PdfDocument;
import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.enums.DocumentStatus;
import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.repository.PdfDocumentRepository;
import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.service.PdfStorageService;
import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.service.PdfTextProcessingService;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

record DocumentResponse(
        Long id,
        String filename,
        long sizeBytes,
        String status,
        Instant uploadedAt) {

    static DocumentResponse from(PdfDocument document) {
        return new DocumentResponse(
                document.getId(),
                document.getOriginalFileName(),
                document.getSizeBytes(),
                document.getStatus().name(),
                document.getUploadedAt()
        );
    }
}

@RestController
@RequestMapping("/documents")
public class DocumentController {

    private final PdfStorageService storage;
    private final PdfDocumentRepository repository;
    private final PdfTextProcessingService pdfTextProcessingService;
    private final VectorStore vectorStore;

    public DocumentController(
            PdfStorageService storage,
            PdfDocumentRepository repository,
            PdfTextProcessingService pdfTextProcessingService,
            VectorStore vectorStore) {
        this.storage = storage;
        this.repository = repository;
        this.pdfTextProcessingService = pdfTextProcessingService;
        this.vectorStore = vectorStore;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public DocumentResponse upload(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {

        PdfDocument pdf = storage.save(file, userId(authentication));

        try {
            var chunks = pdfTextProcessingService.extractAndSplit(pdf);
            vectorStore.add(chunks);

            pdf.setStatus(DocumentStatus.INDEXED);
            repository.save(pdf);

            return DocumentResponse.from(pdf);
        } catch (IOException | RuntimeException exception) {
            pdf.setStatus(DocumentStatus.FAILED);
            repository.save(pdf);
            throw exception;
        }
    }

    @GetMapping
    public List<DocumentResponse> list(Authentication authentication) {
        return repository.findByOwnerIdOrderByUploadedAtDesc(userId(authentication))
                .stream()
                .map(DocumentResponse::from)
                .toList();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) throws IOException {

        PdfDocument document = repository.findByIdAndOwnerId(id, userId(authentication))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        storage.delete(document);
        return ResponseEntity.noContent().build();
    }

    private Long userId(Authentication authentication) {
        return ((CustomUserDetails) authentication.getPrincipal())
                .getUser()
                .getId();
    }
}