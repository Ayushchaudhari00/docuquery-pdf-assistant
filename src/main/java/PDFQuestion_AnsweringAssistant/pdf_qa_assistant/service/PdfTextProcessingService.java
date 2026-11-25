package PDFQuestion_AnsweringAssistant.pdf_qa_assistant.service;

import PDFQuestion_AnsweringAssistant.pdf_qa_assistant.entity.PdfDocument;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.reader.pdf.config.PdfDocumentReaderConfig;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PdfTextProcessingService {

    private final PdfStorageService pdfStorageService;

    private final TokenTextSplitter textSplitter = TokenTextSplitter.builder()
            .withChunkSize(800)
            .withMinChunkSizeChars(350)
            .withMinChunkLengthToEmbed(5)
            .build();

    public PdfTextProcessingService(PdfStorageService pdfStorageService) {
        this.pdfStorageService = pdfStorageService;
    }

    public List<Document> extractAndSplit(PdfDocument pdfDocument) throws IOException {
        Path pdfPath = pdfStorageService.pathOf(pdfDocument);

        if (!Files.isRegularFile(pdfPath)) {
            throw new IOException("The stored PDF file was not found.");
        }

        PagePdfDocumentReader reader = new PagePdfDocumentReader(
                new FileSystemResource(pdfPath.toFile()),
                PdfDocumentReaderConfig.defaultConfig()
        );

        List<Document> pages = reader.read();
        List<Document> chunks = textSplitter.apply(pages);

        if (chunks.isEmpty()) {
            throw new IOException("No readable text was found in the PDF.");
        }

        List<Document> result = new ArrayList<>(chunks.size());

        for (Document chunk : chunks) {
            Map<String, Object> metadata = new HashMap<>(chunk.getMetadata());
            metadata.put("documentId", pdfDocument.getId());
            metadata.put("ownerId", pdfDocument.getOwnerId());
            metadata.put("originalFileName", pdfDocument.getOriginalFileName());

            result.add(new Document(chunk.getText(), metadata));
        }

        return result;
    }
}