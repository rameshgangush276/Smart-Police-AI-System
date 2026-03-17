package com.smartpolice.app.models;

import java.util.List;

public class DocumentResponse {
    private boolean success;
    private Document document; // For single generation response
    private List<Document> documents; // For list response

    public static class Document {
        private String id;
        private String documentId;
        private String type;
        private String fileUrl;
        private String generatedAt;
        private String caseId;

        public String getId() { return id; }
        public String getDocumentId() { return documentId; }
        public String getType() { return type; }
        public String getFileUrl() { return fileUrl; }
        public String getGeneratedAt() { return generatedAt; }
        public String getCaseId() { return caseId; }
    }

    public boolean isSuccess() { return success; }
    public Document getDocument() { return document; }
    public List<Document> getDocuments() { return documents; }
}
