package PDFQuestion_AnsweringAssistant.pdf_qa_assistant.entity;

import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.enums.DocumentStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

@Entity
@Data
@Table(name = "pdf_document")
public class PdfDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long Id;

    @Column(nullable = false)
    private Long ownerId;

    @Column(nullable = false)
    private String originalFileName;

    @Column(nullable = false, unique = true)
    private String storedFilename;

    private long sizeBytes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentStatus status = DocumentStatus.UPLOADED;

    @Column(nullable = false)
    private Instant uploadedAt = Instant.now();
}
