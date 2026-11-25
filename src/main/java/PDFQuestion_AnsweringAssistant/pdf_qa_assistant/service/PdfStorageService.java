package PDFQuestion_AnsweringAssistant.pdf_qa_assistant.service;

import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.entity.PdfDocument;
import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.repository.PdfDocumentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
public class PdfStorageService {

    private final Path root;
    private final PdfDocumentRepository repository;

    public PdfStorageService(@Value("${app.storage.dir}")String  dir,
                             PdfDocumentRepository repository) throws IOException {
        this.root = Path.of(dir.trim()).toAbsolutePath().normalize();
        Files.createDirectories(root);
        this.repository = repository;
    }

    public PdfDocument save(MultipartFile file, Long ownerId) throws IOException {
        if (file == null || file.isEmpty()) throw bad("File is empty");

        String original = cleanName(file.getOriginalFilename());
        if (!original.toLowerCase().endsWith(".pdf")) throw bad("Only .pdf files are allowed");


        try (InputStream in = file.getInputStream()) {
            String head = new String(in.readNBytes(5), StandardCharsets.ISO_8859_1);
            if (!"%PDF-".equals(head)) throw bad("File is not a real PDF");
        }

        String stored = UUID.randomUUID() + ".pdf";
        Path target = root.resolve(stored).normalize();
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target);
        }

        PdfDocument doc = new PdfDocument();
        doc.setOwnerId(ownerId);
        doc.setOriginalFileName(original);
        doc.setStoredFilename(stored);
        doc.setSizeBytes(file.getSize());
        try {
            return repository.save(doc);
        } catch (RuntimeException e) {
            Files.deleteIfExists(target);                         // no orphan files
            throw e;
        }
    }

    public Path pathOf(PdfDocument doc) {
        return root.resolve(doc.getStoredFilename()).normalize();
    }

    public void delete(PdfDocument doc) throws IOException {
        Files.deleteIfExists(pathOf(doc));
        repository.delete(doc);
    }

    private static String cleanName(String name) {
        if (name == null || name.isBlank()) return "document.pdf";
        String n = name.replace("\\", "/");
        return n.substring(n.lastIndexOf('/') + 1);              // drop any folder part
    }

    private static ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }


}
