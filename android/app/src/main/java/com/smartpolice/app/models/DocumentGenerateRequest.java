package com.smartpolice.app.models;

import java.util.Map;

public class DocumentGenerateRequest {
    private String caseId;
    private String documentType;
    private Map<String, String> additionalData;

    public DocumentGenerateRequest(String caseId, String documentType, Map<String, String> additionalData) {
        this.caseId = caseId;
        this.documentType = documentType;
        this.additionalData = additionalData;
    }

    // Getters and Setters
    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public Map<String, String> getAdditionalData() { return additionalData; }
    public void setAdditionalData(Map<String, String> additionalData) { this.additionalData = additionalData; }
}
