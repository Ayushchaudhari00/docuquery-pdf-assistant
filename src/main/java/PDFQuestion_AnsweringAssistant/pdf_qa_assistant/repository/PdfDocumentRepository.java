package PDFQuestion_AnsweringAssistant.pdf_qa_assistant.repository;

import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.entity.PdfDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PdfDocumentRepository extends JpaRepository<PdfDocument,Long> {
    List<PdfDocument>findByOwnerIdOrderByUploadedAtDesc(Long ownerId);
    Optional<PdfDocument> findByIdAndOwnerId(Long id, Long ownerId);
}
